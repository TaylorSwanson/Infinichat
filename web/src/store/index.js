import { createStore } from "vuex";
import { io, Socket } from "socket.io-client";

export default createStore({
  state: {
    socket: null,
    isConnected: false,
    activePiece: {
      x: 0,
      y: 0,
      index: 0
    },
    chunks: [],
  },
  getters: {
    getSocket: state => {
      return state.socket;
    },
    getChunks: state => {
      return state.chunks;
    },
    isConnected: state => {
      return state.isConnected;
    },
    activePiece: state => {
      return state.activePiece;
    },
  },
  mutations: {

  },
  actions: {
    addChunk({ state }, { x, y }) {
      state.socket.emit("subscribe", { x, y });
      state.socket.emit("get", { x, y });
      state.chunks.push({ x, y });
    },
    getChunk({ state }, { x, y }) {
      return state.chunks?.find(c => c.x === x && c.y === y);
    },
    removeChunk({ state }, chunk) {
      const idx = state.chunks.indexOf(chunk);
      if (idx === -1) return;

      const { x, y } = chunk;

      state.socket.emit("unsubscribe", { x, y });
      state.chunks.splice(idx, 1);
    },
    connect({ state }) {
      const socket = io(process.env.VUE_APP_API_URL);

      socket.on("connect", () => {
        state.isConnected = true;
        socket.on("fullChunk", (fullChunk) => {
          const chunk = state.chunks.find(c => c.x === fullChunk.x && c.y === fullChunk.y);
          if (!chunk) return;

          chunk.data = fullChunk.data;
        });
      });

      socket.on("disconnect", () => {
        state.isConnected = false;
        socket.off("fullChunk");
      });

      state.socket = socket;
    },
    setActive({ state }, payload) {
      state.activePiece = {
        x: payload.x,
        y: payload.y,
        index: payload.index
      };
    },
    moveCursor({ state }, dir) {
      const { x, y } = dir;
    },
    placeChar({ state, dispatch }, char) {
      const { x, y, index } = state.activePiece;

      const chunk = state.chunks.find(c =>
        c.x === x && c.y === y
      );
      if (!chunk) return;

      chunk.data[index] = char;

      dispatch("moveCursor", { x: 1, y: 0 });
    }
  },
  modules: {

  }
})
