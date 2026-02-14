const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CONFIG = {

    API_BASE_URL: isLocal
        ? 'http://localhost:3000/api'
        : `${window.location.origin}/api`
};
