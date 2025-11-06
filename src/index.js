import React from 'react';
import ReactDOM from 'react-dom/client';
import 'nes.css/css/nes.min.css';
import './index.css';
import './pixel-owl.css';
import './pixel-owl-hat.css';
import './pixel-dog-hat.css';
import './pixel-bunny-hat.css';
import './pixel-cat-hat.css';
import './pixel-lizard-hat.css';
import './pixel-bird-hat.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
