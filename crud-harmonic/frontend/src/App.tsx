import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import SongPage from "./pages/SongPage";

type View = "home" | "profile" | "reviews" | "song";

export default function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [view, setView] = useState<View>("home");
    const [profileUserId, setProfileUserId] = useState<number | null>(null);
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("harmonic_token");
        setAuthenticated(!!token);
    }, []);

    function handleLogout() {
        setAuthenticated(false);
        setView("home");
    }

    function openProfile(userId: number) {
        setProfileUserId(userId);
        setView("profile");
    }

    function openSong(songId: string) {
        setCurrentSongId(songId);
        setView("song");
    }

    if (!authenticated) {
        return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;
    }

    if (view === "profile" && profileUserId != null) {
        return (
            <ProfilePage
                userId={profileUserId}
                onBack={() => setView("home")}
                onOpenReviews={() => setView("reviews")}
                onOpenProfile={openProfile}
                onLogout={handleLogout}
            />
        );
    }

    if (view === "reviews") {
        return (
            <ReviewsPage
                onBack={() => setView("home")}
                onOpenProfile={openProfile}
                onLogout={handleLogout}
            />
        );
    }

    if (view === "song" && currentSongId != null) {
        return (
            <SongPage
                songId={currentSongId}
                onBack={() => setView("home")}
                onOpenProfile={openProfile}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <HomePage
            onLogout={handleLogout}
            onOpenProfile={openProfile}
            onOpenReviews={() => setView("reviews")}
            onOpenSong={openSong}
        />
    );
}
