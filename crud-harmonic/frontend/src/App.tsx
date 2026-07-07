import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import ListsPage from "./pages/ListsPage";
import UsersPage from "./pages/UsersPage";
import SongPage from "./pages/SongPage";
import AlbumPage from "./pages/AlbumPage";
import PlaylistPage from "./pages/PlaylistPage";

type Screen =
    | { view: "home" }
    | { view: "profile"; userId: number }
    | { view: "reviews" }
    | { view: "list" }
    | { view: "users" }
    | { view: "song"; songId: string }
    | { view: "album"; albumId: string }
    | { view: "playlist"; playlistId: number };

const HOME_SCREEN: Screen = { view: "home" };

export default function App() {
    const [authenticated, setAuthenticated] = useState(false);
    // Pilha de navegação: o último item é a tela atual, os anteriores são o "histórico".
    const [history, setHistory] = useState<Screen[]>([HOME_SCREEN]);

    useEffect(() => {
        const token = localStorage.getItem("harmonic_token");
        setAuthenticated(!!token);
    }, []);

    const current = history[history.length - 1];

    // Abre uma nova tela por cima da atual (empilha).
    function navigate(screen: Screen) {
        setHistory((prev) => [...prev, screen]);
    }

    // Volta para a tela anterior de verdade (desempilha). Se não houver histórico, fica no Home.
    function goBack() {
        setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }

    // Vai direto para o Home e reinicia o histórico (usado pelo link "🏠 Home" do menu).
    function goHome() {
        setHistory([HOME_SCREEN]);
    }

    function handleLogout() {
        setAuthenticated(false);
        setHistory([HOME_SCREEN]);
    }

    function openProfile(userId: number) {
        navigate({ view: "profile", userId });
    }

    function openSong(songId: string) {
        navigate({ view: "song", songId });
    }

    function openAlbum(albumId: string) {
        navigate({ view: "album", albumId });
    }

    function openPlaylist(playlistId: number) {
        navigate({ view: "playlist", playlistId });
    }

    function openReviews() {
        navigate({ view: "reviews" });
    }

    function openLists() {
        navigate({ view: "list" });
    }

    function openUsers() {
        navigate({ view: "users" });
    }

    if (!authenticated) {
        return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;
    }

    if (current.view === "profile") {
        return (
            <ProfilePage
                userId={current.userId}
                onBack={goBack}
                onGoHome={goHome}
                onOpenReviews={openReviews}
                onOpenLists={openLists}
                onOpenProfile={openProfile}
                onOpenSong={openSong}
                onOpenPlaylist={openPlaylist}
                onLogout={handleLogout}
            />
        );
    }

    if (current.view === "reviews") {
        return (
            <ReviewsPage
                onBack={goBack}
                onGoHome={goHome}
                onOpenLists={openLists}
                onOpenProfile={openProfile}
                onOpenPlaylist={openPlaylist}  
                onLogout={handleLogout}
            />
        );
    }
    if (current.view === "list") {
        return (
            <ListsPage
                onBack={goBack}
                onGoHome={goHome}
                onOpenReviews={openReviews}
                onOpenProfile={openProfile}
                onOpenSong={openSong}
                onOpenPlaylist={openPlaylist}
                onLogout={handleLogout}
            />
        );
    }

    if (current.view === "users") {
        return (
            <UsersPage
                onBack={goBack}
                onGoHome={goHome}
                onLogout={handleLogout}
            />
        );
    }

    if (current.view === "song") {
        return (
            <SongPage
                songId={current.songId}
                onBack={goBack}
                onGoHome={goHome}
                onOpenProfile={openProfile}
                onOpenPlaylist={openPlaylist}
                onLogout={handleLogout}
            />
        );
    }

    if (current.view === "album") {
        return (
            <AlbumPage
                albumId={current.albumId}
                onBack={goBack}
                onGoHome={goHome}
                onOpenSong={openSong}
                onOpenProfile={openProfile}
                onOpenPlaylist={openPlaylist}
                onLogout={handleLogout}
            />
        );
    }

    if (current.view === "playlist") {
        return (
            <PlaylistPage
                playlistId={current.playlistId}
                onBack={goBack}
                onGoHome={goHome}
                onOpenReviews={openReviews}
                onOpenLists={openLists}
                onOpenProfile={openProfile}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <HomePage
            onLogout={handleLogout}
            onOpenProfile={openProfile}
            onOpenReviews={openReviews}
            onOpenLists={openLists}
            onOpenUsers={openUsers}
            onOpenSong={openSong}
            onOpenAlbum={openAlbum}
            onOpenPlaylist={openPlaylist}
        />
    );
}
