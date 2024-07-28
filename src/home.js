import React, { useState } from "react";
import axios from "axios";

const Home = ({ handleLogin, token, navigate }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState({
		tracks: [],
		albums: [],
		artists: [],
	});
	const [error, setError] = useState(null);
	const [selectedType, setSelectedType] = useState("all");

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
					</div>
				)}
			</header>
		</div>
	);
};

export default Home;
