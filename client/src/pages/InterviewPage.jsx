import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api';

// Reusable PillButton component
const PillButton = ({ label, selected, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
      transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      ${selected 
        ? 'bg-black text-white shadow-md' 
        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {label}
  </button>
);

// Reusable SearchInput component
const SearchInput = ({ placeholder, value, onChange }) => (
  <div className="relative mb-4">
    <svg 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
    />
  </div>
);

// Selection Section component
const SelectionSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

export default function InterviewPage() {
  const navigate = useNavigate();
  const { id: interviewId } = useParams();
  
  // Loading states for API mode
  const [loading, setLoading] = useState(!!interviewId);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Interview data from API (for application mode)
  const [interviewData, setInterviewData] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Interview session state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Auto-start practice interview if no ID, or fetch interview if ID exists
  useEffect(() => {
    async function fetchOrStartInterview() {
      if (interviewId) {
        // Fetch existing interview
        try {
          setLoading(true);
          setError('');
          console.log('Fetching interview:', interviewId);
          const data = await api.getInterview(interviewId);
          console.log('Interview data received:', data);
          
          if (!data) {
            throw new Error('No data received from server');
          }
          
          if (data.status === 'completed') {
            navigate(`/report/${interviewId}`, { replace: true });
            return;
          }
          
          setInterviewData(data);
          
          // Ensure questions array exists and has items
          const questionsList = data.questions || [];
          console.log('Questions list:', questionsList);
          if (questionsList.length === 0) {
            throw new Error('No questions found for this interview');
          }
          
          setQuestions(questionsList);
          setQuestionIndex(data.currentQuestionIndex || 0);
          setJobTitle(data.jobTitle || '');
          setCompanyName(data.companyName || '');
          
          // Restore existing answers
          const existingAnswers = {};
          (data.answers || []).forEach(a => {
            existingAnswers[a.questionId] = a.transcript;
          });
          setAnswers(existingAnswers);
          
          // Auto-start interview when we have data from API
          setInterviewStarted(true);
          setLoading(false);
        } catch (err) {
          console.error('Failed to load interview:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            interviewId: interviewId
          });
          setError(err.message || 'Failed to load interview. Please try again.');
          setLoading(false);
          setInterviewStarted(false);
        }
      } else {
        // No ID - auto-start a practice interview
        try {
          setLoading(true);
          setError('');
          const data = await api.startInterview();
          
          if (data && data.interviewId) {
            // Redirect to the interview with ID
            navigate(`/interview/${data.interviewId}`, { replace: true });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (err) {
          console.error('Failed to start interview:', err);
          setError(err.message || 'Failed to start interview. Please try again.');
          setLoading(false);
        }
      }
    }
    
    fetchOrStartInterview();
  }, [interviewId, navigate]);

  // Load saved answer when question changes
  useEffect(() => {
    if (questions[questionIndex]) {
      const questionId = questions[questionIndex].id;
      setAnswer(answers[questionId] || '');
    }
  }, [questionIndex, questions, answers]);

  // Initialize webcam
  useEffect(() => {
    if (interviewStarted && videoEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          setVideoEnabled(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewStarted, videoEnabled]);


  const handleSubmitAnswer = async (skipped = false) => {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return;
    
    // Save answer locally
    if (!skipped) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
    }
    
    // If we have an interview ID, submit to API
    if (interviewId) {
      try {
        setSubmitting(true);
        setError('');
        
        const result = await api.submitAnswer(
          interviewId,
          currentQuestion.id,
          skipped ? '' : answer,
          skipped
        );
        
        // Auto-complete: if backend says completed, go to report
        if (result.completed) {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          navigate(`/report/${interviewId}`);
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to submit answer');
        setSubmitting(false);
        return;
      } finally {
        setSubmitting(false);
      }
    }
    
    // Move to next question
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setAnswer('');
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    handleSubmitAnswer(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [questions[questionIndex].id]: answer,
        }));
      }
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handleEndInterview = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    if (interviewId) {
      try {
        await api.completeInterview(interviewId);
        navigate(`/report/${interviewId}`);
      } catch (err) {
        console.error('Failed to complete:', err);
        navigate(`/report/${interviewId}`);
      }
    } else {
      // Practice mode - just go to home
      navigate('/home');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current && streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const currentQuestion = questions[questionIndex];

  // Loading state (API mode)
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Error state (API mode) - show if we have an error and haven't started the interview
  if (error && !interviewStarted && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Interview</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have an interview ID but no questions and not loading, something went wrong
  if (interviewId && !loading && questions.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-4">This interview doesn't have any questions yet.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If no interview ID and not loading, we should have auto-started
  // If we get here, there was an error - show error state
  if (!interviewStarted && !interviewId && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <p className="text-red-500 mb-4">{error || 'Failed to start interview'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: if we have interviewId but interview hasn't started and we're not loading, show loading
  if (interviewId && !interviewStarted && !loading && !error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing interview...</p>
        </div>
      </div>
    );
  }

  // Safety check: if interview started but no questions, show error
  if (interviewStarted && questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-4">This interview doesn't have any questions.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Interview Session Page (after interview starts)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            InterviewAI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {companyName || 'Company'} • {jobTitle || 'Interview'}
            </span>
            <button
              onClick={handleEndInterview}
              disabled={submitting}
              className="px-4 py-2 text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
            >
              End Interview
            </button>
          </div>
        </div>
      </nav>

      {/* Interview Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Webcam Video Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Video Feed</h2>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                  ${videoEnabled 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {videoEnabled ? 'Disable Video' : 'Enable Video'}
              </button>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video border border-gray-200">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video Disabled
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">Recording in progress</span>
              </div>
            </div>
          </div>

          {/* Question & Answer Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {questionIndex + 1} of {questions.length}
                </h2>
                {currentQuestion?.type && (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full
                    ${currentQuestion.type === 'technical' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {currentQuestion.type}
                  </span>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                <div 
                  className="bg-black h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-gray-900 text-lg leading-relaxed">{currentQuestion?.text || ''}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Type your answer here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={!answer.trim() || submitting}
                className={`flex-1 px-6 py-3 rounded-full font-medium transition-all duration-200
                  ${answer.trim() && !submitting
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="px-6 py-3 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium rounded-full transition-all duration-200 disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2024 InterviewAI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
