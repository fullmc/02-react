import "./App.css";

function App() {
	const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
	const redirectUrl = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
	const endpoint = process.env.REACT_APP_SPOTIFY_ENDPOINT;
	const responseType = "token";

	return (
		<div className="App">
			<h1>API Endpoint</h1>
			<a
				href={`${endpoint}?client_id=${clientSecret}&redirect_uri=${redirectUrl}&response_type=${responseType}`}>
				API endpoint
			</a>
		</div>
	);
}

export default App;
