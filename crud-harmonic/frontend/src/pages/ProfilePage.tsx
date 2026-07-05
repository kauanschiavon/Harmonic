import { useEffect, useState } from "react";
import { userService, type UserProfile, type Review } from "../services/userService";

export default function ProfilePage({
    userId,
    onBack,
    onLogout,
}: {
    userId: number;
    onBack: () => void;
    onLogout: () => void;
}) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const isOwnProfile = loggedUser?.id === userId;

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function loadProfile() {
        setLoading(true);
        setError("");
        try {
            const data = await userService.getProfile(userId);
            setProfile(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível carregar este perfil.");
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
            {/* Navbar — mesma estrutura do HomePage */}
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
                    <span style={s.navLink}>📈 Trending</span>
                    <span style={s.navLink}>📋 Lists</span>
                    <span style={s.navLinkActive}>👤 {isOwnProfile ? "Meu perfil" : profile?.username ?? "Perfil"}</span>
                </div>
                <div style={s.navRight}>
                    <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <main style={s.main}>
                {loading && <p style={{ color: "#888" }}>Carregando perfil…</p>}

                {!loading && error && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>{error}</p>
                        <button onClick={loadProfile} style={s.retryBtn}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !error && profile && (
                    <>
                        {/* Cabeçalho do perfil */}
                        <section style={s.header}>
                            <div
                                style={{
                                    ...s.avatar,
                                    backgroundImage: profile.photo_url ? `url(${profile.photo_url})` : undefined,
                                }}
                            >
                                {!profile.photo_url && (profile.username?.[0]?.toUpperCase() ?? "?")}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 style={s.username}>{profile.username}</h1>
                                <p style={s.bio}>{profile.bio || "Este usuário ainda não escreveu uma bio."}</p>
                                <div style={s.statsRow}>
                                    <span style={s.statBadge}>
                                        <strong style={{ color: "#111" }}>{profile.reviews?.length ?? 0}</strong> reviews
                                    </span>
                                </div>
                            </div>
                            {isOwnProfile && (
                                <button style={s.editBtn}>Editar perfil</button>
                            )}
                        </section>

                        {/* Reviews do usuário */}
                        <section>
                            <h2 style={s.sectionTitle}>
                                {isOwnProfile ? "Minhas Reviews" : `Reviews de ${profile.username}`}
                            </h2>

                            {(!profile.reviews || profile.reviews.length === 0) ? (
                                <div style={s.emptyBox}>
                                    <p style={{ color: "#888", margin: 0 }}>
                                        {isOwnProfile ? "Você ainda não escreveu nenhuma Reviews." : "Este usuário ainda não escreveu Reviews."}
                                    </p>
                                    {isOwnProfile && (
                                        <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                                            Procure um álbum na Home e conte o que achou!
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div style={s.reviewList}>
                                    {profile.reviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const date = review.create_time
        ? new Date(review.create_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : null;

    return (
        <div style={s.reviewCard}>
            <div style={s.reviewTop}>
                <Stars note={review.note} />
                {date && <span style={s.reviewDate}>{date}</span>}
            </div>
            <p style={s.reviewText}>{review.text}</p>
        </div>
    );
}

function Stars({ note }: { note: number }) {
    return (
        <div style={{ display: "flex", gap: 2 }} title={`${note}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < note ? "#d44800" : "#e2e2e2", fontSize: 15, lineHeight: 1 }}>★</span>
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
    main: { padding: "32px 32px 64px", maxWidth: 880, margin: "0 auto" },

    header: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid #eee" },
    avatar: {
        width: 96, height: 96, borderRadius: "50%", backgroundColor: "#111", backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 800, flexShrink: 0,
    },
    username: { fontSize: 26, fontWeight: 800, color: "#111", margin: "4px 0 6px" },
    bio: { fontSize: 14, color: "#666", margin: 0, lineHeight: 1.5 },
    statsRow: { display: "flex", gap: 10, marginTop: 14 },
    statBadge: { fontSize: 13, color: "#888", background: "#f7f7f7", padding: "6px 12px", borderRadius: 20 },
    editBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111", flexShrink: 0 },

    sectionTitle: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 16 },
    reviewList: { display: "flex", flexDirection: "column", gap: 12 },
    reviewCard: { border: "1px solid #eee", borderRadius: 12, padding: 18 },
    reviewTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    reviewDate: { fontSize: 12, color: "#aaa" },
    reviewText: { fontSize: 14, color: "#333", margin: 0, lineHeight: 1.5 },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },
};
