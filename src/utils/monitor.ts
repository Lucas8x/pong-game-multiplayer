import Table from 'cli-table3';
import { Server } from 'socket.io';

import { Lobby } from '../controllers/lobby';
import { config } from './env';

const { MAX_ROOMS, PORT, TICK_RATE, BALL_SPEED } = config;

function roomsInfo(lobby: Lobby) {
  const rooms = lobby.getAllRooms();
  const keys = Object.keys(rooms);

  const data = keys.map((key) => {
    const room = rooms[key];
    return {
      id: room.id,
      players: Object.keys(room.state.players),
      started: room.started,
    };
  });

  return data;
}

export function Monitor(lobby: Lobby, io: Server) {
  const ms = 1000;

  const serverInfo = new Table({
    style: {
      head: [],
      border: [],
    },
  });

  const rooms = new Table({
    style: {
      head: [],
      border: [],
    },
    wordWrap: true,
    colWidths: [null, null, null, 24],
  });

  setInterval(() => {
    console.clear();
    serverInfo.length = 0;
    rooms.length = 0;
    rooms.options.rowHeights = [null, null];

    serverInfo.push(
      [
        {
          colSpan: 5,
          hAlign: 'center',
          content: new Date().toLocaleString(),
        },
      ],
      [
        { content: 'Connections', hAlign: 'center' },
        { content: 'Rooms', hAlign: 'center' },
        { content: 'Tick Rate', hAlign: 'center' },
        { content: 'Ball Speed', hAlign: 'center' },
        { content: 'Port', hAlign: 'center' },
      ],
      [
        {
          content: `${io.engine.clientsCount}/${MAX_ROOMS * 2}`,
          hAlign: 'center',
        },
        { content: `${lobby.roomsLength()}/${MAX_ROOMS}`, hAlign: 'center' },
        { content: TICK_RATE, hAlign: 'center' },
        { content: BALL_SPEED, hAlign: 'center' },
        { content: PORT, hAlign: 'center' },
      ]
    );

    rooms.push(
      [{ colSpan: 4, content: 'Rooms', hAlign: 'center' }],
      [
        { content: 'ID', hAlign: 'center' },
        { content: 'Players', hAlign: 'center' },
        { content: 'Started', hAlign: 'center' },
        { content: 'Players', hAlign: 'center' },
      ]
    );

    roomsInfo(lobby).forEach((x) => {
      rooms.push([
        { content: x.id, hAlign: 'center' },
        { content: `${x.players.length}/2`, hAlign: 'center' },
        { content: x.started ? 'Yes' : 'No', hAlign: 'center' },
        { content: x.players.join('\n'), hAlign: 'center' },
      ]);
    });

    console.log(serverInfo.toString());
    console.log(rooms.toString());
  }, ms);
}
