import express from 'express'
import { uploadCV, getCV, upload } from '../controllers/cvController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/upload', protect, upload.single('cv'), uploadCV)
router.get('/', protect, getCV)

export default router