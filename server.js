// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- SERVE FRONTEND -------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* -------------------- UPLOADS FOLDER -------------------- */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

/* -------------------- MULTER -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

/* -------------------- EMAIL -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Optional: test SMTP connection on server start
transporter.verify((err, success) => {
  if (err) console.error("SMTP Connection Error:", err);
  else console.log("SMTP Connected ✅");
});

/* -------------------- ROUTES -------------------- */

// Home page
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

// Form submission route
app.post(
  "/submit",
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "taxDocuments", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log("FORM DATA:", req.body);
      console.log("FILES:", req.files);

      // Build uploaded file URLs
      const uploadedFiles = {};
      for (const key in req.files) {
        uploadedFiles[key] = req.files[key].map(
          (f) =>` /uploads/${f.filename}`
        );
      }

      // Send confirmation email
      try {
        if (req.body.email) {
          await transporter.sendMail({
            from:`Application Team <${process.env.EMAIL_USER}>`,
            to: req.body.email,
            subject: "Application Received",
            html: `
              <p>Hello ${req.body.firstName || "Applicant"},</p>
              <p>Your application has been successfully received.</p>
              <p>Uploaded files:</p>
              <ul>
                ${Object.entries(uploadedFiles)
                  .map(
                    ([field, files]) =>
                      `<li>${field}: ${files
                        .map((url) => `<a href="${url}">${url}</a>`)
                        .join(", ")}</li>`
                  )
                  .join("")}
              </ul>
            `
          });
          console.log("Email sent successfully ✅");
        } else {
          console.warn("No email provided, skipping email sending");
        }
      } catch (mailErr) {
        console.error("EMAIL ERROR:", mailErr);
        // Continue even if email fails
      }

      // Redirect to thank-you page
      res.redirect("/thankyou.html");

    } catch (err) {
      console.error("SERVER ERROR:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  }
);

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});