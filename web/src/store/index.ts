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
    }
  },
  getters: {
    getSocket: state => {
      return state.socket;
    },
    isConnected: state => {
      return state.isConnected;
    },
    activePiece: state => {
      return state.activePiece;
    }
  },
  mutations: {

  },
  actions: {
    connect({ state }) {
      const socket = io(process.env.VUE_APP_API_URL as string) as any;

      socket.on("connect", () => {
        state.isConnected = true;
      });

      socket.on("disconnect", () => {
        state.isConnected = false;
      });


      state.socket = socket;
    },
    setActive({ state }, payload) {
      state.activePiece = {
        x: payload.x,
        y: payload.y,
        index: payload.index
      };
    }
  },
  modules: {

  }
})
