import dotenv from 'dotenv'
dotenv.config()

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  mailtrap: {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME, 
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,     
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
}

export default config