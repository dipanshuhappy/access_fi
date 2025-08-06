"use client";

import dynamic from 'next/dynamic';
import HeroBanner from '~/components/HeroBanner';
import PoolsSection from '~/components/PoolsSection';


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner with Three.js Animation */}
      <HeroBanner />

      {/* Pools Section */}
      <PoolsSection />
    </div>
  );
}
