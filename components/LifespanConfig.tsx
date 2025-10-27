
// FIX: Import React to use JSX and React hooks.
import React from 'react';

interface LifespanConfigProps {
  onSave: (dob: string, expectedEndDate: string) => void;
  onClose: () => void;
  initialDob: string | null;
  initialExpectedEndDate: string | null;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const LifespanConfig: React.FC<LifespanConfigProps> = ({ onSave, onClose, initialDob, initialExpectedEndDate }) => {
  const [dob, setDob] = React.useState(initialDob || '');
  const [expectedEndDate, setExpectedEndDate] = React.useState(initialExpectedEndDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dob && expectedEndDate) {
        const birthDate = new Date(dob);
        const endDate = new Date(expectedEndDate);
        if (endDate > birthDate) {
            onSave(dob, expectedEndDate);
        } else {
            alert("Expected end date must be after your date of birth.");
        }
    } else if (dob) {
        // Allow saving with only DOB for "normal clock" mode
        onSave(dob, '');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#121212] p-8 rounded-lg shadow-2xl shadow-cyan-500/20 max-w-md w-full border border-gray-800 animate-fade-in relative">
        {initialDob && (
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                title="Close"
            >
                <CloseIcon />
            </button>
        )}
        <h2 className="font-cursive text-4xl text-white text-center mb-2">Welcome to your Clock</h2>
        <p className="text-gray-400 text-center mb-6">
          To begin, please provide your date of birth. This will display a standard clock and your current age. 
          To transform this into a personalized 'Death Clock' that visualizes your entire lifespan, add an expected end date.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-400 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
            />
          </div>
          <div>
            <label htmlFor="expectancy" className="block text-sm font-medium text-gray-400 mb-2">
              Expected End Date (Optional)
            </label>
            <input
              type="date"
              id="expectancy"
              value={expectedEndDate}
              onChange={(e) => setExpectedEndDate(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={!dob}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#121212] disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {initialDob ? 'Update Visualization' : 'Begin Visualization'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LifespanConfig;