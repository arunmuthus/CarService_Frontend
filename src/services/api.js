import axios from 'axios';

const api = axios.create({
    baseURL: 'https://carservice-backtend.onrender.com', // Updated to 8081
});

export default api;
