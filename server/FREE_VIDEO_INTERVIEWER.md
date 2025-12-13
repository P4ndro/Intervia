# Free AI Video Interviewer Implementation

## Approach: Browser-Based Text-to-Speech + Static Avatar

**100% Free** - Uses browser's built-in Web Speech API (no API keys, no costs)

## How It Works

1. **Frontend-only** - Uses browser's `speechSynthesis` API (free, built-in)
2. **Static avatar image** - Simple image that "speaks" when audio plays
3. **No backend changes needed** - Everything happens in the browser
4. **Works offline** - After page loads, no internet needed

## Implementation

### Step 1: Add Avatar Image

Place an avatar image in `client/public/`:
- `client/public/interviewer-avatar.png` (or `.jpg`, `.svg`)

You can use:
- Free avatar from https://thispersondoesnotexist.com/
- Or any professional stock photo
- Or a simple illustration

### Step 2: Update InterviewPage.jsx

Add the interviewer component:

```javascript
// In client/src/pages/InterviewPage.jsx

import { useState, useRef, useEffect } from 'react';

export default function InterviewPage() {
  // ... existing state ...
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  // Speak question when it changes
  useEffect(() => {
    if (currentQuestion?.text) {
      speakQuestion(currentQuestion.text);
    }

    // Cleanup: stop speaking when component unmounts or question changes
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion]);

  const speakQuestion = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice (use system default or find a good one)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Zira') || 
      voice.name.includes('Samantha')
    ) || voices[0];
    
    utterance.voice = preferredVoice;
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ... existing code ... */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interviewer Avatar */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Your Interviewer</h3>
          
          <div className="relative">
            {/* Avatar Image with speaking animation */}
            <div className={`relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden ${
              isSpeaking ? 'ring-2 ring-emerald-500' : ''
            }`}>
              <img
                src="/interviewer-avatar.png"
                alt="Interviewer"
                className={`w-full h-full object-cover ${
                  isSpeaking ? 'animate-pulse' : ''
                }`}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900 to-blue-900">
                      <div class="text-center">
                        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                          <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                          </svg>
                        </div>
                        <p class="text-white text-sm">AI Interviewer</p>
                      </div>
                    </div>
                  `;
                }}
              />
              
              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-6 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-8 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-6 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
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
                {isSpeaking ? 'Speaking...' : '🔊 Replay Question'}
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

          {/* Question text (always visible as backup) */}
          <div className="mt-4 p-4 bg-slate-900 rounded-md border border-slate-700">
            <p className="text-white text-sm leading-relaxed">{currentQuestion?.text}</p>
          </div>
        </div>

        {/* Right: Candidate Video & Answer */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          {/* ... existing candidate video and answer form ... */}
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Add Avatar Image

1. Get a free avatar image:
   - Visit https://thispersondoesnotexist.com/ (AI-generated faces)
   - Or use https://unsplash.com/s/photos/professional-woman (free stock photos)
   - Or create a simple illustration

2. Save it as `client/public/interviewer-avatar.png`

### Step 4: Optional - Add Lip Sync Animation

For a more realistic effect, add simple mouth animation:

```javascript
// Add to InterviewPage.jsx

const [mouthOpen, setMouthOpen] = useState(false);

useEffect(() => {
  if (isSpeaking) {
    // Simple mouth animation while speaking
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 200); // Toggle every 200ms
    
    return () => clearInterval(interval);
  } else {
    setMouthOpen(false);
  }
}, [isSpeaking]);

// In the avatar div, add:
<div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-slate-800 rounded-full border-2 border-slate-600 ${
  mouthOpen ? 'h-12' : 'h-6'
} transition-all duration-200`}></div>
```

## Browser Compatibility

✅ **Works in:**
- Chrome/Edge (best support)
- Firefox
- Safari (iOS 7+)
- Opera

❌ **Limited support:**
- Some older browsers
- Some mobile browsers (but most modern ones work)

## Advantages

1. **100% Free** - No API costs
2. **No Backend Changes** - Pure frontend
3. **Works Offline** - After page loads
4. **Fast** - No network delays
5. **Privacy** - Speech happens in browser
6. **Customizable** - Easy to change voice, speed, pitch

## Voice Options

The browser provides multiple voices. You can:
- Use system default
- Let user choose
- Prefer female/male voices
- Adjust rate, pitch, volume

## Alternative: Free TTS Services (if browser API doesn't work)

If Web Speech API isn't available, use these free alternatives:

### Option 1: Google Translate TTS (Free, no API key)
```javascript
const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
// Play audio
```

### Option 2: ResponsiveVoice (Free tier)
- https://responsivevoice.org/
- Free for non-commercial use
- Simple JavaScript API

## Summary

**Best Free Solution:**
- ✅ Browser Web Speech API (built-in, free)
- ✅ Static avatar image
- ✅ Simple speaking animation
- ✅ No backend changes needed
- ✅ Works immediately

This gives you a professional-looking interviewer with zero costs!

