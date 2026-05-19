import multer from 'multer'
import cloudinary from '../utils/cloudinary.js'
import { createRequire } from 'module'
import { extractSkillsFromText } from '../utils/gemini.js'
import User from '../models/User.js'

// Store file in memory temporarily instead of saving to disk
const storage = multer.memoryStorage()

// Multer instance for handling CV uploads
const require = createRequire(import.meta.url)
const { PdfReader } = require('pdfreader')

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  },
})

export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Step 1 — Upload PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
            resource_type: 'auto',
            folder: 'skillbridge/cvs',
            format: 'pdf',
            access_mode: 'public',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    // Step 2 — Extract text from PDF buffer
    const cvText = await new Promise((resolve, reject) => {
    const reader = new PdfReader()
    let text = ''
    reader.parseBuffer(req.file.buffer, (err, item) => {
        if (err) reject(err)
        else if (!item) resolve(text)
        else if (item.text) text += item.text + ' '
    })
    })

    if (!cvText || cvText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF. Please upload a text-based PDF.' })
    }

    // Step 3 — Send text to Gemini and get skills
    const extractedSkills = await extractSkillsFromText(cvText)

    // Step 4 — Save CV URL to user profile
    await User.findByIdAndUpdate(req.user.id, {
      cvUrl: uploadResult.secure_url,
    })

    res.status(200).json({
      message: 'CV uploaded successfully',
      cvUrl: uploadResult.secure_url,
      extractedSkills,
    })
  } catch (error) {
    console.error('CV upload error:', error)
    res.status(500).json({ message: 'CV upload failed', error: error.message })
  }
}

export const getCV = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cvUrl')
    res.status(200).json({ cvUrl: user.cvUrl || null })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch CV', error: error.message })
  }
}