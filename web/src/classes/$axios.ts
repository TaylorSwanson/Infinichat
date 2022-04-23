import axios from "axios";
// import store from "@/store";

// Configure axios
const $axios = axios.create({
  baseURL: process.env.VUE_APP_API_URL + "/1/",
  withCredentials: true,
  timeout: 10 * 1000
});

// const errorCodes = ["ECONNABORTED", "ERR_NETWORK"];

// const requestInterceptor = function (request) {
//   return request;
// };

// const errorInterceptor = function (error) {
//   // Lots of 400s are thrown by the app for various purposes - ignore those
//   const status = error.response?.status;

//   if (errorCodes.includes(error.code) ||
//     error.message === "Network Error" ||
//     status >= 501) {  // 500 is okay

//     console.warn("Intercepted error: ", error.message, error.code, error.status);
//     if (store) store.dispatch("set", true);     // True being "virtue is down" 
//   }

//   return Promise.reject(error);
// };

// // Interceptor to determine if the app is online
// $axios.interceptors.response.use(requestInterceptor, errorInterceptor);
// $axios.interceptors.request.use(requestInterceptor, errorInterceptor);

export default $axios;