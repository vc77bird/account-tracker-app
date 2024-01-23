import axios from 'axios';

let baseURL = 'http://oncore-ontrack.umms.umm.edu:8000'

try {
    if (process.env.REACT_APP_baseURL)
        baseURL = process.env.REACT_APP_baseURL
} catch (error) {
    console.log('Error', error);
}
console.log(baseURL);


const api = axios.create({
    baseURL: baseURL,
});

export default api;