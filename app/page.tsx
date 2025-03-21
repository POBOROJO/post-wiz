import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrendingUpIcon,
  ZapIcon,
  RocketIcon,
  Camera,
  Wand2,
  Check,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";
import  Navbar  from "@/components/Navbar";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-100 overflow-hidden pt-20">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 animate-float">
          <SparklesIcon className="w-8 h-8 text-yellow-400 opacity-50" />
        </div>
        <div className="absolute top-40 right-20 animate-float animation-delay-2000">
          <ZapIcon className="w-10 h-10 text-blue-400 opacity-50" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float animation-delay-4000">
          <TrendingUpIcon className="w-12 h-12 text-green-400 opacity-50" />
        </div>

        {/* Hero Section */}
        <div className="relative py-28 lg:py-36 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl"></div>
          
          {/* Animated elements */}
          <div className="absolute w-full h-full">
            <div className="absolute top-20 left-[15%] animate-pulse-slow">
              <div className="w-24 h-24 rounded-full bg-blue-500/10 backdrop-blur-xl"></div>
            </div>
            <div className="absolute top-1/2 right-[10%] animate-pulse-slow animation-delay-2000">
              <div className="w-32 h-32 rounded-full bg-purple-500/10 backdrop-blur-xl"></div>
            </div>
            <div className="absolute bottom-20 left-1/3 animate-pulse-slow animation-delay-1000">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 backdrop-blur-xl"></div>
            </div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0 text-left lg:text-left">
                <div className="inline-block px-3 py-1 mb-6 text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full">
                  AI-Powered Content Creation Platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">remarkable content</span> with AI.
                </h1>
                <p className="text-xl mb-8 text-gray-300 max-w-xl">
                  Generate compelling social media posts and stunning visuals in seconds with our advanced AI technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg transition duration-300 ease-in-out border-0 shadow-lg hover:shadow-blue-600/20"
                  >
                    <Link href="/generate">Start Creating</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-700 px-8 py-3 rounded-xl text-lg transition duration-300 ease-in-out"
                  >
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-gray-800">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 p-4 pt-8">
                    {/* Browser mockup header */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center px-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    
                    {/* Content showcase */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <div className="space-y-4">
                        <div className="bg-gray-800/80 rounded-lg p-4">
                          <TwitterIcon className="w-5 h-5 text-blue-400 mb-2" />
                          <div className="h-3 w-4/5 bg-gray-700 rounded-full"></div>
                          <div className="h-3 w-full bg-gray-700 rounded-full mt-2"></div>
                          <div className="h-3 w-2/3 bg-gray-700 rounded-full mt-2"></div>
                        </div>
                        <div className="bg-gray-800/80 rounded-lg p-4">
                          <LinkedinIcon className="w-5 h-5 text-blue-600 mb-2" />
                          <div className="h-3 w-full bg-gray-700 rounded-full"></div>
                          <div className="h-3 w-5/6 bg-gray-700 rounded-full mt-2"></div>
                          <div className="h-3 w-4/5 bg-gray-700 rounded-full mt-2"></div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gray-800/80 rounded-lg p-4 h-full flex flex-col">
                          <Camera className="w-5 h-5 text-purple-400 mb-2" />
                          <div className="flex-grow rounded-md bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                            <SparklesIcon className="w-10 h-10 text-purple-400 opacity-70" />
                          </div>
                          <div className="h-3 w-4/5 bg-gray-700 rounded-full mt-3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  New: AI Images
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20" id="features">
          <h2 className="text-3xl font-bold mb-16 text-center text-white">
            Supercharge Your Social Media Presence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {[
              {
                title: "Twitter Threads",
                icon: <TwitterIcon className="w-10 h-10 mb-4 text-blue-400" />,
                description:
                  "Generate compelling Twitter threads that engage your audience and boost your reach.",
              },
              {
                title: "Instagram Captions",
                icon: (
                  <InstagramIcon className="w-10 h-10 mb-4 text-pink-400" />
                ),
                description:
                  "Create catchy captions for your Instagram posts that increase engagement and followers.",
              },
              {
                title: "LinkedIn Posts",
                icon: <LinkedinIcon className="w-10 h-10 mb-4 text-blue-600" />,
                description:
                  "Craft professional content for your LinkedIn network to establish thought leadership.",
              },
              // New feature
              {
                title: "AI Image Generator",
                icon: <Camera className="w-10 h-10 mb-4 text-purple-400" />,
                description:
                  "Generate stunning images for your posts with our AI. No design skills needed!",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-2xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Generator Showcase */}
        <div className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-30"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 inline-block p-2 rounded-full mb-6">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-6 text-white">
                  Introducing AI Image Generation
                </h2>
                <p className="text-xl mb-6 text-gray-300">
                  Create stunning visuals for your social media posts with just a text prompt. 
                  No design skills required.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Generate custom images in seconds",
                    "Perfectly match your brand aesthetic",
                    "Create eye-catching visuals that get more engagement",
                    "Save time and money on graphic design",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-500/20 p-1 rounded-full mr-3 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white px-8 py-3 rounded-full text-lg transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <Link href="/generate">Try Image Generator</Link>
                </Button>
              </div>
              
              <div className="lg:w-1/2">
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-gray-400">AI Image Generator</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="w-full rounded-xl overflow-hidden mb-4 aspect-video bg-gradient-to-r from-purple-900/50 to-blue-900/50">
                      {/* This would be an actual image in your implementation */}
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-16 h-16 text-purple-400 opacity-70" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 w-full rounded-md bg-gray-700/50 animate-pulse"></div>
                      <div className="h-10 w-3/4 rounded-md bg-gray-700/50 animate-pulse"></div>
                      <div className="h-10 w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-gray-900 rounded-3xl my-20 relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
            <svg
              className="absolute w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L100,0 L100,100 L0,100 Z"
                fill="url(#grid-pattern)"
              />
            </svg>
            <defs>
              <pattern
                id="grid-pattern"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">
              Why Choose Our AI Content Generator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                "Save time and effort on content creation",
                "Consistently produce high-quality posts",
                "Generate professional-looking images without design skills", // New benefit
                "Increase engagement across all platforms",
                "Stay ahead of social media trends",
                "Customize content to match your brand voice",
                "Scale your social media presence effortlessly",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20 relative">
          <div className="absolute top-10 right-10 animate-spin-slow">
            <svg
              className="w-20 h-20 text-blue-500 opacity-20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-8 text-white">
            Ready to revolutionize your social media strategy?
          </h2>
          {userId ? (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              <Link href="/generate">
                Generate Content Now <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105">
                Get Started Free <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          )}
          <p className="mt-4 text-gray-400">No credit card required</p>
        </div>
      </main>
    </div>
  );
}