import { useEffect, useState } from "react";
import api from "../services/api";
import { commentService, type Comment } from "../services/commentService";
import { reviewlikeService } from "../services/reviewlikeService";
import { favoriteService } from "../services/favoriteService";
import { playlistService, type Playlist } from "../services/playlistService";

interface SongDetail {
    music_id: string; title: string; artist: string; artist_id: string;
    album: string; cover: string; duration_ms: number; track_number: number;
    release_date: string; spotify_url: string;
    avg_rating: number | null; total_reviews: number; reviews: Review[];
}
interface Review {
    id: number; note: number; text: string; create_time: string;
    user_id: number; username: string; photo_url: string | null;
}
function fmt(ms: number) { const s = Math.floor(ms/1000); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
function Stars({ r, size = 18, onClick }: { r: number; size?: number; onClick?: (n: number) => void }) {
    return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i<=r?"#f59e0b":"#ddd", fontSize: size, cursor: onClick?"pointer":"default" }} onClick={()=>onClick?.(i)}>★</span>)}</span>;
}

export default function SongPage({ songId, onBack, onOpenProfile, onLogout }: {
    songId: string; onBack: ()=>void; onOpenProfile:(id:number)=>void; onLogout:()=>void;
}) {
    const [song, setSong] = useState<SongDetail|null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [note, setNote] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");
    // comments state per review
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
    const [commentText, setCommentText] = useState<Record<number, string>>({});
    const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});
    // likes
    const [likes, setLikes] = useState<Record<number, number>>({});
    // favorite
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    // playlist modal
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [playlistMsg, setPlaylistMsg] = useState("");

    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");

    useEffect(() => { loadSong(); }, [songId]);
    useEffect(() => { if (user?.id) checkFavorite(); }, [songId, user?.id]);

    async function loadSong() {
        setLoading(true); setError("");
        try { const { data } = await api.get(`/songs/${songId}`); setSong(data); }
        catch { setError("Não foi possível carregar os detalhes da música."); }
        finally { setLoading(false); }
    }

    async function checkFavorite() {
        try {
            const favs = await favoriteService.listByUser(user.id);
            setIsFav(favs.some(f => f.music_id === songId));
        } catch { /* sem favoritos ainda */ }
    }

    async function handleSubmitReview(e: React.FormEvent) {
        e.preventDefault();
        if (!note) { setSubmitMsg("Selecione uma nota."); return; }
        if (!song?.artist_id) { setSubmitMsg("Dados ainda carregando, tente novamente."); return; }
        setSubmitting(true); setSubmitMsg("");
        try {
            await api.post("/reviews", { user_id: user.id, music_id: songId, artist_id: song.artist_id, note, text });
            setSubmitMsg("Avaliação publicada!"); setNote(0); setText(""); loadSong();
        } catch (err: any) { setSubmitMsg(err.response?.data?.message ?? "Erro ao publicar."); }
        finally { setSubmitting(false); }
    }

    async function toggleFavorite() {
        if (!user?.id || !song) return;
        setFavLoading(true);
        try {
            if (isFav) { await favoriteService.remove(user.id, songId); setIsFav(false); }
            else { await favoriteService.add(user.id, { music_id: songId, title: song.title, duration_ms: song.duration_ms }); setIsFav(true); }
        } catch (err: any) { alert(err.response?.data?.message ?? "Erro."); }
        finally { setFavLoading(false); }
    }

    async function toggleComments(reviewId: number) {
        if (openComments[reviewId]) { setOpenComments(p => ({...p, [reviewId]: false})); return; }
        setOpenComments(p => ({...p, [reviewId]: true}));
        if (comments[reviewId]) return;
        try {
            const { comments: data } = await commentService.listByReview(reviewId);
            setComments(p => ({...p, [reviewId]: data}));
        } catch { setComments(p => ({...p, [reviewId]: []})); }
    }

    async function submitComment(reviewId: number) {
        const txt = commentText[reviewId]?.trim();
        if (!txt || !user?.id) return;
        setCommentLoading(p => ({...p, [reviewId]: true}));
        try {
            await commentService.create(reviewId, user.id, txt);
            setCommentText(p => ({...p, [reviewId]: ""}));
            const { comments: data } = await commentService.listByReview(reviewId);
            setComments(p => ({...p, [reviewId]: data}));
        } catch { /* ignore */ }
        finally { setCommentLoading(p => ({...p, [reviewId]: false})); }
    }

    async function handleLike(reviewId: number) {
        if (!user?.id) return;
        try {
            const { total_likes } = await reviewlikeService.like(reviewId, user.id);
            setLikes(p => ({...p, [reviewId]: total_likes}));
        } catch { /* já curtiu */ }
    }

    async function openPlaylistModal() {
        if (!user?.id) return;
        setShowPlaylistModal(true); setPlaylistMsg("");
        try { const data = await playlistService.findByUser(user.id); setPlaylists(data); }
        catch { setPlaylists([]); }
    }

    async function addToPlaylist(playlistId: number) {
        if (!song) return;
        try {
            await playlistService.addMusic(playlistId, { music_id: songId, title: song.title, duration_ms: song.duration_ms });
            setPlaylistMsg("Adicionado com sucesso!"); setTimeout(() => setShowPlaylistModal(false), 1200);
        } catch (err: any) { setPlaylistMsg(err.response?.data?.message ?? "Erro ao adicionar."); }
    }

    async function createAndAdd() {
        if (!newPlaylistName.trim() || !user?.id) return;
        try {
            const pl = await playlistService.create({ user_id: user.id, name: newPlaylistName.trim() });
            await addToPlaylist(pl.id);
            setNewPlaylistName("");
        } catch (err: any) { setPlaylistMsg(err.response?.data?.message ?? "Erro ao criar playlist."); }
    }

    function handleLogout() { localStorage.removeItem("harmonic_token"); localStorage.removeItem("harmonic_user"); onLogout(); }

    if (loading) return <div style={s.page}><p style={{padding:32,color:"#888"}}>Carregando…</p></div>;
    if (error||!song) return <div style={s.page}><p style={{padding:32,color:"red"}}>{error||"Música não encontrada."}</p></div>;

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <div style={s.logoRow}><span style={{fontSize:22}}>♪</span><span style={{fontSize:20,fontWeight:800,color:"#111"}}>Harm<span style={{color:"#d44800"}}>onic</span></span></div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onBack}>🏠 Home</span>
                    <span style={s.navLink} onClick={()=>user?.id&&onOpenProfile(user.id)}>👤 {user?.username??"Profile"}</span>
                </div>
                <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
            </nav>

            <main style={s.main}>
                {/* Cabeçalho */}
                <div style={s.header}>
                    <img src={song.cover} alt={song.title} style={s.cover}/>
                    <div style={s.info}>
                        <p style={s.metaLabel}>🎵 Música</p>
                        <h1 style={s.title}>{song.title}</h1>
                        <p style={s.subtitle}>{song.artist} · {song.album}</p>
                        <div style={s.tags}>
                            <span style={s.tag}>⏱ {fmt(song.duration_ms)}</span>
                            <span style={s.tag}>📅 {song.release_date?.slice(0,4)}</span>
                            <span style={s.tag}>🎼 Faixa {song.track_number}</span>
                        </div>
                        <div style={{marginTop:12,display:"flex",alignItems:"center",gap:10}}>
                            {song.avg_rating ? (<><Stars r={song.avg_rating}/><span style={{fontWeight:700}}>{Number(song.avg_rating).toFixed(1)}</span><span style={{fontSize:13,color:"#888"}}>({song.total_reviews} avaliações)</span></>) : (<span style={{fontSize:13,color:"#888"}}>Ainda sem avaliações</span>)}
                        </div>
                        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
                            <a href={song.spotify_url} target="_blank" rel="noreferrer" style={s.spotifyBtn}>▶ Ouvir no Spotify</a>
                            {user && <button onClick={toggleFavorite} disabled={favLoading} style={{...s.actionBtn, background: isFav?"#ffeee4":"#f7f7f7", color: isFav?"#d44800":"#555", borderColor: isFav?"#d44800":"#ddd"}}>{favLoading?"…": isFav?"❤️ Favorito":"🤍 Favoritar"}</button>}
                            {user && <button onClick={openPlaylistModal} style={s.actionBtn}>📋 Adicionar à playlist</button>}
                        </div>
                    </div>
                </div>

                {/* Formulário de avaliação */}
                {user && (
                    <section style={s.section}>
                        <h2 style={s.sectionTitle}>Avaliar esta música</h2>
                        <form onSubmit={handleSubmitReview} style={s.form}>
                            <div style={{display:"flex",gap:4,marginBottom:10}}>
                                {[1,2,3,4,5].map(i=><span key={i} onClick={()=>setNote(i)} style={{fontSize:30,cursor:"pointer",color:i<=note?"#f59e0b":"#ddd"}}>★</span>)}
                            </div>
                            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Escreva sua review…" style={s.textarea} rows={3} maxLength={1000}/>
                            {submitMsg && <p style={{fontSize:13,color:submitMsg.includes("Erro")||submitMsg.includes("já")?"red":"green",margin:"4px 0"}}>{submitMsg}</p>}
                            <button type="submit" disabled={submitting} style={s.submitBtn}>{submitting?"Publicando…":"Publicar avaliação"}</button>
                        </form>
                    </section>
                )}

                {/* Lista de reviews com likes e comentários */}
                <section style={s.section}>
                    <h2 style={s.sectionTitle}>Avaliações {song.total_reviews>0&&`(${song.total_reviews})`}</h2>
                    {song.reviews.length===0 ? (
                        <div style={s.emptyBox}><p style={{color:"#888",margin:0}}>Seja o primeiro a avaliar!</p></div>
                    ) : (
                        <div style={s.reviewList}>
                            {song.reviews.map(r => (
                                <div key={r.id} style={s.reviewCard}>
                                    <div style={s.reviewHeader}>
                                        <span style={{fontWeight:700,fontSize:14,cursor:"pointer",color:"#111"}} onClick={()=>onOpenProfile(r.user_id)}>{r.username}</span>
                                        <Stars r={r.note}/>
                                        <span style={{fontSize:12,color:"#aaa",marginLeft:"auto"}}>{new Date(r.create_time).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    {r.text&&<p style={s.reviewText}>{r.text}</p>}
                                    <div style={{display:"flex",gap:16,marginTop:10}}>
                                        {user&&user.id!==r.user_id&&(
                                            <button style={s.miniBtn} onClick={()=>handleLike(r.id)}>
                                                👍 {likes[r.id]??""} Curtir
                                            </button>
                                        )}
                                        <button style={s.miniBtn} onClick={()=>toggleComments(r.id)}>
                                            💬 {openComments[r.id]?"Ocultar comentários":"Ver comentários"}
                                        </button>
                                    </div>
                                    {openComments[r.id]&&(
                                        <div style={s.commentsBox}>
                                            {(comments[r.id]??[]).map(c=>(
                                                <div key={c.id} style={s.commentRow}>
                                                    <span style={{fontWeight:700,fontSize:13}}>{c.username}: </span>
                                                    <span style={{fontSize:13,color:"#444"}}>{c.text}</span>
                                                </div>
                                            ))}
                                            {(comments[r.id]??[]).length===0&&<p style={{fontSize:13,color:"#aaa",margin:0}}>Nenhum comentário ainda.</p>}
                                            {user&&(
                                                <div style={{display:"flex",gap:8,marginTop:8}}>
                                                    <input value={commentText[r.id]??""} onChange={e=>setCommentText(p=>({...p,[r.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submitComment(r.id)} placeholder="Escreva um comentário…" style={s.commentInput}/>
                                                    <button onClick={()=>submitComment(r.id)} disabled={commentLoading[r.id]} style={s.commentBtn}>{commentLoading[r.id]?"…":"Enviar"}</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Modal de playlist */}
            {showPlaylistModal&&(
                <div style={s.overlay} onClick={()=>setShowPlaylistModal(false)}>
                    <div style={s.modalCard} onClick={e=>e.stopPropagation()}>
                        <div style={s.modalHeader}><span style={s.modalTitle}>Adicionar à playlist</span><button style={s.closeBtn} onClick={()=>setShowPlaylistModal(false)}>✕</button></div>
                        {playlistMsg&&<p style={{fontSize:13,color:playlistMsg.includes("Erro")?"red":"green",margin:"0 0 8px"}}>{playlistMsg}</p>}
                        {playlists.length>0&&(
                            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                                {playlists.map(pl=>(
                                    <div key={pl.id} style={{padding:"10px 14px",border:"1px solid #eee",borderRadius:8,cursor:"pointer",display:"flex",justifyContent:"space-between"}} onClick={()=>addToPlaylist(pl.id)} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                                        <span style={{fontSize:14,fontWeight:600}}>{pl.name}</span><span style={{color:"#aaa"}}>+</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p style={{fontSize:13,color:"#888",marginBottom:6}}>Criar nova playlist:</p>
                        <div style={{display:"flex",gap:8}}>
                            <input value={newPlaylistName} onChange={e=>setNewPlaylistName(e.target.value)} placeholder="Nome da playlist…" style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&createAndAdd()}/>
                            <button onClick={createAndAdd} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#d44800",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>Criar</button>
                        </div>
                    </div>
                </div>
            )}
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
    cover:{width:200,height:200,borderRadius:12,objectFit:"cover",flexShrink:0},
    info:{flex:1},
    metaLabel:{fontSize:12,color:"#aaa",textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"},
    title:{fontSize:32,fontWeight:800,color:"#111",margin:"0 0 4px"},
    subtitle:{fontSize:16,color:"#555",margin:"0 0 12px"},
    tags:{display:"flex",gap:8,flexWrap:"wrap"},
    tag:{background:"#f0f0f0",padding:"4px 10px",borderRadius:20,fontSize:13,color:"#555"},
    spotifyBtn:{display:"inline-block",background:"#1DB954",color:"#fff",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,textDecoration:"none"},
    actionBtn:{padding:"8px 14px",borderRadius:20,border:"1px solid #ddd",background:"#f7f7f7",cursor:"pointer",fontSize:13,fontWeight:600},
    section:{marginBottom:40},
    sectionTitle:{fontSize:20,fontWeight:800,color:"#111",marginBottom:16},
    form:{display:"flex",flexDirection:"column",gap:8,maxWidth:500},
    textarea:{padding:"10px 14px",borderRadius:8,border:"1px solid #ddd",fontSize:14,resize:"vertical",outline:"none",fontFamily:"Inter, sans-serif"},
    submitBtn:{background:"#d44800",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",alignSelf:"flex-start"},
    emptyBox:{border:"1.5px dashed #ddd",borderRadius:12,padding:32,textAlign:"center"},
    reviewList:{display:"flex",flexDirection:"column",gap:16},
    reviewCard:{border:"1px solid #eee",borderRadius:10,padding:"14px 18px"},
    reviewHeader:{display:"flex",alignItems:"center",gap:10,marginBottom:6},
    reviewText:{fontSize:14,color:"#444",margin:0,lineHeight:1.6},
    miniBtn:{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#888",padding:0},
    commentsBox:{marginTop:10,paddingTop:10,borderTop:"1px solid #f5f5f5"},
    commentRow:{marginBottom:6},
    commentInput:{flex:1,padding:"6px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13,outline:"none"},
    commentBtn:{padding:"6px 12px",borderRadius:6,border:"none",background:"#111",color:"#fff",fontSize:13,cursor:"pointer"},
    overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50},
    modalCard:{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:420,boxShadow:"0 8px 32px rgba(0,0,0,0.2)"},
    modalHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},
    modalTitle:{fontSize:18,fontWeight:800,color:"#111"},
    closeBtn:{border:"none",background:"transparent",fontSize:18,cursor:"pointer",color:"#888"},
};
