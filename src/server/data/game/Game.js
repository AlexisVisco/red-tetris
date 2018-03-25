import Player from "../player/Player";
import PacketSender from "../../packet/PacketSender";
import RoomManager from "./GameManager";

class Game {

  constructor(name) {
    /** @type {Array<Player>} */
    this.players = [];
    this.name = name;
    this.waiting = true;
  }

  /**
   * Add an player with playerName and id
   * @param {string} playerName
   * @param {string} id
   * @param {boolean} [master]
   * @return {Player | undefined}
   */
  addPlayer(playerName, id, master = false) {
    if (!playerName || !id)
      return undefined;
    if (!this.containPlayer(playerName) && !this.containId(id) && this.waiting) {
      const player = new Player(playerName, id, Date.now(), master);
      this.players.push(player);

      PacketSender.sendPlayerJoin(player, this);

      return player;
    }
  }

  /**
   * Remove an player by his playerName.
   * @param {string} playerName
   * @return {Player}
   */
  removePlayer(playerName) {
    const player = this.players.find(e => e.playerName === playerName);
    if (player) {
      this.players.removeObj(player);
      if (player.master)
        this.promoteNewPlayer();

      PacketSender.sendPlayerQuit(player, this);

      return player;
    }
  }

  /**
   * Get an player in the room by his id.
   * @param {string} id
   * @returns {Player | undefined}
   */
  getPlayer(id) {
    return this.players.find(e => e.id === id);
  }

  /**
   * Return true if this.players contain player with id.
   * @param {string} id
   * @returns {boolean}
   */
  containId(id) {
    return this.players.find(e => e.id === id) !== undefined;
  }

  /**
   * Return true if this.players contain player with playerName.
   * @param {string} playerName
   * @returns {boolean}
   */
  containPlayer(playerName) {
    return this.players.find(e => e.playerName === playerName) !== undefined;
  }

  /**
   * Check if a player is alone and he has lose or on multiples players, there is only player that not has loose.
   * @return {boolean}
   */
  gameHasEnd() {
    if (this.players.length === 1 && this.players[0].loose ||
      this.players.length > 1 && this.players.filter(p => !p.loose).length === 1) {
      this.players.forEach(e => e.loose = false);
      this.setWaiting(true);
      return true;
    }
    return false;
  }

  /**
   * Set the current getState of the room to true or false, if getState is true player can join else player can't join.
   * @param {boolean} stateWaiting
   */
  setWaiting(stateWaiting) {
    this.waiting = stateWaiting;
    if (!this.waiting)
      PacketSender.sendGameStart(this);
  }

  /**
   * Check if the player is the master, if it is assign the master role to another player.
   */
  promoteNewPlayer() {
    if (this.players.length === 0) {
      RoomManager.deleteGame(this.name);
    }
    else if (!this.players.some(e => e.master)) {
      const promotedPlayer = this.players.sort((a, b) => a.order > b.order)[0];
      promotedPlayer.master = true;
      PacketSender.sendPlayerPromoted(promotedPlayer, this);
    }
  }

  /**
   * Return true if players can join, false else.
   * @returns {boolean}
   */
  canJoin() {
    return this.waiting;
  }
}

export default Game;