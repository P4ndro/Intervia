import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api';

export default function InterviewPage() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState({}); // questionId -> transcript
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Free TTS Interviewer (browser-based, no API costs)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  // Fetch interview data on mount
  useEffect(() => {
    async function fetchInterview() {
      try {
        setLoading(true);
        const data = await api.getInterview(interviewId);
        
        if (data.status === 'completed') {
          // Interview already completed, redirect to report
          navigate(`/report/${interviewId}`, { replace: true });
          return;
        }
        
        setQuestions(data.questions);
        setQuestionIndex(data.currentQuestionIndex || 0);
        
        // Restore any existing answers
        const existingAnswers = {};
        (data.answers || []).forEach(a => {
          existingAnswers[a.questionId] = a.transcript;
        });
        setAnswers(existingAnswers);
        
      } catch (err) {
        setError(err.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    }
    
    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId, navigate]);

  // Initialize webcam
  useEffect(() => {
    if (!loading && videoEnabled) {
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
  }, [loading, videoEnabled]);

  // Load saved answer when question changes
  useEffect(() => {
    if (questions[questionIndex]) {
      const questionId = questions[questionIndex].id;
      setAnswer(answers[questionId] || '');
    }
  }, [questionIndex, questions, answers]);

  const currentQuestion = questions[questionIndex];

  // Free TTS: Speak question when it changes (browser Web Speech API - 100% free)
  useEffect(() => {
    if (currentQuestion?.text && !loading) {
      speakQuestion(currentQuestion.text);
    }

    // Cleanup: stop speaking when component unmounts or question changes
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, loading]);

  // Load voices (some browsers need this)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakQuestion = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Browser does not support speech synthesis');
      return;
    }

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice (use system default or find a good one)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Zira') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Handle events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSubmitAnswer = async (skipped = false) => {
    if (!currentQuestion) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const result = await api.submitAnswer(
        interviewId,
        currentQuestion.id,
        skipped ? '' : answer,
        skipped
      );
      
      // Save answer locally
      if (!skipped) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      
      // Auto-complete: if backend says completed, go to report
      if (result.completed) {
        // Stop webcam
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        navigate(`/report/${interviewId}`);
        return;
      }
      
      // Move to next question
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        setAnswer('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = () => {
    handleSubmitAnswer(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      // Save current answer state locally (without submitting to API)
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      // Save current answer state locally
      if (answer.trim()) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleEndInterview = async () => {
    try {
      setSubmitting(true);
      
      // Stop webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      // Complete interview
      await api.completeInterview(interviewId);
      
      // Navigate to report
      navigate(`/report/${interviewId}`);
    } catch (err) {
      setError(err.message || 'Failed to complete interview');
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <p className="text-slate-400">Loading interview...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Interviewer Panel (Free TTS) */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Your Interviewer</h2>
              {isSpeaking && (
                <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded">
                  🔊 Speaking
                </span>
              )}
            </div>
            
            {/* Interviewer Avatar */}
            <div className={`relative bg-gradient-to-br from-emerald-900 to-blue-900 rounded-lg overflow-hidden aspect-video border-2 transition-all ${
              isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-slate-700'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center transition-transform ${
                    isSpeaking ? 'scale-110' : 'scale-100'
                  }`}>
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">AI Interviewer</p>
                </div>
              </div>
              
              {/* Speaking animation */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-6 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-8 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-6 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => speakQuestion(currentQuestion?.text || '')}
                disabled={isSpeaking}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md text-white text-sm font-medium transition"
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊 Replay Question'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium transition"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
          </div>

          {/* Webcam Video Panel */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Video Feed</h2>
              <button
                onClick={toggleVideo}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                {videoEnabled ? 'Disable Video' : 'Enable Video'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video border border-slate-700">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Video Disabled
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-slate-900 rounded-md border border-slate-700">
              <p className="text-sm text-slate-400">
                🔊 Audio: <span className="text-emerald-400">Active</span>
              </p>
            </div>
          </div>

          {/* Question & Answer Panel */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">
                  Question {questionIndex + 1}/{questions.length}
                </h2>
                <span className={`text-xs px-2 py-1 rounded ${
                  currentQuestion?.type === 'technical' 
                    ? 'bg-blue-900/50 text-blue-400' 
                    : 'bg-emerald-900/50 text-emerald-400'
                }`}>
                  {currentQuestion?.type || 'behavioral'}
                </span>
              </div>
              <div className="bg-slate-900 rounded-md p-4 border border-slate-700 mb-4">
                <p className="text-white text-lg">{currentQuestion?.text}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                disabled={submitting}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none disabled:opacity-50"
                placeholder="Type your answer here..."
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={!answer.trim() || submitting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                Skip
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={handlePrevQuestion}
                disabled={questionIndex === 0 || submitting}
                className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white font-medium rounded-md transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={questionIndex >= questions.length - 1 || submitting}
                className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white font-medium rounded-md transition-colors"
              >
                Next →
              </button>
            </div>

            <button
              onClick={handleEndInterview}
              disabled={submitting}
              className="w-full mt-4 px-4 py-2 border border-red-600 hover:border-red-500 text-red-400 hover:text-red-300 font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Finishing...' : 'End Interview'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
