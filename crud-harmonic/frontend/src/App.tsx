import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import UsersPage from "./pages/UsersPage";
import SongPage from "./pages/SongPage";
import PlaylistPage from "./pages/PlaylistPage";
import ArtistPage from "./pages/ArtistPage";

type View = "home" | "profile" | "reviews" | "users" | "song" | "playlist" | "artist";

export default function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [view, setView] = useState<View>("home");
    const [profileUserId, setProfileUserId] = useState<number | null>(null);
    const [songId, setSongId] = useState<string | null>(null);
    const [artistId, setArtistId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("harmonic_token");
        setAuthenticated(!!token);
    }, []);

    function handleLogout() { setAuthenticated(false); setView("home"); }
    function openProfile(userId: number) { setProfileUserId(userId); setView("profile"); }
    function openSong(id: string) { setSongId(id); setView("song"); }
    function openArtist(id: string) { setArtistId(id); setView("artist"); }

    if (!authenticated) return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;

    if (view === "profile" && profileUserId != null)
        return <ProfilePage userId={profileUserId} onBack={() => setView("home")} onOpenReviews={() => setView("reviews")} onOpenProfile={openProfile} onLogout={handleLogout} />;

    if (view === "reviews")
        return <ReviewsPage onBack={() => setView("home")} onOpenProfile={openProfile} onLogout={handleLogout} />;

    if (view === "users")
        return <UsersPage onBack={() => setView("home")} onLogout={handleLogout} />;

    if (view === "song" && songId != null)
        return <SongPage songId={songId} onBack={() => setView("home")} onOpenProfile={openProfile} onLogout={handleLogout} />;

    if (view === "playlist")
        return <PlaylistPage onBack={() => setView("home")} onOpenSong={openSong} onLogout={handleLogout} />;

    if (view === "artist" && artistId != null)
        return <ArtistPage artistId={artistId} onBack={() => setView("home")} onOpenSong={openSong} onLogout={handleLogout} />;

    return (
        <HomePage
            onLogout={handleLogout}
            onOpenProfile={openProfile}
            onOpenReviews={() => setView("reviews")}
            onOpenUsers={() => setView("users")}
            onOpenSong={openSong}
            onOpenPlaylist={() => setView("playlist")}
            onOpenArtist={openArtist}
        />
    );
}
