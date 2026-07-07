import { useEffect, useState } from "react";
import { userService, type UserProfile, type Review, type User } from "../services/userService";
import { followService, type FollowStats, type FollowUser } from "../services/followService";
import { reviewService } from "../services/reviewService";
import { playlistService, type Playlist } from "../services/playlistService";
import { EditUserModal } from "./UsersPage";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function ProfilePage({
    userId,
    onBack,
    onGoHome,
    onOpenReviews,
    onOpenLists,
    onOpenProfile,
    onOpenSong,
    onOpenPlaylist,
    onLogout,
}: {
    userId: number;
    onBack: () => void;
    onGoHome: () => void;
    onOpenReviews: () => void;
    onOpenLists: () => void;
    onOpenProfile: (userId: number) => void;
    onOpenSong?: (songId: string) => void;
    onOpenPlaylist: (playlistId: number) => void;
    onLogout: () => void;
}) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [stats, setStats] = useState<FollowStats | null>(null);
    const [followLoading, setFollowLoading] = useState(false);

    const [listModal, setListModal] = useState<"followers" | "following" | null>(null);
    const [listUsers, setListUsers] = useState<FollowUser[]>([]);
    const [listLoading, setListLoading] = useState(false);

    const [editingProfile, setEditingProfile] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(true);
    const [confirmLogout, setConfirmLogout] = useState(false);

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const isOwnProfile = loggedUser?.id === userId;

    useEffect(() => {
        loadProfile();
        loadStats();
        loadPlaylists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function loadPlaylists() {
        setPlaylistsLoading(true);
        try {
            const data = await playlistService.findByUser(userId);
            setPlaylists(data);
        } catch {
            setPlaylists([]);
        } finally {
            setPlaylistsLoading(false);
        }
    }

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

    async function loadStats() {
        if (!loggedUser?.id) return;
        try {
            const data = await followService.getStats(userId, loggedUser.id);
            setStats(data);
        } catch {
            // sem stats, sem problema — só não mostra os contadores
        }
    }

    async function toggleFollow() {
        if (!loggedUser?.id || !stats || followLoading) return;
        setFollowLoading(true);
        try {
            if (stats.is_following) {
                await followService.unfollow(userId, loggedUser.id);
            } else {
                await followService.follow(userId, loggedUser.id);
            }
            await loadStats();
        } catch {
            // se falhar, mantém o estado anterior
        } finally {
            setFollowLoading(false);
        }
    }

    async function openList(tab: "followers" | "following") {
        setListModal(tab);
        setListLoading(true);
        try {
            const data = tab === "followers"
                ? await followService.getFollowers(userId)
                : await followService.getFollowing(userId);
            setListUsers(data);
        } catch {
            setListUsers([]);
        } finally {
            setListLoading(false);
        }
    }

    function handleOpenProfileFromList(id: number) {
        setListModal(null);
        onOpenProfile(id);
    }

    function handleLogout() {
        localStorage.removeItem("harmonic_token");
        localStorage.removeItem("harmonic_user");
        onLogout();
    }

    const visiblePlaylists = isOwnProfile ? playlists : playlists.filter((p) => p.is_public !== false);

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
                    <span style={s.navLink} onClick={onGoHome}>🏠 Home</span>
                    <span style={s.navLink}>🎵 Tracks</span>
                    <span style={s.navLink} onClick={onOpenReviews}>📝 Reviews</span>
                    <span style={s.navLink} onClick={onOpenLists}>📋 Playlists</span>
                    <span style={s.navLinkActive}>👤 {isOwnProfile ? "Meu perfil" : profile?.username ?? "Perfil"}</span>
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
                                    <span style={s.statBadgeClickable} onClick={() => openList("followers")}>
                                        <strong style={{ color: "#111" }}>{stats?.followers_count ?? 0}</strong> seguidores
                                    </span>
                                    <span style={s.statBadgeClickable} onClick={() => openList("following")}>
                                        <strong style={{ color: "#111" }}>{stats?.following_count ?? 0}</strong> seguindo
                                    </span>
                                </div>
                            </div>
                            {isOwnProfile ? (
                                <button style={s.editBtn} onClick={() => setEditingProfile(true)}>Editar perfil</button>
                            ) : (
                                loggedUser?.id && stats && (
                                    <button
                                        style={stats.is_following ? s.followingBtn : s.followBtn}
                                        onClick={toggleFollow}
                                        disabled={followLoading}
                                    >
                                        {followLoading ? "…" : stats.is_following ? "Seguindo" : "Seguir"}
                                    </button>
                                )
                            )}
                        </section>

                        {/* Playlists do usuário */}
                        <section style={{ marginBottom: 40 }}>
                            <h2 style={s.sectionTitle}>
                                {isOwnProfile ? "Minhas Playlists" : `Playlists de ${profile.username}`}
                            </h2>

                            {!playlistsLoading && visiblePlaylists.length === 0 && (
                                <div style={s.emptyBox}>
                                    <p style={{ color: "#888", margin: 0 }}>
                                        {isOwnProfile ? "Você ainda não criou nenhuma playlist." : "Nenhuma playlist pública ainda."}
                                    </p>
                                    {isOwnProfile && (
                                        <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                                            Crie a primeira na tela de Playlists!
                                        </p>
                                    )}
                                </div>
                            )}

                            {visiblePlaylists.length > 0 && (
                                <div style={s.playlistGrid}>
                                    {visiblePlaylists.map((p) => (
                                        <div key={p.id} style={s.playlistCard} onClick={() => onOpenPlaylist(p.id)}>
                                            <div
                                                style={{
                                                    ...s.playlistCover,
                                                    backgroundImage: p.cover_url ? `url(${p.cover_url})` : undefined,
                                                }}
                                            />
                                            <p style={s.playlistName}>{p.name}</p>
                                            {isOwnProfile && p.is_public === false && (
                                                <span style={s.privateTag}>Privada</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                            canEdit={isOwnProfile}
                                            onOpenSong={onOpenSong}
                                            onUpdated={(updated) =>
                                                setProfile((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              reviews: prev.reviews.map((r) =>
                                                                  r.id === review.id ? { ...r, ...updated } : r
                                                              ),
                                                          }
                                                        : prev
                                                )
                                            }
                                            onDeleted={() =>
                                                setProfile((prev) =>
                                                    prev
                                                        ? { ...prev, reviews: prev.reviews.filter((r) => r.id !== review.id) }
                                                        : prev
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {/* Modal de seguidores/seguindo */}
            {listModal && (
                <div style={s.overlay} onClick={() => setListModal(null)}>
                    <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <span style={s.modalTitle}>
                                {listModal === "followers" ? "Seguidores" : "Seguindo"}
                            </span>
                            <button style={s.closeBtn} onClick={() => setListModal(null)}>✕</button>
                        </div>

                        {listLoading && <p style={{ color: "#888", fontSize: 14 }}>Carregando…</p>}

                        {!listLoading && listUsers.length === 0 && (
                            <p style={{ color: "#888", fontSize: 14 }}>
                                {listModal === "followers" ? "Nenhum seguidor ainda." : "Não está seguindo ninguém ainda."}
                            </p>
                        )}

                        {!listLoading && listUsers.map((u) => (
                            <div key={u.id} style={s.userRow} onClick={() => handleOpenProfileFromList(u.id)}>
                                <div style={s.avatarSmall}>{u.username?.[0]?.toUpperCase() ?? "?"}</div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{u.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Editar meu perfil */}
            {editingProfile && profile && (
                <EditUserModal
                    user={{
                        id: profile.id,
                        username: profile.username,
                        bio: profile.bio,
                        photo_url: profile.photo_url,
                        email: loggedUser?.email ?? "",
                    } as User}
                    onClose={() => setEditingProfile(false)}
                    onSaved={(updated) => {
                        setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
                        localStorage.setItem("harmonic_user", JSON.stringify({ ...loggedUser, ...updated }));
                        setEditingProfile(false);
                    }}
                />
            )}
        </div>
    );
}

function ReviewCard({
    review,
    canEdit,
    onOpenSong,
    onUpdated,
    onDeleted,
}: {
    review: Review;
    canEdit: boolean;
    onOpenSong?: (songId: string) => void;
    onUpdated: (updated: Partial<Review>) => void;
    onDeleted: () => void;
}) {
    const date = review.create_time
        ? new Date(review.create_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : null;

    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(review.note);
    const [text, setText] = useState(review.text);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    function startEdit() {
        setNote(review.note);
        setText(review.text);
        setErrorMsg("");
        setIsEditing(true);
    }

    async function handleSave() {
        if (!note) { setErrorMsg("Selecione uma nota."); return; }
        setSubmitting(true);
        setErrorMsg("");
        try {
            await reviewService.update(review.id, { note, text });
            onUpdated({ note, text });
            setIsEditing(false);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message ?? "Erro ao atualizar avaliação.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;
        try {
            await reviewService.delete(review.id);
            onDeleted();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message ?? "Erro ao excluir avaliação.");
        }
    }

    return (
        <div style={s.reviewCard}>
            {(review.music_title || review.artist_name) && (
                <p
                    style={{
                        ...s.reviewAbout,
                        cursor: review.music_id && onOpenSong ? "pointer" : "default",
                    }}
                    onClick={() => review.music_id && onOpenSong?.(review.music_id)}
                >
                    {review.music_title
                        ? `🎵 ${review.music_title}${review.artist_name ? ` · ${review.artist_name}` : ""}`
                        : `🎤 ${review.artist_name}`}
                </p>
            )}
            <div style={s.reviewTop}>
                {isEditing ? (
                    <StarPickerSmall value={note} onChange={setNote} />
                ) : (
                    <Stars note={review.note} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                    {date && !isEditing && <span style={s.reviewDate}>{date}</span>}
                    {canEdit && !isEditing && (
                        <span style={s.reviewActions}>
                            <span style={s.reviewActionLink} onClick={startEdit}>Editar</span>
                            <span style={s.reviewActionLink} onClick={handleDelete}>Excluir</span>
                        </span>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={s.editTextarea}
                        rows={3}
                        maxLength={1000}
                    />
                    {errorMsg && <p style={{ fontSize: 13, color: "red", margin: "4px 0" }}>{errorMsg}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button type="button" disabled={submitting} style={s.saveBtn} onClick={handleSave}>
                            {submitting ? "Salvando…" : "Salvar"}
                        </button>
                        <button type="button" style={s.cancelBtn} onClick={() => setIsEditing(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <p style={s.reviewText}>{review.text}</p>
            )}
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

// Estrelas clicáveis usadas na edição inline da review no perfil
function StarPickerSmall({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    onClick={() => onChange(i)}
                    style={{ fontSize: 20, cursor: "pointer", color: i <= value ? "#d44800" : "#e2e2e2" }}
                >★</span>
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
    backBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111" },
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px", maxWidth: 880, margin: "0 auto" },

    header: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid #eee" },
    avatar: {
        width: 96, height: 96, borderRadius: "50%", backgroundColor: "#111", backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 800, flexShrink: 0,
    },
    username: { fontSize: 26, fontWeight: 800, color: "#111", margin: "4px 0 6px" },
    bio: { fontSize: 14, color: "#666", margin: 0, lineHeight: 1.5 },
    statsRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
    statBadge: { fontSize: 13, color: "#888", background: "#f7f7f7", padding: "6px 12px", borderRadius: 20 },
    statBadgeClickable: { fontSize: 13, color: "#888", background: "#f7f7f7", padding: "6px 12px", borderRadius: 20, cursor: "pointer" },
    editBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111", flexShrink: 0 },
    followBtn: { border: "1px solid #d44800", background: "#d44800", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 },
    followingBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111", flexShrink: 0 },

    sectionTitle: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 16 },

    playlistGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 18 },
    playlistCard: { cursor: "pointer", position: "relative" },
    playlistCover: { width: "100%", aspectRatio: "1 / 1", borderRadius: 10, backgroundColor: "#222", backgroundSize: "cover", backgroundPosition: "center", marginBottom: 6 },
    playlistName: { fontSize: 14, fontWeight: 700, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    privateTag: { fontSize: 11, color: "#888", background: "#f0f0f0", padding: "2px 8px", borderRadius: 10, marginTop: 4, display: "inline-block" },
    reviewList: { display: "flex", flexDirection: "column", gap: 12 },
    reviewCard: { border: "1px solid #eee", borderRadius: 12, padding: 18 },
    reviewAbout: { fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 8px" },
    reviewTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    reviewDate: { fontSize: 12, color: "#aaa" },
    reviewText: { fontSize: 14, color: "#333", margin: 0, lineHeight: 1.5 },
    reviewActions: { display: "flex", gap: 10 },
    reviewActionLink: { fontSize: 12, color: "#d44800", fontWeight: 700, cursor: "pointer" },
    editTextarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" },
    saveBtn: { background: "#d44800", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
    cancelBtn: { background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },

    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
    modalCard: { background: "#fff", borderRadius: 16, padding: 24, width: 320, maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
    modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 800, color: "#111" },
    closeBtn: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#888" },
    userRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", cursor: "pointer", borderBottom: "1px solid #f5f5f5" },
    avatarSmall: {
        width: 32, height: 32, borderRadius: "50%", backgroundColor: "#111", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0,
    },
};
