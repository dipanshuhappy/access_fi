import { useReadContract } from 'wagmi';
import { FACTORY_ACCESSFI_ADDRESS } from '~/constant';
import { factoryAccessfiAbi } from '~/generated';

export interface StoredPoolData {
  name: string;
  size: string;
  minAccessTokens: string;
  apy: string;
  duration: string;
  proofs: string[];
  customProof: boolean;
  txHash: string;
  createdAt: string;
  timestamp: number;
}

export interface Pool {
  id: string;
  title: string;
  usdcAmount: number;
  minAccessTokens: number;
  totalVolume: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isActive: boolean;
  address: string;
  apy?: string;
  duration?: string;
  createdAt?: string;
}

export const getStoredPoolsData = (): StoredPoolData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('createdPools');
    const pools = stored ? JSON.parse(stored) : [];
    // Sort by timestamp to ensure consistent ordering
    return pools.sort((a: StoredPoolData, b: StoredPoolData) => 
      (a.timestamp || 0) - (b.timestamp || 0)
    );
  } catch (error) {
    console.error('Error reading pool data from localStorage:', error);
    return [];
  }
};

export const getPoolDataByIndex = (index: number): StoredPoolData | null => {
  const storedPools = getStoredPoolsData();
  return storedPools[index] || null;
};

export const createPoolFromData = (
  address: string, 
  index: number, 
  storedData: StoredPoolData | null
): Pool => {
  const defaultPool: Pool = {
    id: (index + 1).toString(),
    title: `Pool ${index + 1}`,
    usdcAmount: 10000,
    minAccessTokens: 100,
    totalVolume: 0,
    risk: 'low' as const,
    category: 'liquidity',
    tags: ['Email Verification', 'ZK Proof'],
    isActive: true,
    address: address
  };

  if (!storedData) {
    return defaultPool;
  }

  return {
    ...defaultPool,
    title: storedData.name || defaultPool.title,
    usdcAmount: parseInt(storedData.size) || defaultPool.usdcAmount,
    minAccessTokens: parseInt(storedData.minAccessTokens) || defaultPool.minAccessTokens,
    apy: storedData.apy,
    duration: storedData.duration,
    tags: storedData.proofs.length > 0 ? storedData.proofs : defaultPool.tags,
    createdAt: storedData.createdAt
  };
};

export const clearPoolStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('createdPools');
  }
};

export const debugPoolStorage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('createdPools');
    console.log('🗄️  Pool storage debug:', {
      raw: stored,
      parsed: stored ? JSON.parse(stored) : null,
      count: stored ? JSON.parse(stored).length : 0
    });
  }
};