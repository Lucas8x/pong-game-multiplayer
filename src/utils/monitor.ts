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
      players: room.playersLength(),
      started: room.started,
    };
  });

  return data;
}

export function Monitor(lobby: Lobby, io: Server) {
  var table = new Table({ style: { head: [], border: [] } });

  const tableUpdate = setInterval(() => {
    console.clear();
    table.length = 0;

    table[0] = [
      { colSpan: 5, hAlign: 'center', content: new Date().toLocaleString() },
    ];

    table[1] = [
      { colSpan: 1, content: 'Connections', hAlign: 'center' },
      { colSpan: 1, content: 'Rooms', hAlign: 'center' },
      { colSpan: 1, content: 'Tick Rate', hAlign: 'center' },
      { colSpan: 1, content: 'Ball Speed', hAlign: 'center' },
      { colSpan: 1, content: 'Port', hAlign: 'center' },
    ];

    table[2] = [
      {
        colSpan: 1,
        content: `${io.engine.clientsCount}/${MAX_ROOMS * 2}`,
        hAlign: 'center',
      },
      {
        colSpan: 1,
        content: `${lobby.roomsLength()}/${MAX_ROOMS}`,
        hAlign: 'center',
      },
      {
        colSpan: 1,
        content: TICK_RATE,
        hAlign: 'center',
      },
      {
        colSpan: 1,
        content: BALL_SPEED,
        hAlign: 'center',
      },
      {
        colSpan: 1,
        content: PORT,
        hAlign: 'center',
      },
    ];

    table[3] = [{ colSpan: 5, content: 'Rooms', hAlign: 'center' }];
    table[4] = [
      { colSpan: 1, content: 'ID', hAlign: 'center' },
      { colSpan: 1, content: 'Players', hAlign: 'center' },
      { colSpan: 1, content: 'Started', hAlign: 'center' },
    ];

    roomsInfo(lobby).map((x) => {
      table.push([
        { colSpan: 1, content: x.id, hAlign: 'center' },
        { colSpan: 1, content: `${x.players}/2`, hAlign: 'center' },
        { colSpan: 1, content: x.started ? 'Yes' : 'No', hAlign: 'center' },
      ]);
    });

    console.log(table.toString());
  }, 1000);
}
