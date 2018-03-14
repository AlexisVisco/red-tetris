/**
 * @type {Map}
 */
const socketMap = require("../App");
const socketDefs = require("../../common/socket-definitions");
const SocketMap = require("../data/SocketMap");

class PacketSender {
  /**
   * This packet is sent when a new player is coming in a room.
   * The player who join will not be notified.
   * @param {User} player
   * @param {Room} room
   */
  static sendPlayerJoin(player, room) {
    PacketSender.sendPacketToAllPlayer(socketDefs.PACKET_PLAYER_JOIN, player, room, {player, room});
  }

  /**
   * This packet is sent when a player quit the room.
   * The player who quit will not be notified.
   * @param {User} player
   * @param {Room} room
   */
  static sendPlayerQuit(player, room) {
    PacketSender.sendPacketToAllPlayer(socketDefs.PACKET_PLAYER_QUIT, player, room, {player, room});
  }

  /**
   * This packet is sent when the master of the room quit the room.
   * A new master is promoted (the second who have join).
   * @param {User} player
   * @param {Room} room
   */
  static sendPlayerPromoted(player, room) {
    PacketSender.sendPacketToAllPlayer(socketDefs.PACKET_PLAYER_PROMOTED, player, room, {player, room}, false);
  }

  /**
   * This packet is sent when the game start, will be sent to all players in the room.
   * @param {Room} room
   */
  static sendGameStart(room) {
    PacketSender.sendPacketToAllPlayer(socketDefs.PACKET_GAME_START, undefined, room, {room}, false);
  }

  /**
   * Sent a set of pieces for tetris game to all clients
   * @param {Room} room
   * @param {Array<number>} pieces
   */
  static sendGenFlow(room, pieces) {
    PacketSender.sendPacketToAllPlayer(socketDefs.PACKET_GENFLOW, undefined, room, {pieces}, false);
  }

  static sendPacketToAllPlayer(packetName, user, room, data, exceptConcerned = true) {
    room.users.filter(e => exceptConcerned ? e.getId() !== user.getId() : true).forEach(e => {
      const socket = SocketMap.sockets.get(e.id);
      socket.emit(packetName, data);
    });
  }
}

module.exports = PacketSender;