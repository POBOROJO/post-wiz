"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Download,
  RefreshCw,
  Wand2,
  X,
  Info,
  Camera,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/nextjs";
import { updateUserPoints } from "@/utils/db/actions";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Cost in points for generating an image
const IMAGE_GENERATION_COST = 10;

interface ImageGeneratorProps {
  userPoints: number | null;
  onPointsUpdate: (points: number) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

export function ImageGenerator({ userPoints, onPointsUpdate, onNotification }: ImageGeneratorProps) {
  const { user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const hasEnoughPoints = userPoints !== null && userPoints >= IMAGE_GENERATION_COST;

  const generateImage = async () => {
    if (!genAI || !prompt || !hasEnoughPoints || !user?.id) {
      if (!hasEnoughPoints) {
        onNotification('error', 'Not enough points for image generation');
      } else if (!prompt) {
        onNotification('error', 'Please enter a prompt first');
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Using Gemini 2.0 Flash for image generation
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
      });
      
      // Generation configuration
      const generationConfig = {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      };

      // Generate the image
      const result = await model.generateContent(prompt);

      // Extract image data
      let imageDataUrl = null;
      const responseData = result.response;

      if (responseData.candidates && responseData.candidates.length > 0) {
        const candidate = responseData.candidates[0];
        
        if (candidate.content && candidate.content.parts) {
          // Loop through parts to find image data
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              imageDataUrl = `data:${mimeType};base64,${imageData}`;
              break;
            }
          }
        }
      }

      if (!imageDataUrl) {
        throw new Error("No image was generated. Please try a different prompt.");
      }

      // Set the generated image
      setGeneratedImage(imageDataUrl);
      
      // Update user points
      const updatedUser = await updateUserPoints(
        user.id,
        -IMAGE_GENERATION_COST
      );
      
      if (updatedUser && updatedUser.points !== null) {
        onPointsUpdate(updatedUser.points);
      }
      
      onNotification('success', 'Image generated successfully!');
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError(err.message || "Failed to generate image. Please try again.");
      onNotification('error', 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `threadcraft-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onNotification('success', 'Image download started');
  };

  const clearImage = () => {
    setGeneratedImage(null);
  };

  // Example prompts for inspiration
  const examplePrompts = [
    "A serene mountain landscape at sunset with reflections in a lake",
    "A futuristic cityscape with flying vehicles and neon lights",
    "A photorealistic portrait of a smiling woman with curly hair",
    "A cute robot sitting in a cafe reading a newspaper",
    "An elegant product photo of a smartphone on a minimalist desk"
  ];

  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Wand2 className="w-5 h-5 text-purple-400 mr-2" />
            AI Image Generator
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="text-gray-400 hover:text-white"
          >
            <Info className="h-4 w-4 mr-1" />
            Tips
          </Button>
        </div>

        {showTips && (
          <div className="bg-gray-700/50 border border-gray-600/50 p-4 rounded-xl text-sm text-gray-300">
            <h4 className="font-medium mb-2 text-white">Tips for better images:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be specific about what you want to see</li>
              <li>Mention style, lighting, and perspective</li>
              <li>Include details about colors and mood</li>
              <li>Specify if you want photorealistic or artistic style</li>
            </ul>
          </div>
        )}

        <div>
          <label
            htmlFor="imagePrompt"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Describe the image you want to generate
          </label>
          <Textarea
            id="imagePrompt"
            placeholder="Describe the image in detail. Include style, colors, subjects, and mood..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-700/50 border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 rounded-xl resize-none"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">Try one of these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => useExamplePrompt(example)}
                className="text-xs bg-gray-700/70 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
              >
                {example.length > 40 ? example.substring(0, 40) + "..." : example}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt || !hasEnoughPoints}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:hover:from-purple-600 disabled:hover:to-blue-500 border-0"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Generating Image...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Camera className="mr-2 h-5 w-5" />
                <span>Generate Image ({IMAGE_GENERATION_COST} points)</span>
              </div>
            )}
          </Button>
          
          {!hasEnoughPoints && (
            <p className="text-sm text-red-400 mt-2 text-center">
              You need {IMAGE_GENERATION_COST} points to generate an image.
            </p>
          )}
        </div>
      </div>

      {/* Generated Image Display */}
      {(generatedImage || isGenerating || error) && (
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Generated Image
            </h3>
            {generatedImage && (
              <div className="flex space-x-2">
                <Button
                  onClick={downloadImage}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border-0 flex items-center"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  onClick={clearImage}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border-0"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/50 aspect-square flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-300">Creating your masterpiece...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a minute</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="AI Generated"
                className="w-full h-full object-contain"
              />
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <X className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-red-400">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 text-white"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}