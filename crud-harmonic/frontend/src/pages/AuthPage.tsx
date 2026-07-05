import { useState } from "react";
import { userService } from "../services/userService";

type Tab = "signin" | "signup";

export default function AuthPage({ onAuthenticated }: { onAuthenticated: () => void }) {
    const [tab, setTab] = useState<Tab>("signin");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regError, setRegError] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    function saveSession(user: any, token: string) {
        localStorage.setItem("harmonic_token", token);
        localStorage.setItem("harmonic_user", JSON.stringify(user));
        onAuthenticated();
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        try {
            const { user, token } = await userService.login({ email: loginEmail, password: loginPassword });
            saveSession(user, token);
        } catch (err: any) {
            setLoginError(err?.response?.data?.message ?? "Erro ao entrar.");
        } finally {
            setLoginLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setRegError("");
        setRegLoading(true);
        try {
            const { user, token } = await userService.register({
                username: regUsername,
                email: regEmail,
                password: regPassword,
            });
            saveSession(user, token);
        } catch (err: any) {
            setRegError(err?.response?.data?.message ?? "Erro ao criar conta.");
        } finally {
            setRegLoading(false);
        }
    }

    return (
        <div style={s.page}>
            <div style={s.logoRow}>
                <span style={{ fontSize: 32 }}>♪</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#111" }}>
                    Harm<span style={{ color: "#d44800" }}>onic</span>
                </span>
            </div>
            <p style={s.subtitle}>Welcome back! Sign in to continue</p>

            <div style={s.card}>
                <div style={s.tabs}>
                    {(["signin", "signup"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{ ...s.tab, background: tab === t ? "#111" : "transparent", color: tab === t ? "#fff" : "#888" }}
                        >
                            {t === "signin" ? "Sign In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                {tab === "signin" ? (
                    <form onSubmit={handleLogin} style={s.form}>
                        <Field label="Email" icon="👤" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="Enter your email" />
                        <Field label="Password" icon="🔒" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="Enter your password" />
                        {loginError && <p style={s.error}>{loginError}</p>}
                        <button type="submit" disabled={loginLoading} style={{ ...s.submit, opacity: loginLoading ? 0.7 : 1 }}>
                            {loginLoading ? "Entrando…" : "Sign In"}
                        </button>
                        <p style={s.switchText}>
                            Don't have an account?{" "}
                            <button type="button" onClick={() => setTab("signup")} style={s.switchLink}>Sign up</button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} style={s.form}>
                        <Field label="Username" icon="👤" type="text" value={regUsername} onChange={setRegUsername} placeholder="Choose a username" />
                        <Field label="Email" icon="✉️" type="email" value={regEmail} onChange={setRegEmail} placeholder="Enter your email" />
                        <Field label="Password" icon="🔒" type="password" value={regPassword} onChange={setRegPassword} placeholder="Create a password (mín. 8 caracteres)" />
                        {regError && <p style={s.error}>{regError}</p>}
                        <button type="submit" disabled={regLoading} style={{ ...s.submit, opacity: regLoading ? 0.7 : 1 }}>
                            {regLoading ? "Criando…" : "Create Account"}
                        </button>
                        <p style={s.switchText}>
                            Already have an account?{" "}
                            <button type="button" onClick={() => setTab("signin")} style={s.switchLink}>Sign in</button>
                        </p>
                    </form>
                )}
            </div>

            <p style={s.footer}>By continuing, you agree to Harmonic's Terms of Service and Privacy Policy</p>
        </div>
    );
}

function Field({ label, icon, type, value, onChange, placeholder }: {
    label: string; icon: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{label}</label>
            <div style={{ position: "relative" }}>
                <span style={s.icon}>{icon}</span>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    style={s.input}
                />
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 24 },
    logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
    subtitle: { color: "#666", fontSize: 14, marginBottom: 28 },
    card: { background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" },
    tabs: { display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f0f0f0", borderRadius: 10, padding: 4, marginBottom: 28 },
    tab: { padding: 10, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15 },
    form: { display: "flex", flexDirection: "column", gap: 16 },
    icon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" },
    input: { width: "100%", padding: "12px 14px 12px 42px", borderRadius: 10, border: "1.5px solid #e8e8e8", background: "#f7f7f7", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box" },
    submit: { width: "100%", padding: 13, borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" },
    error: { color: "#d44800", fontSize: 13, margin: 0 },
    switchText: { textAlign: "center", fontSize: 13, color: "#888", margin: 0 },
    switchLink: { fontWeight: 700, color: "#111", background: "none", border: "none", cursor: "pointer", fontSize: 13 },
    footer: { marginTop: 24, fontSize: 12, color: "#aaa", textAlign: "center", maxWidth: 340 },
};
