// FIX: Import React to use React types.
import React from 'react';

interface SoundToggleProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SpeakerOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpeakerOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l4 4m0-4l-4 4" />
    </svg>
);


const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, setSoundEnabled }) => {
  // NOTE: Actual audio playback is omitted due to constraints on creating asset files.
  // This component manages the UI state for the sound toggle.
  
  return (
    <button
      onClick={() => setSoundEnabled(!soundEnabled)}
      className="absolute bottom-8 right-8 w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-cyan-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      title={soundEnabled ? "Disable Sound" : "Enable Sound"}
    >
      {soundEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  );
};

export default SoundToggle;