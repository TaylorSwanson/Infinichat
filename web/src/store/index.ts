import { createStore } from "vuex";
import { io } from "socket.io-client";

const socket = io(process.env.VUE_APP_API_URL as string);

export default createStore({
  state: {
    socket,
  },
  getters: {
    getSocket: state => {
      return state.socket;
    }
  },
  mutations: {
    
  },
  actions: {
    
  },
  modules: {
    
  }
})
