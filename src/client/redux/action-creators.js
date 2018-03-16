/**
 * Create action for add pieces to the state.partsFlow.
 * @param {Array<int>} pieces
 */
const addPartsFlow = pieces => {
  return {
    type: 'ADD_PARTS_FLOW',
    data: pieces
  };
};

/**
 * Create a action for set error to state.error.
 * @param {type, message} error
 */
const addError = error => {
  return {
    type: 'ADD_ERROR',
    data: error
  }
};

/**
 * Create a action for synchronize players with users.
 * @param {Array<user>} users
 */
const updateUsers = users => {
  return {
    type: 'UPDATE_USERS',
    data: users
  }
};

/**
 * Create a action for update the grid with the move of the part.
 * @param {PARTS_MOVE} move
 */
const movePart = move => {
  return {
    type: 'MOVE_PART',
    data: move
  }
};

/**
 * Create a action for update the grid of the player that as change.
 * @param {grid, playerName} gridAndPlayer
 */
const updateGrid = gridAndPlayer => {
  return {
    type: 'UPDATE_GRID',
    data: gridAndPlayer
  }
};

/**
 * Restart grid of player and flow, set le pieces to the flow and start game.
 * @param {Array<int>} pieces
 */
const startGame = pieces => {
  return {
    type: 'START_GAME',
    data: pieces
  }
};

export {addPartsFlow, addError, updateUsers, movePart, updateGrid, startGame};
