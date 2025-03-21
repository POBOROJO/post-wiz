import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  ArrowRightIcon,
  SparklesIcon,
  ZapIcon,
  RocketIcon,
  CheckCircleIcon,
  StarIcon,
  BrainIcon,
  TrendingUpIcon,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";
import  Navbar  from "@/components/Navbar";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-gray-100">
      <Navbar />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="w-12 h-12 text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Craft Perfect Social Posts with AI Magic
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed">
              Transform your ideas into engaging content across all platforms with our intelligent AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {userId ? (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Link href="/generate">
                    Start Creating
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <SignUpButton mode="modal">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              )}
              <Button
                asChild
                variant="outline"
                className="border-2 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-6 rounded-full text-lg transition-all"
              >
                <Link href="#features">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Icons */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <TwitterIcon className="w-8 h-8" />
              <span className="text-lg font-medium">Twitter</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
              <InstagramIcon className="w-8 h-8" />
              <span className="text-lg font-medium">Instagram</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors">
              <LinkedinIcon className="w-8 h-8" />
              <span className="text-lg font-medium">LinkedIn</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20" id="features">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Intelligent Content Creation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <BrainIcon className="w-10 h-10 text-blue-400" />,
                  title: "AI-Powered Writing",
                  description: "Advanced AI algorithms craft engaging content tailored to your brand voice.",
                },
                {
                  icon: <StarIcon className="w-10 h-10 text-purple-400" />,
                  title: "Platform Optimization",
                  description: "Content optimized for each social platform's unique requirements and audience.",
                },
                {
                  icon: <TrendingUpIcon className="w-10 h-10 text-pink-400" />,
                  title: "Performance Analytics",
                  description: "Track engagement and optimize your content strategy with detailed insights.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    {feature.icon}
                    <h3 className="text-2xl font-semibold mt-6 mb-4">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">
              Ready to transform your social media presence?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of creators who trust PostWiz to create engaging content that resonates with their audience.
            </p>
            {userId ? (
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Link href="/generate">
                  Start Creating Now
                  <RocketIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
                  Get Started Free
                  <RocketIcon className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            )}
            <p className="mt-4 text-sm text-gray-500">No credit card required</p>
          </div>
        </section>
      </main>
    </div>
  );
}