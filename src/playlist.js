import React, { useEffect, useState } from "react";
import axios from "axios";
import "./playlist.css";

const CreatePlaylist = ({ token }) => {
	const [userId, setUserId] = useState("");
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");
	const [error, setError] = useState(null);

	useEffect(() => {
		if (token) {
			axios
				.get("https://api.spotify.com/v1/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((response) => {
					setUserId(response.data.id);
				})
				.catch((error) => {
					console.error("Error fetching user ID:", error);
					setError("Error fetching user ID");
				});
		}
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
			setError("Error creating playlist");
		}
	};

	return (
		<div className="create-playlist">
			<h2>Create Playlist</h2>
			{error && <p style={{ color: "red" }}>{error}</p>}
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

export default CreatePlaylist;
