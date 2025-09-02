import { openDB } from 'idb';

const DB_NAME = 'social-app-db';
const POSTS_STORE_NAME = 'posts';
const USERS_STORE_NAME = 'users';
const DB_VERSION = 2; // Incremented version to trigger upgrade

interface User {
    id?: number;
    name: string;
    email: string;
    password?: string;
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

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(POSTS_STORE_NAME)) {
      db.createObjectStore(POSTS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(USERS_STORE_NAME)) {
        const usersStore = db.createObjectStore(USERS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('username', 'username', { unique: true });
    }
  },
});

// Post functions
export const addPost = async (post: any) => {
  const db = await dbPromise;
  await db.add(POSTS_STORE_NAME, post);
};

export const getAllPosts = async () => {
  const db = await dbPromise;
  return await db.getAll(POSTS_STORE_NAME);
};

export const deletePost = async (id: number) => {
  const db = await dbPromise;
  await db.delete(POSTS_STORE_NAME, id);
};

export const updatePost = async (post: any) => {
  const db = await dbPromise;
  await db.put(POSTS_STORE_NAME, post);
};

export const seedPosts = async () => {
    const db = await dbPromise;
    const count = await db.count(POSTS_STORE_NAME);
  
    if (count === 0) {
      const samplePosts = [
        {
          id: 1,
          author: 'Alice',
          handle: 'alice_wonder',
          time: '2h',
          content: 'Just enjoyed a wonderful cup of coffee this morning! #coffee #morningvibes',
          likes: 15,
          comments: 3,
          retweets: 1,
          avatar: 'https://i.pravatar.cc/150?img=1',
          image: undefined,
        },
        {
          id: 2,
          author: 'Bob',
          handle: 'bob_builder',
          time: '5h',
          content: 'Working on a new project. So excited to share it soon!',
          likes: 30,
          comments: 7,
          retweets: 5,
          avatar: 'https://i.pravatar.cc/150?img=2',
          image: 'https://picsum.photos/600/400?random=1', // Sample image URL
        },
        {
          id: 3,
          author: 'Charlie',
          handle: 'charlie_chaplin',
          time: '1d',
          content: 'What a beautiful sunset today! Nature never ceases to amaze me. #sunset #nature',
          likes: 50,
          comments: 10,
          retweets: 8,
          avatar: 'https://i.pravatar.cc/150?img=3',
          image: 'https://picsum.photos/600/400?random=2', // Sample image URL
        },
        {
          id: 4,
          author: 'Diana',
          handle: 'diana_prince',
          time: '2d',
          content: 'Reading a great book. Any recommendations for my next read?',
          likes: 22,
          comments: 5,
          retweets: 2,
          avatar: 'https://i.pravatar.cc/150?img=4',
          image: undefined,
        },
      ];
  
      for (const post of samplePosts) {
        await db.add(POSTS_STORE_NAME, post);
      }
      console.log('Sample posts added to IndexedDB.');
    }
  };

// User functions
export const addUser = async (user: User) => {
    const db = await dbPromise;
    await db.add(USERS_STORE_NAME, user);
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
    const db = await dbPromise;
    return await db.getFromIndex(USERS_STORE_NAME, 'email', email);
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
    const db = await dbPromise;
    return await db.getFromIndex(USERS_STORE_NAME, 'username', username);
};

export const getCurrentUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const updateUser = async (user: User) => {
    const db = await dbPromise;
    await db.put(USERS_STORE_NAME, user);
};