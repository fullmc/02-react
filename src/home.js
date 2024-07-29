import React, { useState } from "react";

const Home = ({ handleLogin, token, navigate }) => {
	return (
		<div>
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
		</div>
	);
};

export default Home;
