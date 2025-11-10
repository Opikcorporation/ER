const chatModal = document.getElementById('chat-modal');
const chatBody = document.getElementById('chat-conversation-area');
const chatInputArea = document.getElementById('chat-input-area');
const hiddenForm = document.getElementById('conversational-form');

let currentQuestionIndex = 0;
let isTyping = false; // Empêche les doubles clics

// --- BASE DE DONNÉES DES QUESTIONS ---
const questions = [
    {
        text: "Hello ! 👋<br>Pour commencer, ça fait combien de temps que tu exerces ton activité ?",
        name: "activite_temps",
        type: "radio",
        options: [
            { text: "-1 an", value: "-1 an" },
            { text: "1 an à 2 ans", value: "1-2 ans" },
            { text: "+2 ans", value: "+2 ans" }
        ]
    },
    {
        text: "Super ! C'est quoi ton compte Instagram ? J'aimerais bien jeter un œil à ce que tu fais.",
        name: "instagram",
        type: "text",
        placeholder: "@toncompte",
        validation: "required"
    },
    {
        text: "D'accord. Et est-ce que tu as déjà eu l'occasion de former d'autres personnes ?",
        name: "deja_forme",
        type: "radio",
        options: [
            { text: "Oui", value: "Oui" },
            { text: "Non", value: "Non" }
        ]
    },
    {
        text: "Intéressant ! Justement, quel type de formation est-ce que tu aimerais créer ? (Prothésiste ongulaire, Cils, ...)",
        name: "formation_type",
        type: "text",
        placeholder: "Ex: Prothésiste ongulaire...",
        validation: "required"
    },
    {
        text: "C'est un super projet. Pour que ça marche, il faut être prête à s'investir. Tu es prête à y mettre du temps et de l'énergie ?",
        name: "investir_temps",
        type: "radio",
        options: [
            { text: "Oui", value: "Oui" },
            { text: "Non", value: "Non" }
        ]
    },
    {
        text: "On y est presque ! C'est quoi ton nom et prénom ?",
        name: "full_name",
        type: "text",
        placeholder: "Ex: Esther Rizzo",
        validation: "required"
    },
    {
        text: "Parfait. Laisse-moi ton numéro de téléphone pour que l'équipe puisse te contacter.",
        name: "phone",
        type: "tel",
        placeholder: "06 12 34 56 78",
        validation: "phone"
    },
    {
        text: "Et ton adresse e-mail ? (pour être sûre que tu reçoives bien tout).",
        name: "email",
        type: "email",
        placeholder: "esther@exemple.com",
        validation: "email"
    },
    {
        text: "Dernière question, et c'est important pour être transparente : quel budget es-tu prête à investir pour ton succès ?",
        name: "budget",
        type: "radio",
        options: [
            { text: "3500€ à 4500€", value: "3500-4500" },
            { text: "4500€ à 5500€", value: "4500-5500" },
            { text: "5500€ à 6500€", value: "5500-6500" }
        ]
    },
    {
        // C'est l'avant-dernière étape, qui déclenche la soumission
        text: "Merci pour toutes tes réponses ! 🙏<br>Ton formulaire est complet, l'équipe va l'étudier...",
        type: "final"
    }
];

// --- GESTION DU POP-UP (Ouvrir/Fermer) ---
document.addEventListener('DOMContentLoaded', () => {
    const openButton = document.getElementById('open-modal-btn');
    const closeButton = document.querySelector('.chat-close-btn');

    openButton.addEventListener('click', () => {
        chatModal.style.display = 'flex';
        document.body.classList.add('modal-open'); // <-- MODIFICATION : Bloque le scroll
        startChat();
    });

    closeButton.addEventListener('click', () => {
        chatModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // <-- MODIFICATION : Réactive le scroll
        resetChat(); // Réinitialise le chat si on ferme
    });
});

// --- MOTEUR DE CHAT ---

function startChat() {
    currentQuestionIndex = 0;
    chatBody.innerHTML = ''; // Vide la conversation précédente
    chatInputArea.innerHTML = ''; // Vide les inputs précédents
    hiddenForm.innerHTML = ''; // Vide les données précédentes
    isTyping = false;
    
    askQuestion(currentQuestionIndex);
}

function resetChat() {
    startChat();
}

// Fait défiler le chat vers le bas
function scrollToBottom() {
    // Ajoute un léger délai pour que le DOM se mette à jour
    setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
}

// Affiche la question de Sophie
function askQuestion(index) {
    if (isTyping || index >= questions.length) return;
    isTyping = true;
    
    const question = questions[index];
    
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message');
    // MISE À JOUR ICI
    messageBubble.innerHTML = `
        <img src="image_1.jpg" alt="Esther Rizzo" class="avatar">
        <div class="bubble">${question.text}</div>
    `;
    chatBody.appendChild(messageBubble);
    scrollToBottom();
    
    chatInputArea.innerHTML = ''; // Vide l'input précédent
    
    if (question.type === "radio") {
        const radioGroup = document.createElement('div');
        radioGroup.classList.add('chat-radio-group');
        question.options.forEach(option => {
            radioGroup.innerHTML += `
                <button type="button" data-value="${option.value}">${option.text}</button>
            `;
        });
        chatInputArea.appendChild(radioGroup);
        
        chatInputArea.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => handleAnswer(button.dataset.value, button.textContent));
        });
        
    } else if (question.type === "text" || question.type === "tel" || question.type === "email") {
        chatInputArea.innerHTML = `
            <div class="text-answer-group">
                <input type="${question.type}" id="chat-text-input" class="chat-input" placeholder="${question.placeholder}" />
                <button type="button" class="text-send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="error-message"></div>
        `;
        
        chatInputArea.querySelector('.text-send-btn').addEventListener('click', () => {
            const inputField = document.getElementById('chat-text-input');
            handleAnswer(inputField.value, inputField.value);
        });
        chatInputArea.querySelector('.chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const inputField = document.getElementById('chat-text-input');
                handleAnswer(inputField.value, inputField.value);
            }
        });
        
    } else if (question.type === "final") {
        // C'est la fin, on lance la séquence de soumission
        chatInputArea.innerHTML = '';
        submitForm();
    }
    
    isTyping = false;
    scrollToBottom();
}

// Gère la réponse de l'utilisateur
function handleAnswer(value, textToShow) {
    if (isTyping) return;
    
    const question = questions[currentQuestionIndex];
    
    const errorDiv = chatInputArea.querySelector('.error-message');
    if (errorDiv) errorDiv.style.display = 'none';

    if (question.validation) {
        if (value.trim() === '') {
            showError("Ce champ est requis.");
            return;
        }
        if (question.validation === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError("Veuillez entrer une adresse e-mail valide.");
            return;
        }
        if (question.validation === 'phone' && !/^[0-9\s+()-]{8,}$/.test(value)) {
            showError("Veuillez entrer un numéro de téléphone valide.");
            return;
        }
    }
    
    isTyping = true;
    
    chatInputArea.innerHTML = '';
    
    const userBubble = document.createElement('div');
    userBubble.classList.add('message', 'user');
    userBubble.innerHTML = `<div class="bubble">${textToShow}</div>`;
    chatBody.appendChild(userBubble);
    
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = question.name;
    hiddenInput.value = value;
    hiddenForm.appendChild(hiddenInput);
    
    currentQuestionIndex++;
    setTimeout(() => {
        isTyping = false;
        askQuestion(currentQuestionIndex);
    }, 500);
}

function showError(message) {
    const errorDiv = chatInputArea.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// --- SÉQUENCE DE FIN (MISE À JOUR) ---

function submitForm() {
    console.log("Données du formulaire prêtes à être soumises :");
    const formData = new FormData(hiddenForm);
    for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
    }
    
    // Envoi des données en arrière-plan (décommentez pour la production)
    /*
    fetch(hiddenForm.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log('Soumission réussie:', data))
    .catch(error => console.error('Erreur de soumission:', error));
    */
    
    // Démarre la séquence d'animation
    setTimeout(showLoading, 500);
}

function showLoading() {
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'system');
    loadingMessage.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> Analyse de votre profil en cours...
    `;
    chatBody.appendChild(loadingMessage);
    scrollToBottom();
    
    // Simule une analyse de 2.5 secondes
    setTimeout(() => {
        loadingMessage.remove(); // Supprime le message de chargement
        showSuccess();
    }, 2500);
}

function showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.classList.add('message', 'system', 'success');
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i> Profil accepté !
    `;
    chatBody.appendChild(successMessage);
    scrollToBottom();
    
    // Laisse le temps de lire le message
    setTimeout(showGoogleCalendar, 1500);
}

// MISE À JOUR : Crée un lien-texte au lieu d'un bouton/iframe
function showGoogleCalendar() {
    // Message d'accompagnement final
    const googleIntro = document.createElement('div');
    googleIntro.classList.add('message');
    
    // C'est ce texte qui est crucial
    // MISE À JOUR ICI
    googleIntro.innerHTML = `
        <img src="image_1.jpg" alt="Esther Rizzo" class="avatar">
        <div class="bubble">
            YES ! Profil accepté ! 🚀 Félicitations, tu as fait le plus dur.
            <br><br>
            J'ai vraiment hâte de discuter de ton projet de vive voix.
            <br><br>
            C'est la dernière étape :
            <a href="https://calendar.app.google/v2gKU8buxz5fyNqq9" target="_blank" rel="noopener noreferrer">
                Clique ici pour réserver ton appel visio 1-on-1
            </a>
            <br><br>
            (Fais-le maintenant, mon agenda se remplit très vite !)
        </div>
    `;
    chatBody.appendChild(googleIntro);
    scrollToBottom();
}
