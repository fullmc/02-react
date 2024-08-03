import axios from "axios";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "https://localhost:3000";

const getToken = async (code) => {
	try {
		const response = await axios.post(
			"https://accounts.spotify.com/api/token",
			new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: REDIRECT_URI,
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
			}),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error("Error fetching token:", error);
		throw error;
	}
};

export default getToken;
