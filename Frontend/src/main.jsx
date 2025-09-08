import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./components/context/AuthContext";
import { Analytics } from "@vercel/analytics/react"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster />
    <Analytics/>
  </BrowserRouter>
);
