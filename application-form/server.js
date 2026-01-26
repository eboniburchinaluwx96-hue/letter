const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Create folders if they don't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow CORS (optional)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Handle form submission
app.post(
  "/submit",
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "taxDocuments", maxCount: 1 },
  ]),
  (req, res) => {
    const formData = {
      personalInfo: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        placeOfBirth: req.body.placeOfBirth,
        gender: req.body.gender,
        oldAddress: req.body.oldAddress,
        newAddress: req.body.newAddress,
      },
      parentInfo: {
        fatherFullName: req.body.fatherFullName,
        motherFullName: req.body.motherFullName,
      },
      identification: {
        ssn: req.body.ssn,
        govIdNumber: req.body.govIdNumber,
        idDocument: req.files["idDocument"] ? req.files["idDocument"][0].filename : null,
      },
      idme: {
        idmeEmail: req.body.idmeEmail,
      },
      taxDocuments: req.files["taxDocuments"] ? req.files["taxDocuments"][0].filename : null,
      employment: {
        position: req.body.position,
        experience: req.body.experience,
        reason: req.body.reason,
      },
      submittedAt: new Date().toISOString(),
    };

    // Save data to JSON file
    const dataFile = path.join(__dirname, "submissions.json");
    let allSubmissions = [];
    if (fs.existsSync(dataFile)) {
      allSubmissions = JSON.parse(fs.readFileSync(dataFile));
    }
    allSubmissions.push(formData);
    fs.writeFileSync(dataFile, JSON.stringify(allSubmissions, null, 2));

    res.send("Form submitted successfully!");
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});