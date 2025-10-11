import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { Toaster } from "./components/ui/sonner";
import "./utils/monacoWorkerSetup";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster  position="top-center" />
    </BrowserRouter>
  // </React.StrictMode>,
);
