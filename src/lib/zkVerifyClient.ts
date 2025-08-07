import { env } from '../env.js';

const DEFAULT_API_URL = 'https://relayer-api.horizenlabs.io/api/v1';

// Type definitions based on the provided data structures
export interface GrothProofData {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: 'groth16';
  curve: 'bn128';
}

export interface VerificationKey {
  protocol: 'groth16';
  curve: 'bn128';
  nPublic: number;
  vk_alpha_1: [string, string, string];
  vk_beta_2: [[string, string], [string, string], [string, string]];
  vk_gamma_2: [[string, string], [string, string], [string, string]];
  vk_delta_2: [[string, string], [string, string], [string, string]];
  vk_alphabeta_12: [[[string, string], [string, string], [string, string]], [[string, string], [string, string], [string, string]]];
  IC: Array<[string, string, string]>;
}

export interface ProofOptions {
  library: 'snarkjs';
  curve: 'bn128';
}

export interface RegisterVkRequest {
  proofType: 'groth16';
  proofOptions: ProofOptions;
  vk: VerificationKey;
}

export interface RegisterVkResponse {
  vkHash?: string;
  meta?: {
    vkHash: string;
  };
  [key: string]: any;
}

export interface SubmitProofRequest {
  proofType: 'groth16';
  vkRegistered: boolean;
  proofOptions: ProofOptions;
  proofData: {
    proof: GrothProofData;
    publicSignals: string[];
    vk: string | any; // vkHash
  };
}

export interface SubmitProofResponse {
  optimisticVerify: 'success' | 'failed';
  jobId: string;
  [key: string]: any;
}

export type JobStatus = 'Pending' | 'Processing' | 'Finalized' | 'Failed';

export interface JobStatusResponse {
  status: JobStatus;
  jobId: string;
  createdAt?: string;
  updatedAt?: string;
  result?: any;
  error?: string;
  [key: string]: any;
}

export interface ZkVerifyClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class ZkVerifyClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: ZkVerifyClientOptions = {}) {
    this.apiKey = options.apiKey || env.NEXT_PUBLIC_ZK_VERIFY_API_KEY;
    this.baseUrl = options.baseUrl || DEFAULT_API_URL;
    this.timeout = options.timeout || 30000;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Register a verification key with the relayer
   */
  async registerVk(vk: VerificationKey): Promise<RegisterVkResponse> {
    const request: RegisterVkRequest = {
      proofType: 'groth16',
      proofOptions: {
        library: 'snarkjs',
        curve: 'bn128',
      },
      vk,
    };

    try {
      return await this.makeRequest<RegisterVkResponse>(
        `/register-vk/${this.apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );
    } catch (error) {
      throw new Error(`Failed to register VK: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit a proof for verification
   */
  async submitProof(
    proof: GrothProofData,
    publicSignals: string[],
    vk: any,
    // vkHash: string,
    vkRegistered: boolean = true
  ): Promise<SubmitProofResponse> {
    const request: SubmitProofRequest = {
      proofType: 'groth16',
      vkRegistered,
      proofOptions: {
        library: 'snarkjs',
        curve: 'bn128',
      },
      proofData: {
        proof,
        publicSignals,
        vk
        // vk: vkHash,
      },
    };

    return this.makeRequest<SubmitProofResponse>(
      `/submit-proof/${this.apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get the status of a proof verification job
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.makeRequest<JobStatusResponse>(
      `/job-status/${this.apiKey}/${jobId}`
    );
  }

  /**
   * Poll job status until completion
   */
  async waitForJobCompletion(
    jobId: string,
    pollInterval: number = 5000,
    maxAttempts: number = 120 // 10 minutes with 5-second intervals
  ): Promise<JobStatusResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getJobStatus(jobId);

      if (status.status === 'Finalized' || status.status === 'Failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error(`Job ${jobId} did not complete within the timeout period`);
  }

  /**
   * Complete workflow: register VK, submit proof, and wait for completion
   */
  async verifyProofComplete(
    proof: GrothProofData,
    publicSignals: string[],
    vk: VerificationKey,
    existingVkHash?: string
  ): Promise<{
    vkRegistration?: RegisterVkResponse;
    proofSubmission: SubmitProofResponse;
    finalStatus: JobStatusResponse;
  }> {
    let vkHash = existingVkHash;
    let vkRegistration: RegisterVkResponse | undefined;

    // Register VK if not provided
    if (!vkHash) {
      vkRegistration = await this.registerVk(vk);
      vkHash = vkRegistration.vkHash || vkRegistration.meta?.vkHash;

      if (!vkHash) {
        throw new Error('Failed to get VK hash from registration response');
      }
    }

    // Submit proof
    const proofSubmission = await this.submitProof(proof, publicSignals, vkHash, !!existingVkHash);

    if (proofSubmission.optimisticVerify !== 'success') {
      throw new Error(`Proof verification failed: ${JSON.stringify(proofSubmission)}`);
    }

    // Wait for completion
    const finalStatus = await this.waitForJobCompletion(proofSubmission.jobId);

    return {
      vkRegistration,
      proofSubmission,
      finalStatus,
    };
  }
}

// Utility functions
export const zkVerifyUtils = {
  /**
   * Validate proof data structure
   */
  isValidProofData(proof: any): proof is GrothProofData {
    return (
      proof &&
      Array.isArray(proof.pi_a) &&
      proof.pi_a.length === 3 &&
      Array.isArray(proof.pi_b) &&
      proof.pi_b.length === 3 &&
      Array.isArray(proof.pi_c) &&
      proof.pi_c.length === 3 &&
      proof.protocol === 'groth16' &&
      proof.curve === 'bn128'
    );
  },

  /**
   * Validate verification key structure
   */
  isValidVerificationKey(vk: any): vk is VerificationKey {
    return (
      vk &&
      vk.protocol === 'groth16' &&
      vk.curve === 'bn128' &&
      typeof vk.nPublic === 'number' &&
      Array.isArray(vk.vk_alpha_1) &&
      Array.isArray(vk.vk_beta_2) &&
      Array.isArray(vk.vk_gamma_2) &&
      Array.isArray(vk.vk_delta_2) &&
      Array.isArray(vk.vk_alphabeta_12) &&
      Array.isArray(vk.IC)
    );
  },

  /**
   * Validate public signals
   */
  isValidPublicSignals(publicSignals: any): publicSignals is string[] {
    return Array.isArray(publicSignals) && publicSignals.every(signal => typeof signal === 'string');
  },
};

// Export a factory function for creating clients
export function createZkVerifyClient(options: ZkVerifyClientOptions = {}): ZkVerifyClient {
  return new ZkVerifyClient(options);
}

// Export a default client instance using environment variables
export const zkVerifyClient = new ZkVerifyClient();
