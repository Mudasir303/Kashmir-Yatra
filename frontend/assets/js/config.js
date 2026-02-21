const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const BASE_SERVER_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://kashmir-yatra.onrender.com';

const CONFIG = {
    API_BASE_URL: `${BASE_SERVER_URL}/api`
};
