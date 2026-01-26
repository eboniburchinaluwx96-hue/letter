
const form = document.getElementById("applicationForm");

// Create a message container at the top
const messageContainer = document.createElement("div");
messageContainer.style.margin = "10px 0";
messageContainer.style.padding = "15px";
messageContainer.style.borderRadius = "5px";
messageContainer.style.textAlign = "center";
messageContainer.style.fontSize = "1.2em";
messageContainer.style.display = "none";
document.querySelector(".container").prepend(messageContainer);

// Allowed file types and max file size
const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// Display selected file names under each file input
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach((input) => {
  const fileLabel = document.createElement("p");
  fileLabel.style.fontSize = "0.9em";
  fileLabel.style.color = "#555";
  input.parentNode.insertBefore(fileLabel, input.nextSibling);

  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      const names = Array.from(input.files).map((f) => f.name).join(", ");
      fileLabel.textContent = Selected `file: ${names};`
    } else {
      fileLabel.textContent = "";
    }
  });
});

// Function to show messages
function showMessage(text, color) {
  messageContainer.textContent = text;
  messageContainer.style.backgroundColor = color === "green" ? "#d4edda" : "#f8d7da";
  messageContainer.style.color = color === "green" ? "#155724" : "#721c24";
  messageContainer.style.border = color === "green" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
  messageContainer.style.display = "block";
  messageContainer.scrollIntoView({ behavior: "smooth" });
}

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  // Validate files
  const allFiles = [...formData.getAll("idDocument"), ...formData.getAll("taxDocuments")];
  for (const file of allFiles) {
    if (!allowedTypes.includes(file.type)) {
      showMessage(`File type not allowed: ${file.name}`, "red");
      return;
    }
    if (file.size > maxFileSize) {
      showMessage(`File too large (max 5MB): ${file.name}`, "red");
      return;
    }
  }

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData
    });
    await response.text();

    // Show thank you message
    showMessage("Thank you! Redirecting...", "green");

    // Redirect to thank-you page after 2 seconds
    setTimeout(() => {
      window.location.href = "thankyou.html";
    }, 2000);

  } catch (error) {
    console.error(error);
    showMessage("There was an error submitting the form. Please try again.", "red");
  }
});
