import React, { useState } from "react";
import "./home.css";

const Home = ({ handleLogin, token, navigate }) => {
	return (
		<div>
			<header className="App-header">
				<h1>Spotify Playlist Manager</h1>
				{!token ? (
					<div>{""}</div>
				) : (
					<div>
						<p>Logged in!</p>
						<button onClick={() => navigate("/create-playlist")}>
							Create Playlist
						</button>
					</div>
				)}
			</header>
		</div>
	);
};

export default Home;
