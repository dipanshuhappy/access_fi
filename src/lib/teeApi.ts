import { env } from '../env.js';

const TEE_API_URL = env.NEXT_PUBLIC_TEE_API_URL;

export interface TeeApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QuoteResponse {
  quote: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface PublicKeyResponse {
  publicKey: string;
}

export interface EncryptRequest {
  secret: string;
  nonce: string;
  txHash: `0x${string}`;
}

export interface DecryptRequest {
  txHash: `0x${string}`;
  publicKey: string;
}

export interface DecryptResponse {
  encryptedData: string,
  nonce: string;
}

export interface SendVerificationEmailRequest {
  hash: `0x${string}`;
  signature: `0x${string}`;
  email: string;
}

class TeeApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = TEE_API_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`TEE API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ping the TEE service to check connectivity
   */
  async ping(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ping`);
    return response.text();
  }

  /**
   * Get TEE quote for attestation
   */
  async getQuote(): Promise<QuoteResponse> {
    return this.makeRequest<QuoteResponse>('/quote');
  }

  /**
   * Check service health status
   */
  async getHealth(): Promise<HealthResponse> {
    return this.makeRequest<HealthResponse>('/health');
  }

  /**
   * Get the public key of the TEE
   */
  async getPublicKey(): Promise<PublicKeyResponse> {
    return this.makeRequest<PublicKeyResponse>('/public-key');
  }

  /**
   * Encrypt and store secret data associated with a transaction
   */
  async encrypt(data: EncryptRequest): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/encrypt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Decrypt data associated with a transaction
   */
  async decrypt(data: DecryptRequest): Promise<DecryptResponse> {
    return this.makeRequest<DecryptResponse>('/decrypt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(data: SendVerificationEmailRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send verification email: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }
}

// Export a singleton instance
export const teeApi = new TeeApiClient();

// Export the class for custom instances if needed
export { TeeApiClient };

// Utility functions for common operations
export const teeUtils = {
  /**
   * Check if TEE service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await teeApi.ping();
      return response === 'pong';
    } catch {
      return false;
    }
  },

  /**
   * Get TEE attestation data
   */
  async getAttestationData(): Promise<{ quote: string; publicKey: string }> {
    const [quote, publicKey] = await Promise.all([
      teeApi.getQuote(),
      teeApi.getPublicKey(),
    ]);

    return {
      quote: quote.quote,
      publicKey: publicKey.publicKey,
    };
  },
};
