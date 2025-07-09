import dotenv from 'dotenv';
dotenv.config();

export const adminLogin = (req, res) => {
  const { email, password } = req.body;
 console.log("💻 Admin Login Attempt:", email, password);
  console.log("🛠 Expected:", process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  const isAdmin = (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password)

  res.status(200).json({ success: isAdmin });
}