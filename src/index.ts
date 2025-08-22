import 'reflect-metadata';
import { app } from './app';
import { env } from './env';
import { AppDataSource } from './db';

(async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ DataSource initialized');
        app.listen(env.PORT, () => console.log(`🚀 http://localhost:${env.PORT}`));
    } catch (e) {
        console.error('❌ DataSource init failed', e);
        process.exit(1);
    }
})();
