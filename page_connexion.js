document.addEventListener("mousemove", (e) => {
  // 1. EFFET SPOTLIGHT : Suivi de la souris
  // On récupère la position de la souris
  const x = e.clientX;
  const y = e.clientY;

  // On met à jour les variables CSS (--x et --y) utilisées dans le gradient
  document.documentElement.style.setProperty("--x", x + "px");
  document.documentElement.style.setProperty("--y", y + "px");
});

// 2. GESTION DES ONGLETS (Connexion / Inscription)
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const signupFields = document.getElementById("signup-fields");
const formTitle = document.getElementById("form-title");
const btnAction = document.querySelector(".btn-action");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  signupFields.style.display = "none";
  formTitle.innerText = "Bon retour, Héros";
  btnAction.innerText = "Continuer l'aventure";
});

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupFields.style.display = "block";
  formTitle.innerText = "Rejoindre la Ligue";
  btnAction.innerText = "Créer mon compte";
});

// 3. SIMULATION DE CONNEXION
document.getElementById("auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert(
    "Bravo ! Votre progression est maintenant sauvegardée. Préparez-vous à jouer !",
  );
  // Ici, on pourrait rediriger vers le jeu
});
