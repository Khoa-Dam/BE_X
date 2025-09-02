import React from 'react';
import { Search } from 'lucide-react';
import TrendItem from './TrendItem';
import FollowSuggestionItem from './FollowSuggestionItem';

const trends = [
    { category: 'Trending in Technology', topic: 'Hulk-Hub', posts: '125K posts' },
    { category: 'Trending', topic: 'Social Media', posts: '89.2K posts' },
    { category: 'Technology · Trending', topic: 'React', posts: '45.8K posts' },
];

const whoToFollow = [
    { name: 'Bruce Banner', username: 'hulkscientist', verified: true, avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqx0cT1HzvxSTfdYqsGaBkrZGHLsXrfiV6qxA0DhpVwdQARNRjA6lTbNQwRM2KqD9OZkw&usqp=CAU' },
    { name: 'Tony Stark', username: 'ironman', verified: true, avatar: 'https://media.istockphoto.com/id/1360554439/vi/anh/%C4%91%E1%BA%A3o-nhi%E1%BB%87t-%C4%91%E1%BB%9Bi-maldives.jpg?s=612x612&w=0&k=20&c=pqWxvBFhn0_mJQF-oNyiDS56iahHule2vZmmVbjc_TA=' },
    { name: 'Peter Parker', username: 'spiderman', verified: false, avatar: 'https://picsum.photos/seed/picsum/400/400' },
];

const RightSidebar = () => {
  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Search */}
      <div className="sticky top-0 bg-black pb-2 z-10">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-900 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* What's happening */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">What's happening</h2>
        <div className="space-y-1">
          {trends.map((trend) => (
            <TrendItem key={trend.topic} {...trend} />
          ))}
        </div>
        <button className="text-blue-500 hover:underline mt-3 p-3">Show more</button>
      </div>

      {/* Who to follow */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">Who to follow</h2>
        <div className="space-y-1">
          {whoToFollow.map((user) => (
            <FollowSuggestionItem key={user.username} {...user} />
          ))}
        </div>
        <button className="text-blue-500 hover:underline mt-3 p-3">Show more</button>
      </div>
    </div>
  );
};

export default RightSidebar;