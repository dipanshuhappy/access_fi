"use client";

import { motion } from 'framer-motion';
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// Three.js animated components
function AnimatedDollar() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 2;
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        ref={meshRef}
        fontSize={1.5}
        position={[-3, 0, 0]}
        color="#00ff88"
      >
        $
      </Text>
    </Float>
  );
}

function AnimatedData() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 2;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[3, 0, 0]}>
      {Array.from({ length: 8 }, (_, i) => (
        <Float
          key={i}
          speed={1 + i * 0.2}
          rotationIntensity={0.3}
          floatIntensity={0.3}
          position={[
            Math.cos(i * 0.785) * 0.8,
            Math.sin(i * 0.785) * 0.8,
            0
          ]}
        >
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial
              color="#0088ff"
              emissive="#0088ff"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function SwapArrow() {
  const arrowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      arrowRef.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <mesh ref={arrowRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
    </mesh>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null!);
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        positions[i3 + 1] += Math.cos(state.clock.elapsedTime + i) * 0.002;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ff88"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088ff" />

      <Suspense fallback={null}>
        <ParticleField />
        <AnimatedDollar />
        <SwapArrow />
        <AnimatedData />
      </Suspense>
    </Canvas>
  );
}

export default function HeroBanner() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
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

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 70%),
              radial-gradient(circle at 80% 50%, hsl(var(--chart-2)) 0%, transparent 70%)
            `
          }}
        />
      </div>

      {/* Three.js Scene */}
      <div className="absolute inset-0 opacity-60">
        <ThreeScene />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            Swap Data for Value
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Transform your digital assets through{" "}
          <span className="text-primary font-semibold">intelligent pools</span> and{" "}
          <span className="text-chart-2 font-semibold">automated strategies</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.div
            className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-full"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: [
                "0 0 0 rgba(var(--primary-rgb), 0)",
                "0 0 20px rgba(var(--primary-rgb), 0.3)",
                "0 0 0 rgba(var(--primary-rgb), 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-primary font-semibold">Live Trading Active</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-muted-foreground"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" />
            <span>Real-time swaps in progress</span>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          variants={containerVariants}
        >
          {[
            { label: "Total Volume", value: "$24.7M", change: "+12.3%" },
            { label: "Active Pools", value: "127", change: "+5" },
            { label: "Avg APY", value: "18.5%", change: "+2.1%" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-chart-2 font-medium">{stat.change}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
