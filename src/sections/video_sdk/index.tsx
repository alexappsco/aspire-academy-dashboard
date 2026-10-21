import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1a1c23",
      paper: "#2a2d3a",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

const rootElement = typeof document !== "undefined" ? document.getElementById("root") : null;

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ToastContainer
          position="bottom-left"
          autoClose={4000}
          hideProgressBar
          closeButton={false}
          pauseOnHover
          theme="light"
        />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
