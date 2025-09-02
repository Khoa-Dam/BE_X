import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
    await mongoose.connect(env.MONGODB_URI, {
        autoIndex: true
    });
    // Optional: log index creation errors
    mongoose.connection.on('error', (e) => console.error('Mongo error:', e));
}
