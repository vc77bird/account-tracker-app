import axios from 'axios';

const api = axios.create({
    baseURL: 'http://oncore-ontrack.umms.umm.edu:8000',
});

export default api;