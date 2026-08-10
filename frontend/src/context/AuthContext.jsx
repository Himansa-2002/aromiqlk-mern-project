import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            // Priority to sessionStorage
            let savedUser = sessionStorage.getItem("user");

            // clear legacy localStorage if it exists
            if (sessionStorage.getItem("user")) sessionStorage.removeItem("user");

            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        const savedToken = sessionStorage.getItem("token");
        if (sessionStorage.getItem("token")) sessionStorage.removeItem("token");
        return savedToken;
    });

    const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("token"));

    useEffect(() => {
        // Sync state if sessionStorage changes (less common, but good practice)
        const handleStorage = () => {
            const currentToken = sessionStorage.getItem("token");
            if (!currentToken && isLoggedIn) {
                logout(false);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [isLoggedIn]);

    const login = (userData, authToken) => {
        sessionStorage.setItem("token", authToken);
        sessionStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setToken(authToken);
        setIsLoggedIn(true);

        // Redirect logic
        if (userData?.role === "admin") {
            navigate("/admin");
        } else {
            navigate("/");
        }
    };

    const logout = (shouldNavigate = true) => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setUser(null);
        setToken(null);
        setIsLoggedIn(false);

        if (shouldNavigate) {
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
