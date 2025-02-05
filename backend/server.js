const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://healthnet-seven.vercel.app",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    headers: ["Content-Type", "Authorization"],
  })
);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },

  contact: {
    type: String,
    required: true,
  },

  DOB: {
    type: String,
    required: true,
  },

  bloodType: {
    type: String,
    required: true,
  },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

const formSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  contactnumber: { type: String, required: true },
  email: { type: String, required: true },
  tag: { type: String, required: true },
  bloodType: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

});

const Form = mongoose.model("Form", formSchema);


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

app.post("/api/register", async (req, res) => {
  try {
    const {
      fullname,
      contact,
      DOB,
      bloodType,
      email,
      password,
      
      
    } = req.body;
    const user = new User({
      fullname,
      contact,
      DOB,
      bloodType,
      email,
      password,
     
      
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_TOKEN,
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/delete/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});


app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/uploadform", authenticateToken, async (req, res) => {
  try {
    const {
      fullname,
      contactnumber,
      email,
      tag,
      bloodType,
      age,
      weight,
      gender,
      address,
      userId
     
    } = req.body;
    const form = new Form({
      fullname,
      contactnumber,
      email,
      tag,
      bloodType,
      age,
      weight,
      gender,
      address,
      userId
    
    });
    await form.save();
    res.status(201).json({ message: "Form uploaded successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/getform", async (req, res) => {
  const { tag } = req.query;
  const data = await Form.find({ tag: tag });
  res.status(200).json(data);
});


app.get("/api/myforms/:id",authenticateToken ,async (req, res) => {
  const userId = req.user.id;

  try {
    const forms = await Form.find({ userId }); 
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: "Error fetchig forms", error });
  }
});

app.delete("/api/deleteform/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.status(200).json({ message: "Form deleted successfully", form: deletedForm });
  } catch (error) {
    console.error("Error during form deletion:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});


app.put("/api/updatepassword", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, password } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error during update:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }

});


const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
