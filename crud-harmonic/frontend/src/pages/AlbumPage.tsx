import { useEffect, useState } from "react";
import api from "../services/api";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface AlbumTrack {
    id: string;
    name: string;
    track_number: number;
    duration_ms: number;
}

interface AlbumDetail {
    album_id: string;
    name: string;
    cover: string;
    release_date: string;
    artist: string;
    artist_id: string;
    total_tracks: number;
    tracks: AlbumTrack[];
}

function formatDuration(ms: number) {
    const total = Math.floor(ms / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function AlbumPage({
    albumId,
    onBack,
    onGoHome,
    onOpenSong,
    onOpenProfile,
    onLogout,
}: {
    albumId: string;
    onBack: () => void;
    onGoHome: () => void;
    onOpenSong: (songId: string) => void;
    onOpenProfile: (userId: number) => void;
    onLogout: () => void;
}) {
    const [album, setAlbum] = useState<AlbumDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmLogout, setConfirmLogout] = useState(false);

    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => {
        loadAlbum();
    }, [albumId]);

    async function loadAlbum() {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/albums/${albumId}`);
            setAlbum(data);
        } catch {
            setError("Não foi possível carregar os detalhes do álbum.");
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("harmonic_token");
        localStorage.removeItem("harmonic_user");
        onLogout();
    }

    if (loading) return <div style={s.page}><p style={{ padding: 32, color: "#888" }}>Carregando…</p></div>;
    if (error || !album) return (
        <div style={s.page}>
            <p style={{ padding: 32, color: "red" }}>{error}</p>
            <button onClick={onBack} style={{ ...s.backBtn, margin: "0 32px" }} title="Voltar">← Voltar</button>
        </div>
    );

    return (
        <div style={s.page}>
            {/* Navbar */}
            <nav style={s.nav}>
                <div style={s.logoRow}>
                    <span style={{ fontSize: 22 }}>♪</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>
                        Harm<span style={{ color: "#d44800" }}>onic</span>
                    </span>
                </div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onGoHome}>🏠 Home</span>
                    <span style={s.navLink} onClick={() => user?.id && onOpenProfile(user.id)}>👤 {user?.username ?? "Profile"}</span>
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
                {/* Cabeçalho do álbum */}
                <div style={s.header}>
                    <img src={album.cover} alt={album.name} style={s.cover} />
                    <div style={s.info}>
                        <p style={s.meta}>💿 Álbum</p>
                        <h1 style={s.title}>{album.name}</h1>
                        <p style={s.subtitle}>{album.artist}</p>
                        <div style={s.tags}>
                            <span style={s.tag}>📅 {album.release_date?.slice(0, 4)}</span>
                            <span style={s.tag}>🎼 {album.total_tracks} faixas</span>
                        </div>
                    </div>
                </div>

                {/* Lista de faixas */}
                <section style={s.section}>
                    <h2 style={s.sectionTitle}>Faixas</h2>
                    <div style={s.trackList}>
                        {album.tracks.map((track) => (
                            <div key={track.id} style={s.trackRow} onClick={() => onOpenSong(track.id)}>
                                <span style={s.trackNumber}>{track.track_number}</span>
                                <span style={s.trackName}>{track.name}</span>
                                <span style={s.trackDuration}>{formatDuration(track.duration_ms)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#fff", fontFamily: "Inter, sans-serif" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #eee", gap: 24 },
    logoRow: { display: "flex", alignItems: "center", gap: 8 },
    navLinks: { display: "flex", gap: 24, flex: 1, justifyContent: "center" },
    navLink: { color: "#555", fontSize: 14, cursor: "pointer" },
    navRight: { display: "flex", alignItems: "center", gap: 12 },
    backBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111" },
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px", maxWidth: 860, margin: "0 auto" },
    header: { display: "flex", gap: 32, marginBottom: 48, alignItems: "flex-start" },
    cover: { width: 200, height: 200, borderRadius: 12, objectFit: "cover", flexShrink: 0 },
    info: { flex: 1 },
    meta: { fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" },
    title: { fontSize: 32, fontWeight: 800, color: "#111", margin: "0 0 4px" },
    subtitle: { fontSize: 16, color: "#555", margin: "0 0 12px" },
    tags: { display: "flex", gap: 8, flexWrap: "wrap" },
    tag: { background: "#f0f0f0", padding: "4px 10px", borderRadius: 20, fontSize: 13, color: "#555" },
    section: { marginBottom: 40 },
    sectionTitle: { fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 16 },
    trackList: { display: "flex", flexDirection: "column", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
    trackRow: { display: "flex", alignItems: "center", gap: 16, padding: "12px 18px", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
    trackNumber: { fontSize: 13, color: "#aaa", width: 20, textAlign: "right", flexShrink: 0 },
    trackName: { fontSize: 14, color: "#111", fontWeight: 600, flex: 1 },
    trackDuration: { fontSize: 13, color: "#999", flexShrink: 0 },
};
