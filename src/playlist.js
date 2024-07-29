import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./playlist.css";

const CreatePlaylist = ({ token }) => {
	const [userId, setUserId] = useState("");
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");
	const [error, setError] = useState(null);
	const [playlists, setPlaylists] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState({
		tracks: [],
		albums: [],
		artists: [],
	});
	const [selectedType, setSelectedType] = useState("all");
	const [selectedTrack, setSelectedTrack] = useState(null);
	const navigate = useNavigate();

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
			const newPlaylist = {
				...response.data,
				tracks: [],
			};
			setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);
			setPlaylistName("");
			setPlaylistDescription("");
			setError(null);
		} catch (error) {
			console.error("Error creating playlist:", error);
			setError("Error creating playlist");
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			setError("Search query cannot be empty.");
			return;
		}

		const types =
			selectedType === "all" ? ["track", "album", "artist"] : [selectedType];

		try {
			const responses = await Promise.all(
				types.map((type) =>
					axios.get(`https://api.spotify.com/v1/search`, {
						params: {
							q: searchQuery,
							type,
							limit: 10,
						},
						headers: {
							Authorization: `Bearer ${token}`,
						},
					})
				)
			);

			const results = {
				tracks:
					responses.find((r) => r.config.params.type === "track")?.data.tracks
						?.items || [],
				albums:
					responses.find((r) => r.config.params.type === "album")?.data.albums
						?.items || [],
				artists:
					responses.find((r) => r.config.params.type === "artist")?.data.artists
						?.items || [],
			};

			setSearchResults(results);
			setError(null);
		} catch (error) {
			console.error("Error performing search:", error);
			setError("Error performing search");
		}
	};
	const handleAddTrackToSpotifyPlaylist = async (playlistId, trackUri) => {
		try {
			await axios.post(
				`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
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
			setError(null);
		} catch (error) {
			console.error("Error adding track to Spotify playlist:", error);
			setError("Error adding track to Spotify playlist");
		}
	};

	const handleAddTrackToPlaylist = (playlistId, track) => {
		setPlaylists((prevPlaylists) =>
			prevPlaylists.map((playlist) =>
				playlist.id === playlistId
					? {
							...playlist,
							tracks: [...playlist.tracks, track],
					  }
					: playlist
			)
		);

		handleAddTrackToSpotifyPlaylist(playlistId, track.uri);
	};

	const handleRemoveTrackFromPlaylist = (playlistId, trackId) => {
		setPlaylists((prevPlaylists) =>
			prevPlaylists.map((playlist) =>
				playlist.id === playlistId
					? {
							...playlist,
							tracks: playlist.tracks.filter((track) => track.id !== trackId),
					  }
					: playlist
			)
		);
	};

	const filteredResults = () => {
		switch (selectedType) {
			case "track":
				return searchResults.tracks || [];
			case "album":
				return searchResults.albums || [];
			case "artist":
				return searchResults.artists || [];
			case "all":
			default:
				return {
					tracks: searchResults.tracks || [],
					albums: searchResults.albums || [],
					artists: searchResults.artists || [],
				};
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

			<h3>Created Playlists</h3>
			<ul>
				{playlists.map((playlist) => (
					<li key={playlist.id}>
						<strong>{playlist.name}</strong> - {playlist.description}
						<button onClick={() => navigate(`/playlists/${playlist.id}`)}>
							View Details
						</button>
					</li>
				))}
			</ul>
			<div>
				<p>Search</p>
				<input
					type="search"
					placeholder="Search for tracks, albums, artists..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<button onClick={handleSearch}>Search</button>
			</div>
			<div>
				<button onClick={() => setSelectedType("track")}>Tracks</button>
				<button onClick={() => setSelectedType("album")}>Albums</button>
				<button onClick={() => setSelectedType("artist")}>Artists</button>
				<button onClick={() => setSelectedType("all")}>All</button>
			</div>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<div>
				<h3>Search Results</h3>
				{(selectedType === "track" || selectedType === "all") && (
					<div>
						<h4>Tracks</h4>
						<ul>
							{(searchResults.tracks || []).map((track) => (
								<li key={track.id}>
									{track.name} by{" "}
									{track.artists.map((artist) => artist.name).join(", ")}
									<button onClick={() => setSelectedTrack(track)}>
										Select
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
				{(selectedType === "album" || selectedType === "all") && (
					<div>
						<h4>Albums</h4>
						<ul>
							{(searchResults.albums || []).map((album) => (
								<li key={album.id}>
									{album.name} by{" "}
									{album.artists.map((artist) => artist.name).join(", ")}
								</li>
							))}
						</ul>
					</div>
				)}
				{(selectedType === "artist" || selectedType === "all") && (
					<div>
						<h4>Artists</h4>
						<ul>
							{(searchResults.artists || []).map((artist) => (
								<li key={artist.id}>{artist.name}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			{selectedTrack && (
				<div>
					<h3>Selected Track</h3>
					<p>{selectedTrack.name}</p>
					<p>{selectedTrack.artists.map((artist) => artist.name).join(", ")}</p>
					<div>
						<h4>Add to Playlist</h4>
						{playlists.map((playlist) => (
							<button
								key={playlist.id}
								onClick={() =>
									handleAddTrackToPlaylist(playlist.id, selectedTrack)
								}>
								{playlist.name}
							</button>
						))}
					</div>
				</div>
			)}
			<div>
				{playlists.map((playlist) => (
					<div key={playlist.id}>
						<h4>{playlist.name}</h4>
						<ul>
							{Array.isArray(playlist.tracks) &&
								playlist.tracks.map((track) => (
									<li key={track.id}>
										{track.name} by{" "}
										{track.artists.map((artist) => artist.name).join(", ")}
										<button
											onClick={() =>
												handleRemoveTrackFromPlaylist(playlist.id, track.id)
											}>
											Remove
										</button>
									</li>
								))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};

export default CreatePlaylist;
