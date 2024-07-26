import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
} from "react-router-dom";

const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const RESPONSE_TYPE = "code";

const App = () => {
	const [token, setToken] = useState("");
	const [userId, setUserId] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");

		if (code) {
			axios
				.post(
					TOKEN_ENDPOINT,
					new URLSearchParams({
						grant_type: "authorization_code",
						code: code,
						redirect_uri: REDIRECT_URI,
						client_id: CLIENT_ID,
						client_secret: CLIENT_SECRET,
					}),
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					}
				)
				.then((response) => {
					setToken(response.data.access_token);
					return axios.get("https://api.spotify.com/v1/me", {
						headers: {
							Authorization: `Bearer ${response.data.access_token}`,
						},
					});
				})
				.then((response) => {
					setUserId(response.data.id);
					window.history.pushState({}, null, "/"); // Remove code from URL
				})
				.catch((error) => console.error("Error fetching token:", error));
		}
	}, []);

	const handleLogin = () => {
		const scope = "playlist-modify-private playlist-modify-public";
		const authURL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
		window.location = authURL;
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Spotify Playlist Creator</h1>
				{!token ? (
					<button onClick={handleLogin}>Login to Spotify</button>
				) : (
					<div>
						<p>Logged in!</p>
						<button onClick={() => navigate("/create-playlist")}>
							Create Playlist
						</button>
					</div>
				)}
			</header>
			<Routes>
				<Route
					path="/create-playlist"
					element={<CreatePlaylist token={token} userId={userId} />}
				/>
			</Routes>
		</div>
	);
};

const CreatePlaylist = ({ token, userId }) => {
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");

	const handleCreatePlaylist = async () => {
		try {
			const response = await axios.post(
				`https://api.spotify.com/v1/users/${userId}/playlists`,
				{
					name: playlistName,
					description: playlistDescription,
					public: false,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			console.log("Playlist created:", response.data);
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	return (
		<div>
			<h2>Create Playlist</h2>
			<input
				type="text"
				placeholder="Playlist Name"
				value={playlistName}
				onChange={(e) => setPlaylistName(e.target.value)}
			/>
			<input
				type="text"
				placeholder="Playlist Description"
				value={playlistDescription}
				onChange={(e) => setPlaylistDescription(e.target.value)}
			/>
			<button onClick={handleCreatePlaylist}>Create Playlist</button>
		</div>
	);
};

export default App;
