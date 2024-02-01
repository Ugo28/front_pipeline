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

function showLogs(stage) {
    const logsModal = document.getElementById('logs-modal');
    const logsContent = document.getElementById('logs-content');
    const logModalTitle = document.getElementById('logModalTitle');
    let logTitle = '';

    switch (stage) {
        case 'clone':
            logTitle = 'Logs de l\'étape "Récupération du code"';
            break;
        case 'build':
            logTitle = 'Logs de l\'étape "Compilation & Tests"';
            break;
        case 'increment':
            logTitle = 'Logs de l\'étape "Increment"';
            break;
        case 'docker':
            logTitle = 'Logs de l\'étape "Création image Docker & Update"';
            break;
        case 'deploy':
            logTitle = 'Logs de l\'étape "Déploiement"';
            break;
    }

    logModalTitle.textContent = logTitle;

    // Vous devrez charger les logs appropriés ici depuis votre backend
    const logs = [
        "Log 1 de l'étape",
        "Log 2 de l'étape",
        "Log 3 de l'étape"
    ];

    logsContent.innerHTML = '';

    logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');
        logEntry.textContent = log;
        logsContent.appendChild(logEntry);
    });

    logsModal.style.display = 'block';
}

function closeLogsModal() {
    const logsModal = document.getElementById('logs-modal');
    logsModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', (event) => {
    var socket = io.connect('http://172.20.10.2:5000'); // Utilisez l'adresse de votre serveur

    socket.on('log_message', function (msg) {
        var logsElement = document.getElementById('logs');
        var newLogEntry = document.createElement('div');
        newLogEntry.classList.add('log-entry');
        newLogEntry.textContent = msg.data;
        logsElement.appendChild(newLogEntry);

        // Faire défiler automatiquement vers le bas pour afficher le dernier log
        logsElement.scrollTop = logsElement.scrollHeight;
    });

    socket.on('ci_stage', function (stageData) {
        // stageData devrait contenir les informations sur l'étape reçue du backend
        // Mettez à jour l'affichage en conséquence (par exemple, en modifiant le texte ou la classe CSS des étapes)
        console.log("Nouvelle étape de la pipeline reçue:", stageData);
    
        // Exemple : Mettre à jour le texte de l'étape
        var stageElement = document.getElementById(stageData.id); // Assurez-vous d'attribuer un ID unique à chaque étape dans le HTML
        if (stageElement) {
            stageElement.querySelector('.status').textContent = `Status: ${stageData.status}`;
    
            // Mettez à jour la classe CSS en fonction du statut
            if (stageData.status === "success") {
                stageElement.classList.remove('erreur'); // Supprimez la classe d'erreur
                stageElement.classList.add('termine'); // Ajoutez la classe de succès
            } else if (stageData.status === "error") {
                stageElement.classList.remove('termine'); // Supprimez la classe de succès
                stageElement.classList.add('erreur'); // Ajoutez la classe d'erreur
            }
        }
    });
    
    
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
