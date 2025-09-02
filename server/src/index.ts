import { createServer } from 'http';
import { app } from './app';
import { env } from './env';
import { connectDB } from './db';
import { initializeSocket } from './lib/socket';

(async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected');
        
        const httpServer = createServer(app);
        const io = initializeSocket(httpServer);
        
        // Make io available globally
        (global as any).io = io;
        
        httpServer.listen(env.PORT, () => console.log(`🚀 http://localhost:${env.PORT}`));
    } catch (e) {
        console.error('❌ Startup failed', e);
        process.exit(1);
    }
})();
