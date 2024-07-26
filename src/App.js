import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import axios from "axios";

const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";

const App = () => {
	const [token, setToken] = useState("");

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
					</div>
				)}
			</header>
		</div>
	);
};
export default App;
