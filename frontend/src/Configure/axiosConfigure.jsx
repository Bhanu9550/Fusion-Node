import axios from "axios";

const api = axios.create({
    baseURL: `/api`,
    // baseURL : `${import.meta.env.VITE_Backend_Domain_Url}`,
    withCredentials: true
});

export default api;