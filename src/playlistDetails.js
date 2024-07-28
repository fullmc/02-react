import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PlaylistDetails = ({ token }) => {
	const { id } = useParams();
	const [playlist, setPlaylist] = useState(null);
	const [tracks, setTracks] = useState([]);
	const [error, setError] = useState(null);
	const [trackUrl, setTrackUrl] = useState("");

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
						placeholder="Track URL"
						value={trackUrl}
						onChange={(e) => setTrackUrl(e.target.value)}
					/>
					<button>Add Track</button>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default PlaylistDetails;
