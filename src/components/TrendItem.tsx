import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface TrendItemProps {
  category: string;
  topic: string;
  posts: string;
}

const TrendItem: React.FC<TrendItemProps> = ({ category, topic, posts }) => {
  return (
    <div className="hover:bg-gray-800 p-3 rounded-lg cursor-pointer transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-500 text-sm">{category}</p>
          <p className="font-bold text-white">{topic}</p>
          <p className="text-gray-500 text-sm">{posts}</p>
        </div>
        <button className="text-gray-500 hover:text-blue-500">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default TrendItem;
