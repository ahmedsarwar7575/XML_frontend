import { useCookies } from "react-cookie";

export const useAuth = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["adminAuth"]);

  const isAuthenticated = () => {
    return cookies.adminAuth === "true";
  };

  const login = () => {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    setCookie("adminAuth", "true", { path: "/", expires });
  };

  const logout = () => {
    removeCookie("adminAuth", { path: "/" });
  };

  return { isAuthenticated, login, logout };
};
