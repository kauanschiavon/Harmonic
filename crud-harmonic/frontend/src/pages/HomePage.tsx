import { useEffect, useState } from "react";
import { spotifyService, type SpotifyAlbum, type SpotifyTrack } from "../services/spotifyService";
import { playlistService, type Playlist } from "../services/playlistService";

export default function HomePage({ onLogout, onOpenProfile, onOpenReviews, onOpenLists, onOpenUsers, onOpenSong, onOpenPlaylist }: { onLogout: () => void; onOpenProfile: (userId: number) => void; onOpenReviews: () => void; onOpenLists: () => void; onOpenUsers: () => void; onOpenSong: (songId: string) => void; onOpenPlaylist: (playlistId: number) => void }) {
    const [query, setQuery] = useState("");
    const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => {
        loadPlaylists();
    }, []);

    async function loadPlaylists() {
        try {
            const data = await playlistService.findAll();
            setPlaylists(data);
        } catch {
            // feed vazio, sem problema
        }
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const results = await spotifyService.search(query);
            setAlbums(results.albums ?? []);
            setTracks(results.tracks ?? []);
        } catch {
            setAlbums([]);
            setTracks([]);
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
            {/* Navbar */}
            <nav style={s.nav}>
                <div style={s.logoRow}>
                    <span style={{ fontSize: 22 }}>♪</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>
                        Harm<span style={{ color: "#d44800" }}>onic</span>
                    </span>
                </div>
                <div style={s.navLinks}>
                    <span style={s.navLinkActive}>🏠 Home</span>
                    <span style={s.navLink}>🎵 Tracks</span>
                    <span style={s.navLink} onClick={onOpenReviews}>📝 Reviews</span>
                    <span style={s.navLink} onClick={onOpenLists}>📋 Playlists</span>
                    <span style={s.navLink} onClick={() => user?.id && onOpenProfile(user.id)}>👤 {user?.username ?? "Profile"}</span>
                    {user?.role === "admin" && (
                        <span style={s.navLink} onClick={onOpenUsers}>🛠️ Admin</span>
                    )}
                </div>
                <div style={s.navRight}>
                    <form onSubmit={handleSearch} style={{ position: "relative" }}>
                        <span style={s.searchIcon}>🔍</span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search albums, artists…"
                            style={s.searchInput}
                        />
                    </form>
                    <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <main style={s.main}>
                {/* Músicas encontradas na busca — clique para ver detalhes e avaliar */}
                {tracks.length > 0 && (
                    <section style={{ marginBottom: 48 }}>
                        <h2 style={s.sectionTitle}>Músicas</h2>
                        <div style={s.grid}>
                            {tracks.map((track) => (
                                <TrackCard key={track.id} track={track} onOpenSong={onOpenSong} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Álbuns encontrados na busca */}
                {albums.length > 0 && (
                    <section style={{ marginBottom: 48 }}>
                        <h2 style={s.sectionTitle}>Álbuns</h2>
                        <div style={s.grid}>
                            {albums.map((album) => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    </section>
                )}

                {loading && <p style={{ color: "#888" }}>Buscando…</p>}

                {/* Feed de playlists públicas */}
                <section>
                    <h2 style={s.sectionTitle}>Playlists da comunidade</h2>
                    {playlists.length === 0 ? (
                        <div style={s.emptyBox}>
                            <p style={{ color: "#888", margin: 0 }}>Nenhuma playlist pública ainda.</p>
                            <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                                Procure um álbum acima e crie sua primeira playlist!
                            </p>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {playlists.map((p) => (
                                <PlaylistCard key={p.id} playlist={p} onOpen={onOpenPlaylist} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function TrackCard({ track, onOpenSong }: { track: SpotifyTrack; onOpenSong: (songId: string) => void }) {
    return (
        <div style={{ ...s.card, cursor: "pointer" }} onClick={() => onOpenSong(track.id)}>
            <div style={{ ...s.coverWrap, backgroundImage: `url(${track.image})` }} />
            <p style={s.cardTitle}>{track.name}</p>
            <p style={s.cardSubtitle}>{track.artist}</p>
            <p style={s.cardMeta}>💿 {track.album}</p>
        </div>
    );
}

function AlbumCard({ album }: { album: SpotifyAlbum }) {
    return (
        <div style={s.card}>
            <div style={{ ...s.coverWrap, backgroundImage: `url(${album.image})` }} />
            <p style={s.cardTitle}>{album.name}</p>
            <p style={s.cardSubtitle}>{album.artist}</p>
            <p style={s.cardMeta}>📅 {album.releaseDate?.slice(0, 4)}</p>
        </div>
    );
}

function PlaylistCard({ playlist, onOpen }: { playlist: Playlist; onOpen: (playlistId: number) => void }) {
    return (
        <div style={{ ...s.card, cursor: "pointer" }} onClick={() => onOpen(playlist.id)}>
            <div style={{ ...s.coverWrap, backgroundColor: "#222", backgroundImage: playlist.cover_url ? `url(${playlist.cover_url})` : undefined }} />
            <p style={s.cardTitle}>{playlist.name}</p>
            <p style={s.cardSubtitle}>por {playlist.username}</p>
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
    searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.5 },
    searchInput: { padding: "8px 14px 8px 34px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f7", fontSize: 14, width: 220, outline: "none" },
    logoutBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 },
    main: { padding: "32px 32px 64px" },
    sectionTitle: { fontSize: 24, fontWeight: 800, color: "#111", marginBottom: 16 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 },
    card: { display: "flex", flexDirection: "column", gap: 4 },
    coverWrap: { width: "100%", aspectRatio: "1 / 1", borderRadius: 10, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#eee", marginBottom: 6 },
    cardTitle: { fontWeight: 700, fontSize: 14, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    cardSubtitle: { fontSize: 13, color: "#777", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    cardMeta: { fontSize: 12, color: "#999", margin: 0 },
    emptyBox: { border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center" },
};
