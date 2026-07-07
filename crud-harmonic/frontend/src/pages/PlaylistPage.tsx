import { useEffect, useState } from "react";
import { playlistService, type Playlist, type PlaylistWithMusics } from "../services/playlistService";

export default function PlaylistPage({ onBack, onOpenSong, onLogout }: {
    onBack: ()=>void; onOpenSong:(id:string)=>void; onLogout:()=>void;
}) {
    const user = JSON.parse(localStorage.getItem("harmonic_user") ?? "null");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PlaylistWithMusics | null>(null);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => { if (user?.id) load(); }, []);

    async function load() {
        setLoading(true);
        try { const data = await playlistService.findByUser(user.id); setPlaylists(data); }
        catch { /* vazia */ }
        finally { setLoading(false); }
    }

    async function openPlaylist(id: number) {
        try { const data = await playlistService.findById(id); setSelected(data); }
        catch { alert("Não foi possível carregar a playlist."); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true); setMsg("");
        try {
            await playlistService.create({ user_id: user.id, name: name.trim(), description: desc.trim() || undefined, public: isPublic });
            setName(""); setDesc(""); setCreating(false); setMsg("Playlist criada!");
            await load();
        } catch (err: any) { setMsg(err.response?.data?.message ?? "Erro ao criar."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: number) {
        if (!confirm("Excluir esta playlist?")) return;
        try { await playlistService.delete(id, user.id); await load(); if (selected?.id === id) setSelected(null); }
        catch { alert("Erro ao excluir."); }
    }

    async function removeMusic(musicId: string) {
        if (!selected) return;
        try { await playlistService.removeMusic(selected.id, musicId); openPlaylist(selected.id); }
        catch { alert("Erro ao remover música."); }
    }

    function fmt(ms?: number) { if (!ms) return "—"; const s=Math.floor(ms/1000); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
    function handleLogout() { localStorage.removeItem("harmonic_token"); localStorage.removeItem("harmonic_user"); onLogout(); }

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <div style={s.logoRow}><span style={{fontSize:22}}>♪</span><span style={{fontSize:20,fontWeight:800,color:"#111"}}>Harm<span style={{color:"#d44800"}}>onic</span></span></div>
                <div style={s.navLinks}>
                    <span style={s.navLink} onClick={onBack}>🏠 Home</span>
                    <span style={s.navLinkActive}>📋 Minhas Playlists</span>
                </div>
                <button onClick={handleLogout} style={s.logoutBtn} title="Sair">↪</button>
            </nav>

            <main style={s.main}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                    <h2 style={s.sectionTitle}>Minhas Playlists</h2>
                    <button style={s.createBtn} onClick={()=>setCreating(true)}>+ Nova playlist</button>
                </div>

                {msg && <p style={{color:"#1a8a4a",fontWeight:600,marginBottom:12}}>{msg}</p>}

                {loading && <p style={{color:"#888"}}>Carregando…</p>}

                {!loading && playlists.length === 0 && !creating && (
                    <div style={s.emptyBox}>
                        <p style={{color:"#888",margin:0}}>Você ainda não tem playlists.</p>
                        <p style={{color:"#aaa",fontSize:13,marginTop:4}}>Crie uma ou adicione músicas ao ouvir uma música!</p>
                        <button style={{...s.createBtn,marginTop:12}} onClick={()=>setCreating(true)}>Criar primeira playlist</button>
                    </div>
                )}

                {/* Formulário criar */}
                {creating && (
                    <div style={{border:"1px solid #eee",borderRadius:12,padding:20,marginBottom:24}}>
                        <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>Nova Playlist</h3>
                        <form onSubmit={handleCreate} style={{display:"flex",flexDirection:"column",gap:10}}>
                            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da playlist *" required style={s.input}/>
                            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2} style={{...s.input,resize:"vertical"}}/>
                            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:14,cursor:"pointer"}}>
                                <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)}/>
                                Playlist pública
                            </label>
                            <div style={{display:"flex",gap:8}}>
                                <button type="submit" disabled={saving} style={s.submitBtn}>{saving?"Criando…":"Criar"}</button>
                                <button type="button" style={s.cancelBtn} onClick={()=>{setCreating(false);setMsg("");}}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de playlists */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,marginBottom:32}}>
                    {playlists.map(pl => (
                        <div key={pl.id} style={s.plCard}>
                            <div style={s.plIcon}>🎵</div>
                            <div style={{flex:1,minWidth:0}}>
                                <p style={{fontWeight:700,fontSize:14,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.name}</p>
                                {pl.description&&<p style={{fontSize:12,color:"#888",margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.description}</p>}
                                <p style={{fontSize:11,color:"#bbb",margin:"4px 0 0"}}>{pl.public?"Pública":"Privada"}</p>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                <button style={s.miniBtn} onClick={()=>openPlaylist(pl.id)}>Ver</button>
                                <button style={{...s.miniBtn,color:"#c0392b",borderColor:"#f5c6c6"}} onClick={()=>handleDelete(pl.id)}>Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detalhe da playlist selecionada */}
                {selected && (
                    <div style={{border:"1px solid #eee",borderRadius:12,padding:20}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                            <h3 style={{margin:0,fontSize:18,fontWeight:800}}>{selected.name}</h3>
                            <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#888"}} onClick={()=>setSelected(null)}>✕</button>
                        </div>
                        {selected.description&&<p style={{fontSize:14,color:"#666",marginBottom:16}}>{selected.description}</p>}
                        {selected.musics.length===0 ? (
                            <p style={{color:"#aaa",fontSize:14}}>Nenhuma música adicionada ainda.</p>
                        ) : (
                            <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                {selected.musics.map((m,i)=>(
                                    <div key={m.music_id} style={s.musicRow}>
                                        <span style={{color:"#bbb",fontSize:13,width:24}}>{i+1}</span>
                                        <span style={{flex:1,fontWeight:600,fontSize:14,cursor:"pointer"}} onClick={()=>onOpenSong(m.music_id)}>{m.title}</span>
                                        <span style={{fontSize:13,color:"#888"}}>{fmt(m.duration_ms)}</span>
                                        <button style={{background:"none",border:"none",cursor:"pointer",color:"#c0392b",fontSize:12}} onClick={()=>removeMusic(m.music_id)}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        )}
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
    navLinks:{display:"flex",gap:24,flex:1,justifyContent:"center"},
    navLink:{color:"#555",fontSize:14,cursor:"pointer"},
    navLinkActive:{color:"#111",fontSize:14,fontWeight:700,background:"#f0f0f0",padding:"6px 12px",borderRadius:8},
    logoutBtn:{border:"1px solid #ddd",background:"#fff",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14},
    main:{padding:"32px 32px 64px",maxWidth:900,margin:"0 auto"},
    sectionTitle:{fontSize:24,fontWeight:800,color:"#111",margin:0},
    createBtn:{background:"#d44800",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:14,cursor:"pointer"},
    cancelBtn:{background:"#f7f7f7",color:"#333",border:"1px solid #ddd",borderRadius:8,padding:"9px 18px",fontSize:14,cursor:"pointer"},
    submitBtn:{background:"#111",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontWeight:700,fontSize:14,cursor:"pointer"},
    input:{padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,outline:"none",fontFamily:"inherit"},
    emptyBox:{border:"1.5px dashed #ddd",borderRadius:12,padding:32,textAlign:"center"},
    plCard:{display:"flex",alignItems:"center",gap:12,border:"1px solid #eee",borderRadius:10,padding:"12px 16px"},
    plIcon:{width:44,height:44,background:"#f0f0f0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
    miniBtn:{border:"1px solid #ddd",background:"#fff",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#333"},
    musicRow:{display:"flex",alignItems:"center",gap:12,padding:"8px 4px",borderBottom:"1px solid #f5f5f5"},
};
