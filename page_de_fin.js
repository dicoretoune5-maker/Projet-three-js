document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById("custom-cursor");

  // 1. SUIVI DU CURSEUR PERSONNALISÉ
  document.addEventListener("mousemove", (e) => {
    // On déplace le curseur personnalisé
    // On soustrait 10 (moitié de sa taille) pour le centrer
    cursor.style.left = e.clientX - 10 + "px";
    cursor.style.top = e.clientY - 10 + "px";
  });

  // 2. EFFET AU CLIC
  document.addEventListener("mousedown", () => {
    cursor.style.transform = "scale(0.8)";
  });

  document.addEventListener("mouseup", () => {
    cursor.style.transform = "scale(1)";
  });

  // 3. EFFET DE SURVOL SUR LES BOUTONS
  const buttons = document.querySelectorAll("button, a");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.background = "rgba(255, 215, 0, 0.2)";
      cursor.style.borderColor = "#ffd700";
    });
    btn.addEventListener("mouseleave", () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      cursor.style.background = "rgba(59, 89, 152, 0.5)";
      cursor.style.borderColor = "#5a7ecf";
    });
  });
});

function partager() {
  alert(
    "Félicitations ! Votre exploit a été partagé avec la Ligue des Justiciers !",
  );
}
