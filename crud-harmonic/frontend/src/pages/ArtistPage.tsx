import { useEffect, useState } from "react";
import api from "../services/api";

interface ArtistData {
    id: string; name: string; genres: string[];
    images: { url: string }[];
    followers: { total: number };
    external_urls: { spotify: string };
}
interface Album { id: string; name: string; images: { url: string }[]; release_date: string; album_type: string; }
interface Track { id: string; name: string; duration_ms: number; external_urls: { spotify: string }; }

function fmt(ms: number) { const s=Math.floor(ms/1000); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }

export default function ArtistPage({ artistId, onBack, onOpenSong, onLogout }: {
    artistId: string; onBack:()=>void; onOpenSong:(id:string)=>void; onLogout:()=>void;
}) {
    const [artist, setArtist] = useState<ArtistData|null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [topTracks, setTopTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("harmonic_user")??"null");

    useEffect(() => { load(); }, [artistId]);

    async function load() {
        setLoading(true); setError("");
        try {
            const [artRes, albRes, tracksRes] = await Promise.all([
                api.get(`/spotify/artists/${artistId}`),
                api.get(`/spotify/artists/${artistId}/albums`),
                api.get(`/spotify/artists/${artistId}/top-tracks`),
            ]);
            setArtist(artRes.data);
            setAlbums(albRes.data?.items ?? []);
            setTopTracks(tracksRes.data?.tracks ?? []);
        } catch { setError("Não foi possível carregar o artista."); }
        finally { setLoading(false); }
    }

    function handleLogout() { localStorage.removeItem("harmonic_token"); localStorage.removeItem("harmonic_user"); onLogout(); }

    if (loading) return <div style={s.page}><p style={{padding:32,color:"#888"}}>Carregando artista…</p></div>;
    if (error||!artist) return <div style={s.page}><p style={{padding:32,color:"red"}}>{error||"Artista não encontrado."}</p></div>;

    const cover = artist.images?.[0]?.url;
    const followers = artist.followers?.total?.toLocaleString("pt-BR");

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <div style={s.logoRow}><span style={{fontSize:22}}>♪</span><span style={{fontSize:20,fontWeight:800,color:"#111"}}>Harm<span style={{color:"#d44800"}}>onic</span></span></div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onBack}>🏠 Home</span>
                    {user&&<span style={s.navLink} onClick={()=>user?.id&&onLogout}>👤 {user?.username}</span>}
                </div>
                <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
            </nav>

            <main style={s.main}>
                {/* Cabeçalho do artista */}
                <div style={s.header}>
                    {cover&&<img src={cover} alt={artist.name} style={s.cover}/>}
                    <div>
                        <p style={s.metaLabel}>🎤 Artista</p>
                        <h1 style={s.title}>{artist.name}</h1>
                        <p style={s.subtitle}>{followers} seguidores no Spotify</p>
                        {artist.genres?.length>0&&(
                            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                                {artist.genres.slice(0,4).map(g=><span key={g} style={s.genre}>{g}</span>)}
                            </div>
                        )}
                        <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer" style={s.spotifyBtn}>▶ Ver no Spotify</a>
                    </div>
                </div>

                {/* Top tracks */}
                {topTracks.length>0&&(
                    <section style={{marginBottom:40}}>
                        <h2 style={s.sectionTitle}>Músicas populares</h2>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            {topTracks.slice(0,10).map((t,i)=>(
                                <div key={t.id} style={s.trackRow} onClick={()=>onOpenSong(t.id)} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                                    <span style={{color:"#bbb",fontSize:13,width:24}}>{i+1}</span>
                                    <span style={{flex:1,fontWeight:600,fontSize:14}}>{t.name}</span>
                                    <span style={{fontSize:13,color:"#888"}}>{fmt(t.duration_ms)}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Discografia */}
                {albums.length>0&&(
                    <section>
                        <h2 style={s.sectionTitle}>Discografia</h2>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16}}>
                            {albums.map(al=>(
                                <div key={al.id} style={{display:"flex",flexDirection:"column",gap:4}}>
                                    <div style={{width:"100%",aspectRatio:"1/1",borderRadius:8,backgroundImage:`url(${al.images?.[0]?.url})`,backgroundSize:"cover",backgroundColor:"#eee"}}/>
                                    <p style={{fontWeight:700,fontSize:13,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{al.name}</p>
                                    <p style={{fontSize:12,color:"#999",margin:0}}>{al.release_date?.slice(0,4)} · {al.album_type}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

const s: Record<string,React.CSSProperties> = {
    page:{minHeight:"100vh",background:"#fff",fontFamily:"Inter, sans-serif"},
    nav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",borderBottom:"1px solid #eee",gap:24},
    logoRow:{display:"flex",alignItems:"center",gap:8},
    navLinks:{display:"flex",gap:24,flex:1,justifyContent:"center"},
    navLink:{color:"#555",fontSize:14,cursor:"pointer"},
    logoutBtn:{border:"1px solid #ddd",background:"#fff",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14},
    main:{padding:"32px 32px 64px",maxWidth:860,margin:"0 auto"},
    header:{display:"flex",gap:32,marginBottom:48,alignItems:"flex-start"},
    cover:{width:200,height:200,borderRadius:"50%",objectFit:"cover",flexShrink:0},
    metaLabel:{fontSize:12,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"},
    title:{fontSize:36,fontWeight:800,color:"#111",margin:"0 0 4px"},
    subtitle:{fontSize:15,color:"#666",margin:"0 0 8px"},
    genre:{background:"#f0f0f0",padding:"4px 10px",borderRadius:20,fontSize:12,color:"#555"},
    spotifyBtn:{display:"inline-block",marginTop:16,background:"#1DB954",color:"#fff",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,textDecoration:"none"},
    sectionTitle:{fontSize:20,fontWeight:800,color:"#111",marginBottom:16},
    trackRow:{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:8,cursor:"pointer",background:"#fff",transition:"background 0.1s"},
};
