import {
  reducerPiecesFlow,
  reducerAddWallLine,
  reducerError,
  reducerMovePiece,
  reducerStartGame,
  reducerUpdateGrid,
  reducerUpdateUsers
} from "./reducer-aux";
import {GRID_HEIGHT, GRID_WIDTH} from "../../common/grid";
import {urlGetPlayerName, urlGetRoomName} from "../util/url-handler";
import {PIECES_NUM} from "../../common/pieces";


const initPlayerState = (playerName, isMaster = false) => {
  return {
    grid: Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(PIECES_NUM.empty)),
    playerName: playerName,
    isMaster: isMaster,
    hasLoose: false,
    hasWin: false,
  }
};

const initialState = {
  playerStates: [initPlayerState(urlGetPlayerName())],
  piecesFlow: [],
  error: undefined,
  playerName: urlGetPlayerName(),
  roomName: urlGetRoomName(),
  animate: false,
  EmitLoose: false,
  EmitUpdateGrid: false,
  EmitCompleteLine: 0,
};


//----------------------------------------------------------------------------
//
// SWITCH REDUCER
//
//----------------------------------------------------------------------------

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_PIECES_FLOW':
      return reducerPiecesFlow(state, action);
    case 'ADD_ERROR':
      return reducerError(state, action);
    case 'UPDATE_PLAYERS':
      return reducerUpdateUsers(state, action);
    case 'PIECES_MOVE':
      return reducerMovePiece(state, action);
    case 'UPDATE_GRID':
      return reducerUpdateGrid(state, action);
    case 'RECV_START_GAME':
      return reducerStartGame(state, action);
    case 'ADD_WALL_LINE':
      return reducerAddWallLine(state);
    default:
      return state;
  }
};

export {reducer, initPlayerState};