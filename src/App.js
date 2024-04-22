import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const CLIENT_ID = "7291bcb33e0b424a863a0947005b6a6c"
  const REDIRECT_URI = "https://spotifytestss.netlify.app"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([])
  const [topTracks, setTopTracks] = useState([]);
  const [topArtist, setTopArtist] = useState([]);

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      window.location.hash = ""
      window.localStorage.setItem("token", token)
      setToken(token)
    } else {
      setToken(token);
    }

  }, [])

  const searchArtists = async (e) => {
    e.preventDefault()
    try {

      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: searchKey,
          type: "artist",
          limit: 10
        }
      });

      const TopArtist = response.data.artists.items[0];
      setTopArtist(TopArtist)
      const TopArtistId = TopArtist.id;
      const TopArtistsTracks = await axios.get(`https://api.spotify.com/v1/artists/${TopArtistId}/top-tracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      setTopTracks(TopArtistsTracks.data.tracks)

      setArtists(response.data.artists.items)
    } catch (error) {
      console.error("Error searching artists:", error);
    }
  }

  const fetchArtistInfo = async (artistId) => {
    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            country: "KR",
          },
        }
      );
      setTopTracks(data.tracks);
    } catch (error) {
      console.error("Error fetching artist info:", error);
    }
  }



  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  return (
    <div className="App">
      <header className="header_container">
        <h2>Spotify React</h2>
        {token && (
          <form className="search_box" onSubmit={searchArtists}>
            <input
              type="text"
              className="search-input"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
          >
            Login
          </a>
        ) : (
          <button className="btn-logout" onClick={logout}>Logout</button>
        )}

      </header>
      <main className="main_container">
        {artists.length > 0 && (
          <>
            <div className="top-artist">
              <img className="topArtist_imgs" src={topArtist.images[0].url} alt={topArtist.name} />
              <p className="top-artist-name">{topArtist.name}</p>
              <p className='followers'>팔로워 수: {topArtist.followers.total}</p>
              <div className='top-artist-info'>
                {topArtist.genres.map(genre => (
                  <p key={genre} className='genre'>{genre}</p>
                ))}
              </div>
            </div>
            <div className="top-artist-tracks">
              <ul>
                {topTracks.map(track => (
                  <div className="top-artist-track">
                    <img className="track-image" src={track.album.images[0].url} alt={track.album.name} />
                    <p className="track-title">{track.name}</p>
                  </div>
                ))}
              </ul>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default App;