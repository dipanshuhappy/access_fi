"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Pools', href: '#pools' },
  { name: 'Swap', href: '#swap' },
  { name: 'Analytics', href: '#analytics' },
  { name: 'Docs', href: '#docs' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
        ? 'bg-background/95 backdrop-blur-md border-b border-border/50'
        : 'bg-background/10 backdrop-blur-sm'
        }`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(hsl(var(--primary)), 0)",
                  "0 0 20px rgba(hsl(var(--primary)), 0.3)",
                  "0 0 0 rgba(hsl(var(--primary)), 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Access Fi
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {item.name}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-chart-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />
              </motion.a>
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <motion.button
                              onClick={openConnectModal}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                              whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 25px rgba(hsl(var(--primary)), 0.3)"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Connect Wallet
                            </motion.button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <motion.button
                              onClick={openChainModal}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 py-2 rounded-full font-medium transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Wrong network
                            </motion.button>
                          );
                        }

                        return (
                          <div className="flex items-center space-x-3">
                            <motion.button
                              onClick={openChainModal}
                              className="flex items-center bg-muted hover:bg-muted/80 px-3 py-2 rounded-full text-sm font-medium transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {chain.hasIcon && (
                                <div className="w-4 h-4 mr-2 rounded-full overflow-hidden">
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? 'Chain icon'}
                                      src={chain.iconUrl}
                                      className="w-4 h-4"
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </motion.button>

                            <motion.button
                              onClick={openAccountModal}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-medium transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {account.displayName}
                            </motion.button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary focus:outline-none"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className="md:hidden overflow-hidden"
          variants={menuVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/98 backdrop-blur-md rounded-lg mt-2 border border-border/50 shadow-lg">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                variants={itemVariants}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </motion.a>
            ))}
            <motion.div
              className="pt-3"
              variants={itemVariants}
            >
              <ConnectButton />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Animated border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{
          opacity: [0, 1, 0],
          scaleX: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.nav>
  );
}
