import { app } from './app';
import { env } from './env';
import { connectDB } from './db';

(async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected');
        app.listen(env.PORT, () => console.log(`🚀 http://localhost:${env.PORT}`));
    } catch (e) {
        console.error('❌ Startup failed', e);
        process.exit(1);
    }
})();
