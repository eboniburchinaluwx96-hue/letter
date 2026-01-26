const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- SERVE FRONTEND -------------------- */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -------------------- MULTER -------------------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* -------------------- EMAIL -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* -------------------- SUBMIT ROUTE -------------------- */
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

      await transporter.sendMail({
        from:`"Application Team" <${process.env.EMAIL_USER}>`,
        to: req.body.email,
        subject: "Application Received",
        html: `
          <p>Hello ${req.body.firstName},</p>
          <p>Your application has been successfully received.</p>
        `
      });

      res.json({ message: "Application submitted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});