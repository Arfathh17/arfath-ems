/* ============================================================
   EMS — Login Page Script
   Features:
     - Eyes follow mouse cursor (trigonometry)
     - Nervous state on password focus
     - Covering hands while typing password
     - Happy bounce on success
     - Head shake on wrong credentials
     - Smooth speech caption updates
   ============================================================ */

(function () {
  "use strict";

  /* ── Element refs ── */
  const otto        = document.getElementById("otto");
  const pupilL      = document.getElementById("pupil-left");
  const pupilR      = document.getElementById("pupil-right");
  const ottoMsg     = document.getElementById("otto-msg");
  const pwInput     = document.getElementById("password");
  const usernameInp = document.getElementById("username");
  const loginForm   = document.getElementById("login-form");
  const alertBox    = document.getElementById("alert-error");
  const alertMsg    = document.getElementById("alert-msg");
  const btnLogin    = document.getElementById("btn-login");
  const btnText     = btnLogin.querySelector(".btn-text");
  const btnSpinner  = document.getElementById("btn-spinner");
  const btnArrow    = btnLogin.querySelector(".btn-arrow");
  const pwEye       = document.getElementById("pw-eye");
  const eyeIcon     = document.getElementById("eye-icon");

  /* ── Otto default eye center positions (in SVG coordinate space) ── */
  const LEFT_EYE_CENTER  = { x: 82, y: 108 };
  const RIGHT_EYE_CENTER = { x: 118, y: 108 };
  const PUPIL_RADIUS      = 5; // max pixel drift inside iris

  /* ── Speech lines ── */
  const idleLines    = ["Hey! Welcome to arfath.co 👋", "Ready to manage your team? 💼", "Good to see you again! ✨"];
  const nervousLines = ["Uh oh, password time... 😬", "Don't peek! 🙈", "I won't look, I promise! 🤝"];
  const coverLines   = ["Covering my eyes! 🙈", "Your secret is safe! 🔒", "Absolutely not looking! 🫣"];
  const wrongLines   = ["Hmm, that doesn't seem right... 🤔", "Are you sure about that? 😅", "Try again! I believe in you! 💪"];
  const happyLines   = ["YES! Welcome aboard! 🎉", "Logging you in! 🚀", "Great to have you back! 🌟"];

  let currentState  = "idle";
  let speechTimer   = null;

  /* ──────────────────────────────────────────
     EYE TRACKING — mouse moves pupil positions
  ────────────────────────────────────────── */
  document.addEventListener("mousemove", (e) => {
    // Don't track when covering eyes
    if (otto.classList.contains("covering")) return;

    const svgRect = otto.getBoundingClientRect();

    // Compute mouse relative to SVG element
    const mx = e.clientX - svgRect.left;
    const my = e.clientY - svgRect.top;

    // SVG viewBox is 240×280; scale mouse coords to SVG space
    const scaleX = 200 / svgRect.width;
    const scaleY = 230 / svgRect.height;
    const svgMx  = mx * scaleX;
    const svgMy  = my * scaleY;

    /* For each eye, compute angle toward mouse and clamp to max drift */
    movePupil(pupilL, LEFT_EYE_CENTER,  svgMx, svgMy);
    movePupil(pupilR, RIGHT_EYE_CENTER, svgMx, svgMy);
  });

  function movePupil(pupilEl, center, mx, my) {
    const dx    = mx - center.x;
    const dy    = my - center.y;
    const angle = Math.atan2(dy, dx);
    const dist  = Math.min(Math.hypot(dx, dy) * 0.12, PUPIL_RADIUS);

    const nx = center.x + Math.cos(angle) * dist;
    const ny = center.y + Math.sin(angle) * dist;

    // Use setAttribute for SVG cx/cy
    pupilEl.setAttribute("cx", nx.toFixed(2));
    pupilEl.setAttribute("cy", ny.toFixed(2));
  }

  /* ──────────────────────────────────────────
     OTTO STATE MACHINE
  ────────────────────────────────────────── */

  function setState(state) {
    if (state === currentState) return;

    // Remove all state classes first
    otto.classList.remove("nervous", "covering", "happy", "wrong");

    if (state === "nervous")  otto.classList.add("nervous");
    if (state === "covering") otto.classList.add("covering");
    if (state === "happy")    otto.classList.add("happy");
    if (state === "wrong")    otto.classList.add("wrong");

    currentState = state;
  }

  function showMsg(lines) {
    clearTimeout(speechTimer);
    const msg = lines[Math.floor(Math.random() * lines.length)];
    ottoMsg.style.opacity = "0";
    ottoMsg.style.transform = "translateY(6px)";
    setTimeout(() => {
      ottoMsg.textContent = msg;
      ottoMsg.style.opacity = "1";
      ottoMsg.style.transform = "translateY(0)";
    }, 150);

    ottoMsg.style.transition = "opacity 0.25s ease, transform 0.25s ease";
  }

  /* ──────────────────────────────────────────
     PASSWORD FIELD INTERACTIONS
  ────────────────────────────────────────── */

  // Password focused (but empty) → nervous
  pwInput.addEventListener("focus", () => {
    if (pwInput.value.length === 0) {
      setState("nervous");
      showMsg(nervousLines);
    }
  });

  // Typing in password → covering eyes
  pwInput.addEventListener("input", () => {
    if (pwInput.value.length > 0) {
      setState("covering");
      if (currentState !== "covering") showMsg(coverLines);
    } else {
      setState("nervous");
      showMsg(nervousLines);
    }
  });

  // Password blur → back to idle (if empty)
  pwInput.addEventListener("blur", () => {
    if (pwInput.value.length === 0) {
      setState("idle");
      showMsg(idleLines);
    }
  });

  // Username focus → greet
  usernameInp.addEventListener("focus", () => {
    if (currentState === "idle") {
      showMsg(["Enter your username 👤", "Who goes there? 🔍"]);
    }
  });

  /* ──────────────────────────────────────────
     TOGGLE PASSWORD VISIBILITY
  ────────────────────────────────────────── */
  pwEye.addEventListener("click", () => {
    const isHidden = pwInput.type === "password";
    pwInput.type = isHidden ? "text" : "password";

    // Toggle icon
    if (isHidden) {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>`;
      // Peeking: briefly show eyes
      if (otto.classList.contains("covering")) {
        setState("nervous");
        showMsg(["Hehe, I can see it now 😳"]);
        setTimeout(() => {
          if (pwInput.value.length > 0 && pwInput.type === "text") {
            setState("nervous");
          }
        }, 1500);
      }
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>`;
      if (pwInput.value.length > 0) {
        setState("covering");
        showMsg(coverLines);
      }
    }
  });

  /* ──────────────────────────────────────────
     FORM SUBMIT — AJAX to Flask
  ────────────────────────────────────────── */
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show loading spinner
    btnText.textContent = "Signing in…";
    btnArrow.classList.add("hidden");
    btnSpinner.classList.remove("hidden");
    btnLogin.disabled = true;
    alertBox.classList.add("hidden");

    const formData = new FormData(loginForm);

    try {
      const res  = await fetch("/", {
        method:  "POST",
        body:    formData,
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });
      const data = await res.json();

      if (data.status === "ok") {
        /* ── SUCCESS ── */
        setState("happy");
        showMsg(happyLines);
        btnText.textContent = "Welcome!";
        btnSpinner.classList.add("hidden");

        // Small delay → then redirect
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 900);

      } else {
        /* ── FAILURE ── */
        setState("wrong");
        showMsg(wrongLines);
        setTimeout(() => setState("idle"), 1200);

        // Show error banner
        alertMsg.textContent = data.message || "Invalid credentials.";
        alertBox.classList.remove("hidden");

        // Reset button
        btnText.textContent = "Sign In";
        btnArrow.classList.remove("hidden");
        btnSpinner.classList.add("hidden");
        btnLogin.disabled = false;

        // Shake the form card
        const card = document.querySelector(".form-card");
        card.style.animation = "none";
        void card.offsetHeight;
        card.style.animation = "shake 0.4s ease";
      }
    } catch (err) {
      console.error(err);
      btnText.textContent = "Sign In";
      btnArrow.classList.remove("hidden");
      btnSpinner.classList.add("hidden");
      btnLogin.disabled = false;
    }
  });

  /* ── Initial greeting on page load ── */
  setTimeout(() => {
    setState("idle");
    showMsg(idleLines);
  }, 500);

})();