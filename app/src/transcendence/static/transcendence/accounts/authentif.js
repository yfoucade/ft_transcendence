function handleLogin() {
	console.log("Authentification en cours..");
	const url = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ba2f40600381a654f7efe53fd4f0f7c810f01346021559142adfef5c9a162468&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fprofile&response_type=code"; //A METTRE DANS L'ENV
	const popup = window.open(url, '_blank', 'width=600,height=800');
}