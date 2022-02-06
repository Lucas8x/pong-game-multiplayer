import express from 'express';
import { Socket } from 'socket.io';
import http from 'http';
import chalk from 'chalk';

import { Game } from './controllers/game';
import { log, config } from './utils';
import { SocketServer } from './socketio';

const app = express();
const server = http.createServer(app);
const io = SocketServer.getInstance(server);

app.use(express.static('public'));

const game = new Game();

io.on('connection', (socket: Socket) => {
  if (io.engine.clientsCount > config.MAX_ROOMS * 2) {
    socket.emit('server reached max connections');
    socket.conn.close();
    return;
  }

  const playerId = socket.id;
  log(chalk`[{green IO}] New Connection: {cyan ${playerId}}`);

  socket.on('enter_game', () => {
    if (game.addPlayer(playerId))
      log(chalk`[{yellow GAME}] Player {cyan ${playerId}} entered game.`);
  });

  socket.on('start', () => {
    if (game.start())
      log(chalk`[{yellow GAME}] {cyan ${playerId}} started the game.`);
  });

  socket.on('move', ({ direction }) => {
    game.movePlayer(playerId, direction);
  });

  socket.on('disconnect', () => {
    if (game.removePlayer(playerId))
      log(chalk`[{yellow GAME}] Player {cyan ${playerId}} left the game.`);
    log(chalk`[{red IO}] Disconnected: {cyan ${playerId}}`);
  });
});

server.listen(config.PORT, () => {
  log(
    chalk`[{magenta SERVER}] Listening on port: {cyan ${config.PORT}}`,
    chalk`\n[{magenta SERVER}] Max connections: {cyan ${config.MAX_ROOMS * 2}}`,
    chalk`\n[{magenta SERVER}] Game tick rate: {cyan ${config.TICK_RATE}}`,
    chalk`\n[{magenta SERVER}] Game ball speed: {cyan ${config.BALL_SPEED}}`
  );
});
