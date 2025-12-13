import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
  
  // Interview setup state
  const [setupState, setSetupState] = useState({
    company: '',
    level: '',
    role: '',
    skills: [],
    duration: 45
  });
  
  // Search states
  const [companySearch, setCompanySearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  
  // Interview session state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Data options
  const companies = ['TechCorp', 'InnovDesigns', 'MedGen', 'StartupX', 'DataFlow', 'CloudNine'];
  const levels = ['Junior', 'Mid', 'Senior'];
  const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer'];
  const skillOptions = ['Algorithms', 'System Design', 'Leadership', 'Communication', 'Problem Solving', 'Data Structures', 'API Design', 'Testing'];

  // Filter companies and skills based on search
  const filteredCompanies = companies.filter(c => 
    c.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredSkills = skillOptions.filter(s => 
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Calculate dynamic duration
  useEffect(() => {
    let duration = 45; // base duration
    duration += setupState.skills.length * 10; // +10 min per skill
    if (setupState.level === 'Senior') duration += 5; // +5 for senior
    if (setupState.level === 'Mid') duration += 2; // +2 for mid
    setSetupState(prev => ({ ...prev, duration }));
  }, [setupState.skills, setupState.level]);

  // Check if form is valid
  const isFormValid = setupState.company && setupState.level && setupState.role;

  // Selection handlers
  const handleCompanySelect = (company) => {
    setSetupState(prev => ({ ...prev, company }));
  };

  const handleLevelSelect = (level) => {
    setSetupState(prev => ({ ...prev, level }));
  };

  const handleRoleSelect = (role) => {
    setSetupState(prev => ({ ...prev, role }));
  };

  const handleSkillToggle = (skill) => {
    setSetupState(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : prev.skills.length < 5 
          ? [...prev.skills, skill]
          : prev.skills;
      return { ...prev, skills };
    });
  };

  // Mock AI questions based on setup
  const generateQuestions = () => {
    const baseQuestions = [
      `Tell me about yourself and why you're interested in ${setupState.company}.`,
      `What makes you a good fit for a ${setupState.level} ${setupState.role} position?`,
      `Describe a challenging project you worked on.`,
      `How do you handle tight deadlines and pressure?`,
      `Where do you see yourself in 5 years?`,
    ];
    
    // Add skill-specific questions
    setupState.skills.forEach(skill => {
      baseQuestions.push(`Can you tell me about your experience with ${skill}?`);
    });
    
    return baseQuestions;
  };

  const questions = generateQuestions();

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

  const handleStartInterview = () => {
    if (isFormValid) {
      // Store setup in session for later use
      sessionStorage.setItem('interviewSetup', JSON.stringify(setupState));
      setInterviewStarted(true);
      setCurrentQuestion(questions[0]);
      setQuestionIndex(0);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setAnswer('');
    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const handleSubmitAnswer = async () => {
    console.log('Answer submitted:', answer);
    handleNextQuestion();
  };

  const handleEndInterview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
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

  // Setup Page (before interview starts)
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              InterviewAI
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/home" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">Profile</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Setup Your Interview</h1>
            <p className="text-gray-500">Configure your mock interview session</p>
          </div>

          {/* Selection Sections */}
          <div className="space-y-6">
            {/* Company Selection */}
            <SelectionSection title="Select Company">
              <SearchInput 
                placeholder="Search Company" 
                value={companySearch} 
                onChange={setCompanySearch} 
              />
              <div className="flex flex-wrap gap-3">
                {filteredCompanies.map(company => (
                  <PillButton
                    key={company}
                    label={company}
                    selected={setupState.company === company}
                    onClick={() => handleCompanySelect(company)}
                  />
                ))}
              </div>
            </SelectionSection>

            {/* Level Selection */}
            <SelectionSection title="Select Level">
              <div className="flex flex-wrap gap-3">
                {levels.map(level => (
                  <PillButton
                    key={level}
                    label={level}
                    selected={setupState.level === level}
                    onClick={() => handleLevelSelect(level)}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">* Required — Level affects question difficulty</p>
            </SelectionSection>

            {/* Job Role Selection */}
            <SelectionSection title="Select Job Role">
              <div className="flex flex-wrap gap-3">
                {roles.map(role => (
                  <PillButton
                    key={role}
                    label={role}
                    selected={setupState.role === role}
                    onClick={() => handleRoleSelect(role)}
                  />
                ))}
              </div>
            </SelectionSection>

            {/* Skills Selection (Multi-select) */}
            <SelectionSection title={`Select Skills (${setupState.skills.length}/5 selected)`}>
              <SearchInput 
                placeholder="Search Skill Focus" 
                value={skillSearch} 
                onChange={setSkillSearch} 
              />
              <div className="flex flex-wrap gap-3">
                {filteredSkills.map(skill => (
                  <PillButton
                    key={skill}
                    label={skill}
                    selected={setupState.skills.includes(skill)}
                    onClick={() => handleSkillToggle(skill)}
                    disabled={!setupState.skills.includes(skill) && setupState.skills.length >= 5}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">Select up to 5 skills to focus on</p>
            </SelectionSection>

            {/* Estimated Duration */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Estimated Interview Duration</h3>
                  <p className="text-gray-400 text-sm">Based on your selections</p>
                </div>
                <div className="text-4xl font-bold">
                  {setupState.duration} <span className="text-lg font-normal text-gray-400">min</span>
                </div>
              </div>
            </div>

            {/* Start Interview Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleStartInterview}
                disabled={!isFormValid}
                className={`
                  px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform
                  ${isFormValid 
                    ? 'bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Start Interview
              </button>
            </div>

            {/* Validation Message */}
            {!isFormValid && (
              <p className="text-center text-sm text-gray-400">
                Please select Company, Level, and Job Role to continue
              </p>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-16">
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
              {setupState.company} • {setupState.level} {setupState.role}
            </span>
            <button
              onClick={handleEndInterview}
              className="px-4 py-2 text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>
      </nav>

      {/* Interview Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
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
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  AI Generated
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                <div 
                  className="bg-black h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-gray-900 text-lg leading-relaxed">{currentQuestion}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all duration-200"
                placeholder="Type your answer here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim()}
                className={`flex-1 px-6 py-3 rounded-full font-medium transition-all duration-200
                  ${answer.trim() 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Submit Answer
              </button>
              <button
                onClick={handleSkipQuestion}
                className="px-6 py-3 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium rounded-full transition-all duration-200"
              >
                Skip
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={questionIndex >= questions.length - 1}
                className={`px-6 py-3 border border-gray-200 font-medium rounded-full transition-all duration-200
                  ${questionIndex < questions.length - 1 
                    ? 'text-gray-600 hover:text-gray-900 hover:border-gray-300' 
                    : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                Next
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
