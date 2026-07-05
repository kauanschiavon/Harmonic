-- ============================================================
-- Harmonic — Migration completa
-- Execute UMA VEZ no painel do Neon ou via psql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(30)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    photo_url   TEXT,
    bio         TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Playlists pertencem a um usuário
CREATE TABLE IF NOT EXISTS playlists (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url   TEXT,
    is_public   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Álbuns do Spotify referenciados numa playlist
-- Não salvamos dados do álbum aqui — buscamos do Spotify pelo spotify_album_id
CREATE TABLE IF NOT EXISTS playlist_albums (
    id               SERIAL PRIMARY KEY,
    playlist_id      INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    spotify_album_id VARCHAR(100) NOT NULL,
    added_at         TIMESTAMP DEFAULT NOW(),
    UNIQUE(playlist_id, spotify_album_id)  -- evita duplicatas
);
