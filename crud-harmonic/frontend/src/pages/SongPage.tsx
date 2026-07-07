import { useEffect, useState } from "react";
import api from "../services/api";
import { reviewService } from "../services/reviewService";

interface RatingDistribution {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

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
    rating_distribution: RatingDistribution;
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

// Estrelas clicáveis, usadas no formulário de criar/editar avaliação
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    return (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    onClick={() => onChange(i)}
                    style={{ fontSize: 28, cursor: "pointer", color: i <= value ? "#f59e0b" : "#ddd" }}
                >★</span>
            ))}
        </div>
    );
}

// Barra de distribuição das notas (quantas reviews deram 1 a 5 estrelas)
function RatingDistributionChart({ distribution, total }: { distribution: RatingDistribution; total: number }) {
    return (
        <div style={s.distributionBox}>
            {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                    <div key={star} style={s.distRow}>
                        <span style={s.distStarLabel}>{star} ★</span>
                        <div style={s.distBarTrack}>
                            <div style={{ ...s.distBarFill, width: `${pct}%` }} />
                        </div>
                        <span style={s.distCount}>{count}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function SongPage({
    songId,
    onBack,
    onOpenProfile,
    onLogout,
}: {
    songId: string;
    onBack: () => void;
    onOpenProfile: (userId: number) => void;
    onLogout: () => void;
}) {
    const [song, setSong] = useState<SongDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // formulário de avaliação (criar)
    const [note, setNote] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");

    // edição de review existente (própria)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNote, setEditNote] = useState(0);
    const [editText, setEditText] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editMsg, setEditMsg] = useState("");

    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const myReview = song?.reviews.find((r) => r.user_id === user?.id) ?? null;

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

    function startEdit(r: Review) {
        setEditingId(r.id);
        setEditNote(r.note);
        setEditText(r.text);
        setEditMsg("");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditMsg("");
    }

    async function handleUpdateReview(id: number) {
        if (!editNote) { setEditMsg("Selecione uma nota."); return; }
        setEditSubmitting(true);
        setEditMsg("");
        try {
            await reviewService.update(id, { note: editNote, text: editText });
            setEditingId(null);
            loadSong();
        } catch (err: any) {
            setEditMsg(err.response?.data?.message ?? "Erro ao atualizar avaliação.");
        } finally {
            setEditSubmitting(false);
        }
    }

    async function handleDeleteReview(id: number) {
        if (!window.confirm("Tem certeza que deseja excluir sua avaliação?")) return;
        try {
            await reviewService.delete(id);
            loadSong();
        } catch (err: any) {
            setEditMsg(err.response?.data?.message ?? "Erro ao excluir avaliação.");
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
                        <a href={song.spotify_url} target="_blank" rel="noreferrer" style={s.spotifyBtn}>
                            ▶ Ouvir no Spotify
                        </a>
                    </div>
                </div>

                {/* Distribuição das notas */}
                {song.total_reviews > 0 && (
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Distribuição das notas</h2>
                        <RatingDistributionChart distribution={song.rating_distribution} total={song.total_reviews} />
                    </section>
                )}

                {/* Formulário de avaliação (só aparece se o usuário ainda não avaliou) */}
                {user && !myReview && (
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Avaliar esta música</h2>
                        <form onSubmit={handleSubmitReview} style={s.form}>
                            <StarPicker value={note} onChange={setNote} />
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

                {/* Aviso de que o usuário já avaliou, com link para editar abaixo */}
                {user && myReview && editingId !== myReview.id && (
                    <section style={s.section}>
                        <div style={s.emptyBox}>
                            <p style={{ margin: 0, color: "#555" }}>
                                Você já avaliou esta música.{" "}
                                <span style={{ color: "#d44800", fontWeight: 700, cursor: "pointer" }} onClick={() => startEdit(myReview)}>
                                    Editar sua avaliação
                                </span>
                            </p>
                        </div>
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
                            {song.reviews.map((r) => {
                                const isMine = user?.id === r.user_id;
                                const isEditing = editingId === r.id;

                                return (
                                    <div key={r.id} style={s.reviewCard}>
                                        <div style={s.reviewHeader}>
                                            <span
                                                style={{ fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#111" }}
                                                onClick={() => onOpenProfile(r.user_id)}
                                            >
                                                {r.username}
                                            </span>
                                            {!isEditing && <Stars rating={r.note} />}
                                            <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>
                                                {new Date(r.create_time).toLocaleDateString("pt-BR")}
                                            </span>
                                            {isMine && !isEditing && (
                                                <span style={s.reviewActions}>
                                                    <span style={s.reviewActionLink} onClick={() => startEdit(r)}>Editar</span>
                                                    <span style={s.reviewActionLink} onClick={() => handleDeleteReview(r.id)}>Excluir</span>
                                                </span>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div style={{ marginTop: 8 }}>
                                                <StarPicker value={editNote} onChange={setEditNote} />
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    style={s.textarea}
                                                    rows={3}
                                                    maxLength={1000}
                                                />
                                                {editMsg && <p style={{ fontSize: 13, color: "red", margin: "4px 0" }}>{editMsg}</p>}
                                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                                    <button
                                                        type="button"
                                                        disabled={editSubmitting}
                                                        style={s.submitBtn}
                                                        onClick={() => handleUpdateReview(r.id)}
                                                    >
                                                        {editSubmitting ? "Salvando…" : "Salvar"}
                                                    </button>
                                                    <button type="button" style={s.cancelBtn} onClick={cancelEdit}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            r.text && <p style={s.reviewText}>{r.text}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
    spotifyBtn: { display: "inline-block", marginTop: 16, background: "#1DB954", color: "#fff", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: "none" },
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
    reviewActions: { display: "flex", gap: 10, marginLeft: 8 },
    reviewActionLink: { fontSize: 12, color: "#d44800", fontWeight: 700, cursor: "pointer" },
    cancelBtn: { background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" },
    distributionBox: { display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 },
    distRow: { display: "flex", alignItems: "center", gap: 10 },
    distStarLabel: { fontSize: 13, color: "#555", width: 34, flexShrink: 0 },
    distBarTrack: { flex: 1, height: 10, borderRadius: 6, background: "#f0f0f0", overflow: "hidden" },
    distBarFill: { height: "100%", background: "#f59e0b", borderRadius: 6 },
    distCount: { fontSize: 13, color: "#888", width: 24, textAlign: "right", flexShrink: 0 },
};
