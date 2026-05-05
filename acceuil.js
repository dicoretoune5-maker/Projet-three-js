document.addEventListener("DOMContentLoaded", () => {
  // 1. SURVOL LOGO
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener(
      "mouseenter",
      () => (logo.style.transform = "scale(1.1)"),
    );
    logo.addEventListener(
      "mouseleave",
      () => (logo.style.transform = "scale(1)"),
    );
  }

  // 2. ANIMATION DE FLOTTEMENT DOUX (Uniquement pour le centre pour rester simple)
  const centerGroup = document.querySelector(".center");
  let pos = 0;
  let dir = 1;

  function float() {
    pos += 0.05 * dir;
    if (pos > 5 || pos < 0) dir *= -1;

    // On garde le translateX(-50%) du CSS et on ajoute le mouvement vertical
    if (centerGroup) {
      centerGroup.style.transform = `translateX(-50%) translateY(${pos}px)`;
    }
    requestAnimationFrame(float);
  }

  float();
});
