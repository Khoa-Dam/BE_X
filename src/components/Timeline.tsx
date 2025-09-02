import React from 'react';
import PostComposer from './PostComposer';
import Post from './Post';
import { Sparkles } from 'lucide-react';
import { Post as PostData } from '../pages/Home'; // Import the centralized Post interface

interface TimelineProps {
  title: string;
  posts: PostData[];
  onNewPost?: (content: string, image?: File) => void;
  showComposer?: boolean;
  showTabs?: boolean;
  composerAvatar?: string;
  currentUserHandle?: string;
  onDeletePost?: (id: number) => void; // Use number for ID
  onEditPost?: (updatedPost: PostData) => void;
}

const Timeline: React.FC<TimelineProps> = ({ title, posts, onNewPost, showComposer = false, showTabs = false, composerAvatar = '', currentUserHandle, onDeletePost, onEditPost }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black bg-opacity-80 backdrop-blur-xl border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{title}</h1>
          <Sparkles size={20} className="text-gray-500" />
        </div>
        
        {showTabs && (
          <div className="flex mt-4">
            <button className="flex-1 text-center py-4 font-bold border-b-2 border-blue-500">
              For you
            </button>
            <button className="flex-1 text-center py-4 text-gray-500 hover:bg-gray-900">
              Following
            </button>
          </div>
        )}
      </div>
      
      {showComposer && onNewPost && <PostComposer onPost={onNewPost} avatar={composerAvatar} />}
      
      <div className="divide-y divide-gray-800">
        {posts.map((post) => (
          <Post key={post.id} {...post} isCurrentUserPost={post.handle === currentUserHandle} onDeletePost={onDeletePost} onEditPost={onEditPost} />
        ))}
      </div>

      {posts.length > 0 && (
        <div className="text-center py-8 border-t border-gray-800">
            <button className="text-blue-500 hover:underline">
            Show more posts
            </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;
