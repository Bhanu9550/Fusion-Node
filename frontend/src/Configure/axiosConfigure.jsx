import axios from "axios";

// const Domain = import.meta.env.VITE_Backend_Domain_Url;

const api = axios.create({
    baseURL: `/api`,
    withCredentials: true
});

export default api;