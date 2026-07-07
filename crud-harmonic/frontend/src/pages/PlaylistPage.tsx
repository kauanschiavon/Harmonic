import { useEffect, useState } from "react";
import { playlistService, type PlaylistWithMusics, type PlaylistMusic } from "../services/playlistService";

function formatDuration(ms: number) {
    const total = Math.floor((ms ?? 0) / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function PlaylistPage({
    playlistId,
    onBack,
    onGoHome,
    onOpenReviews,
    onOpenLists,
    onOpenProfile,
    onLogout,
}: {
    playlistId: number;
    onBack: () => void;
    onOpenReviews: () => void;
    onOpenLists: () => void;
    onOpenProfile: (userId: number) => void;
    onLogout: () => void;
}) {
    const [playlist, setPlaylist] = useState<PlaylistWithMusics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [reorderingId, setReorderingId] = useState<string | null>(null);

    const loggedUser = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const isOwner = !!loggedUser?.id && playlist?.user_id === loggedUser.id;

    useEffect(() => {
        loadPlaylist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistId]);

    async function loadPlaylist() {
        setLoading(true);
        setError("");
        try {
            const data = await playlistService.findById(playlistId);
            setPlaylist(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível carregar esta playlist.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveMusic(musicId: string) {
        if (!playlist) return;
        setActionError("");
        const prevMusics = playlist.musics;
        // atualização otimista
        setPlaylist({ ...playlist, musics: playlist.musics.filter((m) => m.music_id !== musicId) });
        try {
            await playlistService.removeMusic(playlist.id, musicId);
        } catch (err: any) {
            setPlaylist({ ...playlist, musics: prevMusics });
            setActionError(err?.response?.data?.message ?? "Não foi possível remover a música.");
        }
    }

    async function handleMove(index: number, direction: -1 | 1) {
        if (!playlist) return;
        const target = index + direction;
        if (target < 0 || target >= playlist.musics.length) return;

        const musics = [...playlist.musics];
        [musics[index], musics[target]] = [musics[target], musics[index]];

        // recalcula posições sequencialmente
        const reordered = musics.map((m, i) => ({ ...m, position: i + 1 }));
        const moved = reordered[target];

        setActionError("");
        setReorderingId(moved.music_id);
        const prevMusics = playlist.musics;
        setPlaylist({ ...playlist, musics: reordered });
        try {
            await playlistService.reorder(
                playlist.id,
                reordered.map((m) => ({ music_id: m.music_id, position: m.position }))
            );
        } catch (err: any) {
            setPlaylist({ ...playlist, musics: prevMusics });
            setActionError(err?.response?.data?.message ?? "Não foi possível reordenar as músicas.");
        } finally {
            setReorderingId(null);
        }
    }

    async function handleDelete() {
        if (!playlist || !loggedUser?.id) return;
        setDeleting(true);
        setActionError("");
        try {
            await playlistService.delete(playlist.id, loggedUser.id);
            onBack();
        } catch (err: any) {
            setActionError(err?.response?.data?.message ?? "Não foi possível excluir a playlist.");
            setDeleting(false);
            setShowDeleteConfirm(false);
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
                    <span style={s.navLink} onClick={onOpenReviews}>📝 Reviews</span>
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
                {loading && <p style={{ color: "#888" }}>Carregando playlist…</p>}

                {!loading && error && (
                    <div style={s.emptyBox}>
                        <p style={{ color: "#d44800", margin: 0, fontWeight: 700 }}>{error}</p>
                        <button onClick={loadPlaylist} style={s.retryBtn}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !error && playlist && (
                    <>
                        <div style={s.header}>
                            <div
                                style={{
                                    ...s.cover,
                                    backgroundImage: playlist.cover_url ? `url(${playlist.cover_url})` : undefined,
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={s.meta}>
                                    📋 Playlist {playlist.is_public === false && "· Privada"}
                                </p>
                                <h1 style={s.title}>{playlist.name}</h1>
                                <p style={s.subtitle}>
                                    por{" "}
                                    <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => onOpenProfile(playlist.user_id)}>
                                        {playlist.username ?? "usuário"}
                                    </span>
                                    {" · "}
                                    {playlist.musics.length} música{playlist.musics.length !== 1 ? "s" : ""}
                                </p>
                                {playlist.description && <p style={s.description}>{playlist.description}</p>}
                            </div>

                            {isOwner && (
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button style={s.editBtn} onClick={() => setShowEditModal(true)}>Editar</button>
                                    <button style={s.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>Excluir</button>
                                </div>
                            )}
                        </div>

                        {actionError && (
                            <p style={{ color: "#d44800", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{actionError}</p>
                        )}

                        {playlist.musics.length === 0 ? (
                            <div style={s.emptyBox}>
                                <p style={{ color: "#888", margin: 0 }}>Nenhuma música nesta playlist ainda.</p>
                                <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                                    Vá até a página de uma música e adicione à playlist.
                                </p>
                            </div>
                        ) : (
                            <div style={s.trackList}>
                                {playlist.musics.map((music, index) => (
                                    <TrackRow
                                        key={music.music_id}
                                        music={music}
                                        index={index}
                                        total={playlist.musics.length}
                                        isOwner={isOwner}
                                        busy={reorderingId === music.music_id}
                                        onMoveUp={() => handleMove(index, -1)}
                                        onMoveDown={() => handleMove(index, 1)}
                                        onRemove={() => handleRemoveMusic(music.music_id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {showEditModal && playlist && (
                <EditPlaylistModal
                    playlist={playlist}
                    onClose={() => setShowEditModal(false)}
                    onSaved={(updated) => {
                        setPlaylist({ ...playlist, ...updated });
                        setShowEditModal(false);
                    }}
                />
            )}

            {showDeleteConfirm && (
                <div style={s.modalOverlay} onClick={() => !deleting && setShowDeleteConfirm(false)}>
                    <div style={s.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <h3 style={s.modalTitle}>Excluir playlist?</h3>
                        <p style={{ fontSize: 14, color: "#555", margin: "0 0 20px" }}>
                            Essa ação não pode ser desfeita. Tem certeza que deseja excluir "{playlist?.name}"?
                        </p>
                        <div style={s.modalActions}>
                            <button style={s.cancelBtn} onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                                Cancelar
                            </button>
                            <button style={s.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                                {deleting ? "Excluindo…" : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TrackRow({
    music,
    index,
    total,
    isOwner,
    busy,
    onMoveUp,
    onMoveDown,
    onRemove,
}: {
    music: PlaylistMusic;
    index: number;
    total: number;
    isOwner: boolean;
    busy: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}) {
    return (
        <div style={{ ...s.trackRow, opacity: busy ? 0.5 : 1 }}>
            <span style={s.trackPosition}>{index + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={s.trackTitle}>{music.title}</p>
            </div>
            <span style={s.trackDuration}>{formatDuration(music.duration_ms)}</span>
            {isOwner && (
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button style={s.iconBtn} onClick={onMoveUp} disabled={index === 0 || busy} title="Mover para cima">▲</button>
                    <button style={s.iconBtn} onClick={onMoveDown} disabled={index === total - 1 || busy} title="Mover para baixo">▼</button>
                    <button style={s.iconBtnDanger} onClick={onRemove} disabled={busy} title="Remover da playlist">✕</button>
                </div>
            )}
        </div>
    );
}

function EditPlaylistModal({
    playlist,
    onClose,
    onSaved,
}: {
    playlist: PlaylistWithMusics;
    onClose: () => void;
    onSaved: (data: { name: string; description?: string; is_public: boolean }) => void;
}) {
    const [name, setName] = useState(playlist.name);
    const [description, setDescription] = useState(playlist.description ?? "");
    const [isPublic, setIsPublic] = useState(playlist.is_public !== false);
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
            await playlistService.update(playlist.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                is_public: isPublic,
            });
            onSaved({ name: name.trim(), description: description.trim() || undefined, is_public: isPublic });
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Não foi possível salvar as alterações.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={s.modalOverlay} onClick={onClose}>
            <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
                <h3 style={s.modalTitle}>Editar playlist</h3>
                <form onSubmit={handleSubmit}>
                    <label style={s.label}>Nome</label>
                    <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} autoFocus />

                    <label style={s.label}>Descrição</label>
                    <textarea
                        style={{ ...s.input, resize: "vertical", minHeight: 60 }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label style={{ ...s.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        Playlist pública
                    </label>

                    {error && <p style={{ color: "#d44800", fontSize: 13, margin: "8px 0 0" }}>{error}</p>}

                    <div style={s.modalActions}>
                        <button type="button" onClick={onClose} style={s.cancelBtn} disabled={saving}>Cancelar</button>
                        <button type="submit" style={s.createBtn} disabled={saving}>
                            {saving ? "Salvando…" : "Salvar alterações"}
                        </button>
                    </div>
                </form>
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
    navRight: { display: "flex", alignItems: "center", gap: 12 },
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px", maxWidth: 780, margin: "0 auto" },

    header: { display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start" },
    cover: { width: 140, height: 140, borderRadius: 12, backgroundColor: "#222", backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 },
    meta: { fontSize: 12, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" },
    title: { fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 6px" },
    subtitle: { fontSize: 14, color: "#666", margin: 0 },
    description: { fontSize: 14, color: "#333", margin: "10px 0 0", lineHeight: 1.5 },
    editBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },
    deleteBtn: { border: "1px solid #d44800", background: "#fff", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#d44800" },

    trackList: { display: "flex", flexDirection: "column", gap: 8 },
    trackRow: { display: "flex", alignItems: "center", gap: 14, border: "1px solid #eee", borderRadius: 10, padding: "10px 16px" },
    trackPosition: { fontSize: 13, color: "#aaa", width: 20, textAlign: "center", flexShrink: 0 },
    trackTitle: { fontSize: 14, fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    trackDuration: { fontSize: 13, color: "#888", flexShrink: 0 },
    iconBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 11, color: "#555" },
    iconBtnDanger: { border: "1px solid #ffd7c4", background: "#fff", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 12, color: "#d44800" },

    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
    retryBtn: { marginTop: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111" },

    modalOverlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16,
    },
    modalBox: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" },
    confirmBox: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" },
    modalTitle: { fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 18px" },
    label: { display: "block", fontSize: 13, fontWeight: 700, color: "#333", margin: "12px 0 6px" },
    input: { width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
    cancelBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#555" },
    createBtn: { border: "none", background: "#d44800", color: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700 },
    confirmDeleteBtn: { border: "none", background: "#d44800", color: "#fff", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700 },
};

