import React, { useState, useRef } from 'react';
import { Image, Trash2, Smile, Calendar, X } from 'lucide-react';

interface PostComposerProps {
  onPost: (content: string, image?: File) => void;
  avatar: string;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPost, avatar }) => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 280;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearContent = () => {
    setContent('');
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || imageFile) {
      onPost(content, imageFile || undefined);
      clearContent();
    }
  };

  return (
    <div className="border-b border-gray-800 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <img src={avatar} alt="Your avatar" className="w-12 h-12 rounded-full object-cover" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What is happening?!"
              className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none focus:outline-none min-h-[120px]"
              rows={3}
              maxLength={maxLength}
            />

            {imagePreview && (
              <div className="relative my-4 z-0">
                <img src={imagePreview} alt="Selected preview" className="rounded-2xl max-h-80 w-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-1.5 hover:bg-opacity-90 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="file" accept="image/*" onChange={handleImageSelect} ref={fileInputRef} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors"
                >
                  <Image size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => alert('Emoji picker coming soon!')}
                  className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors"
                >
                  <Smile size={20} />
                </button>
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full transition-colors"
                >
                  <Calendar size={20} />
                </button>
                {(content || imageFile) && (
                    <button
                    type="button"
                    onClick={clearContent}
                    className="text-red-500 hover:bg-red-500 hover:bg-opacity-10 p-2 rounded-full transition-colors"
                    >
                    <Trash2 size={20} />
                    </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {content.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      content.length > maxLength * 0.8 ? 'border-orange-500' : 'border-gray-600'
                    }`}>
                      <span className={`text-xs ${content.length > maxLength * 0.8 ? 'text-orange-500' : 'text-gray-500'}`}>
                        {maxLength - content.length}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!content.trim() && !imageFile}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-1.5 rounded-full font-bold transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
