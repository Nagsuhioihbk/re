// ----- IMPORTS -----
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");


// ----- EXPRESS APP INIT -----
const app = express();
app.use('/pdfs', express.static(path.join(__dirname, 'uploads/pdfs')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- MONGODB CONNECTION -----
mongoose
  .connect(
    "mongodb+srv://root:1234@cluster0.ofeco44.mongodb.net/Retoolssss"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ----- MONGOOSE SCHEMA -----
const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // admin or customer
});

const Admin =  mongoose.models.admin || mongoose.model("admin", AdminSchema);

// ----- MULTER CONFIG -----
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // or "uploads/gallery/" if needed
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});





app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({ storage: diskStorage }); // ✅ New config

// ----- NODEMAILER CONFIG -----
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nagaraja.nagas.2003@gmail.com",
    pass: "hwsx keex wbry qcan",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const JobSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  qualifications: String,
  field: String,
  skills: String,
  location: String,
  type: String,
  salary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("job", JobSchema);

const StudentApplicationSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  gender: String,
  dob: String,
  education: String,
  percentage: String,
  skills: String,
  jobTitle: String,
  resumeFilename: String,
  isChecked: { type: Boolean, default: false },  // ✅ New field
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentApplication = mongoose.model(
  "studentApplication",
  StudentApplicationSchema
);





// Student testimonial and achivements 
const AchievementSchema = new mongoose.Schema({
  img: String, // image path
  title: String,
  desc: String,
  createdAt: { type: Date, default: Date.now }
});
const Achievement = mongoose.model("achievement", AchievementSchema);

const TestimonialSchema = new mongoose.Schema({
  img: String,
  name: String,
  desc: String,
  company: String,
  month: String,
  day: String,
  createdAt: { type: Date, default: Date.now }
});
const Testimonial = mongoose.model("testimonial", TestimonialSchema);

const AboutPageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    company: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    image: { type: String }, // optional
  },
  { timestamps: true }
);

const AboutPage = mongoose.model("AboutPage", AboutPageSchema);


// ----- PRODUCT APPLICATION SCHEMA -----
const ProductApplicationSchema = new mongoose.Schema({
  productTitle: String,
  name: String,
  email: { type: String, required: true, unique: true },  // <-- unique here
  phone: { type: String, required: true },
  companyName: String,
  companyLocation: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// Optional: compound index for email + phone uniqueness
ProductApplicationSchema.index({ email: 1, phone: 1 }, { unique: true });

const ProductApplication = mongoose.model("productApplication", ProductApplicationSchema);




app.post("/api/product-applications", async (req, res) => {
  try {
    // Check if email already exists
    const existing = await ProductApplication.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const application = new ProductApplication(req.body);
    await application.save();

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ message: "Failed to submit application", error: err.message });
  }
});

app.get("/api/product-applications", async (req, res) => {
  try {
    const applications = await ProductApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
});
app.put("/api/product-applications/:id", async (req, res) => {
  try {
    const updatedApplication = await ProductApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedApplication) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application updated", application: updatedApplication });
  } catch (err) {
    res.status(500).json({ message: "Failed to update application", error: err.message });
  }
});
app.delete("/api/product-applications/:id", async (req, res) => {
  try {
    const deleted = await ProductApplication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application", error: err.message });
  }
});



const SellsApplicationSchema = new mongoose.Schema({
  productTitle: String,
  name: String,
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  companyName: String,
  companyLocation: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// Optional: compound index for email + phone uniqueness
SellsApplicationSchema.index({ email: 1, phone: 1 }, { unique: true });

const SellsApplication = mongoose.model("sellsApplication", SellsApplicationSchema);

// ----- CREATE -----
app.post("/api/sells-applications", async (req, res) => {
  try {
    const existing = await SellsApplication.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const application = new SellsApplication(req.body);
    await application.save();

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ message: "Failed to submit application", error: err.message });
  }
});

// ----- READ ALL -----
app.get("/api/sells-applications", async (req, res) => {
  try {
    const applications = await SellsApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
});

// ----- UPDATE -----
app.put("/api/sells-applications/:id", async (req, res) => {
  try {
    const updatedApplication = await SellsApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedApplication) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application updated", application: updatedApplication });
  } catch (err) {
    res.status(500).json({ message: "Failed to update application", error: err.message });
  }
});

// ----- DELETE -----
app.delete("/api/sells-applications/:id", async (req, res) => {
  try {
    const deleted = await SellsApplication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application", error: err.message });
  }
});


// -------------------- About Page --------------------

// Create About Page entry
app.post("/api/about", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, company, month, day } = req.body;

    const newAbout = new AboutPage({
      name,
      desc,
      company,
      month,
      day,
      image: req.file ? req.file.filename : null,
    });

    await newAbout.save();
    res.status(201).json({ message: "About page entry created", about: newAbout });
  } catch (err) {
    console.error("❌ Error creating about entry:", err);
    res.status(500).json({ message: "Failed to create about entry", error: err.message });
  }
});

// Get all About Page entries
app.get("/api/about", async (req, res) => {
  try {
    const aboutEntries = await AboutPage.find().sort({ createdAt: -1 });
    res.json(aboutEntries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch about entries", error: err.message });
  }
});

// Update About Page entry
app.put("/api/about/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, company, month, day } = req.body;

    const updated = await AboutPage.findByIdAndUpdate(
      req.params.id,
      {
        name,
        desc,
        company,
        month,
        day,
        image: req.file ? req.file.filename : undefined,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "About entry not found" });

    res.json({ message: "About entry updated", about: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update about entry", error: err.message });
  }
});

// Delete About Page entry
app.delete("/api/about/:id", async (req, res) => {
  try {
    const deleted = await AboutPage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "About entry not found" });
    res.json({ message: "About entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete about entry", error: err.message });
  }
});

// Upload Student Achievement
app.post("/api/achievements", upload.single("img"), async (req, res) => {
  const { title, desc } = req.body;
  const imgPath = req.file ? `/uploads/${req.file.filename}` : "";

  const newAch = new Achievement({ img: imgPath, title, desc });
  await newAch.save();
  res.status(201).json({ message: "Achievement saved", achievement: newAch });
});

// Get All Achievements
app.get("/api/achievements", async (req, res) => {
  const achievements = await Achievement.find().sort({ createdAt: -1 });
  res.json(achievements);
});


const CourseDownloadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  education: String,
  description: String,
  courseName: String,
  createdAt: { type: Date, default: Date.now },
});

const CourseDownload = mongoose.model("courseDownload", CourseDownloadSchema);


// ----- PDF DOWNLOAD FORM ROUTE -----
app.post("/api/course-download", async (req, res) => {
  const { name, email, phone, education, description, courseName } = req.body;

  if (!name || !email || !phone || !education || !courseName) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if already submitted
    const existing = await CourseDownload.findOne({ email, phone, courseName });

    if (existing) {
      return res.status(200).json({
        message: "Already submitted. You can download the PDF.",
        alreadySubmitted: true,
      });
    }

    // Save new submission
    const newDownload = new CourseDownload({
      name,
      email,
      phone,
      education,
      description,
      courseName,
    });

    await newDownload.save();

    // Send email to admin
    const mailOptions = {
      from: email,
      to: "nn1528523@gmail.com",
      subject: `📘 Course PDF Request - ${courseName}`,
      text: `
📥 New PDF Download Form Submission

📚 Course: ${courseName}
👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone}
🎓 Education: ${education}
🗒️ Description: ${description || "N/A"}

Submitted at: ${new Date().toLocaleString()}
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Form submitted and saved successfully",
      alreadySubmitted: false,
    });
  } catch (err) {
    console.error("❌ Error saving form or sending email:", err);
    return res.status(500).json({ message: "Failed to process form", error: err.message });
  }
});



// ----- GET ALL DOWNLOAD FORM SUBMISSIONS -----
app.get("/api/course-downloads", async (req, res) => {
  try {
    const downloads = await CourseDownload.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(downloads);
  } catch (err) {
    console.error("❌ Error fetching course downloads:", err);
    res.status(500).json({ message: "Failed to fetch downloads", error: err.message });
  }
});

// Upload Testimonial
app.post("/api/testimonials", upload.single("img"), async (req, res) => {
  const { name, desc, company, month, day } = req.body;
  const imgPath = req.file ? `/uploads/${req.file.filename}` : "";

  const newTestimonial = new Testimonial({
    img: imgPath, name, desc, company, month, day
  });
  await newTestimonial.save();
  res.status(201).json({ message: "Testimonial saved", testimonial: newTestimonial });
});

// Get All Testimonials
app.get("/api/testimonials", async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(testimonials);
});

// DELETE Achievement
app.delete("/api/achievements/:id", async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: "Achievement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete achievement" });
  }
});

// UPDATE Achievement
app.put("/api/achievements/:id", upload.single("img"), async (req, res) => {
  const { title, desc } = req.body;
  const updateData = { title, desc };
  if (req.file) updateData.img = `/uploads/${req.file.filename}`;
  try {
    const updated = await Achievement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update achievement" });
  }
});

// DELETE Testimonial
app.delete("/api/testimonials/:id", async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

// UPDATE Testimonial
app.put("/api/testimonials/:id", upload.single("img"), async (req, res) => {
  const { name, desc, company, month, day } = req.body;
  const updateData = { name, desc, company, month, day };
  if (req.file) updateData.img = `/uploads/${req.file.filename}`;
  try {
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});


// === Submit Student Application ===
app.post("/api/students/apply", upload.single("latestResume"), async (req, res) => {
  try {
    const {
  name,
  mobile,
  email,
  gender,
  dob,
  education,
  percentage,
  skills,
  jobTitle, // ✅ Add this
} = req.body;


    const resumeFilename = req.file ? req.file.filename : "";

    const application = new StudentApplication({
  name,
  mobile,
  email,
  gender,
  dob,
  education,
  percentage,
  skills,
  resumeFilename,
  jobTitle, // ✅ THIS LINE IS MISSING IN YOUR CURRENT CODE
});


    await application.save();

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    console.error("Error saving application:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// === Get All Student Applications (for Admin View) ===
// === Get All Student Applications (for Admin View) ===
app.get("/api/students/applications", async (req, res) => {
  try {
    // Find all applications and include all fields
    const applications = await StudentApplication.find({}, null, {
      sort: { createdAt: -1 },
    });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications", error });
  }
});


// === Update Student Application ===
// Toggle "checked" status of an application
app.put('/api/students/applications/:id', async (req, res) => {
  try {
    const updated = await StudentApplication.findByIdAndUpdate(
      req.params.id,
      req.body, // <- update all fields sent in req.body
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
});




// === Delete Student Application ===
app.delete("/api/students/applications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedApplication = await StudentApplication.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted", application: deletedApplication });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Failed to delete application" });
  }
});






const SliderSchema = new mongoose.Schema({
  tag: { type: String, default: "" }, // For small label above title
  imageUrl: { type: String, required: true }, // Background image
  overlayImageUrl: { type: String, default: "" }, // Overlay image
  text: { type: String, default: "" }, // Main title text
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Slider = mongoose.model("Slider", SliderSchema);






//Blog Start
const BlogSchema = new mongoose.Schema({
  title: String,
  caption: String,
  description: String,
  subParts: [String],
  imagePath: String, // main image
  extraImages: [String], // ✅ new field for up to 4 extra images
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', BlogSchema);

const SellSchema = new mongoose.Schema({
  title: String,
  caption: String,
  description: String,
  subParts: [String],
  imagePath: String,       // main image
  extraImages: [String],   // up to 4 extra images
  createdAt: { type: Date, default: Date.now },
});

const Sell = mongoose.model("Sell", SellSchema);


// -------- CREATE Sell --------
app.post("/api/Sells", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "extraImages", maxCount: 4 },
]), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { title, caption, description } = req.body;

    // Safely parse subParts
    let subParts = [];
    if (req.body.subParts) {
      try {
        subParts = JSON.parse(req.body.subParts);
      } catch (err) {
        // if it's already an array or string, just push it
        subParts = Array.isArray(req.body.subParts) ? req.body.subParts : [req.body.subParts];
      }
    }

    const imagePath = req.files?.image ? req.files.image[0].filename : null;
    const extraImages = req.files?.extraImages ? req.files.extraImages.map(file => file.filename) : [];

    const newSell = new Sell({
      title,
      caption,
      description,
      subParts,
      imagePath,
      extraImages,
    });

    await newSell.save();
    res.status(201).json({ message: "Sell created successfully ✅", sell: newSell });
  } catch (error) {
    console.error("Error creating sell:", error);
    res.status(500).json({ message: "Server error while creating sell", error: error.message });
  }
});

// -------- GET All Sells --------
app.get("/api/Sells", async (req, res) => {
  const sells = await Sell.find().sort({ createdAt: -1 });
  res.json(sells);
});

// -------- GET Single Sell --------
app.get("/api/Sells/:id", async (req, res) => {
  const sell = await Sell.findById(req.params.id);
  if (!sell) return res.status(404).json({ message: "Sell not found" });
  res.json(sell);
});

// -------- DELETE Sell --------
app.delete("/api/Sells/:id", async (req, res) => {
  await Sell.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

// -------- UPDATE Sell --------
app.put("/api/Sells/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "extraImages", maxCount: 4 },
]), async (req, res) => {
  try {
    const { title, caption, description, subParts } = req.body;

    const sell = await Sell.findById(req.params.id);
    if (!sell) return res.status(404).json({ message: "Sell not found" });

    sell.title = title;
    sell.caption = caption;
    sell.description = description;
    sell.subParts = JSON.parse(subParts);

    if (req.files["image"]) sell.imagePath = req.files["image"][0].filename;

    if (req.files["extraImages"]) {
      const newExtraImages = req.files["extraImages"].map(file => file.filename);
      sell.extraImages = sell.extraImages || [];
      newExtraImages.forEach((fileName, idx) => {
        sell.extraImages[idx] = fileName; // replace at index
      });
    }

    await sell.save();
    res.json({ message: "Sell updated successfully", sell });
  } catch (error) {
    console.error("Error updating sell:", error);
    res.status(500).json({ message: "Server error while updating sell" });
  }
});

// Image Schema
const ImageSchema = new mongoose.Schema({
  url: String,
  text: String,
});

// Folder Schema (folder-based images)
const FolderSchema = new mongoose.Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  images: [ImageSchema],
});

const Folder = mongoose.model("Folder", FolderSchema);

// Image Model (for images without folder)
const GalleryImage = mongoose.model(
  "GalleryImage",
  new mongoose.Schema({
    url: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  })
);


// ----- CONTACT SCHEMA -----
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("contact", ContactSchema);


// ----- CONTACT FORM ROUTE -----
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, Email, and Message are required" });
    }

    // ✅ Save to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    // ✅ Send email to admin
    const mailOptions = {
      from: email,
      to: "nn1528523@gmail.com", // your admin email
      subject: "📩 New Contact Form Submission",
      text: `
New Contact Form Submission:

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone || "N/A"}
💬 Message: ${message}

Submitted at: ${new Date().toLocaleString()}
      `,
    };

    await transporter.sendMail(mailOptions);

    // ✅ Respond with success
    res.status(200).json({ message: "Contact form submitted successfully", contact: newContact });

  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.status(500).json({ message: "Failed to submit contact form", error: error.message });
  }
});



// Get all folders

app.post("/api/gallery/bulk", upload.array("images", 20), async (req, res) => {
  const { folder, texts } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const imageTexts = texts ? JSON.parse(texts) : [];

  try {
    const imageObjects = files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      text: imageTexts[index] || "",
    }));

    // Find or create the folder
    let folderDoc = await Folder.findOne({ name: folder });

    if (!folderDoc) {
      folderDoc = new Folder({
        name: folder,
        images: imageObjects,
      });
    } else {
      folderDoc.images.push(...imageObjects); // Add new images
    }

    await folderDoc.save();

    res.status(201).json({ message: "Images uploaded to folder", folder: folderDoc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload images", error: err.message });
  }
});


app.get("/api/gallery/folders", async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    console.log("Folders:", folders);
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch folders", error: err.message });
  }
});



app.get("/api/gallery", async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    const ungroupedImages = await GalleryImage.find().sort({ createdAt: -1 });

    res.status(200).json({
      folders,
      ungroupedImages,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch gallery", error: err.message });
  }
});

// Delete ungrouped image
app.delete("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;
  const image = await GalleryImage.findByIdAndDelete(id);
  if (image) {
    const filePath = path.join(__dirname, "uploads", path.basename(image.url));
    fs.unlink(filePath, () => {});
  }
  res.json({ message: "Image deleted" });
});

// Delete folder and its images
app.delete("/api/gallery/folder/:id", async (req, res) => {
  const folder = await Folder.findByIdAndDelete(req.params.id);
  if (folder) {
    const images = await GalleryImage.find({ folder: folder.name });
    await Promise.all(
      images.map(async (img) => {
        const filePath = path.join(__dirname, "uploads", path.basename(img.url));
        fs.unlink(filePath, () => {});
        await img.deleteOne();
      })
    );
  }
  res.json({ message: "Folder and images deleted" });
});

app.put('/api/folders/:folderId/images/:imageId', upload.single("image"), async (req, res) => {
  const { folderId, imageId } = req.params;
  const { text } = req.body;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const image = folder.images.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found in folder" });

    // Update text if provided
    if (text) image.text = text;

    // Update image file if uploaded
    if (req.file) {
      image.url = `/uploads/${req.file.filename}`;
    }

    await folder.save();
    res.json({ message: "Image updated", image });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete image from a folder
// DELETE image inside a folder (embedded subdocument)
app.delete("/api/folders/:folderId/images/:imageId", async (req, res) => {
  const { folderId, imageId } = req.params;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const imgSubdoc = folder.images.id(imageId);
    if (!imgSubdoc) return res.status(404).json({ message: "Image not found in this folder" });

    // delete the physical file
    const filePath = path.join(__dirname, "uploads", path.basename(imgSubdoc.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // remove the subdocument
    imgSubdoc.deleteOne(); // or folder.images.id(imageId).remove() on old mongoose
    await folder.save();

    res.json({ message: "Image deleted from folder" });
  } catch (error) {
    console.error("Folder image delete error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});





// Blog upload route
// accepts 1 main + 4 extra images
app.post("/api/blogs", upload.fields([
  { name: "image", maxCount: 1 },         // main image
  { name: "extraImages", maxCount: 4 },   // up to 4 extra images
]), async (req, res) => {
  try {
    console.log("Files:", req.files);
    console.log("Body:", req.body);

    const { title, caption, description, subParts } = req.body;
    const imagePath = req.files["image"] ? req.files["image"][0].filename : null;
    const extraImages = req.files["extraImages"] ? req.files["extraImages"].map(file => file.filename) : [];

    const newBlog = new Blog({
      title,
      caption,
      description,
      subParts: JSON.parse(subParts),
      imagePath,
      extraImages,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error while creating blog" });
  }
});



app.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

app.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  res.json(blog);
});


app.delete("/api/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});



app.put("/api/blogs/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "extraImages", maxCount: 4 },
]), async (req, res) => {
  try {
    const { title, caption, description, subParts } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Update main fields
    blog.title = title;
    blog.caption = caption;
    blog.description = description;
    blog.subParts = JSON.parse(subParts);

    // Update main image if provided
    if (req.files["image"]) {
      blog.imagePath = req.files["image"][0].filename;
    }

    // Update extra images partially
    if (req.files["extraImages"]) {
      // Merge existing extraImages array with newly uploaded ones
      const newExtraImages = req.files["extraImages"].map(file => file.filename);

      // If user uploads to replace only specific indexes, handle accordingly
      // Assuming front-end sends new images in order to replace
      blog.extraImages = blog.extraImages || [];

      newExtraImages.forEach((fileName, idx) => {
        blog.extraImages[idx] = fileName; // replace only the index provided
      });
    }

    await blog.save();

    res.json({ message: "Blog updated", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error while updating blog" });
  }
});




app.post("/api/sliders", upload.fields([
  { name: "image", maxCount: 1 },         // Background image
  { name: "overlayImage", maxCount: 1 }   // Right-side overlay image
]), async (req, res) => {
  try {
    const tag = req.body.tag || "";
    const text = req.body.text || "";

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Background image is required" });
    }

    const slider = new Slider({
      tag,
      text,
      imageUrl: `/uploads/${req.files.image[0].filename}`,
      overlayImageUrl: req.files.overlayImage
        ? `/uploads/${req.files.overlayImage[0].filename}`
        : ""
    });

    await slider.save();
    res.status(201).json({ message: "Slider added successfully", slider });
  } catch (err) {
    console.error("Slider upload error:", err);
    res.status(500).json({ message: "Failed to upload slider" });
  }
});


// Get all sliders
app.get("/api/sliders", async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sliders" });
  }
});

// Delete slider by ID
app.delete("/api/sliders/:id", async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Slider deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
});

// UPDATE Slider
app.put("/api/sliders/:id", upload.fields([
  { name: "image", maxCount: 1 },        // Background image
  { name: "overlayImage", maxCount: 1 }, // Overlay image
]), async (req, res) => {
  try {
    const { tag, text } = req.body;

    // Find the existing slider
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: "Slider not found" });
    }

    // Update text fields
    if (tag !== undefined) slider.tag = tag;
    if (text !== undefined) slider.text = text;

    // Update background image if uploaded
    if (req.files && req.files.image) {
      slider.imageUrl = `/uploads/${req.files.image[0].filename}`;
    }

    // Update overlay image if uploaded
    if (req.files && req.files.overlayImage) {
      slider.overlayImageUrl = `/uploads/${req.files.overlayImage[0].filename}`;
    }

    await slider.save();
    res.json({ message: "Slider updated successfully", slider });
  } catch (err) {
    console.error("Slider update error:", err);
    res.status(500).json({ message: "Failed to update slider" });
  }
});


// Upload a new slider (background + overlay)
app.post(
  "/api/sliders",
  upload.fields([
    { name: "image", maxCount: 1 }, // Background
    { name: "overlayImage", maxCount: 1 }, // Overlay
  ]),
  async (req, res) => {
    try {
      const { text, tag } = req.body;

      if (!req.files || !req.files["image"]) {
        return res.status(400).json({ message: "Background image is required" });
      }

      const slider = new Slider({
        tag: tag || "",
        imageUrl: `/uploads/${req.files["image"][0].filename}`,
        overlayImageUrl: req.files["overlayImage"]
          ? `/uploads/${req.files["overlayImage"][0].filename}`
          : "",
        text: text || "",
      });

      await slider.save();
      res.status(201).json({ message: "Slider added successfully", slider });
    } catch (err) {
      console.error("Slider upload error:", err);
      res.status(500).json({ message: "Failed to upload slider" });
    }
  }
);


// Get all gallery images
app.get("/api/gallery", async (req, res) => {
  const { folder } = req.query;
  const filter = folder ? { folder } : {};
  const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
  res.json(images);
});

//delte api for Gallery
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Extract filename from image URL
    const filename = image.url.split("/uploads/")[1];
    const filePath = path.join(__dirname, "uploads", filename);

    // Delete file from filesystem
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("File deletion error:", err.message);
        // You can still delete the DB entry if the file is already gone
      }

      // Delete from MongoDB
      await GalleryImage.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Image and file deleted" });
    });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
});


// Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Failed to post job" });
  }
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Update a job by ID
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Job updated", job });
  } catch (err) {
    res.status(500).json({ message: "Error updating job", error: err.message });
  }
});

// Delete a job by ID
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
});


// ----- LOGIN ROUTE -----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt:", email, password);
    const user = await Admin.findOne({ password: password });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      email: user.email,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----- CAREER ROUTE -----
app.post("/send-career", upload.single("resume"), (req, res) => {
  const { name, email, phone } = req.body;
  const resume = req.file;

  if (!name || !email || !phone || !resume) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptions = {
    from: email,
    to: "nn1528523@gmail.com",
    subject: "New Career Application",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}`,
    attachments: [
      {
        filename: resume.originalname,
        content: resume.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to send application", error: err.message });
    return res
      .status(200)
      .json({
        message: "Application submitted successfully",
        info: info.response,
      });
  });
});

// ----- CONTACT ROUTE -----
app.post("/send-email", async (req, res) => {
  const { fullname, email, phone, description, subject } = req.body;
  if (!fullname || !email || !phone || !description || !subject) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Save to DB
    const newContact = new Contact({
      name: fullname,
      email,
      phone,
      message: description,
    });
    await newContact.save();

    // Send mail
    const mailOptions = {
      from: email,
      to: "nn1528523@gmail.com",
      subject: "New Contact Form Submission",
      text: `\nName: ${fullname}\nEmail: ${email}\nSubject: ${subject}\nPhone: ${phone}\nMessage: ${description}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent and saved successfully", contact: newContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit contact form", error: error.message });
  }
});

// ----- GET ALL CONTACTS -----
app.get("/api/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.status(200).json(contacts);
});


// ----- DELETE CONTACT BY ID -----
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ message: "Failed to delete contact", error: err.message });
  }
});

// ----- UPDATE CONTACT BY ID -----
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, message },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact updated successfully", contact: updated });
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ message: "Failed to update contact", error: err.message });
  }
});





// ----- FEEDBACK ROUTE -----
app.post("/send-feedback", (req, res) => {
  const { name, email, phone, address, feedback } = req.body;
  if (!name || !email || !phone || !address || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptions = {
    from: email,
    to: "nn1528523@gmail.com",
    subject: "New Feedback Form Submission",
    text: `\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nFeedback: ${feedback}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to send feedback", error: err.message });
    return res
      .status(200)
      .json({ message: "Feedback sent successfully", info: info.response });
  });
});




// ----- STATIC FILE SERVING -----
app.use(express.static(path.join(__dirname, "/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

// ----- START SERVER -----
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
