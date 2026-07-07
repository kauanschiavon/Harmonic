import { useEffect, useState } from "react";
import { spotifyService, type SpotifyAlbum, type SpotifyTrack, type SpotifyArtist } from "../services/spotifyService";
import { playlistService, type Playlist } from "../services/playlistService";
import { reviewService, type FeedReview } from "../services/reviewService";

export default function HomePage({ onLogout, onOpenProfile, onOpenReviews, onOpenUsers, onOpenSong, onOpenPlaylist, onOpenArtist }: {
    onLogout: ()=>void; onOpenProfile:(id:number)=>void; onOpenReviews:()=>void;
    onOpenUsers:()=>void; onOpenSong:(id:string)=>void; onOpenPlaylist:()=>void;
    onOpenArtist:(id:string)=>void;
}) {
    const [query, setQuery] = useState("");
    const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [artists, setArtists] = useState<SpotifyArtist[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [feed, setFeed] = useState<FeedReview[]>([]);
    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => { loadSidebar(); }, []);

    async function loadSidebar() {
        try {
            const [pl, rv] = await Promise.all([
                user?.id ? playlistService.findByUser(user.id).catch(()=>[]) : Promise.resolve([]),
                reviewService.getFeed().catch(()=>[]),
            ]);
            setPlaylists(pl as Playlist[]);
            setFeed((rv as FeedReview[]).slice(0, 5));
        } catch { /* sem dados ainda */ }
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true); setSearched(true);
        try {
            const r = await spotifyService.search(query);
            setAlbums(r.albums ?? []); setTracks(r.tracks ?? []); setArtists(r.artists ?? []);
        } catch { setAlbums([]); setTracks([]); setArtists([]); }
        finally { setLoading(false); }
    }

    function clearSearch() { setQuery(""); setAlbums([]); setTracks([]); setArtists([]); setSearched(false); }

    function handleLogout() { localStorage.removeItem("harmonic_token"); localStorage.removeItem("harmonic_user"); onLogout(); }

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <div style={s.logoRow}><span style={{fontSize:22}}>♪</span><span style={{fontSize:20,fontWeight:800,color:"#111"}}>Harm<span style={{color:"#d44800"}}>onic</span></span></div>
                <div style={s.navLinks}>
                    <span style={s.navLinkActive}>🏠 Home</span>
                    <span style={s.navLink} onClick={onOpenReviews}>📝 Reviews</span>
                    <span style={s.navLink} onClick={onOpenPlaylist}>📋 Playlists</span>
                    <span style={s.navLink} onClick={()=>user?.id&&onOpenProfile(user.id)}>👤 {user?.username??"Profile"}</span>
                    {user?.role==="admin"&&<span style={s.navLink} onClick={onOpenUsers}>🛠️ Admin</span>}
                </div>
                <div style={s.navRight}>
                    <form onSubmit={handleSearch} style={{position:"relative"}}>
                        <span style={s.searchIcon}>🔍</span>
                        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar músicas, álbuns, artistas…" style={s.searchInput}/>
                    </form>
                    {searched&&<button onClick={clearSearch} style={{...s.logoutBtn,fontSize:12}}>✕ Limpar</button>}
                    <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
                </div>
            </nav>

            <main style={s.main}>
                {loading&&<p style={{color:"#888",marginBottom:24}}>Buscando no Spotify…</p>}

                {/* Artistas */}
                {artists.length>0&&(
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Artistas</h2>
                        <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:8}}>
                            {artists.slice(0,6).map(a=>(
                                <div key={a.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"pointer",minWidth:100,flexShrink:0}} onClick={()=>onOpenArtist(a.id)}>
                                    <div style={{width:80,height:80,borderRadius:"50%",backgroundImage:`url(${a.image})`,backgroundSize:"cover",backgroundColor:"#eee"}}/>
                                    <span style={{fontSize:13,fontWeight:600,textAlign:"center",color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{a.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tracks */}
                {tracks.length>0&&(
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Músicas</h2>
                        <div style={s.grid}>
                            {tracks.map(t=>(
                                <div key={t.id} style={{...s.card,cursor:"pointer"}} onClick={()=>onOpenSong(t.id)}>
                                    <div style={{...s.coverWrap,backgroundImage:`url(${t.image})`}}/>
                                    <p style={s.cardTitle}>{t.name}</p>
                                    <p style={s.cardSubtitle}>{t.artist}</p>
                                    <p style={s.cardMeta}>💿 {t.album}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Albums */}
                {albums.length>0&&(
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Álbuns</h2>
                        <div style={s.grid}>
                            {albums.map(a=>(
                                <div key={a.id} style={s.card}>
                                    <div style={{...s.coverWrap,backgroundImage:`url(${a.image})`}}/>
                                    <p style={s.cardTitle}>{a.name}</p>
                                    <p style={{...s.cardSubtitle,cursor:"pointer",textDecoration:"underline",textDecorationColor:"#ccc"}} onClick={()=>a.artistId&&onOpenArtist(a.artistId)}>{a.artist}</p>
                                    <p style={s.cardMeta}>📅 {a.releaseDate?.slice(0,4)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {searched&&!loading&&tracks.length===0&&albums.length===0&&(
                    <div style={s.emptyBox}><p style={{color:"#888",margin:0}}>Nenhum resultado para "{query}".</p></div>
                )}

                {/* Quando não há busca: feed de reviews + playlists */}
                {!searched&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:32}}>
                        <section>
                            <h2 style={s.sectionTitle}>Atividade recente</h2>
                            {feed.length===0 ? (
                                <div style={s.emptyBox}>
                                    <p style={{color:"#888",margin:0}}>Nenhuma review ainda.</p>
                                    <p style={{color:"#aaa",fontSize:13,marginTop:4}}>Busque uma música e seja o primeiro a avaliar!</p>
                                </div>
                            ) : (
                                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                    {feed.map(r=>(
                                        <div key={r.id} style={{border:"1px solid #eee",borderRadius:10,padding:"12px 16px"}}>
                                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                                                <span style={{fontWeight:700,fontSize:14,cursor:"pointer",color:"#111"}} onClick={()=>onOpenProfile(r.user_id)}>{r.username}</span>
                                                {r.music_title&&<span style={{fontSize:13,color:"#666"}}> avaliou "{r.music_title}"</span>}
                                                {!r.music_title&&r.artist_name&&<span style={{fontSize:13,color:"#666"}}> avaliou {r.artist_name}</span>}
                                                <div style={{marginLeft:"auto",display:"flex",gap:1}}>
                                                    {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=r.note?"#f59e0b":"#eee",fontSize:14}}>★</span>)}
                                                </div>
                                            </div>
                                            {r.text&&<p style={{fontSize:13,color:"#444",margin:0,lineHeight:1.5}}>{r.text.length>120?r.text.slice(0,120)+"…":r.text}</p>}
                                        </div>
                                    ))}
                                    <span style={{fontSize:13,color:"#d44800",cursor:"pointer",fontWeight:600}} onClick={onOpenReviews}>Ver todos os reviews →</span>
                                </div>
                            )}
                        </section>

                        <aside>
                            <h2 style={{...s.sectionTitle,fontSize:18}}>Minhas Playlists</h2>
                            {playlists.length===0 ? (
                                <div style={{border:"1.5px dashed #eee",borderRadius:10,padding:20,textAlign:"center"}}>
                                    <p style={{color:"#aaa",margin:0,fontSize:13}}>Nenhuma playlist ainda.</p>
                                    <span style={{fontSize:13,color:"#d44800",cursor:"pointer",fontWeight:600}} onClick={onOpenPlaylist}>Criar playlist →</span>
                                </div>
                            ) : (
                                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                    {playlists.slice(0,5).map(pl=>(
                                        <div key={pl.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",border:"1px solid #eee",borderRadius:8,cursor:"pointer"}} onClick={onOpenPlaylist} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                                            <span style={{fontSize:18}}>🎵</span>
                                            <span style={{fontSize:14,fontWeight:600,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.name}</span>
                                        </div>
                                    ))}
                                    <span style={{fontSize:13,color:"#d44800",cursor:"pointer",fontWeight:600}} onClick={onOpenPlaylist}>Ver todas →</span>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

const s: Record<string,React.CSSProperties> = {
    page:{minHeight:"100vh",background:"#fff",fontFamily:"Inter, sans-serif"},
    nav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",borderBottom:"1px solid #eee",gap:24},
    logoRow:{display:"flex",alignItems:"center",gap:8,flexShrink:0},
    navLinks:{display:"flex",gap:24,flex:1,justifyContent:"center",flexWrap:"wrap"},
    navLink:{color:"#555",fontSize:14,cursor:"pointer"},
    navLinkActive:{color:"#111",fontSize:14,fontWeight:700,background:"#f0f0f0",padding:"6px 12px",borderRadius:8,cursor:"pointer"},
    navRight:{display:"flex",alignItems:"center",gap:8},
    searchIcon:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.5},
    searchInput:{padding:"8px 14px 8px 34px",borderRadius:8,border:"1px solid #ddd",background:"#f7f7f7",fontSize:14,width:220,outline:"none"},
    logoutBtn:{border:"1px solid #ddd",background:"#fff",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14},
    main:{padding:"32px 32px 64px"},
    section:{marginBottom:40},
    sectionTitle:{fontSize:22,fontWeight:800,color:"#111",marginBottom:16},
    grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16},
    card:{display:"flex",flexDirection:"column",gap:4},
    coverWrap:{width:"100%",aspectRatio:"1/1",borderRadius:10,backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"#eee",marginBottom:6},
    cardTitle:{fontWeight:700,fontSize:13,color:"#111",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
    cardSubtitle:{fontSize:12,color:"#777",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
    cardMeta:{fontSize:11,color:"#999",margin:0},
    emptyBox:{border:"1.5px dashed #ddd",borderRadius:12,padding:32,textAlign:"center"},
};
