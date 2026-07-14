'use client';

import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { useUser } from "@/hooks/useUsers";
import { RecommendationsFeed } from "@/components/recommendations/RecommendationsFeed";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <RecommendationsFeed />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeatureCards />
    </div>
  );
}
