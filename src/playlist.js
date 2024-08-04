import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./playlist.css";
import { ReactComponent as CloseIcon } from "./assets/cross.svg";

const ManagePlaylist = ({ token }) => {
	const [userId, setUserId] = useState("");
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");
	const [error, setError] = useState(null);
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylists, setSelectedPlaylists] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState({
		tracks: [],
		albums: [],
		artists: [],
	});
	const [selectedType, setSelectedType] = useState("all");
	const [selectedTrack, setSelectedTrack] = useState(null);
	const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

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
			prevPlaylists.map((playlist) => {
				if (playlist.id === playlistId) {
					const trackExists = playlist.tracks.some((t) => t.id === track.id);
					if (trackExists) {
						setTimeout(
							() => setError("This track is already in the playlist"),
							200
						);
						return playlist;
					}
					return {
						...playlist,
						tracks: [...playlist.tracks, track],
					};
				}
				return playlist;
			})
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

	const handleSelectPlaylist = (playlistId) => {
		setSelectedPlaylists((prevSelected) => {
			if (prevSelected.includes(playlistId)) {
				return prevSelected.filter((id) => id !== playlistId);
			} else {
				return [...prevSelected, playlistId];
			}
		});
	};

	const handleDeleteSelectedPlaylists = async () => {
		try {
			await Promise.all(
				selectedPlaylists.map((playlistId) =>
					axios.delete(
						`https://api.spotify.com/v1/playlists/${playlistId}/followers`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					)
				)
			);
			setPlaylists((prevPlaylists) =>
				prevPlaylists.filter(
					(playlist) => !selectedPlaylists.includes(playlist.id)
				)
			);
			setSelectedPlaylists([]);
			setError(null);
		} catch (error) {
			console.error("Error deleting playlists:", error);
			setError("Error deleting playlists");
		}
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

	const exportPlaylistsAsJson = () => {
		const playlistsToExport =
			selectedPlaylists.length > 0
				? playlists.filter((playlist) =>
						selectedPlaylists.includes(playlist.id)
				  )
				: playlists;
		const json = JSON.stringify(playlistsToExport, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "playlists.json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const importPlaylistsFromJson = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const importedPlaylists = JSON.parse(e.target.result);

					for (const importedPlaylist of importedPlaylists) {
						// Creates a new playlist on Spotify
						const createPlaylistResponse = await axios.post(
							`https://api.spotify.com/v1/users/${userId}/playlists`,
							{
								name: importedPlaylist.name,
								description: importedPlaylist.description,
								public: false,
							},
							{
								headers: {
									Authorization: `Bearer ${token}`,
									"Content-Type": "application/json",
								},
							}
						);

						const newPlaylist = {
							...createPlaylistResponse.data,
							tracks: importedPlaylist.tracks,
						};

						// Add tracks to the new playlist
						if (importedPlaylist.tracks && importedPlaylist.tracks.length > 0) {
							const trackUris = importedPlaylist.tracks.map(
								(track) => track.uri
							);

							await axios.post(
								`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`,
								{
									uris: trackUris,
								},
								{
									headers: {
										Authorization: `Bearer ${token}`,
										"Content-Type": "application/json",
									},
								}
							);
						}

						// Updates the local state with the new playlist
						setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);
					}
					setError(null);
				} catch (error) {
					console.error("Error importing playlists:", error);
					setError("Error importing playlists: you may have to log in first");
				}
			};
			reader.readAsText(file);
		}
	};

	const handleImportButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="create-playlist">
			{error && <p style={{ color: "red" }}>{error}</p>}
			{/* searchbar */}
			<div className="search">
				<div className="searchbar">
					<input
						type="search"
						placeholder="Search for tracks, albums, artists..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<button onClick={handleSearch}>Search</button>
				</div>
				<div className="filters">
					<p>Filters</p>
					<button onClick={() => setSelectedType("track")}>Tracks</button>
					<button onClick={() => setSelectedType("album")}>Albums</button>
					<button onClick={() => setSelectedType("artist")}>Artists</button>
					<button onClick={() => setSelectedType("all")}>All</button>
				</div>
			</div>
			<div className="main">
				<button
					className="create"
					onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}>
					{showCreatePlaylist ? "Back" : "Create a Playlist"}
				</button>

				{showCreatePlaylist && (
					<>
						<div className="input-create">
							<input
								type="text"
								placeholder="Name"
								value={playlistName}
								onChange={(e) => setPlaylistName(e.target.value)}
							/>
							<input
								type="text"
								placeholder="Description"
								value={playlistDescription}
								onChange={(e) => setPlaylistDescription(e.target.value)}
							/>
							<button onClick={handleCreatePlaylist}>Create</button>
						</div>
					</>
				)}

				<div className="results-header">
					<h3>Playlists</h3>
					<div className="buttons-action">
						<button
							className="delete"
							onClick={handleDeleteSelectedPlaylists}
							disabled={selectedPlaylists.length === 0}>
							Delete Selected
						</button>
						<button
							className="btn-export"
							onClick={exportPlaylistsAsJson}
							disabled={selectedPlaylists.length === 0}>
							Export as JSON
						</button>
						<button onClick={handleImportButtonClick}>Import</button>
						<input
							type="file"
							accept="application/json"
							onChange={importPlaylistsFromJson}
							ref={fileInputRef}
							style={{ display: "none" }}
						/>
					</div>
				</div>

				<ul className="created-playlists">
					{playlists.map((playlist) => (
						<div key={playlist.id}>
							<div className="title">
								<input
									type="checkbox"
									checked={selectedPlaylists.includes(playlist.id)}
									onChange={() => handleSelectPlaylist(playlist.id)}
								/>
								<strong>{playlist.name}</strong> - {playlist.description}
								<button
									className="button-details"
									onClick={() => navigate(`/playlists/${playlist.id}`)}>
									View details
								</button>
							</div>
							<ul>
								{Array.isArray(playlist.tracks) &&
									playlist.tracks.map((track) => (
										<li className="playlist-tracks" key={track.id}>
											{track.name} -{" "}
											{track.artists.map((artist) => artist.name).join(", ")}
											<CloseIcon
												className="button-remove"
												onClick={() =>
													handleRemoveTrackFromPlaylist(playlist.id, track.id)
												}
											/>
										</li>
									))}
							</ul>
						</div>
					))}
				</ul>
			</div>

			{/* <h2>Search Results</h2> */}
			<div className="section">
				<div className="results">
					{(selectedType === "track" || selectedType === "all") && (
						<div>
							<h3>Tracks</h3>
							{(searchResults.tracks || []).map((track) => (
								<div className="track-list">
									<p key={track.id}>
										{track.name} -{" "}
										{track.artists.map((artist) => artist.name).join(", ")}
										<button
											className="select-button"
											onClick={() => setSelectedTrack(track)}>
											Select
										</button>
									</p>
								</div>
							))}
						</div>
					)}
					{(selectedType === "album" || selectedType === "all") && (
						<div>
							<h3>Albums</h3>
							{(searchResults.albums || []).map((album) => (
								<p key={album.id}>
									{album.name} -{" "}
									{album.artists.map((artist) => artist.name).join(", ")}
								</p>
							))}
						</div>
					)}
					{(selectedType === "artist" || selectedType === "all") && (
						<div>
							<h3>Artists</h3>
							{(searchResults.artists || []).map((artist) => (
								<p key={artist.id}>{artist.name}</p>
							))}
						</div>
					)}
				</div>
				<div>
					{selectedTrack && (
						<div>
							<h3>Selected Track</h3>
							<p>
								{selectedTrack.name} -{" "}
								{selectedTrack.artists.map((artist) => artist.name).join(", ")}
							</p>
							<div className="button-add">
								{playlists.length === 0 ? (
									<p>Please create or import a playlist first.</p>
								) : (
									playlists.map((playlist) => (
										<button
											key={playlist.id}
											onClick={() =>
												handleAddTrackToPlaylist(playlist.id, selectedTrack)
											}>
											{"Add to " + playlist.name}
										</button>
									))
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ManagePlaylist;
