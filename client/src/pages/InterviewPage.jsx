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
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-black rounded-lg shadow-xl p-8 border border-white text-center">
            <p className="text-white mb-4">{error}</p>
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
          {/* Webcam Video Panel */}
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Video Feed</h2>
              <button
                onClick={toggleVideo}
                className="px-3 py-1 text-sm bg-white hover:bg-gray-200 text-black rounded-md transition-colors"
              >
                {videoEnabled ? 'Disable Video' : 'Enable Video'}
              </button>
            </div>
            <div className="bg-white rounded-lg overflow-hidden aspect-video border border-white">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black">
                  Video Disabled
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-white rounded-md border border-white">
              <p className="text-sm text-black">
                🔊 Audio: <span className="text-black">Active</span>
              </p>
            </div>
          </div>

          {/* Question & Answer Panel */}
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">
                  Question {questionIndex + 1}/{questions.length}
                </h2>
                <span className="text-xs px-2 py-1 rounded bg-white text-black">
                  {currentQuestion?.type || 'behavioral'}
                </span>
              </div>
              <div className="bg-black rounded-md p-4 border border-white mb-4">
                <p className="text-white text-lg">{currentQuestion?.text}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-white mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                disabled={submitting}
                className="w-full px-4 py-3 bg-black border border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none disabled:opacity-50"
                placeholder="Type your answer here..."
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-black border border-white rounded-md">
                <p className="text-white text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={!answer.trim() || submitting}
                className="flex-1 px-4 py-2 bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-medium rounded-md transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors disabled:opacity-50"
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
                className="flex-1 px-4 py-2 border border-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-gray-300 font-medium rounded-md transition-colors"
              >
                Next →
              </button>
            </div>

            <button
              onClick={handleEndInterview}
              disabled={submitting}
              className="w-full mt-4 px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Finishing...' : 'End Interview'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
