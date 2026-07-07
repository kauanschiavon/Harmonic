import { useEffect, useState } from "react";
import api from "../services/api";
import { playlistService, type Playlist } from "../services/playlistService";

interface SongDetail {
    music_id: string;
    title: string;
    artist: string;
    artist_id: string;
    album: string;
    cover: string;
    duration_ms: number;
    track_number: number;
    release_date: string;
    spotify_url: string;
    avg_rating: number | null;
    total_reviews: number;
    reviews: Review[];
}

interface Review {
    id: number;
    note: number;
    text: string;
    create_time: string;
    user_id: number;
    username: string;
    photo_url: string | null;
}

function formatDuration(ms: number) {
    const total = Math.floor(ms / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

function Stars({ rating }: { rating: number }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#ddd", fontSize: 18 }}>★</span>
            ))}
        </span>
    );
}

export default function SongPage({
    songId,
    onBack,
    onOpenProfile,
    onOpenPlaylist,
    onLogout,
}: {
    songId: string;
    onBack: () => void;
    onOpenProfile: (userId: number) => void;
    onOpenPlaylist: (playlistId: number) => void;
    onLogout: () => void;
}) {
    const [song, setSong] = useState<SongDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // formulário de avaliação
    const [note, setNote] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => {
        loadSong();
    }, [songId]);

    async function loadSong() {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/songs/${songId}`);
            setSong(data);
        } catch {
            setError("Não foi possível carregar os detalhes da música.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitReview(e: React.FormEvent) {
        e.preventDefault();
        if (!note) { setSubmitMsg("Selecione uma nota."); return; }
        setSubmitting(true);
        setSubmitMsg("");
        try {
            await api.post(`/reviews`, {
                user_id: user.id,
                music_id: songId,
                artist_id: song.artist_id,
                note,
                text,
            });
            setSubmitMsg("Avaliação publicada!");
            setNote(0);
            setText("");
            loadSong(); // recarrega para mostrar a nova review
        } catch (err: any) {
            setSubmitMsg(err.response?.data?.message ?? "Erro ao publicar avaliação.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("harmonic_token");
        localStorage.removeItem("harmonic_user");
        onLogout();
    }

    if (loading) return <div style={s.page}><p style={{ padding: 32, color: "#888" }}>Carregando…</p></div>;
    if (error || !song) return <div style={s.page}><p style={{ padding: 32, color: "red" }}>{error}</p></div>;

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
                    <span style={s.navLink} onClick={onBack}>🏠 Home</span>
                    <span style={s.navLink} onClick={() => user?.id && onOpenProfile(user.id)}>👤 {user?.username ?? "Profile"}</span>
                </div>
                <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
            </nav>

            <main style={s.main}>
                {/* Cabeçalho da música */}
                <div style={s.header}>
                    <img src={song.cover} alt={song.title} style={s.cover} />
                    <div style={s.info}>
                        <p style={s.meta}>🎵 Música</p>
                        <h1 style={s.title}>{song.title}</h1>
                        <p style={s.subtitle}>{song.artist} · {song.album}</p>
                        <div style={s.tags}>
                            <span style={s.tag}>⏱ {formatDuration(song.duration_ms)}</span>
                            <span style={s.tag}> {song.release_date?.slice(0, 4)}</span>
                            <span style={s.tag}>🎼 Faixa {song.track_number}</span>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                            {song.avg_rating ? (
                                <>
                                    <Stars rating={song.avg_rating} />
                                    <span style={{ fontSize: 15, fontWeight: 700 }}>{song.avg_rating.toFixed(1)}</span>
                                    <span style={{ fontSize: 13, color: "#888" }}>({song.total_reviews} avaliações)</span>
                                </>
                            ) : (
                                <span style={{ fontSize: 13, color: "#888" }}>Ainda sem avaliações</span>
                            )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                            <a href={song.spotify_url} target="_blank" rel="noreferrer" style={s.spotifyBtn}>
                                ▶ Ouvir no Spotify
                            </a>
                            {user && (
                                <button style={s.addPlaylistBtn} onClick={() => setShowAddModal(true)}>
                                    + Adicionar à playlist
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Formulário de avaliação */}
                {user && (
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Avaliar esta música</h2>
                        <form onSubmit={handleSubmitReview} style={s.form}>
                            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span
                                        key={i}
                                        onClick={() => setNote(i)}
                                        style={{ fontSize: 28, cursor: "pointer", color: i <= note ? "#f59e0b" : "#ddd" }}
                                    >★</span>
                                ))}
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Escreva sua review…"
                                style={s.textarea}
                                rows={3}
                                maxLength={1000}
                            />
                            {submitMsg && (
                                <p style={{ fontSize: 13, color: submitMsg.includes("Erro") || submitMsg.includes("já") ? "red" : "green", margin: "4px 0" }}>
                                    {submitMsg}
                                </p>
                            )}
                            <button type="submit" disabled={submitting} style={s.submitBtn}>
                                {submitting ? "Publicando…" : "Publicar avaliação"}
                            </button>
                        </form>
                    </section>
                )}

                {/* Lista de reviews */}
                <section style={s.section}>
                    <h2 style={s.sectionTitle}>
                        Avaliações {song.total_reviews > 0 && `(${song.total_reviews})`}
                    </h2>
                    {song.reviews.length === 0 ? (
                        <div style={s.emptyBox}>
                            <p style={{ color: "#888", margin: 0 }}>Seja o primeiro a avaliar!</p>
                        </div>
                    ) : (
                        <div style={s.reviewList}>
                            {song.reviews.map((r) => (
                                <div key={r.id} style={s.reviewCard}>
                                    <div style={s.reviewHeader}>
                                        <span
                                            style={{ fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#111" }}
                                            onClick={() => onOpenProfile(r.user_id)}
                                        >
                                            {r.username}
                                        </span>
                                        <Stars rating={r.note} />
                                        <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>
                                            {new Date(r.create_time).toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                    {r.text && <p style={s.reviewText}>{r.text}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showAddModal && song && (
                <AddToPlaylistModal
                    userId={user.id}
                    music={{ music_id: song.music_id, title: song.title, duration_ms: song.duration_ms }}
                    onClose={() => setShowAddModal(false)}
                    onOpenPlaylist={(id) => { setShowAddModal(false); onOpenPlaylist(id); }}
                />
            )}
        </div>
    );
}

function AddToPlaylistModal({
    userId,
    music,
    onClose,
    onOpenPlaylist,
}: {
    userId: number;
    music: { music_id: string; title: string; duration_ms: number };
    onClose: () => void;
    onOpenPlaylist: (playlistId: number) => void;
}) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingId, setAddingId] = useState<number | null>(null);
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);

    useEffect(() => {
        loadLibrary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadLibrary() {
        setLoading(true);
        setError("");
        try {
            const data = await playlistService.findByUser(userId);
            setPlaylists(data);
        } catch {
            setError("Não foi possível carregar sua biblioteca de playlists.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(playlistId: number) {
        setAddingId(playlistId);
        setRowError(null);
        try {
            await playlistService.addMusic(playlistId, music.music_id, music.title, music.duration_ms);
            setAddedIds((prev) => [...prev, playlistId]);
        } catch (err: any) {
            setRowError({ id: playlistId, message: err?.response?.data?.message ?? "Não foi possível adicionar." });
        } finally {
            setAddingId(null);
        }
    }

    return (
        <div style={s.modalOverlay} onClick={onClose}>
            <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
                <h3 style={s.modalTitle}>Adicionar à playlist</h3>

                {loading && <p style={{ color: "#888", fontSize: 14 }}>Carregando sua biblioteca…</p>}

                {!loading && error && <p style={{ color: "#d44800", fontSize: 14 }}>{error}</p>}

                {!loading && !error && playlists.length === 0 && (
                    <p style={{ color: "#888", fontSize: 14 }}>
                        Você ainda não tem nenhuma playlist. Crie uma na tela de Playlists primeiro.
                    </p>
                )}

                {!loading && !error && playlists.length > 0 && (
                    <div style={s.libraryList}>
                        {playlists.map((p) => {
                            const added = addedIds.includes(p.id);
                            return (
                                <div key={p.id} style={s.libraryRow}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={s.libraryName}>{p.name}</p>
                                        {rowError?.id === p.id && (
                                            <p style={{ color: "#d44800", fontSize: 12, margin: 0 }}>{rowError.message}</p>
                                        )}
                                    </div>
                                    <button
                                        style={added ? s.addedBtn : s.addBtn}
                                        disabled={added || addingId === p.id}
                                        onClick={() => handleAdd(p.id)}
                                    >
                                        {added ? "Adicionada ✓" : addingId === p.id ? "Adicionando…" : "Adicionar"}
                                    </button>
                                    {added && (
                                        <button style={s.viewBtn} onClick={() => onOpenPlaylist(p.id)}>Ver</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={s.modalActions}>
                    <button type="button" onClick={onClose} style={s.cancelBtn}>Fechar</button>
                </div>
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#fff", fontFamily: "Inter, sans-serif" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #eee", gap: 24 },
    logoRow: { display: "flex", alignItems: "center", gap: 8 },
    navLinks: { display: "flex", gap: 24, flex: 1, justifyContent: "center" },
    navLink: { color: "#555", fontSize: 14, cursor: "pointer" },
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
    spotifyBtn: { display: "inline-block", background: "#1DB954", color: "#fff", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: "none" },
    addPlaylistBtn: { border: "1px solid #ddd", background: "#fff", color: "#111", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer" },
    section: { marginBottom: 40 },
    sectionTitle: { fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 16 },
    form: { display: "flex", flexDirection: "column", gap: 8, maxWidth: 500 },
    textarea: { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "Inter, sans-serif" },
    submitBtn: { background: "#d44800", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" },
    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    reviewList: { display: "flex", flexDirection: "column", gap: 16 },
    reviewCard: { border: "1px solid #eee", borderRadius: 10, padding: "14px 18px" },
    reviewHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
    reviewText: { fontSize: 14, color: "#444", margin: 0, lineHeight: 1.6 },

    modalOverlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16,
    },
    modalBox: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" },
    modalTitle: { fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 18px" },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
    cancelBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#555" },

    libraryList: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" },
    libraryRow: { display: "flex", alignItems: "center", gap: 8, border: "1px solid #eee", borderRadius: 10, padding: "10px 14px" },
    libraryName: { fontSize: 14, fontWeight: 700, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    addBtn: { border: "none", background: "#d44800", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 },
    addedBtn: { border: "1px solid #ddd", background: "#f3f3f3", color: "#888", borderRadius: 8, padding: "8px 14px", cursor: "default", fontSize: 13, fontWeight: 700, flexShrink: 0 },
    viewBtn: { border: "1px solid #ddd", background: "#fff", color: "#111", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 },
};
