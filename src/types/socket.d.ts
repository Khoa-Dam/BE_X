import { Server as SocketServer } from 'socket.io';

declare global {
    var io: SocketServer | undefined;
    
    namespace Express {
        interface Request {
            io?: SocketServer;
        }
    }
}
