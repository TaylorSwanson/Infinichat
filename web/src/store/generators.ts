// Generates basic get/post/delete/puts
import $axios from "@/classes/$axios";

// Returned functions automatically have actions filled by vuex
// API ref: https://vuex.vuejs.org/api/#actions

// middleware can include actions that should be fired before resolving
// e.x.:
  // loadServices: generators.get("/modules/services", (actions, data) => {
  //   actions.commit("SET_ALL_SERVICES", data);
  // }),


// errorHandler functions are similar:
// e.x.:
  // auth: generators.post("/users/auth", (actions, data) => {
  //   actions.dispatch("load");
  // }, (actions, data) => {
  //   actions.commit("CLEAR_USER");
  // }),


export function get(path, middleware, errorHandler) {
  return async function(actions, query) {
    let data;
    try {
      // Optionally send params with gets
      let modifier;
      if (query) modifier = { params: query };

      const response = await $axios.get(path, modifier);
      data = response?.data;

      if (middleware && typeof middleware === "function")
        middleware(actions, data);
        
      return Promise.resolve(data);
    } catch (e) {
      if (errorHandler && typeof errorHandler === "function")
        errorHandler(actions, data, e);

      return Promise.reject(e);
    }
  };
};

export function post(path, middleware, errorHandler) {
  return async function(actions, payload) {
    let data;
    try {
      const response = await $axios.post(path, payload);
      data = response?.data;

      if (middleware && typeof middleware === "function")
        middleware(actions, data);
        
      return Promise.resolve(data);
    } catch (e) {
      if (errorHandler && typeof errorHandler === "function")
        errorHandler(actions, data, e);

      return Promise.reject(e);
    }
  };
};