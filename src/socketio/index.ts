import { Server } from 'socket.io';
import http from 'http';

export class SocketServer extends Server {
  private static io: SocketServer;

  constructor(httpServer: http.Server) {
    super(httpServer);
  }

  public static getInstance(httpServer?: http.Server): SocketServer {
    if (!SocketServer.io) {
      SocketServer.io = new SocketServer(httpServer);
    }
    return SocketServer.io;
  }
}
