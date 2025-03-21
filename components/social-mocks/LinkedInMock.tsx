import React from "react";
import { ThumbsUp, MessageSquare, Repeat, Send } from "lucide-react";

interface LinkedInMockProps {
  content: string;
  image?: File | null;
}

export const LinkedInMock: React.FC<LinkedInMockProps> = ({ content,image }) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);
  return (
    <div className="bg-white text-black rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
        <p className="font-bold">Your Name</p>
      </div>
      <div className="bg-gray-200 h-64 mb-3 flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded content"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Image Placeholder</span>
        )}
      </div>
      <p className="mb-4">{content}</p>
      <div className="flex justify-between text-gray-500">
        <ThumbsUp size={18} />
        <MessageSquare size={18} />
        <Repeat size={18} />
        <Send size={18} />
      </div>
    </div>
  );
};
