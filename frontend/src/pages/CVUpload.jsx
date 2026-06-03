import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader.jsx'
import config from '../config'

export default function CVUpload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState([])
  const [cvUrl, setCvUrl] = useState(null)
  const [addingSkills, setAddingSkills] = useState(false)
  const [addedCount, setAddedCount] = useState(0)

const user = JSON.parse(localStorage.getItem('user'))
const token = user?.token

  // Fetch existing CV on page load
  useEffect(() => {
    const fetchCV = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/cv`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data.cvUrl) setCvUrl(res.data.cvUrl)
      } catch (err) {
        console.error('Failed to fetch CV:', err)
      }
    }
    fetchCV()
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      setMessage(null)
    } else {
      setMessage({ type: 'error', text: 'Please select a valid PDF file.' })
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file first.' })
      return
    }

    setUploading(true)
    setMessage(null)
    setExtractedSkills([])

    const formData = new FormData()
    formData.append('cv', file)

    try {
      const res = await axios.post(`${config.apiUrl}/cv/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setCvUrl(res.data.cvUrl)
      setExtractedSkills(res.data.extractedSkills)
      setMessage({ type: 'success', text: 'CV uploaded and skills extracted successfully!' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Upload failed. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleAddSkills = async () => {
  setAddingSkills(true)
  let count = 0

  for (const skill of extractedSkills) {
    try {
      await axios.post(
        `${config.apiUrl}/skills`,
        skill,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      count++
      // Small delay between each request to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (err) {
      console.log(`Skipped: ${skill.name} — ${err.response?.data?.message}`)
    }
  }

  setAddedCount(count)
  setAddingSkills(false)
  setMessage({
    type: 'success',
    text: `${count} skills added to your profile! Redirecting to Skills...`,
  })

  setTimeout(() => navigate('/skills'), 2000)
}

  const categoryColors = {
    Frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Backend: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Database: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    DevOps: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    Mobile: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'AI/ML': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    Cloud: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <PageHeader 
          icon={FileText} 
          title="CV Upload" 
          description="Upload your CV and let AI extract your skills automatically" 
        />

        {/* Upload Card */}
        <Card>
          <div className="space-y-4">

            {/* Current CV */}
            {cvUrl && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <FileText className="text-green-600 dark:text-green-400" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Current CV uploaded
                  </p>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-600 dark:text-green-400 underline truncate block"
                  >
                    View CV
                  </a>
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
              <Upload className="text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file ? file.name : 'Click to select your CV (PDF only)'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Message */}
            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle size={16} />
                  : <AlertCircle size={16} />
                }
                {message.text}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading & Extracting Skills...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Upload & Extract Skills
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Extracted Skills */}
        {extractedSkills.length > 0 && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Extracted Skills ({extractedSkills.length})
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {skill.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${categoryColors[skill.category] || categoryColors.Other}`}>
                      {skill.category}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSkills}
                disabled={addingSkills}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {addingSkills ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Skills to Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Add All Skills to My Profile
                  </>
                )}
              </button>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  )
}