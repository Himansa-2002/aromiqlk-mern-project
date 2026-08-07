import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        // Sync state if localStorage changes from another tab
        const handleStorage = () => {
            const currentToken = localStorage.getItem("token");
            if (!currentToken && isLoggedIn) {
                logout(false);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [isLoggedIn]);

    const login = (userData, authToken) => {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

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
        localStorage.removeItem("token");
        localStorage.removeItem("user");

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
