import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
} from "react-router-dom";
import ManagePlaylist from "./playlist";
import PlaylistDetails from "./playlistDetails";
import Home from "./home";
import { ReactComponent as HomeIcon } from "./assets/home.svg";

const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "https://localhost:3000";
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
			<div className="home">
				<div className="test-home">
					<HomeIcon className="home-button" onClick={() => navigate(`/`)} />
					<p>Home</p>
				</div>
				<button className="btn-login" onClick={handleLogin}>
					Log in
				</button>
			</div>
			<Routes>
				<Route
					path="/"
					element={
						<Home handleLogin={handleLogin} token={token} navigate={navigate} />
					}
				/>
				<Route
					path="/create-playlist"
					element={<ManagePlaylist token={token} userId={userId} />}
				/>
				<Route
					path="/playlists/:id"
					element={<PlaylistDetails token={token} userId={userId} />}
				/>
			</Routes>
		</div>
	);
};

export default App;
