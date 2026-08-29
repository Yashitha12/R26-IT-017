import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import "./styles.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <AppProvider>
    <App />
    </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);