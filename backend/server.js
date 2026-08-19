import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import config from './config.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js' 
import uploadRoutes from './routes/uploadRoutes.js'
import skillRoutes from './routes/skillRoutes.js' 
import cvRoutes from './routes/cvRoutes.js'
import mlRoutes from './routes/mlRoutes.js'
import recommendationRoutes from "./routes/recommendationRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SkillBridge API is running! 🚀' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes) 
app.use('/api/upload', uploadRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/cv', cvRoutes)
app.use("/api/ml", mlRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

// Connect to MongoDB and start server
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected!')
    app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port}`)
    })
  })
  .catch((err) => {
    console.log('❌ Connection failed:', err.message)
  })