import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserAuthContextProvider } from "../src/context/Userauthcontext";

const Home = lazy(() => import("../src/pages/Home"));
const Login = lazy(() => import("../src/pages/Login"));
const Signup = lazy(() => import("../src/pages/Signup"));
const Profile = lazy(() => import("../src/pages/Profile/Profile"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserAuthContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </UserAuthContextProvider>
  </React.StrictMode>
);
