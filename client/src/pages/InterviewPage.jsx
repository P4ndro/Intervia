import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
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
  
  // STT (Speech-to-Text) - DISABLED for now (only TTS enabled)
  const isRecording = false;
  const recognitionSupported = false;
  const interimTranscript = '';
  const recognitionRef = useRef(null);
  
  // Timer state: 2 minutes = 120 seconds
  const [timeRemaining, setTimeRemaining] = useState(120);
  const timerIntervalRef = useRef(null);
  const answerRef = useRef('');
  const answersRef = useRef({});

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
      // Stop recording when question changes - DISABLED (STT is disabled)
      // if (isRecording) {
      //   setIsRecording(false);
      // }
      // Auto-start recording - DISABLED (STT is disabled)
      // if (recognitionSupported && !answers[questionId]) {
      //   const timer = setTimeout(() => {
      //     if (!isRecording) {
      //       startRecording();
      //     }
      //   }, 2000);
      //   return () => clearTimeout(timer);
      // }
    }
  }, [questionIndex, questions, answers]);

  // Keep refs in sync with state (for timer access without dependencies)
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Timer effect: countdown and auto-submit
  useEffect(() => {
    // Reset timer when question changes
    setTimeRemaining(120);
    
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    const currentQ = questions[questionIndex];
    
    // Don't start timer if submitting or no current question
    if (submitting || !currentQ) {
      return;
    }
    
    // Start countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0, auto-submit
          clearInterval(timerIntervalRef.current);
          // Auto-submit logic (inline to avoid dependency issues)
          const autoSubmit = async () => {
            const q = questions[questionIndex];
            if (!q) return;
            
            try {
              setSubmitting(true);
              setError('');
              
              // Get current answer value from refs (always up-to-date, no dependency needed)
              const currentAnswer = answersRef.current[q.id] || answerRef.current || '';
              
              const result = await api.submitAnswer(
                interviewId,
                q.id,
                currentAnswer,
                false
              );
              
              // Save answer locally
              if (currentAnswer.trim()) {
                setAnswers(prev => ({
                  ...prev,
                  [q.id]: currentAnswer,
                }));
              }
              
              // Auto-complete: if backend says completed, go to report
              if (result.completed) {
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
                setTimeRemaining(120);
              }
            } catch (err) {
              setError(err.message || 'Failed to submit answer');
            } finally {
              setSubmitting(false);
            }
          };
          
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup on unmount or question change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [questionIndex, questions, submitting, interviewId, navigate]);

  const currentQuestion = questions[questionIndex];
  
  // Check if current question is code-based and detect language
  const isCodeQuestion = currentQuestion && (
    currentQuestion.type === 'coding' ||
    currentQuestion.category?.toLowerCase() === 'coding'
  );
  
  // Detect programming language from question text
  const detectLanguage = () => {
    if (!currentQuestion?.text) return 'javascript';
    const text = currentQuestion.text.toLowerCase();
    if (text.includes('python')) return 'python';
    if (text.includes('java') && !text.includes('javascript')) return 'java';
    if (text.includes('c++') || text.includes('cpp')) return 'cpp';
    if (text.includes('c#') || text.includes('csharp')) return 'csharp';
    if (text.includes('typescript')) return 'typescript';
    if (text.includes('go ') || text.includes('golang')) return 'go';
    if (text.includes('rust')) return 'rust';
    if (text.includes('ruby')) return 'ruby';
    if (text.includes('php')) return 'php';
    if (text.includes('swift')) return 'swift';
    if (text.includes('kotlin')) return 'kotlin';
    return 'javascript'; // Default to JavaScript
  };
  
  const codeLanguage = isCodeQuestion ? detectLanguage() : 'javascript';

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

  // STT (Speech-to-Text) - DISABLED for now (only TTS enabled)
  // Initialize Speech Recognition (STT) - COMMENTED OUT
  useEffect(() => {
    // STT disabled - only TTS (text-to-speech) is enabled
    // Browser will speak questions to you, but you need to type answers manually
    return () => {
      // Cleanup - stop TTS on unmount
      window.speechSynthesis.cancel();
    };
  }, []); // Only run once on mount
  
  /* COMMENTED OUT - STT INITIALIZATION
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      
      // Initialize recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true; // Show interim results as you speak
      recognition.lang = 'en-US'; // Language
      recognition.maxAlternatives = 1; // Only get the best result
      
      // Handle results - converts your speech to text in real-time
      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';
        
        // Process all results from the current index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Final transcript - this is confirmed speech, add to answer
            finalText += transcript + ' ';
          } else {
            // Interim transcript - shows as you speak (real-time)
            interimText += transcript;
          }
        }
        
        // Add final transcript to answer (permanent)
        if (finalText.trim()) {
          setAnswer(prev => {
            // Avoid duplicates - check if this text is already at the end
            const trimmed = finalText.trim();
            if (prev.endsWith(trimmed)) {
              return prev;
            }
            // Add with space if there's existing text
            return prev + (prev && !prev.endsWith(' ') ? ' ' : '') + trimmed;
          });
          // Clear interim after adding final
          setInterimTranscript('');
        } else {
          // Show interim transcript in real-time as you speak
          setInterimTranscript(interimText);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // No speech detected - this is normal, just continue
          return;
        } else if (event.error === 'network') {
          // Network error - but don't give up immediately, try to recover
          const isOnline = navigator.onLine;
          if (!isOnline) {
            setHasNetworkError(true);
            setError('No internet connection detected. Speech recognition requires Wi-Fi or mobile data. Please connect to the internet.');
            setIsRecording(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {}
            }
          } else {
            // Online but network error - might be temporary, try to recover automatically
            console.warn('Network error but browser says online - attempting automatic recovery');
            setIsRecovering(true);
            setError('Network issue detected. Attempting to reconnect...');
            
            // Don't stop immediately - try multiple times to recover
            let retryCount = 0;
            const maxRetries = 5; // Try up to 5 times
            
            const attemptRecovery = () => {
              if (isRecording && recognitionRef.current && navigator.onLine && retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  if (isRecording && recognitionRef.current && navigator.onLine) {
                    try {
                      recognitionRef.current.start();
                      // Success! Clear error and recovery state
                      setError('');
                      setHasNetworkError(false);
                      setIsRecovering(false);
                      console.log('Speech recognition recovered successfully');
                    } catch (retryErr) {
                      // If retry fails, try again
                      if (retryCount < maxRetries) {
                        setError(`Reconnecting... (attempt ${retryCount + 1}/${maxRetries})`);
                        attemptRecovery();
                      } else {
                        // All retries failed - show error
                        setHasNetworkError(true);
                        setIsRecovering(false);
                        setError('Network error: Unable to connect to speech recognition service after multiple attempts. Your connection may be slow or unstable. Please check your internet and try again, or type your answer manually.');
                        setIsRecording(false);
                      }
                    }
                  } else {
                    setIsRecovering(false);
                  }
                }, 1500 * retryCount); // Increasing delay between retries (1.5s, 3s, 4.5s, etc.)
              } else {
                setIsRecovering(false);
              }
            };
            
            // Start recovery attempts
            attemptRecovery();
          }
        } else if (event.error === 'audio-capture') {
          setError('Microphone not accessible. Please check permissions.');
          setIsRecording(false);
        } else if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
          setIsRecording(false);
        } else if (event.error === 'aborted') {
          // Recognition was aborted - this is normal when stopping
          return;
        } else {
          setError(`Speech recognition error: ${event.error}. Please check your internet connection.`);
          setIsRecording(false);
        }
      };
      
      recognition.onend = () => {
        // CRITICAL: Recognition stops automatically after periods of silence
        // We MUST restart it continuously to keep listening
        // If we're still supposed to be recording, restart immediately
        // But NOT if there was a network error (prevents infinite retry loop)
        if (isRecording && !hasNetworkError && recognitionRef.current) {
          // Use setTimeout to ensure recognition is fully stopped before restarting
          setTimeout(() => {
            if (isRecording && !hasNetworkError && recognitionRef.current) {
              try {
                // Restart to keep listening - this is essential for continuous recording
                recognitionRef.current.start();
              } catch (err) {
                // If already starting (InvalidStateError), that's fine - it will work
                // Only log real errors
                if (err.name !== 'InvalidStateError') {
                  console.error('Error restarting recognition:', err);
                  // If it's a network error, stop trying
                  if (err.message && err.message.includes('network')) {
                    setHasNetworkError(true);
                    setIsRecording(false);
                  } else {
                    // For other errors, try once more after a delay
                    setTimeout(() => {
                      if (isRecording && !hasNetworkError && recognitionRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (retryErr) {
                          // If still failing, might be a real error
                          if (retryErr.name !== 'InvalidStateError') {
                            console.error('Retry failed:', retryErr);
                          }
                        }
                      }
                    }, 1000);
                  }
                }
              }
            }
          }, 100); // Small delay to ensure clean restart
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Only run once on mount
  END OF COMMENTED OUT STT INITIALIZATION */

  // Handle recording state changes - DISABLED (STT is disabled)
  // useEffect(() => { ... }, [isRecording]);

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

  // STT Functions - DISABLED (only TTS enabled)
  const startRecording = () => {
    // STT disabled - please type your answer manually
  };
  
  const stopRecording = () => {
    // STT disabled
  };

  const handleSubmitAnswer = async (skipped = false) => {
    if (!currentQuestion) return;
    
    // Clear timer when submitting
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const result = await api.submitAnswer(
        interviewId,
        currentQuestion.id,
        skipped ? '' : answer,
        skipped
      );
      
      console.log('Submit answer result:', result); // Debug log
      
      // Save answer locally
      if (!skipped) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
      }
      
      // Check if interview is completed
      const isCompleted = result.completed || 
                         (result.allAnswered && result.answersCount >= questions.length) ||
                         (questionIndex === questions.length - 1 && result.answersCount >= questions.length);
      
      if (isCompleted) {
        console.log('Interview completed, navigating to report...'); // Debug log
        // Stop webcam
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        // Navigate to report immediately
        navigate(`/report/${interviewId}`, { replace: true });
        return;
      }
      
      // Move to next question (only if not completed)
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        setAnswer('');
        setTimeRemaining(120); // Reset timer for next question
      } else {
        // We're on the last question but backend didn't mark as completed
        // This shouldn't happen, but if it does, try to complete manually
        console.warn('Last question answered but interview not marked as completed');
        // Wait a moment and check again
        setTimeout(async () => {
          try {
            const interviewData = await api.getInterview(interviewId);
            if (interviewData.status === 'completed') {
              navigate(`/report/${interviewId}`, { replace: true });
            }
          } catch (err) {
            console.error('Error checking interview status:', err);
          }
        }, 500);
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-black rounded-lg shadow-xl p-8 border border-white text-center">
            <p className="text-white">Loading interview...</p>
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
              className="px-6 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
                <div className="flex items-center gap-3">
                  {/* Timer Display */}
                  <div className={`px-3 py-1 rounded-md font-mono font-semibold text-sm ${
                    timeRemaining <= 30 
                      ? 'bg-red-900/50 text-red-400 border border-red-700' 
                      : timeRemaining <= 60 
                      ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                      : 'bg-slate-700 text-emerald-400 border border-slate-600'
                  }`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    currentQuestion?.type === 'technical' || 
                    currentQuestion?.type === 'coding' || 
                    currentQuestion?.type === 'theoretical'
                      ? 'bg-blue-900/50 text-blue-400' 
                      : 'bg-emerald-900/50 text-emerald-400'
                  }`}>
                    {currentQuestion?.type || 'behavioral'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-900 rounded-md p-4 border border-slate-700 mb-4">
                <p className="text-white text-lg">{currentQuestion?.text}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Your Answer</label>
              {isCodeQuestion ? (
                <div className="border border-slate-600 rounded-md overflow-hidden">
                  <Editor
                    height="400px"
                    language={codeLanguage}
                    value={answer}
                    onChange={(value) => setAnswer(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      readOnly: submitting,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none disabled:opacity-50"
                  placeholder="Type your answer here..."
                />
              )}
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
                className="flex-1 px-4 py-2 border border-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-gray-300 font-medium rounded-md transition-colors"
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
