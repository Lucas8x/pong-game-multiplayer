import express from 'express';
import { Socket } from 'socket.io';
import http from 'http';
import chalk from 'chalk';

import { log, config } from './utils';
import { SocketServer } from './socketio';
import { Lobby } from './controllers/lobby';

const { MAX_ROOMS, PORT, TICK_RATE, BALL_SPEED } = config;

const app = express();
const server = http.createServer(app);
const io = SocketServer.getInstance(server);

app.use(express.static('public'));

const lobby = new Lobby(MAX_ROOMS);
const game = lobby.createRoom({ ball_speed: BALL_SPEED, tick_rate: TICK_RATE });

io.on('connection', (socket: Socket) => {
  if (io.engine.clientsCount > MAX_ROOMS * 2) {
    socket.emit('server reached max connections');
    socket.conn.close();
    return;
  }

  const { id } = socket;
  log(chalk`[{green IO}] New Connection: {cyan ${id}}`);

  socket.on('enter_game', () => {
    if (game.addPlayer(id).joined)
      game.log(`Player ${chalk.cyan(id)} entered game.`);
  });

  socket.on('start', () => {
    if (game.start()) game.log(`${chalk.cyan(id)} started the game.`);
  });

  socket.on('move', ({ direction }) => {
    game.movePlayer(id, direction);
  });

  socket.on('disconnect', () => {
    if (game.removePlayer(id))
      game.log(`Player ${chalk.cyan(id)} left the game.`);
    log(chalk`[{red IO}] Disconnected: {cyan ${id}}`);
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
});
