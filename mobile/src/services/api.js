import axios from 'axios';

// ANDROID EMULATOR: 10.0.2.2
// PHYSICAL DEVICE: Your LAN IP (e.g., 192.168.1.X)
// AWS PRODUCTION: http://<your-ec2-ip>:8080
const API_URL = 'http://10.164.247.157:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
