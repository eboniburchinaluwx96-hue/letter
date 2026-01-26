document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");

  if (!form) {
    console.error("Form with id 'applicationForm' not found");
    return;
  }

  /* ==============================
     MESSAGE CONTAINER
  ============================== */
  const messageContainer = document.createElement("div");
  messageContainer.style.margin = "10px 0";
  messageContainer.style.padding = "15px";
  messageContainer.style.borderRadius = "5px";
  messageContainer.style.textAlign = "center";
  messageContainer.style.fontSize = "1.1em";
  messageContainer.style.display = "none";

  const container = document.querySelector(".container");
  if (container) {
    container.prepend(messageContainer);
  }

  /* ==============================
     FILE VALIDATION SETTINGS
  ============================== */
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf"
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  /* ==============================
     SHOW SELECTED FILE NAMES
  ============================== */
  const fileInputs = document.querySelectorAll('input[type="file"]');

  fileInputs.forEach((input) => {
    const fileLabel = document.createElement("p");
    fileLabel.style.fontSize = "0.9em";
    fileLabel.style.color = "#555";
    fileLabel.style.marginTop = "5px";

    input.parentNode.insertBefore(fileLabel, input.nextSibling);

    input.addEventListener("change", () => {
      if (input.files.length > 0) {
        const names = Array.from(input.files)
          .map(file => file.name)
          .join(", ");

        fileLabel.textContent =`Selected file: ${names};`
      } else {
        fileLabel.textContent = "";
      }
    });
  });

  /* ==============================
     MESSAGE HANDLER
  ============================== */
  function showMessage(text, type) {
    messageContainer.textContent = text;

    if (type === "success") {
      messageContainer.style.backgroundColor = "#d4edda";
      messageContainer.style.color = "#155724";
      messageContainer.style.border = "1px solid #c3e6cb";
    } else {
      messageContainer.style.backgroundColor = "#f8d7da";
      messageContainer.style.color = "#721c24";
      messageContainer.style.border = "1px solid #f5c6cb";
    }

    messageContainer.style.display = "block";
    messageContainer.scrollIntoView({ behavior: "smooth" });
  }

  /* ==============================
     FORM SUBMIT
  ============================== */
  form.addEventListener("/submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const formData = new FormData(form);

    /* -------- FILE VALIDATION -------- */
    const files = [
      ...formData.getAll("idDocument"),
      ...formData.getAll("taxDocuments")
    ].filter(Boolean);

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        showMessage(`File type not allowed: ${file.name}`, "error");
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      if (file.size > maxFileSize) {
        showMessage(`File too large (max 5MB): ${file.name}`, "error");
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    /* -------- SEND DATA -------- */
    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      showMessage("Thank you! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "thankyou.html";
      }, 2000);

    } catch (error) {
      console.error(error);
      showMessage(
        "There was an error submitting the form. Please try again.",
        "error"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
      }
    }
  });
});