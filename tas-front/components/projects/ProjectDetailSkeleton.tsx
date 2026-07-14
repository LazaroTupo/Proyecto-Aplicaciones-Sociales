'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ProjectDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8">
            <div className="h-6 w-32 bg-white/10 rounded mb-4" />
            <div className="h-10 w-3/4 bg-white/10 rounded mb-4" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-5/6 bg-white/10 rounded" />
          </div>

          <div className="glass-panel p-8">
            <div className="h-8 w-48 bg-white/10 rounded mb-6" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-2/3 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Right Column - Funding & Creator */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border-brand-500/20">
            <div className="h-8 w-1/2 bg-white/10 rounded mb-2" />
            <div className="h-4 w-1/3 bg-white/10 rounded mb-6" />
            
            <div className="w-full bg-black/40 h-3 rounded-full mb-4">
              <div className="w-1/3 h-full bg-white/10 rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="h-6 w-16 bg-white/10 rounded mb-1" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div>
                <div className="h-6 w-16 bg-white/10 rounded mb-1" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
            </div>

            <div className="h-12 w-full bg-white/10 rounded-lg" />
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div>
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
