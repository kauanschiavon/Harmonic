-- ============================================================
-- Harmonic — Schema real do banco (conforme confirmado em produção)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    bio TEXT,
    role VARCHAR(10) DEFAULT 'user',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genre (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS artist (
    artist_id VARCHAR(50) PRIMARY KEY,  -- ID do Spotify, usado como chave
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS album (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    spotify_id VARCHAR(50),
    cover_url VARCHAR(255),
    release_date DATE,
    artist_id VARCHAR(50) NOT NULL REFERENCES artist(artist_id)
);

CREATE TABLE IF NOT EXISTS music (
    music_id VARCHAR(50) PRIMARY KEY,  -- ID do Spotify, usado como chave
    title VARCHAR(255) NOT NULL,
    duration_ms INTEGER,
    release_date DATE,
    album_id INTEGER REFERENCES album(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    music_id VARCHAR(50) REFERENCES music(music_id),
    artist_id VARCHAR(50) NOT NULL REFERENCES artist(artist_id),
    note DECIMAL(3,1),
    text TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    text TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    public BOOLEAN DEFAULT TRUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followers (
    followers_id INTEGER NOT NULL REFERENCES users(id),
    following_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (followers_id, following_id)
);

CREATE TABLE IF NOT EXISTS playlist_music (
    playlist_id INTEGER NOT NULL REFERENCES playlist(id),
    music_id INTEGER NOT NULL REFERENCES music(id),
    position INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, music_id)
);

CREATE TABLE IF NOT EXISTS music_artists (
    music_id INTEGER NOT NULL REFERENCES music(id),
    artist_id INTEGER NOT NULL REFERENCES artist(id),
    PRIMARY KEY (music_id, artist_id)
);

CREATE TABLE IF NOT EXISTS music_genres (
    music_id INTEGER NOT NULL REFERENCES music(id),
    genre_id INTEGER NOT NULL REFERENCES genre(id),
    PRIMARY KEY (music_id, genre_id)
);

CREATE TABLE IF NOT EXISTS artist_genre (
    artist_id INTEGER NOT NULL REFERENCES artist(id),
    genre_id INTEGER NOT NULL REFERENCES genre(id),
    PRIMARY KEY (artist_id, genre_id)
);

CREATE TABLE IF NOT EXISTS review_likes (
    user_id INTEGER NOT NULL REFERENCES users(id),
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    PRIMARY KEY (user_id, review_id)
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id),
    music_id INTEGER NOT NULL REFERENCES music(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, music_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    entity VARCHAR(100),
    entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usado pelo fluxo de "esqueci minha senha" (AuthService.forgotPassword/resetPassword).
-- Se essa funcionalidade der erro, confirme se esta tabela existe no seu banco.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
