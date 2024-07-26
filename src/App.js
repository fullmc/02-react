import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";

const App = () => {
	const [token, setToken] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");

		if (code) {
			axios
				.post(
					"https://accounts.spotify.com/api/token",
					new URLSearchParams({
						grant_type: "client_credentials",
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
					window.history.pushState({}, null, "/"); // Remove code from URL
				})
				.catch((error) => console.error("Error fetching token:", error));
		}
	}, []);

	const handleLogin = () => {
		window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=playlist-modify-private playlist-modify-public`;
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
					element={<CreatePlaylist token={token} />}
				/>
			</Routes>
		</div>
	);
};

const CreatePlaylist = ({ token }) => {
	const [userId, setUserId] = useState("");
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");

	useEffect(() => {
		axios
			.get("https://api.spotify.com/v1/me", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setUserId(response.data.id);
			})
			.catch((error) => console.error("Error fetching user ID:", error));
	}, [token]);

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
