let reponseAttendue = "";

/**
 * Ouvre le pop-up d'énigme
 * @param {string} nomObjet - Le nom de l'objet (ex: 'batarang')
 * @param {string} reponse - La réponse correcte (ex: 'Batman')
 * @param {string} imagePath - Le chemin vers l'image de l'objet
 */
function ouvrirEnigme(nomObjet, reponse, imagePath) {
  const overlay = document.getElementById("quiz-overlay");
  const question = document.getElementById("quiz-question");
  const input = document.getElementById("hero-guess");
  const img = document.getElementById("quiz-img");
  const feedback = document.getElementById("feedback");

  // Configurer le contenu
  reponseAttendue = reponse;
  question.innerText = `Qui utilise ce ${nomObjet} ?`;
  img.src = imagePath;

  // Réinitialiser le formulaire
  input.value = "";
  feedback.innerText = "";
  feedback.className = "feedback";

  // Afficher le pop-up
  overlay.style.display = "flex";

  // Mettre le focus sur le champ de texte
  setTimeout(() => input.focus(), 100);
}

function fermerEnigme() {
  document.getElementById("quiz-overlay").style.display = "none";
}

// Gestion de la validation (Touche Entrée)
document
  .getElementById("hero-guess")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      validerReponse();
    }
  });

function validerReponse() {
  const input = document.getElementById("hero-guess");
  const feedback = document.getElementById("feedback");
  const proposition = input.value.trim();

  if (proposition.toLowerCase() === reponseAttendue.toLowerCase()) {
    feedback.innerText = "C'est exact, Héros !";
    feedback.className = "feedback correct";

    // Petite pause avant de fermer
    setTimeout(() => {
      alert("Objet trouvé ! Vous gagnez des points de progression.");
      fermerEnigme();
    }, 1000);
  } else {
    feedback.innerText = "Ce n'est pas la bonne réponse... Réessaie !";
    feedback.className = "feedback wrong";

    // Petit effet de secousse sur l'input
    input.style.transform = "translateX(10px)";
    setTimeout(() => (input.style.transform = "translateX(-10px)"), 100);
    setTimeout(() => (input.style.transform = "translateX(0)"), 200);
  }
}
