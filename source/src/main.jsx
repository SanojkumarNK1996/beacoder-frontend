import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403
            && ["ACCESS_EXPIRED", "ACCESS_NOT_STARTED"].includes(error.response?.data?.code)
            && localStorage.getItem("authToken")) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            window.location.assign("/login");
        }
        return Promise.reject(error);
    },
);

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
)
