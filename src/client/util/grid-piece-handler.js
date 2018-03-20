import {GRID_HEIGHT, GRID_WIDTH} from "../../common/grid";
import {getPiece, PIECES_MOVE} from "../../common/pieces";
import {emitPlayerCompleteLine} from "./socket-handler";
import {ifLooseEmitSet} from "./end-loose-win-handler"

const COLLISION_TYPE = {
  PIECE: "collision_piece",
  WALL_RIGHT: "collision_wall_right",
  WALL_LEFT: "collision_wall_left",
  WALL_BOTTOM: "collision_wall_bottom",
  WALL_TOP: "collision_top",
};

const PRIO_COLLISION = [
  COLLISION_TYPE.WALL_TOP,
  COLLISION_TYPE.PIECE,
  COLLISION_TYPE.WALL_BOTTOM,
  COLLISION_TYPE.WALL_RIGHT,
  COLLISION_TYPE.WALL_LEFT
];

const hasCollision = (grid, piece, loc) => {
  let collisionType = undefined;
  piece.forEach((line, y) => line.forEach((number, x) => {
    const gx = x + loc.x;
    const gy = y + loc.y;

    if (gy < 0 && number !== 0) {
      if (PRIO_COLLISION.indexOf(collisionType) < PRIO_COLLISION.indexOf(COLLISION_TYPE.WALL_TOP)) {
        collisionType = COLLISION_TYPE.WALL_TOP;
      }
    }
    else if (gy >= GRID_HEIGHT && number !== 0) {
      if (PRIO_COLLISION.indexOf(collisionType) < PRIO_COLLISION.indexOf(COLLISION_TYPE.WALL_BOTTOM)) {
        collisionType = COLLISION_TYPE.WALL_BOTTOM;
      }
    }
    else if (gx < 0 && number !== 0) {
      if (PRIO_COLLISION.indexOf(collisionType) < PRIO_COLLISION.indexOf(COLLISION_TYPE.WALL_LEFT)) {
        collisionType = COLLISION_TYPE.WALL_LEFT;
      }
    }
    else if (gx >= GRID_WIDTH && number !== 0) {
      if (PRIO_COLLISION.indexOf(collisionType) < PRIO_COLLISION.indexOf(COLLISION_TYPE.WALL_RIGHT)) {
        collisionType = COLLISION_TYPE.WALL_RIGHT;
      }
    }
    else if (number !== 0 && grid[gy][gx] !== 0) {
      if (PRIO_COLLISION.indexOf(collisionType) < PRIO_COLLISION.indexOf(COLLISION_TYPE.PIECE)) {
        collisionType = COLLISION_TYPE.PIECE;
      }
    }
  }));
  return collisionType;
};

const placePiece = state => {
  const grid = state.playerStates.find(playerState => playerState.playerName === state.playerName).grid;
  const pieceDescr = getPiece(state.piecesFlow[0].num, state.piecesFlow[0].rot);
  const loc = state.piecesFlow[0].pos;
  pieceDescr.forEach((line, y) =>
    line.forEach((number, x) => {
        const gx = x + loc.x;
        const gy = y + loc.y;
        if (number !== 0) {
          grid[gy][gx] = number;
        }
      }
    )
  );
};

const eraseCurPiece = state => {
  const grid = state.playerStates.find(playerState => playerState.playerName === state.playerName).grid;
  const pieceDescr = getPiece(state.piecesFlow[0].num, state.piecesFlow[0].rot);
  const loc = state.piecesFlow[0].pos;
  pieceDescr.forEach((line, i) =>
    line.forEach((p, j) => {
        if (p !== 0) {
          grid[loc.y + i][loc.x + j] = 0;
        }
      }
    )
  );
};

const newLoc = (loc, move) => {
  if (move === PIECES_MOVE.DOWN)
    return {x: loc.x, y: loc.y + 1};
  else if (move === PIECES_MOVE.LEFT)
    return {x: loc.x - 1, y: loc.y};
  else if (move === PIECES_MOVE.RIGHT)
    return {x: loc.x + 1, y: loc.y};
  return {x: loc.x, y: loc.y};
};

const updatePiecePos = (state, move) => {
  let collisionType;
  let needNext = false;
  let loc = newLoc(state.piecesFlow[0].pos, move);
  let pieceDescr = getPiece(state.piecesFlow[0].num, state.piecesFlow[0].rot);
  const grid = state.playerStates.find(playerState => playerState.playerName === state.playerName).grid;

  if (move !== PIECES_MOVE.ROT_RIGHT && move !== PIECES_MOVE.ROT_LEFT) {
    if (move === PIECES_MOVE.DROP) {
      needNext = true;
      while (!hasCollision(grid, pieceDescr, loc)) {
        loc.y++;
      }
      loc.y--;
      state.piecesFlow[0].pos = loc;
    } else if (!(collisionType = hasCollision(grid, pieceDescr, loc))) {
      state.piecesFlow[0].pos = loc;
    } else if (collisionType && move === PIECES_MOVE.DOWN) {
      needNext = true;
    }
  } else {
    if (move === PIECES_MOVE.ROT_RIGHT) {
      state.piecesFlow[0].rot = (state.piecesFlow[0].rot + 1) % 4;
    } else {
      state.piecesFlow[0].rot = (state.piecesFlow[0].rot + 3) % 4;
    }
    pieceDescr = getPiece(state.piecesFlow[0].num, state.piecesFlow[0].rot);

    collisionType = hasCollision(grid, pieceDescr, state.piecesFlow[0].pos);
    while (collisionType === COLLISION_TYPE.PIECE || collisionType === COLLISION_TYPE.WALL_LEFT
    || collisionType === COLLISION_TYPE.WALL_RIGHT || collisionType === COLLISION_TYPE.WALL_BOTTOM) {
      if (collisionType === COLLISION_TYPE.WALL_LEFT) {
        state.piecesFlow[0].pos.x++;
      } else if (collisionType === COLLISION_TYPE.WALL_RIGHT) {
        state.piecesFlow[0].pos.x--;
      } else {
        state.piecesFlow[0].pos.y--;
      }
      collisionType = hasCollision(grid, pieceDescr, state.piecesFlow[0].pos);
    }
  }
  return needNext;
};

const gridDelLine = state => {
  let lineToDel = [];
  const player = state.playerStates.find(playerState => playerState.playerName === state.playerName);

  player.grid.forEach((line, i) => {
    let asEmpty = false;
    line.forEach(el => {
      if (el <= 0) {
        asEmpty = true;
      }
    });
    if (!asEmpty) {
      lineToDel.push(i);
    }
  });

  player.grid = player.grid.filter((line, i) => !lineToDel.includes(i));
  while (player.grid.length < GRID_HEIGHT) {
    emitPlayerCompleteLine(state.roomName, state.playerName);
    player.grid = [Array(GRID_WIDTH).fill(0), ...player.grid];
  }
};

const gridAddWall = state => {
  const player = state.playerStates.find(playerState => playerState.playerName === state.playerName);

  if (player.hasLoose) {
    return;
  }

  eraseCurPiece(state);
  player.grid = [...player.grid, Array(GRID_WIDTH).fill(-1)];
  player.grid.shift();
  if (state.piecesFlow[0].pos.y > 0) {
    state.piecesFlow[0].pos.y--;
  }
  ifLooseEmitSet(state);
  placePiece(state);
};


export {
  hasCollision,
  eraseCurPiece,
  placePiece,
  COLLISION_TYPE,
  newLoc,
  updatePiecePos,
  gridDelLine,
  gridAddWall
}