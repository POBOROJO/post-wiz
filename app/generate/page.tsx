"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  Copy,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Image as ImageIcon,
  History as HistoryIcon,
  BookOpen,
  RefreshCw,
  Camera,
} from "lucide-react";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import  Navbar  from "@/components/Navbar";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getUserPoints,
  saveGeneratedContent,
  updateUserPoints,
  getGeneratedContentHistory,
  createOrUpdateUser,
} from "@/utils/db/actions";
import { TwitterMock } from "@/components/social-mocks/TwitterMock";
import { InstagramMock } from "@/components/social-mocks/InstagramMock";
import { LinkedInMock } from "@/components/social-mocks/LinkedInMock";
import { ImageGenerator } from "@/components/social-mocks/ImageGenerator";
import Link from "next/link";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const contentTypes = [
  { value: "twitter", label: "Twitter Thread", icon: <Twitter className="h-5 w-5 text-blue-400" /> },
  { value: "instagram", label: "Instagram Caption", icon: <Instagram className="h-5 w-5 text-pink-400" /> },
  { value: "linkedin", label: "LinkedIn Post", icon: <Linkedin className="h-5 w-5 text-blue-600" /> },
  { value: "image", label: "Image Generator", icon: <Camera className="h-5 w-5 text-purple-400" /> },
];

const MAX_TWEET_LENGTH = 280;
const POINTS_PER_GENERATION = 5;
const MAX_IMAGES = 10;

interface HistoryItem {
  id: number;
  contentType: string;
  prompt: string;
  content: string;
  createdAt: Date;
}

export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [notifications, setNotifications] = useState<{type: 'success' | 'error', message: string}[]>([]);

  useEffect(() => {
    if (!apiKey) {
      console.error("Gemini API key is not set");
      addNotification('error', 'API key is not configured correctly');
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isSignedIn && user) {
      console.log("User loaded:", user);
      fetchUserPoints();
      fetchContentHistory();
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Reset images when changing content type
  useEffect(() => {
    setImages([]);
  }, [contentType]);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.message !== message));
    }, 3000);
  };

  const fetchUserPoints = async () => {
    if (user?.id) {
      console.log("Fetching points for user:", user.id);
      const points = await getUserPoints(user.id);
      console.log("Fetched points:", points);
      setUserPoints(points);
      if (points === 0) {
        console.log("User has 0 points. Attempting to create/update user.");
        const updatedUser = await createOrUpdateUser(
          user.id,
          user.emailAddresses[0].emailAddress,
          user.fullName || ""
        );
        console.log("Updated user:", updatedUser);
        if (updatedUser) {
          setUserPoints(updatedUser.points);
        }
      }
    }
  };

  const fetchContentHistory = async () => {
    if (user?.id) {
      const contentHistory = await getGeneratedContentHistory(user.id);
      setHistory(contentHistory);
    }
  };

  const handleGenerate = async () => {
    if (
      !genAI ||
      !user?.id ||
      userPoints === null ||
      userPoints < POINTS_PER_GENERATION
    ) {
      addNotification('error', 'Not enough points or API key not set');
      return;
    }

    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      let promptText = `Generate ${contentType} content about "${prompt}".`;
      if (contentType === "twitter") {
        promptText +=
          " Provide a thread of 5 tweets, each under 280 characters.";
      }

      let imageParts: Part[] = [];
      if (contentType === "instagram" && images.length > 0) {
        // Process up to 4 images for analysis (limitation for prompt size)
        const imagesToProcess = images.slice(0, 4);
        
        for (const image of imagesToProcess) {
          const reader = new FileReader();
          const imageData = await new Promise<string>((resolve) => {
            reader.onload = (e) => {
              if (e.target && typeof e.target.result === "string") {
                resolve(e.target.result);
              } else {
                resolve("");
              }
            };
            reader.readAsDataURL(image);
          });

          const base64Data = imageData.split(",")[1];
          if (base64Data) {
            imageParts.push({
              inlineData: {
                data: base64Data,
                mimeType: image.type,
              },
            });
          }
        }
        
        promptText += ` ${imagesToProcess.length} image${imagesToProcess.length > 1 ? 's have' : ' has'} been provided. 
        Describe the image${imagesToProcess.length > 1 ? 's' : ''} and incorporate ${imagesToProcess.length > 1 ? 'them' : 'it'} into the caption. 
        ${imagesToProcess.length > 1 ? 'Create a cohesive caption that ties all images together.' : ''}`;
      }

      const parts: (string | Part)[] = [promptText, ...imageParts];

      const result = await model.generateContent(parts);
      const generatedText = result.response.text();

      let content: string[];
      if (contentType === "twitter") {
        content = generatedText
          .split("\n\n")
          .filter((tweet) => tweet.trim() !== "");
      } else {
        content = [generatedText];
      }

      setGeneratedContent(content);
      addNotification('success', 'Content generated successfully!');

      // Update points
      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) {
        setUserPoints(updatedUser.points);
      }

      // Save generated content
      const savedContent = await saveGeneratedContent(
        user.id,
        content.join("\n\n"),
        prompt,
        contentType
      );

      if (savedContent) {
        setHistory((prevHistory) => [savedContent, ...prevHistory]);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent(["An error occurred while generating content."]);
      addNotification('error', 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setContentType(item.contentType);
    setPrompt(item.prompt);
    setGeneratedContent(
      item.contentType === "twitter"
        ? item.content.split("\n\n")
        : [item.content]
    );
    // Reset images when loading history item
    setImages([]);
    
    // On mobile, close the sidebar after selection
    if (window.innerWidth < 1024) {
      setIsHistorySidebarOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('success', 'Copied to clipboard!');
  };

  const handleImageUpload = (files: File[]) => {
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length < files.length) {
      addNotification('error', 'Some files were not images and were ignored');
    }
    
    // Limit to MAX_IMAGES
    const remainingSlots = MAX_IMAGES - images.length;
    const newImages = validImages.slice(0, remainingSlots);
    
    if (newImages.length < validImages.length) {
      addNotification('error', `Only ${MAX_IMAGES} images allowed - only added the first ${remainingSlots}`);
    }
    
    if (newImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...newImages]);
      addNotification('success', `Added ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    addNotification('success', 'Image removed');
  };

  const renderContentMock = () => {
    if (generatedContent.length === 0 || contentType === "image") return null;

    switch (contentType) {
      case "twitter":
        return <TwitterMock content={generatedContent} />;
      case "instagram":
        return (
          <InstagramMock 
            content={generatedContent[0]} 
            images={images}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        );
      case "linkedin":
        return <LinkedInMock content={generatedContent[0]} />;
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(t => t.value === type);
    return contentType?.icon || null;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center bg-gray-800/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-700">
          <Zap className="h-12 w-12 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            ThreadCraft AI
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Generate engaging content for your social media presence with AI. Sign in to get started with your creative journey.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg w-full">
              Sign In / Sign Up
            </Button>
          </SignInButton>
          <p className="text-gray-500 mt-6 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Navbar />
      
      {/* Notifications */}
      <div className="fixed top-24 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div 
            key={index} 
            className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center space-x-2 animate-in fade-in slide-in-from-right-5 ${
              notification.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-6 pt-24 lg:py-8 lg:px-6 relative">
        {/* Mobile History Toggle */}
        <div className="lg:hidden mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Content Generator</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsHistorySidebarOpen(prev => !prev)}
            className="text-gray-400 hover:text-white"
          >
            <HistoryIcon className="w-5 h-5 mr-2" />
            History
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* History Sidebar - Mobile First approach */}
          <div className={`
            lg:col-span-1 order-2 lg:order-1
            ${isHistorySidebarOpen ? 'block' : 'hidden'} 
            lg:block
            bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden
          `}>
            <div className="p-4 border-b border-gray-700/50 bg-gray-800/80 flex items-center justify-between">
              <div className="flex items-center">
                <HistoryIcon className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-medium text-white">History</h2>
              </div>
              <button 
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setIsHistorySidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="h-[calc(100vh-13rem)] lg:h-[calc(100vh-15rem)] overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <BookOpen className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Your generation history will appear here</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-700/50 ${
                      selectedHistoryItem?.id === item.id ? 'bg-gray-700/80 border border-blue-500/30' : 'bg-gray-700/30 border border-transparent'
                    }`}
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="flex items-center mb-2">
                      {getContentTypeIcon(item.contentType)}
                      <span className="ml-2 text-sm font-medium text-gray-300">
                        {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 truncate font-medium">
                      {item.prompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {item.content.substring(0, 100)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Points display */}
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 p-2 rounded-full mr-3">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Available Points</p>
                  <p className="text-2xl font-bold text-white">
                    {userPoints !== null ? userPoints : "Loading..."}
                  </p>
                </div>
              </div>
              <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-6 rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg border-0"
              >
                <Link href="/pricing">Get More Points</Link>
              </Button>
            </div>

            {/* Content generation form */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Content Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value)}
                      className={`
                        flex items-center justify-center p-4 rounded-xl transition-all duration-200
                        ${contentType === type.value 
                          ? 'bg-gray-700 border-2 border-blue-500/50 shadow-md' 
                          : 'bg-gray-700/40 border border-gray-700 hover:bg-gray-700/70'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-2">
                          {type.icon}
                        </div>
                        <span className="text-sm">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {contentType === "image" ? (
                <ImageGenerator 
                  userPoints={userPoints} 
                  onPointsUpdate={setUserPoints}
                  onNotification={addNotification}
                />
              ) : (
                <>
                  {contentType === "instagram" && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Images
                      </label>
                      <div 
                        className={`
                          border-2 rounded-xl p-6 transition-colors duration-200
                          ${isDragging ? 'border-blue-500 bg-blue-500/10' : images.length > 0 ? 'border-gray-600 bg-gray-700/30' : 'border-dashed border-gray-600 bg-gray-700/20'}
                        `}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const filesArray = Array.from(e.dataTransfer.files);
                            handleImageUpload(filesArray);
                          }
                        }}
                      >
                        {images.length === 0 ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-700/70 p-3 rounded-full mb-4">
                              <ImageIcon className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-base text-gray-300 mb-2">
                              Drag and drop images or 
                              <label htmlFor="file-upload" className="text-blue-400 cursor-pointer ml-1 hover:underline">
                                browse
                              </label>
                            </p>
                            <p className="text-sm text-gray-400 text-center max-w-md">
                              Upload multiple images for an Instagram carousel
                              <br/>
                              <span className="text-xs">(supports up to {MAX_IMAGES} images)</span>
                            </p>
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const filesArray = Array.from(e.target.files);
                                  handleImageUpload(filesArray);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-sm text-blue-400 font-medium">
                                {images.length} of {MAX_IMAGES} image{images.length !== 1 ? 's' : ''} uploaded
                              </p>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => {
                                    document.getElementById('add-more-images')?.click();
                                  }}
                                  className="text-xs flex items-center text-gray-300 hover:text-blue-400 bg-gray-700/50 hover:bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Add more
                                </button>
                                <button 
                                  onClick={() => setImages([])}
                                  className="text-xs flex items-center text-gray-300 hover:text-red-400 bg-gray-700/50 hover:bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Clear all
                                </button>
                              </div>
                              <input
                                id="add-more-images"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const filesArray = Array.from(e.target.files);
                                    handleImageUpload(filesArray);
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-gray-700 rounded-lg overflow-hidden group">
                                  <img 
                                    src={URL.createObjectURL(img)} 
                                    alt={`Upload preview ${idx + 1}`} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                                    <button 
                                      onClick={() => handleImageRemove(idx)}
                                      className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-opacity duration-200"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="prompt"
                      className="block text-sm font-medium mb-2 text-gray-300"
                    >
                      Prompt
                    </label>
                    <Textarea
                      id="prompt"
                      placeholder={`Describe what you want to generate...${contentType === "instagram" && images.length > 0 ? ' The AI will analyze your images.' : ''}`}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-700/50 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 rounded-xl resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={
                      isLoading ||
                      !prompt ||
                      userPoints === null ||
                      userPoints < POINTS_PER_GENERATION
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:hover:from-blue-600 disabled:hover:to-blue-500 border-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Zap className="mr-2 h-5 w-5" />
                        <span>Generate Content ({POINTS_PER_GENERATION} points)</span>
                      </div>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Generated content display */}
            {contentType !== "image" && (selectedHistoryItem || generatedContent.length > 0) && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    {selectedHistoryItem ? (
                      <>
                        <HistoryIcon className="w-5 h-5 text-blue-400 mr-2" />
                        History Item
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5 text-blue-400 mr-2" />
                        Generated Content
                      </>
                    )}
                  </h2>
                  {selectedHistoryItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHistoryItem(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Create New
                    </Button>
                  )}
                </div>
                
                {contentType === "twitter" ? (
                  <div className="space-y-4">
                    {(selectedHistoryItem
                      ? selectedHistoryItem.content.split("\n\n")
                      : generatedContent
                    ).map((tweet, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 border border-gray-600/50 p-5 rounded-xl relative"
                      >
                        <div className="flex items-center mb-3">
                          <Twitter className="h-5 w-5 text-blue-400 mr-2" />
                          <span className="text-xs font-medium text-gray-300">
                            Tweet {index + 1} of {(selectedHistoryItem
                              ? selectedHistoryItem.content.split("\n\n")
                              : generatedContent).length}
                          </span>
                        </div>
                        <ReactMarkdown className="prose prose-invert max-w-none mb-3 text-sm">
                          {tweet}
                        </ReactMarkdown>
                        <div className="flex justify-between items-center text-gray-400 text-xs mt-2">
                          <span className="bg-gray-800 px-2 py-1 rounded-md">
                            {tweet.length}/{MAX_TWEET_LENGTH}
                            {tweet.length > MAX_TWEET_LENGTH && (
                              <span className="text-red-400 ml-1">Too long!</span>
                            )}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(tweet)}
                            className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors border-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700/50 border border-gray-600/50 p-5 rounded-xl">
                    <div className="flex items-center mb-3">
                      {contentType === "instagram" ? (
                        <Instagram className="h-5 w-5 text-pink-400 mr-2" />
                      ) : (
                        <Linkedin className="h-5 w-5 text-blue-600 mr-2" />
                      )}
                      <span className="text-xs font-medium text-gray-300">
                        {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Caption
                      </span>
                    </div>
                    <ReactMarkdown className="prose prose-invert max-w-none text-sm mb-3">
                      {selectedHistoryItem
                        ? selectedHistoryItem.content
                        : generatedContent[0]}
                    </ReactMarkdown>
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={() => 
                          copyToClipboard(selectedHistoryItem 
                            ? selectedHistoryItem.content 
                            : generatedContent[0]
                          )
                        }
                        className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors border-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content preview */}
            {contentType !== "image" && ((contentType === "instagram" && images.length > 0) || (generatedContent.length > 0)) && (
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
                  <ImageIcon className="w-5 h-5 text-blue-400 mr-2" />
                  Preview
                </h2>
                <div className="flex justify-center">
                  {contentType === "instagram" && images.length > 0 && generatedContent.length === 0 ? (
                    <InstagramMock 
                      content="Your caption will appear here after generation."
                      images={images}
                      onImageUpload={handleImageUpload}
                      onImageRemove={handleImageRemove}
                    />
                  ) : (
                    renderContentMock()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}