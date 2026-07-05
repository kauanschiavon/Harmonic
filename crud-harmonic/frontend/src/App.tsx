import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

export default function App() {
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("harmonic_token");
        setAuthenticated(!!token);
    }, []);

    if (!authenticated) {
        return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;
    }

    return <HomePage onLogout={() => setAuthenticated(false)} />;
}
