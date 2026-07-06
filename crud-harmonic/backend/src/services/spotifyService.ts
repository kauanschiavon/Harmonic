import axios from 'axios'

const getToken = async () => {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  )
  return response.data.access_token
}

export const searchSpotify = async (query: string, type = 'artist,album,track') => {
  const token = await getToken()
  const response = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, type, limit: 10 },
  })
  return response.data
}

export const getArtist = async (spotifyId: string) => {
  const token = await getToken()
  const response = await axios.get(`https://api.spotify.com/v1/artists/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getTrack = async (spotifyId: string) => {
  const token = await getToken()
  const response = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getArtistAlbums = async (spotifyId: string, offset = 0) => {
  const token = await getToken()
  const response = await axios.get(`https://api.spotify.com/v1/artists/${spotifyId}/albums`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      include_groups: 'album,single',
      market: 'BR',
      limit: 10,
      offset,
    },
  })
  return response.data
}