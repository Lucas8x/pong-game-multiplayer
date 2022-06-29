import express from 'express';
import { Socket } from 'socket.io';
import http from 'http';
import chalk from 'chalk';

import { log } from './utils';
import { enableMonitor, config } from './utils/env';
import { SocketServer } from './socketio';
import { Monitor } from './utils/monitor';
import { Lobby } from './controllers/lobby';

const { MAX_ROOMS, PORT, TICK_RATE, BALL_SPEED } = config;

const app = express();
const server = http.createServer(app);
const io = SocketServer.getInstance(server);

app.use(express.static('public'));

const lobby = new Lobby(MAX_ROOMS);

const currentConnections = () => `${io.engine.clientsCount}/${MAX_ROOMS * 2}`;
io.on('connection', (socket: Socket) => {
  if (io.engine.clientsCount > MAX_ROOMS * 2) {
    socket.emit('server reached max connections');
    socket.conn.close();
    return;
  }

  const { id } = socket;
  log(
    chalk`[{green IO}] [{green ${currentConnections()}}] New Connection: {cyan ${id}}`
  );

  socket.on('enter_game', () => {
    lobby.quickJoin(socket);
  });

  socket.on('enter_with_id', () => {});

  socket.on('disconnect', () => {
    log(
      chalk`[{red IO}] [{red ${currentConnections()}}] Disconnected: {cyan ${id}}`
    );
  });
});

server.listen(PORT, () => {
  log(
    chalk`[{magenta SERVER}] Listening on port: {cyan ${PORT}}`,
    chalk`\n[{magenta SERVER}] Max rooms: {cyan ${MAX_ROOMS}}`,
    chalk`\n[{magenta SERVER}] Max connections: {cyan ${MAX_ROOMS * 2}}`,
    chalk`\n[{magenta SERVER}] Game tick rate: {cyan ${TICK_RATE}}`,
    chalk`\n[{magenta SERVER}] Game ball speed: {cyan ${BALL_SPEED}}`
  );
  enableMonitor && Monitor(lobby, io);
});
