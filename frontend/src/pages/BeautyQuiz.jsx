import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './BeautyQuiz.css'
import { API_BASE } from '../config'

function BeautyQuiz({ token }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    skinType: '',
    hairType: '',
    budget: '',
    occasion: '',
    style: '',
    concerns: []
  })
  const navigate = useNavigate()

  const questions = [
    {
      id: 'skinType',
      question: 'What is your skin type?',
      options: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
    },
    {
      id: 'hairType',
      question: 'What is your hair type?',
      options: ['Straight', 'Wavy', 'Curly', 'Coily', 'Damaged']
    },
    {
      id: 'budget',
      question: 'What is your monthly beauty budget? (in ₪)',
      options: ['Under 100', '100-200', '200-400', '400-600', '600+']
    },
    {
      id: 'occasion',
      question: 'What occasion do you need beauty products for?',
      options: ['University/Daily', 'Party', 'Wedding', 'Work', 'Special Event']
    },
    {
      id: 'style',
      question: 'What makeup style do you prefer?',
      options: ['Natural/No Makeup', 'Natural Makeup', 'Glamorous', 'Bold/Edgy', 'Classic']
    }
  ]

  const handleAnswer = (value) => {
    setAnswers({...answers, [questions[step].id]: value})
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    try {
      const budgetMap = {
        'Under 100': 100,
        '100-200': 200,
        '200-400': 400,
        '400-600': 600,
        '600+': 700
      }

      const profileData = {
        skinType: answers.skinType.toLowerCase(),
        hairType: answers.hairType.toLowerCase(),
        budget: budgetMap[answers.budget],
        preferences: {
          occasion: answers.occasion,
          style: answers.style,
          concerns: answers.concerns
        }
      }

      if (token) {
        await axios.post(`${API_BASE}/profile`, profileData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      navigate('/recommendations', { state: { profile: profileData } })
    } catch (error) {
      console.error('Error saving profile:', error)
      navigate('/recommendations', { state: { profile: answers } })
    }
  }

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <div className="quiz-container">
      <h2>Beauty Quiz 💕</h2>
      <p className="quiz-subtitle">Let's find your perfect beauty routine!</p>
      
      <div className="progress-bar">
        <div className="progress" style={{width: `${((step + 1) / questions.length) * 100}%`}}></div>
      </div>

      <div className="quiz-question">
        <h3>{questions[step].question}</h3>
        <div className="quiz-options">
          {questions[step].options.map((option, index) => (
            <button
              key={index}
              className="quiz-option"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        {step > 0 && (
          <button onClick={goBack} className="btn btn-secondary">Back</button>
        )}
        <span className="step-indicator">Step {step + 1} of {questions.length}</span>
      </div>
    </div>
  )
}

export default BeautyQuiz