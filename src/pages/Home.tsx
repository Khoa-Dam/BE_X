import React, { useState, useEffect } from 'react';
import Timeline from '../components/Timeline';
import { addPost, getAllPosts, seedPosts, deletePost, updatePost, getCurrentUser } from '../utils/db';

// Define a type for the post object for type safety
export interface Post {
    id: number;
    author: string;
    handle: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    retweets: number;
    avatar?: string;
    image?: string;
}

interface User {
    id?: number;
    name: string;
    email: string;
    username: string;
    bio: string;
    avatar: string;
    backgroundAvatar: string;
    occupation: string;
    location: string;
    joinDate: string;
    stats: {
      following: number;
      followers: number;
    };
  }

const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }

        const fetchAndSeedPosts = async () => {
            await seedPosts(); // Seed posts if DB is empty
            const dbPosts = await getAllPosts();
            const sortedPosts = (dbPosts as Post[]).sort((a, b) => b.id - a.id);
            setPosts(sortedPosts);
        };
        fetchAndSeedPosts();
    }, []);

    const handleNewPost = async (content: string, imageFile?: File) => {
        if (!currentUser) return;

        let imageUrl: string | undefined;
        if (imageFile) {
            imageUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(imageFile);
            });
        }

        const newPost: Post = {
            id: Date.now(),
            author: currentUser.name,
            handle: currentUser.username,
            time: 'now',
            content,
            likes: 0,
            comments: 0,
            retweets: 0,
            avatar: currentUser.avatar,
            image: imageUrl, // Store the Data URL string
        };
        await addPost(newPost);
        const dbPosts = await getAllPosts();
        const sortedPosts = (dbPosts as Post[]).sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
    };

    const handleDeletePost = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(id);
            const dbPosts = await getAllPosts();
            const sortedPosts = (dbPosts as Post[]).sort((a, b) => b.id - a.id);
            setPosts(sortedPosts);
        }
    };

    const handleEditPost = async (updatedPost: Post) => {
        await updatePost(updatedPost);
        const dbPosts = await getAllPosts();
        const sortedPosts = (dbPosts as Post[]).sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
    };

    if (!currentUser) {
        return <div>Loading...</div>
    }

    return (
        <Timeline 
            title="Home" 
            posts={posts} 
            onNewPost={handleNewPost} 
            showComposer 
            showTabs 
            composerAvatar={currentUser.avatar}
            currentUserHandle={currentUser.username}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
        />
    );
};

export default Home;