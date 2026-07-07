import { useEffect, useState } from "react";
import { userService, type User } from "../services/userService";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function UsersPage({
    onBack,
    onGoHome,
    onLogout,
}: {
    onBack: () => void;
    onGoHome: () => void;
    onLogout: () => void;
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmLogout, setConfirmLogout] = useState(false);

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const isAdmin = loggedUser?.role === "admin";

    useEffect(() => {
        if (isAdmin) loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadUsers() {
        setLoading(true);
        setError("");
        try {
            const data = await userService.findAll();
            setUsers(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível carregar os usuários.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.")) return;
        setDeletingId(id);
        try {
            await userService.delete(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch {
            alert("Não foi possível excluir este usuário.");
        } finally {
            setDeletingId(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("harmonic_token");
        localStorage.removeItem("harmonic_user");
        onLogout();
    }

    if (!isAdmin) {
        return (
            <div style={s.page}>
                <nav style={s.nav}>
                    <div style={s.logoRow}>
                        <span style={{ fontSize: 22 }}>♪</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>
                            Harm<span style={{ color: "#d44800" }}>onic</span>
                        </span>
                    </div>
                    <div style={s.navRight}>
                        <button onClick={onBack} style={s.backBtn} title="Voltar">← Voltar</button>
                        <button onClick={() => setConfirmLogout(true)} style={s.logoutBtn} title="Sair">↪</button>
                    </div>
                </nav>
                <main style={s.main}>
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>Acesso restrito</p>
                        <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>Essa área é exclusiva para administradores.</p>
                        <button onClick={onBack} style={s.retryBtn}>Voltar</button>
                    </div>
                </main>

                <ConfirmDialog
                    open={confirmLogout}
                    title="Sair da conta"
                    message="Tem certeza que deseja sair da sua conta?"
                    onConfirm={handleLogout}
                    onCancel={() => setConfirmLogout(false)}
                />
            </div>
        );
    }

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <div style={s.logoRow}>
                    <span style={{ fontSize: 22 }}>♪</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>
                        Harm<span style={{ color: "#d44800" }}>onic</span>
                    </span>
                </div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onGoHome}>🏠 Home</span>
                    <span style={s.navLinkActive}>🛠️ Gerenciar usuários</span>
                </div>
                <div style={s.navRight}>
                    <button onClick={onBack} style={s.backBtn} title="Voltar">← Voltar</button>
                    <button onClick={() => setConfirmLogout(true)} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <ConfirmDialog
                open={confirmLogout}
                title="Sair da conta"
                message="Tem certeza que deseja sair da sua conta?"
                onConfirm={handleLogout}
                onCancel={() => setConfirmLogout(false)}
            />

            <main style={s.main}>
                <h2 style={s.sectionTitle}>Usuários cadastrados</h2>

                {loading && <p style={{ color: "#888" }}>Carregando usuários…</p>}

                {!loading && error && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>{error}</p>
                        <button onClick={loadUsers} style={s.retryBtn}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !error && (
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>ID</th>
                                    <th style={s.th}>Username</th>
                                    <th style={s.th}>Email</th>
                                    <th style={s.th}>Role</th>
                                    <th style={s.th}>Criado em</th>
                                    <th style={s.th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td style={s.td}>{u.id}</td>
                                        <td style={s.td}>{u.username}</td>
                                        <td style={s.td}>{u.email}</td>
                                        <td style={s.td}>
                                            <span style={u.role === "admin" ? s.roleBadgeAdmin : s.roleBadgeUser}>
                                                {u.role ?? "user"}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            {u.create_time ? new Date(u.create_time).toLocaleDateString("pt-BR") : "—"}
                                        </td>
                                        <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                                            <button style={s.editBtn} onClick={() => setEditingUser(u)}>Editar</button>
                                            <button
                                                style={s.deleteBtn}
                                                onClick={() => handleDelete(u.id)}
                                                disabled={deletingId === u.id}
                                            >
                                                {deletingId === u.id ? "…" : "Excluir"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <p style={{ color: "#888", padding: 16 }}>Nenhum usuário cadastrado.</p>
                        )}
                    </div>
                )}
            </main>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSaved={(updated) => {
                        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
}

export function EditUserModal({
    user,
    onClose,
    onSaved,
}: {
    user: User;
    onClose: () => void;
    onSaved: (updated: Partial<User> & { id: number }) => void;
}) {
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio ?? "");
    const [photoUrl, setPhotoUrl] = useState(user.photo_url ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            const updated = await userService.update(user.id, {
                username,
                bio,
                photo_url: photoUrl,
            });
            onSaved({ id: user.id, ...updated });
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível salvar as alterações.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
                <div style={s.modalHeader}>
                    <span style={s.modalTitle}>Editar usuário</span>
                    <button style={s.closeBtn} onClick={onClose}>✕</button>
                </div>

                <label style={s.label}>Username</label>
                <input style={s.input} value={username} onChange={(e) => setUsername(e.target.value)} />

                <label style={s.label}>Bio</label>
                <textarea style={{ ...s.input, minHeight: 70, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} />

                <label style={s.label}>URL da foto</label>
                <input style={s.input} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />

                {error && <p style={{ color: "#d44800", fontSize: 13, marginTop: 4 }}>{error}</p>}

                <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? "Salvando…" : "Salvar"}
                </button>
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#fff", fontFamily: "Inter, sans-serif" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #eee", gap: 24 },
    logoRow: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
    navLinks: { display: "flex", gap: 24, flex: 1, justifyContent: "center" },
    navLink: { color: "#555", fontSize: 14, cursor: "pointer" },
    navLinkActive: { color: "#111", fontSize: 14, fontWeight: 700, background: "#f0f0f0", padding: "6px 12px", borderRadius: 8, cursor: "pointer" },
    navRight: { display: "flex", alignItems: "center", gap: 12 },
    backBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111" },
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px", maxWidth: 960, margin: "0 auto" },

    sectionTitle: { fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 20 },
    tableWrap: { border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
    th: { textAlign: "left", padding: "12px 16px", background: "#f7f7f7", color: "#666", fontWeight: 700, fontSize: 12, textTransform: "uppercase", borderBottom: "1px solid #eee" },
    td: { padding: "12px 16px", borderBottom: "1px solid #f0f0f0", color: "#333" },

    roleBadgeAdmin: { fontSize: 12, fontWeight: 700, color: "#d44800", background: "#fdeee4", padding: "3px 10px", borderRadius: 12 },
    roleBadgeUser: { fontSize: 12, fontWeight: 700, color: "#666", background: "#f0f0f0", padding: "3px 10px", borderRadius: 12 },

    editBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#111", marginRight: 8 },
    deleteBtn: { border: "1px solid #f0c4c4", background: "#fff5f5", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#c0392b" },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },

    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
    modalCard: { background: "#fff", borderRadius: 16, padding: 24, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 6 },
    modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 800, color: "#111" },
    closeBtn: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#888" },
    label: { fontSize: 13, fontWeight: 600, color: "#111", marginTop: 8 },
    input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", fontFamily: "inherit" },
    saveBtn: { marginTop: 14, border: "none", background: "#d44800", color: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700 },
};
