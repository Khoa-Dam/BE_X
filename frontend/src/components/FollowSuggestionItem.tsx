import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface FollowSuggestionItemProps {
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

const FollowSuggestionItem: React.FC<FollowSuggestionItemProps> = ({ name, username, avatar, verified }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors duration-200">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-white truncate hover:underline cursor-pointer">
              {name}
            </span>
            {verified && <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />}
          </div>
          <p className="text-gray-500 text-sm truncate">
            @{username}
          </p>
        </div>
      </div>
      <button className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors flex-shrink-0">
        Follow
      </button>
    </div>
  );
};

export default FollowSuggestionItem;
