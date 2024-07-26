import axios from "axios";
import getToken from "./spotify";

const createPlaylist = async (userId, playlistName, playlistDescription) => {
	const token = await getToken();

	const data = {
		name: playlistName,
		description: playlistDescription,
		public: false,
	};

	try {
		const response = await axios.post(
			`https://api.spotify.com/v1/users/${userId}/playlists`,
			data,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log("Playlist created:", response.data);
		return response.data;
	} catch (error) {
		console.error("Error creating playlist:", error);
		throw error;
	}
};

export default createPlaylist;
