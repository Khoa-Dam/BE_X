import React from 'react';
import { Search, Settings2 } from 'lucide-react';
import TrendItem from '../components/TrendItem';
import FollowSuggestionItem from '../components/FollowSuggestionItem';

// Placeholder data
const trends = [
  { category: 'Trending in Technology', topic: 'Hulk-Hub', posts: '125K posts' },
  { category: 'Trending', topic: 'Social Media', posts: '89.2K posts' },
  { category: 'Technology · Trending', topic: 'React', posts: '45.8K posts' },
  { category: 'Trending in Vietnam', topic: 'Tech News', posts: '23.1K posts' },
  { category: 'Music · Trending', topic: '#AlbumOfTheYear', posts: '1M posts' },
];

const whoToFollow = [
    { name: 'Bruce Banner', username: 'hulkscientist', verified: true, avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqx0cT1HzvxSTfdYqsGaBkrZGHLsXrfiV6qxA0DhpVwdQARNRjA6lTbNQwRM2KqD9OZkw&usqp=CAU' },
    { name: 'Tony Stark', username: 'ironman', verified: true, avatar: 'https://media.istockphoto.com/id/1360554439/vi/anh/%C4%91%E1%BA%A3o-nhi%E1%BB%87t-%C4%91%E1%BB%9Bi-maldives.jpg?s=612x612&w=0&k=20&c=pqWxvBFhn0_mJQF-oNyiDS56iahHule2vZmmVbjc_TA=' },
    { name: 'Peter Parker', username: 'spiderman', verified: false, avatar: 'https://picsum.photos/seed/picsum/400/400' },
];

const explorePosts = [
    { id: 1, imageUrl: 'https://picsum.photos/seed/picsum/400/400', likes: 120, comments: 15, description: 'A beautiful landscape.' },
    { id: 2, imageUrl: 'https://picsum.photos/seed/consectetur/400/400', likes: 256, comments: 32, description: 'Exploring the city streets.' },
    { id: 3, imageUrl: 'https://picsum.photos/seed/adipiscing/400/400', likes: 98, comments: 8, description: 'Delicious food from a local cafe.' },
    { id: 4, imageUrl: 'https://picsum.photos/seed/elit/400/400', likes: 432, comments: 55, description: 'A stunning sunset over the mountains.' },
];

const Explore = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-xl border-b border-gray-800 p-3 flex items-center space-x-4 z-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search Hulk-Hub"
            className="w-full bg-gray-900 text-white rounded-full py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="text-gray-400 hover:text-white">
          <Settings2 size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 flex">
        <button className="flex-1 text-center py-3 font-bold border-b-2 border-blue-500">For You</button>
        <button className="flex-1 text-center py-3 text-gray-500 hover:bg-gray-900">Trending</button>
        <button className="flex-1 text-center py-3 text-gray-500 hover:bg-gray-900">News</button>
        <button className="flex-1 text-center py-3 text-gray-500 hover:bg-gray-900">Sports</button>
      </div>

      {/* Main Content */}
      <div className="divide-y divide-gray-800">
        {/* Trends for you */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">Trends for you</h2>
          <div className="space-y-1">
            {trends.map((trend) => (
              <TrendItem key={trend.topic} {...trend} />
            ))}
            <button className="text-blue-500 hover:underline p-3">Show more</button>
          </div>
        </div>

        {/* Image grid */}
        <div className="py-4">
            <div className="grid grid-cols-2 gap-1">
                {explorePosts.map(p => <img key={p.id} src={p.imageUrl} className="w-full h-full object-cover"/>)}
            </div>
        </div>

        {/* Who to follow */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">Who to follow</h2>
          <div className="space-y-1">
            {whoToFollow.map((user) => (
              <FollowSuggestionItem key={user.username} {...user} />
            ))}
            <button className="text-blue-500 hover:underline p-3">Show more</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
