import axios from 'axios';

// const baseURL = 'https://test.com/api';
const baseURL = 'http://localhost:4000/api';

const ajax = axios.create({
  baseURL,
  withCredentials: true,
});

export default ajax;
export { baseURL };
