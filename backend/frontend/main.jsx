// main.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App.jsx';
import './src/index.css';
import { BrowserRouter } from 'react-router-dom'; // Correct import statement

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
