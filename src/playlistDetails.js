import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PlaylistDetails = ({ token }) => {
	const { id } = useParams();
	const [playlist, setPlaylist] = useState(null);
	const [tracks, setTracks] = useState([]);
	const [error, setError] = useState(null);
	const [trackUri, setTrackUri] = useState("");
	const [newPlaylistName, setNewPlaylistName] = useState("");
	const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
	const [isEditingName, setIsEditingName] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);

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
				setNewPlaylistName(response.data.name);
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
		if (!/^spotify:(track|episode):[\w\d]+$/.test(trackUri)) {
			setError("Invalid track URI");
			return;
		}

		if (tracks.some((track) => track.track.uri === trackUri)) {
			setError("Track already exists in the playlist");
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
			setError(null);
		} catch (error) {
			console.error("Error adding track to playlist:", error);
			setError("Error adding track to playlist");
		}
	};

	const handleDeleteTrackFromPlaylist = async (trackUri) => {
		try {
			await axios.delete(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
				data: {
					tracks: [{ uri: trackUri }],
				},
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

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
			setError(null);
		} catch (error) {
			console.error("Error deleting track from playlist:", error);
			setError("Error deleting track from playlist");
		}
	};

	const handleUpdatePlaylistName = async () => {
		try {
			await axios.put(
				`https://api.spotify.com/v1/playlists/${id}`,
				{
					name: newPlaylistName,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			setPlaylist((prevPlaylist) => ({
				...prevPlaylist,
				name: newPlaylistName,
			}));
			setIsEditingName(false);
			setError(null);
		} catch (error) {
			console.error("Error updating playlist name:", error);
			setError("Error updating playlist name");
		}
	};

	const handleUpdatePlaylistDescription = async () => {
		try {
			await axios.put(
				`https://api.spotify.com/v1/playlists/${id}`,
				{
					description: newPlaylistDescription,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			setPlaylist((prevPlaylist) => ({
				...prevPlaylist,
				description: newPlaylistDescription,
			}));
			setIsEditingDescription(false);
			setError(null);
		} catch (error) {
			console.error("Error updating playlist description:", error);
			setError("Error updating playlist description");
		}
	};

	const handleOrderTrack = async (startIndex, direction) => {
		let endIndex;
		if (direction === "up") {
			endIndex = startIndex - 1;
		} else if (direction === "down") {
			endIndex = startIndex + 2;
		}

		if (endIndex < 0 || endIndex > tracks.length) {
			setError("Invalid track position");
			return;
		}

		try {
			await axios.put(
				`https://api.spotify.com/v1/playlists/${id}/tracks`,
				{
					range_start: startIndex,
					insert_before: endIndex,
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
			setError(null);
		} catch (error) {
			console.error("Error reordering track in playlist:", error);
			setError("Error reordering track in playlist");
		}
	};

	return (
		<div>
			{error && <p style={{ color: "red" }}>{error}</p>}
			{playlist ? (
				<div>
					<h2>{playlist.name}</h2>
					{isEditingName ? (
						<div>
							<input
								type="text"
								value={newPlaylistName}
								onChange={(e) => setNewPlaylistName(e.target.value)}
								placeholder="New Playlist Name"
							/>
							<button onClick={handleUpdatePlaylistName}>Save</button>
						</div>
					) : (
						<button onClick={() => setIsEditingName(true)}>Update Name</button>
					)}
					<p>{playlist.description}</p>
					{isEditingDescription ? (
						<div>
							<input
								type="text"
								value={newPlaylistDescription}
								onChange={(e) => setNewPlaylistDescription(e.target.value)}
								placeholder="New Playlist Description"
							/>
							<button onClick={handleUpdatePlaylistDescription}>Save</button>
						</div>
					) : (
						<button onClick={() => setIsEditingDescription(true)}>
							Update Description
						</button>
					)}
					<ul>
						{tracks.map((track, index) => (
							<li key={track.track.id}>
								{track.track.name} by{" "}
								{track.track.artists.map((artist) => artist.name).join(", ")}
								<button
									onClick={() =>
										handleDeleteTrackFromPlaylist(track.track.uri)
									}>
									Delete
								</button>
								<button
									onClick={() => handleOrderTrack(index, "up")}
									disabled={index === 0}>
									Up
								</button>
								<button
									onClick={() => handleOrderTrack(index, "down")}
									disabled={index === tracks.length - 1}>
									Down
								</button>
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
