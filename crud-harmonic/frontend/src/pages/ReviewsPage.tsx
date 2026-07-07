import { useEffect, useState } from "react";
import { reviewService, type FeedReview } from "../services/reviewService";

export default function ReviewsPage({
    onBack,
    onOpenLists,
    onOpenProfile,
    onLogout,
}: {
    onBack: () => void;
    onOpenLists: () => void;
    onOpenProfile: (userId: number) => void;
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
                    <span style={s.navLinkActive}>📝 Reviews</span>
                    <span style={s.navLink} onClick={onOpenLists}>📋 Playlists</span>
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
                            <ReviewCard key={review.id} review={review} onOpenProfile={onOpenProfile} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ReviewCard({ review, onOpenProfile }: { review: FeedReview; onOpenProfile: (userId: number) => void }) {
    const date = review.create_time
        ? new Date(review.create_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : null;

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
                    <span style={s.authorName} onClick={() => onOpenProfile(review.user_id)}>{review.username}</span>
                    {review.music_title && <span style={s.aboutText}> fez uma review "{review.music_title}"</span>}
                    {!review.music_title && review.artist_name && <span style={s.aboutText}> fez uma review {review.artist_name}</span>}
                    <div style={s.reviewMeta}>
                        <Stars note={review.note} />
                        {date && <span style={s.reviewDate}>{date}</span>}
                    </div>
                </div>
            </div>
            <p style={s.reviewText}>{review.text}</p>
        </div>
    );
}

function Stars({ note }: { note: number }) {
    return (
        <div style={{ display: "flex", gap: 2 }} title={`${note}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < note ? "#d44800" : "#e2e2e2", fontSize: 13, lineHeight: 1 }}>★</span>
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
        width: 40, height: 40, borderRadius: "50%", backgroundColor: "#111", backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0, cursor: "pointer",
    },
    authorName: { fontWeight: 700, fontSize: 14, color: "#111", cursor: "pointer" },
    aboutText: { fontSize: 14, color: "#666" },
    reviewMeta: { display: "flex", alignItems: "center", gap: 10, marginTop: 4 },
    reviewDate: { fontSize: 12, color: "#aaa" },
    reviewText: { fontSize: 14, color: "#333", margin: 0, lineHeight: 1.5 },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },
};
