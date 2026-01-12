import axios from 'axios';

const api = axios.create({
    baseURL: 'https://carservice-backtend.onrender.com/api', // points at backend API root
});

export default api;
