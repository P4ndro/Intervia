import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function InterviewPage() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // Mock AI questions - TODO: Replace with actual AI-generated questions from backend
  const questions = [
    'Tell me about yourself and your experience.',
    'What are your greatest strengths?',
    'Describe a challenging project you worked on.',
    'How do you handle tight deadlines?',
    'Why do you want to work for this company?',
  ];

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
      // Cleanup: stop webcam stream when component unmounts or interview ends
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewStarted, videoEnabled]);

  const handleStartInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestion(questions[0]);
    setQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setAnswer(''); // Clear previous answer
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const handleSubmitAnswer = async () => {
    // TODO: Send answer to backend/API for analysis
    // TODO: Process video/audio for failure mode detection
    console.log('Answer submitted:', answer);
    handleNextQuestion();
  };

  const handleEndInterview = () => {
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    // TODO: End interview session and generate report
    navigate('/report');
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!interviewStarted ? (
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">AI Interview</h1>
            <p className="text-slate-400 mb-8">
              Get ready for your interview. You'll be asked a series of questions.
              <br />
              Make sure your webcam and microphone are ready.
            </p>
            <button
              onClick={handleStartInterview}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-medium rounded-lg transition-colors"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
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
              {/* TODO: Add TTS placeholder - Text-to-Speech for questions */}
              <div className="mt-4 p-3 bg-slate-900 rounded-md border border-slate-700">
                <p className="text-sm text-slate-400">
                  🔊 Audio: <span className="text-emerald-400">Active</span>
                  <br />
                  <span className="text-xs">TTS placeholder - Add text-to-speech integration here</span>
                </p>
              </div>
            </div>

            {/* Question & Answer Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-white">Question {questionIndex + 1}/{questions.length}</h2>
                  <span className="text-sm text-slate-400">AI Generated</span>
                </div>
                <div className="bg-slate-900 rounded-md p-4 border border-slate-700 mb-4">
                  <p className="text-white text-lg">{currentQuestion}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  placeholder="Type your answer here... (AI will analyze for failure modes)"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                >
                  Submit Answer
                </button>
                <button
                  onClick={handleSkipQuestion}
                  className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={questionIndex >= questions.length - 1}
                  className="px-4 py-2 border border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white font-medium rounded-md transition-colors"
                >
                  Next
                </button>
              </div>

              <button
                onClick={handleEndInterview}
                className="w-full mt-4 px-4 py-2 border border-red-600 hover:border-red-500 text-red-400 hover:text-red-300 font-medium rounded-md transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

