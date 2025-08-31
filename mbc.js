function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const pwd = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const toggleBtn = document.getElementById("togglePwd");
  const eyeIcon = toggleBtn?.querySelector("i");

  // Handle login submit
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const input = pwd ? pwd.value : "";
    if (isPasswordValid(input)) {
      sessionStorage.setItem("loggedIn", "true");
      window.location.href = "index.html";
    } else {
      if (errorMsg) {
        errorMsg.textContent = "Incorrect password.";
        errorMsg.classList.add("shake");
        setTimeout(() => errorMsg.classList.remove("shake"), 300);
      }
    }
  });

  // Handle password visibility toggle
  if (toggleBtn && pwd && eyeIcon) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = pwd.type === "password";
      pwd.type = isHidden ? "text" : "password";
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }
}
