import { GoogleGenerativeAI } from '@google/generative-ai'
import config from '../config.js'

const genAI = new GoogleGenerativeAI(config.geminiApiKey)

export const extractSkillsFromText = async (cvText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
  You are an expert CV analyzer and software industry skills classifier.
  
  Extract all technical and professional skills from the following CV text.
  
  Return ONLY a valid JSON array of objects. No explanation. No markdown. No extra text.
  
  Each object must have exactly these fields:
  - "name": the skill name (string)
  - "category": classify CAREFULLY using these rules:
    * "Frontend" — HTML, CSS, JavaScript, React, Vue, Angular, Tailwind, Bootstrap, UI frameworks
    * "Backend" — Node.js, Python, Java, PHP, C++, Express, Django, Spring, REST APIs, server side
    * "Database" — MySQL, MongoDB, PostgreSQL, Firebase Firestore, SQL, NoSQL, Redis
    * "DevOps" — Docker, Kubernetes, CI/CD, Git, GitHub, Linux, Nginx, Jenkins
    * "Mobile" — Android, iOS, React Native, Flutter, Android Studio, Swift, Kotlin
    * "AI/ML" — Machine Learning, Deep Learning, TensorFlow, PyTorch, Scikit-learn, NLP, Data Science
    * "Cloud" — AWS, Azure, GCP, Firebase, Cloudinary, Vercel, Heroku, cloud services
    * "Other" — ONLY use this for soft skills like Teamwork, Communication, Leadership, Time Management
  - "level": estimate based on context:
    * "Beginner" — mentioned once, no projects
    * "Intermediate" — used in projects
    * "Advanced" — multiple projects or work experiences
  
  CV Text:
  ${cvText}
`

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  // Clean any markdown formatting Gemini might add
  const cleaned = response.replace(/```json|```/g, '').trim()

  return JSON.parse(cleaned)
}