import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PlaylistDetails = ({ token }) => {
	const { id } = useParams();
	const [playlist, setPlaylist] = useState(null);
	const [tracks, setTracks] = useState([]);
	const [error, setError] = useState(null);
	const [trackUri, setTrackUri] = useState("");

	useEffect(() => {
		const fetchPlaylistDetails = async () => {
			try {
				const response = await axios.get(
					`https://api.spotify.com/v1/playlists/${id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setPlaylist(response.data);
				setTracks(response.data.tracks.items);
			} catch (error) {
				console.error("Error fetching playlist details:", error);
				setError("Error fetching playlist details");
			}
		};

		if (token) {
			fetchPlaylistDetails();
		}
	}, [token, id]);

	const handleAddTrackToPlaylist = async () => {
		if (!/^spotify:track:[\w\d]+$/.test(trackUri)) {
			setError("Invalid track URI");
			return;
		}

		try {
			await axios.post(
				`https://api.spotify.com/v1/playlists/${id}/tracks`,
				{
					uris: [trackUri],
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			const response = await axios.get(
				`https://api.spotify.com/v1/playlists/${id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setPlaylist(response.data);
			setTracks(response.data.tracks.items);
			setTrackUri("");
		} catch (error) {
			console.error("Error adding track to playlist:", error);
			setError("Error adding track to playlist");
		}
	};

	return (
		<div>
			{error && <p style={{ color: "red" }}>{error}</p>}
			{playlist ? (
				<div>
					<h2>{playlist.name}</h2>
					<p>{playlist.description}</p>
					<ul>
						{tracks.map((track) => (
							<li key={track.track.id}>
								{track.track.name} by{" "}
								{track.track.artists.map((artist) => artist.name).join(", ")}
							</li>
						))}
					</ul>
					<input
						type="text"
						placeholder="Track URI"
						value={trackUri}
						onChange={(e) => setTrackUri(e.target.value)}
					/>
					<button onClick={handleAddTrackToPlaylist}>Add Track</button>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default PlaylistDetails;
