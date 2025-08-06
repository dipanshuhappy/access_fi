"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { TrendingUp, Shield, Zap, Users, Plus, Sparkles, Wallet } from 'lucide-react';

interface Pool {
  id: string;
  title: string;
  usdcAmount: number;
  minAccessTokens: number;
  apy: number;
  totalStaked: number;
  participants: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isActive: boolean;
  timeLeft: string;
}

const mockPools: Pool[] = [
  {
    id: '1',
    title: 'DeFi Yield Optimizer',
    usdcAmount: 125000,
    minAccessTokens: 1000,
    apy: 24.5,
    totalStaked: 2400000,
    participants: 156,
    risk: 'medium',
    category: 'yield',
    tags: ['High APY', 'Auto-compound', 'Verified'],
    isActive: true,
    timeLeft: '5d 12h'
  },
  {
    id: '2',
    title: 'Stable Liquidity Pool',
    usdcAmount: 89500,
    minAccessTokens: 500,
    apy: 12.8,
    totalStaked: 1800000,
    participants: 234,
    risk: 'low',
    category: 'stable',
    tags: ['Low Risk', 'Stable', 'Beginner Friendly'],
    isActive: true,
    timeLeft: '12d 6h'
  },
  {
    id: '3',
    title: 'Growth Strategy Fund',
    usdcAmount: 67800,
    minAccessTokens: 2000,
    apy: 31.2,
    totalStaked: 950000,
    participants: 89,
    risk: 'high',
    category: 'growth',
    tags: ['High Growth', 'Advanced', 'Limited Spots'],
    isActive: true,
    timeLeft: '2d 18h'
  },
  {
    id: '4',
    title: 'NFT Backing Pool',
    usdcAmount: 156000,
    minAccessTokens: 750,
    apy: 18.7,
    totalStaked: 3200000,
    participants: 312,
    risk: 'medium',
    category: 'nft',
    tags: ['NFT Rewards', 'Trending', 'Community'],
    isActive: true,
    timeLeft: '8d 3h'
  },
  {
    id: '5',
    title: 'AI Trading Bot Pool',
    usdcAmount: 234000,
    minAccessTokens: 1500,
    apy: 28.9,
    totalStaked: 1600000,
    participants: 67,
    risk: 'high',
    category: 'ai',
    tags: ['AI Powered', 'Beta', 'Exclusive'],
    isActive: true,
    timeLeft: '15d 9h'
  },
  {
    id: '6',
    title: 'Cross-Chain Arbitrage',
    usdcAmount: 98700,
    minAccessTokens: 1200,
    apy: 22.1,
    totalStaked: 2100000,
    participants: 178,
    risk: 'medium',
    category: 'arbitrage',
    tags: ['Cross-Chain', 'Arbitrage', 'Multi-DEX'],
    isActive: true,
    timeLeft: '6d 14h'
  }
];

const filterCategories = [
  { id: 'all', label: 'All Pools', count: mockPools.length },
  { id: 'yield', label: 'Yield Farming', count: 1 },
  { id: 'stable', label: 'Stable Pools', count: 1 },
  { id: 'growth', label: 'Growth Funds', count: 1 },
  { id: 'nft', label: 'NFT Pools', count: 1 },
  { id: 'ai', label: 'AI Strategies', count: 1 },
  { id: 'arbitrage', label: 'Arbitrage', count: 1 }
];

const riskColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-600 border-red-500/20'
};

const getRiskIcon = (risk: string) => {
  switch (risk) {
    case 'low': return Shield;
    case 'medium': return TrendingUp;
    case 'high': return Zap;
    default: return Shield;
  }
};

export default function PoolsSection() {
  const { isConnected } = useAccount();
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('apy');

  const filteredPools = mockPools
    .filter(pool => activeFilter === 'all' || pool.category === activeFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy': return b.apy - a.apy;
        case 'tvl': return b.totalStaked - a.totalStaked;
        case 'participants': return b.participants - a.participants;
        default: return 0;
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="py-16 px-4 bg-background">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Active <span className="text-primary">Liquidity Pools</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover high-yield opportunities across different risk profiles and strategies
          </p>

          {/* Create Pool Button */}
          <motion.div
            className="mt-8"
            variants={itemVariants}
          >
            {isConnected ? (
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="relative px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 hover:from-primary/90 hover:via-chart-2/90 hover:to-chart-3/90 text-primary-foreground shadow-2xl overflow-hidden group"
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Sparkle effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create New Pool
                    <Plus className="w-5 h-5" />
                  </span>
                </Button>

                {/* Glowing border effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-chart-2 to-chart-3 opacity-0 blur-lg -z-10"
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <motion.div
                    className="relative inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      onClick={openConnectModal}
                      className="relative px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 hover:from-primary/90 hover:via-chart-2/90 hover:to-chart-3/90 text-primary-foreground shadow-2xl overflow-hidden group"
                    >
                      {/* Animated shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Sparkle effect */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          background: [
                            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />

                      <span className="relative z-10 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Connect Wallet to Create Pool
                      </span>
                    </Button>

                    {/* Glowing border effect */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-chart-2 to-chart-3 opacity-0 blur-lg -z-10"
                      animate={{
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.1, 0.8]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                )}
              </ConnectButton.Custom>
            )}
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          variants={itemVariants}
        >
          {filterCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === category.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label} ({category.count})
            </motion.button>
          ))}
        </motion.div>

        {/* Sort Options */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          variants={itemVariants}
        >
          <span className="text-sm text-muted-foreground self-center mr-2">Sort by:</span>
          {[
            { id: 'apy', label: 'APY' },
            { id: 'tvl', label: 'TVL' },
            { id: 'participants', label: 'Participants' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={`px-3 py-1 rounded-md text-sm ${sortBy === option.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Pools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <AnimatePresence mode="popLayout">
            {filteredPools.map((pool) => {
              const RiskIcon = getRiskIcon(pool.risk);

              return (
                <motion.div
                  key={pool.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
                  }}
                  className="group"
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {pool.title}
                        </CardTitle>
                        <div className={`p-1.5 rounded-full ${riskColors[pool.risk]}`}>
                          <RiskIcon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {pool.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-muted/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Pool Size</span>
                          <span className="font-semibold text-lg">
                            {formatCurrency(pool.usdcAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Min. Access Tokens</span>
                          <span className="font-medium">
                            {formatNumber(pool.minAccessTokens)} ACCESS
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">APY</span>
                          <span className="font-bold text-xl text-primary">
                            {pool.apy}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Staked</span>
                          <span>{formatCurrency(pool.totalStaked)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-primary to-chart-2 h-2 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min((pool.totalStaked / 3000000) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{pool.participants}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ends in {pool.timeLeft}
                        </div>
                      </div>

                      {/* Action Button */}
                      {isConnected ? (
                        <Button
                          className="w-full mt-4 group-hover:shadow-lg transition-all"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Join Pool
                        </Button>
                      ) : (
                        <ConnectButton.Custom>
                          {({ openConnectModal }) => (
                            <Button
                              onClick={openConnectModal}
                              className="w-full mt-4 group-hover:shadow-lg transition-all"
                              size="sm"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connect Wallet
                            </Button>
                          )}
                        </ConnectButton.Custom>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button */}
        <motion.div
          className="text-center mt-12"
          variants={itemVariants}
        >
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            Load More Pools
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
