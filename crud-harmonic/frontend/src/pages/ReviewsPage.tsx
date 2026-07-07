import { useEffect, useState } from "react";
import { reviewService, type FeedReview } from "../services/reviewService";
import api from "../services/api";

export default function ReviewsPage({
    onBack,
    onOpenProfile,
    onOpenSong,
    onLogout,
}: {
    onBack: () => void;
    onOpenProfile: (userId: number) => void;
    onOpenSong?: (songId: string) => void;
    onLogout: () => void;
}) {
    const [reviews, setReviews] = useState<FeedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => {
        loadFeed();
    }, []);

    async function loadFeed() {
        setLoading(true);
        setError("");
        try {
            const data = await reviewService.getFeed();
            setReviews(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível carregar as Reviews.");
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
                    <span style={s.navLinkActive}>📝 Reviews</span>
                    <span style={s.navLink}>📋 Lists</span>
                    <span style={s.navLink} onClick={() => loggedUser?.id && onOpenProfile(loggedUser.id)}>
                        👤 {loggedUser?.username ?? "Profile"}
                    </span>
                </div>
                <div style={s.navRight}>
                    <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <main style={s.main}>
                <h2 style={s.sectionTitle}>Reviews da comunidade</h2>

                {loading && <p style={{ color: "#888" }}>Carregando Reviews…</p>}

                {!loading && error && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>{error}</p>
                        <button onClick={loadFeed} style={s.retryBtn}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !error && reviews.length === 0 && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#888", margin: 0 }}>Nenhuma Review ainda.</p>
                        <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                            Procure um álbum na Home e seja o primeiro a fazer um Review!
                        </p>
                    </div>
                )}

                {!loading && !error && reviews.length > 0 && (
                    <div style={s.reviewList}>
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                loggedUserId={loggedUser?.id}
                                onOpenProfile={onOpenProfile}
                                onOpenSong={onOpenSong}
                                onUpdated={(updated) =>
                                    setReviews((prev) =>
                                        prev.map((r) => (r.id === review.id ? { ...r, ...updated } : r))
                                    )
                                }
                                onDeleted={() =>
                                    setReviews((prev) => prev.filter((r) => r.id !== review.id))
                                }
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ReviewCard({
    review,
    loggedUserId,
    onOpenProfile,
    onOpenSong,
    onUpdated,
    onDeleted,
}: {
    review: FeedReview;
    loggedUserId: number;
    onOpenProfile: (userId: number) => void;
    onOpenSong?: (songId: string) => void;
    onUpdated: (updated: Partial<FeedReview>) => void;
    onDeleted: () => void;
}) {
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [loadingLike, setLoadingLike] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editNote, setEditNote] = useState(review.note);
    const [editText, setEditText] = useState(review.text);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editMsg, setEditMsg] = useState("");

    // busca contagem de likes ao montar o card
    useEffect(() => {
        async function fetchLikes() {
            try {
                const { data } = await api.get(`/reviews/${review.id}/likes`);
                setTotalLikes(data.total_likes ?? 0);
            } catch {
                // sem likes ainda, ignora
            }
        }
        fetchLikes();
    }, [review.id]);

    async function handleLike() {
        if (loadingLike) return;
        setLoadingLike(true);
        try {
            if (liked) {
                const { data } = await api.delete(`/reviews/${review.id}/like`, {
                    data: { user_id: loggedUserId },
                });
                setTotalLikes(data.total_likes ?? 0);
                setLiked(false);
            } else {
                const { data } = await api.post(`/reviews/${review.id}/like`, {
                    user_id: loggedUserId,
                });
                setTotalLikes(data.total_likes ?? 0);
                setLiked(true);
            }
        } catch (err: any) {
            // não faz nada silenciosamente (ex: tentou curtir a própria review)
            console.warn(err?.response?.data?.message);
        } finally {
            setLoadingLike(false);
        }
    }

    function startEdit() {
        setEditNote(review.note);
        setEditText(review.text);
        setEditMsg("");
        setIsEditing(true);
    }

    async function handleSaveEdit() {
        if (!editNote) { setEditMsg("Selecione uma nota."); return; }
        setEditSubmitting(true);
        setEditMsg("");
        try {
            await reviewService.update(review.id, { note: editNote, text: editText });
            onUpdated({ note: editNote, text: editText });
            setIsEditing(false);
        } catch (err: any) {
            setEditMsg(err.response?.data?.message ?? "Erro ao atualizar avaliação.");
        } finally {
            setEditSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;
        try {
            await reviewService.delete(review.id);
            onDeleted();
        } catch (err: any) {
            setEditMsg(err.response?.data?.message ?? "Erro ao excluir avaliação.");
        }
    }

    const date = review.create_time
        ? new Date(review.create_time).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    const isOwnReview = loggedUserId === review.user_id;

    return (
        <div style={s.reviewCard}>
            <div style={s.reviewHeader}>
                <div
                    style={{
                        ...s.avatar,
                        backgroundImage: review.user_photo ? `url(${review.user_photo})` : undefined,
                    }}
                    onClick={() => onOpenProfile(review.user_id)}
                >
                    {!review.user_photo && (review.username?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={s.authorName} onClick={() => onOpenProfile(review.user_id)}>
                        {review.username}
                    </span>
                    {review.music_title && (
                        <span
                            style={{ ...s.aboutText, cursor: review.music_id && onOpenSong ? "pointer" : "default" }}
                            onClick={() => review.music_id && onOpenSong?.(review.music_id)}
                        > fez uma review "{review.music_title}"</span>
                    )}
                    {!review.music_title && review.artist_name && (
                        <span style={s.aboutText}> fez uma review {review.artist_name}</span>
                    )}
                    <div style={s.reviewMeta}>
                        {!isEditing && <Stars note={review.note} />}
                        {date && !isEditing && <span style={s.reviewDate}>{date}</span>}
                        {isOwnReview && !isEditing && (
                            <span style={s.reviewActions}>
                                <span style={s.reviewActionLink} onClick={startEdit}>Editar</span>
                                <span style={s.reviewActionLink} onClick={handleDelete}>Excluir</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <span
                                key={i}
                                onClick={() => setEditNote(i)}
                                style={{ fontSize: 20, cursor: "pointer", color: i <= editNote ? "#d44800" : "#e2e2e2" }}
                            >★</span>
                        ))}
                    </div>
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={s.editTextarea}
                        rows={3}
                        maxLength={1000}
                    />
                    {editMsg && <p style={{ fontSize: 13, color: "red", margin: "4px 0" }}>{editMsg}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 12 }}>
                        <button type="button" disabled={editSubmitting} style={s.saveBtn} onClick={handleSaveEdit}>
                            {editSubmitting ? "Salvando…" : "Salvar"}
                        </button>
                        <button type="button" style={s.cancelBtn} onClick={() => setIsEditing(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <p style={s.reviewText}>{review.text}</p>
            )}

            {/* Botão de like */}
            <div style={s.likeRow}>
                <button
                    onClick={handleLike}
                    disabled={loadingLike || isOwnReview}
                    title={isOwnReview ? "Você não pode curtir sua própria review" : liked ? "Descurtir" : "Curtir"}
                    style={{
                        ...s.likeBtn,
                        color: liked ? "#d44800" : "#aaa",
                        borderColor: liked ? "#d44800" : "#eee",
                        opacity: isOwnReview ? 0.4 : 1,
                        cursor: isOwnReview ? "not-allowed" : "pointer",
                    }}
                >
                    ♥ {totalLikes > 0 ? totalLikes : ""}
                </button>
            </div>
        </div>
    );
}

function Stars({ note }: { note: number }) {
    return (
        <div style={{ display: "flex", gap: 2 }} title={`${note}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < note ? "#d44800" : "#e2e2e2", fontSize: 13, lineHeight: 1 }}>
                    ★
                </span>
            ))}
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
    sectionTitle: { fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 20 },
    reviewList: { display: "flex", flexDirection: "column", gap: 16 },
    reviewCard: { border: "1px solid #eee", borderRadius: 12, padding: 18 },
    reviewHeader: { display: "flex", gap: 12, marginBottom: 10 },
    avatar: {
        width: 40, height: 40, borderRadius: "50%", backgroundColor: "#111", backgroundSize: "cover",
        backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0, cursor: "pointer",
    },
    authorName: { fontWeight: 700, fontSize: 14, color: "#111", cursor: "pointer" },
    aboutText: { fontSize: 14, color: "#666" },
    reviewMeta: { display: "flex", alignItems: "center", gap: 10, marginTop: 4 },
    reviewDate: { fontSize: 12, color: "#aaa" },
    reviewActions: { display: "flex", gap: 10, marginLeft: "auto" },
    reviewActionLink: { fontSize: 12, color: "#d44800", fontWeight: 700, cursor: "pointer" },
    editTextarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" },
    saveBtn: { background: "#d44800", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
    cancelBtn: { background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
    reviewText: { fontSize: 14, color: "#333", margin: "0 0 12px", lineHeight: 1.5 },
    likeRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
    likeBtn: {
        background: "none", border: "1px solid #eee", borderRadius: 20,
        padding: "4px 12px", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
    },
    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },
};
