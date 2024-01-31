function signIn() {
    let oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    let form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);

    let params = {
        "client_id": "205521028530-f4qpo5kj5qbav5st1g9o32qcl4jcm3mv.apps.googleusercontent.com",
        "redirect_uri": "http://127.0.0.1:5500/pipeline.html",
        "response_type": "token",
        "scope": "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
        "include_granted_scopes": 'true',
        "state": "pass-through-value"
    };

    for (let p in params) {
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}

function getAccessTokenFromUrl() {
    // Récupérer le fragment de l'URL (partie après '#')
    const hash = window.location.hash.substr(1);

    // Transformer le fragment en un objet clé-valeur
    const params = hash.split('&').reduce((result, item) => {
        const parts = item.split('=');
        result[parts[0]] = decodeURIComponent(parts[1]);
        return result;
    }, {});

    // Récupérer le jeton d'accès depuis les paramètres
    return params['access_token'];
}

function fetchUserInfo(accessToken) {
    const admins = ['ogliugo@gmail.com'];
    fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + accessToken, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const userEmail = data.email;
            const userName = data.name;
            document.getElementById('user-info').innerText = 'Connecté en tant que : ' + userName;

            if (admins.includes(userEmail)) {
            } else {
                alert("Accès refusé. Vous n'êtes pas autorisé à accéder à cette page.");
                window.location.href = 'index.html';
            }
        })
        .catch(error => console.error('Erreur : ' + error));
}

document.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.hash) {
        const accessToken = getAccessTokenFromUrl();
        console.log('Access Token:', accessToken);
        fetchUserInfo(accessToken);
    }
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', function () {
        // Gérer la déconnexion
        // Par exemple, rediriger vers la page de connexion ou simplement retirer le jeton d'accès
        window.location.href = 'index.html'; // Rediriger vers la page de connexion
    });
});
