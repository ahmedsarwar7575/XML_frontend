import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Feeds from "./components/Feeds";
import Campaigns from "./components/Campaigns";
import Proxies from "./components/Proxies";
import Logs from "./components/Logs";
import Settings from "./components/Setting";
import Landing from "./components/Landing";
const PrivateRoute = ({ children }) => {
  const [cookies] = useCookies(["adminAuth"]);
  const isAuth = !!cookies.adminAuth;
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/feeds"
            element={
              <PrivateRoute>
                <Feeds />
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <PrivateRoute>
                <Campaigns />
              </PrivateRoute>
            }
          />
          <Route
            path="/proxies"
            element={
              <PrivateRoute>
                <Proxies />
              </PrivateRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <PrivateRoute>
                <Logs />
              </PrivateRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
