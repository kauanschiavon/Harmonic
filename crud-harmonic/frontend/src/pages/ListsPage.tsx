import { useEffect, useState } from "react";
import { playlistService, type Playlist } from "../services/playlistService";

function CreatePlaylistModal({
    userId,
    onClose,
    onCreated,
}: {
    userId: number;
    onClose: () => void;
    onCreated: (playlist: Playlist) => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Dê um nome para a playlist.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const playlist = await playlistService.create({
                user_id: userId,
                name: name.trim(),
                description: description.trim() || undefined,
                is_public: isPublic,
            });
            onCreated(playlist);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível criar a playlist.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={s.modalOverlay} onClick={onClose}>
            <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
                <h3 style={s.modalTitle}>Nova playlist</h3>
                <form onSubmit={handleSubmit}>
                    <label style={s.label}>Nome</label>
                    <input
                        style={s.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Favoritas de verão"
                        autoFocus
                    />

                    <label style={s.label}>Descrição (opcional)</label>
                    <textarea
                        style={{ ...s.input, resize: "vertical", minHeight: 60 }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Conte um pouco sobre essa playlist"
                    />

                    <label style={{ ...s.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Playlist pública
                    </label>

                    {error && <p style={{ color: "#d44800", fontSize: 13, margin: "8px 0 0" }}>{error}</p>}

                    <div style={s.modalActions}>
                        <button type="button" onClick={onClose} style={s.cancelBtn} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" style={s.createBtn} disabled={saving}>
                            {saving ? "Criando…" : "Criar playlist"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ListsPage({
    onBack,
    onOpenReviews,
    onOpenProfile,
    onOpenPlaylist,
    onLogout,
}: {
    onBack: () => void;
    onOpenReviews: () => void;
    onOpenProfile: (userId: number) => void;
    onOpenPlaylist: (playlistId: number) => void;
    onLogout: () => void;
}) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => {
        loadFeed();
    }, []);

    async function loadFeed() {
        setLoading(true);
        setError("");
        try {
            const data = await playlistService.findAll();
            setPlaylists(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível carregar as Lists.");
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("harmonic_token");
        localStorage.removeItem("harmonic_user");
        onLogout();
    }

    return (
        <div style={s.page}>
            {/* Navbar — mesma estrutura das outras páginas */}
            <nav style={s.nav}>
                <div style={s.logoRow}>
                    <span style={{ fontSize: 22 }}>♪</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>
                        Harm<span style={{ color: "#d44800" }}>onic</span>
                    </span>
                </div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onBack}>🏠 Home</span>
                    <span style={s.navLink}>🎵 Tracks</span>
                    <span style={s.navLink} onClick={onOpenReviews}>📝 Reviews</span>
                    <span style={s.navLinkActive}>📋 Playlists</span>
                    <span style={s.navLink} onClick={() => loggedUser?.id && onOpenProfile(loggedUser.id)}>
                        👤 {loggedUser?.username ?? "Profile"}
                    </span>
                </div>
                <div style={s.navRight}>
                    <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <main style={s.main}>
                <div style={s.titleRow}>
                    <h2 style={s.sectionTitle}>Playlists da comunidade</h2>
                    <button
                        style={s.newPlaylistBtn}
                        onClick={() => setShowCreateModal(true)}
                        disabled={!loggedUser?.id}
                        title={!loggedUser?.id ? "Faça login para criar uma playlist" : undefined}
                    >
                        + Nova playlist
                    </button>
                </div>

                {loading && <p style={{ color: "#888" }}>Carregando Playlists…</p>}

                {!loading && error && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>{error}</p>
                        <button onClick={loadFeed} style={s.retryBtn}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !error && playlists.length === 0 && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#888", margin: 0 }}>Nenhuma playlist pública ainda.</p>
                        <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                            Procure um álbum na Home e crie a primeira playlist!
                        </p>
                    </div>
                )}

                {!loading && !error && playlists.length > 0 && (
                    <div style={s.listGrid}>
                        {playlists.map((playlist) => (
                            <PlaylistListCard key={playlist.id} playlist={playlist} onOpenProfile={onOpenProfile} onOpenPlaylist={onOpenPlaylist} />
                        ))}
                    </div>
                )}
            </main>

            {showCreateModal && loggedUser?.id && (
                <CreatePlaylistModal
                    userId={loggedUser.id}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(playlist) => {
                        setPlaylists((prev) => [
                            { ...playlist, username: loggedUser.username, user_photo: loggedUser.photo },
                            ...prev,
                        ]);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
}

function PlaylistListCard({
    playlist,
    onOpenProfile,
    onOpenPlaylist,
}: {
    playlist: Playlist;
    onOpenProfile: (userId: number) => void;
    onOpenPlaylist: (playlistId: number) => void;
}) {
    const date = playlist.created_at
        ? new Date(playlist.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : null;

    return (
        <div style={{ ...s.listCard, cursor: "pointer" }} onClick={() => onOpenPlaylist(playlist.id)}>
            <div
                style={{
                    ...s.cover,
                    backgroundColor: "#222",
                    backgroundImage: playlist.cover_url ? `url(${playlist.cover_url})` : undefined,
                }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.listHeader}>
                    <div
                        style={{
                            ...s.avatar,
                            backgroundImage: playlist.user_photo ? `url(${playlist.user_photo})` : undefined,
                        }}
                        onClick={(e) => { e.stopPropagation(); onOpenProfile(playlist.user_id); }}
                    >
                        {!playlist.user_photo && (playlist.username?.[0]?.toUpperCase() ?? "?")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={s.listTitle}>{playlist.name}</p>
                        <span style={s.authorName} onClick={(e) => { e.stopPropagation(); onOpenProfile(playlist.user_id); }}>
                            por {playlist.username}
                        </span>
                        {date && <span style={s.listDate}> · {date}</span>}
                    </div>
                </div>
                {playlist.description && <p style={s.listDescription}>{playlist.description}</p>}
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
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px", maxWidth: 720, margin: "0 auto" },

    titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16 },
    sectionTitle: { fontSize: 24, fontWeight: 800, color: "#111", margin: 0 },
    newPlaylistBtn: {
        border: "none", background: "#d44800", color: "#fff", borderRadius: 8,
        padding: "10px 18px", cursor: "pointer", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap",
    },

    modalOverlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16,
    },
    modalBox: {
        background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440,
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    },
    modalTitle: { fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 18px" },
    label: { display: "block", fontSize: 13, fontWeight: 700, color: "#333", margin: "12px 0 6px" },
    input: {
        width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px",
        fontSize: 14, fontFamily: "inherit", boxSizing: "border-box",
    },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
    cancelBtn: {
        border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 16px",
        cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#555",
    },
    createBtn: {
        border: "none", background: "#d44800", color: "#fff", borderRadius: 8, padding: "10px 16px",
        cursor: "pointer", fontSize: 14, fontWeight: 700,
    },
    listGrid: { display: "flex", flexDirection: "column", gap: 16 },
    listCard: { display: "flex", gap: 16, border: "1px solid #eee", borderRadius: 12, padding: 18 },
    cover: { width: 72, height: 72, borderRadius: 10, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 },
    listHeader: { display: "flex", gap: 10, alignItems: "center" },
    avatar: {
        width: 32, height: 32, borderRadius: "50%", backgroundColor: "#111", backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0, cursor: "pointer",
    },
    listTitle: { fontWeight: 700, fontSize: 15, color: "#111", margin: 0 },
    authorName: { fontSize: 13, color: "#777", cursor: "pointer" },
    listDate: { fontSize: 12, color: "#aaa" },
    listDescription: { fontSize: 14, color: "#333", margin: "8px 0 0", lineHeight: 1.5 },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },
};
