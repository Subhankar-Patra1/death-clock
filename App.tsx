
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import Greeting from './components/Greeting';
import SearchBar from './components/SearchBar';
import QuickLinks from './components/QuickLinks';
import Quote from './components/Quote';
import Goal from './components/Goal';
import Balance from './components/Balance';
import DeathClock from './components/DeathClock';
import SoundToggle from './components/SoundToggle';
import useLocalStorage from './hooks/useLocalStorage';
import LifespanConfig from './components/LifespanConfig';

interface LifespanSettings {
  dob: string | null;
  expectedEndDate: string | null;
}

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const App: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(false);
  const [lifespanConfig, setLifespanConfig] = useLocalStorage<LifespanSettings>('lifespan-config', {
    dob: null,
    expectedEndDate: null,
  });
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  React.useEffect(() => {
    if (!lifespanConfig.dob) {
      setIsConfigOpen(true);
    }
  }, [lifespanConfig.dob]);


  const handleConfigSave = (dob: string, expectedEndDate: string) => {
    setLifespanConfig({ dob, expectedEndDate });
    setIsConfigOpen(false);
  };

  return (
    <div className="flex w-full h-screen bg-[#0a0a0f] text-white">
      {isConfigOpen && (
        <LifespanConfig 
          onSave={handleConfigSave}
          initialDob={lifespanConfig.dob}
          initialExpectedEndDate={lifespanConfig.expectedEndDate}
          onClose={() => lifespanConfig.dob && setIsConfigOpen(false)}
        />
      )}

      {/* Left Column */}
      <div className="w-[35%] h-full flex flex-col p-2 gap-2 overflow-hidden">
        <div className="flex-shrink-0">
          <Greeting />
        </div>
        <div className="flex-shrink-0">
          <SearchBar />
        </div>
        <div className="flex-shrink-0">
          <QuickLinks />
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex-shrink-0">
            <Quote />
          </div>
          <div className="flex-shrink-0">
            <Goal />
          </div>
          <div className="flex-shrink-0">
            <Balance />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-[65%] h-full flex flex-col items-center justify-center relative p-8">
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <h1 className="font-cursive text-4xl md:text-5xl text-gray-300">Death Clock</h1>
          {lifespanConfig.dob && (
            <button 
              onClick={() => setIsConfigOpen(true)} 
              className="text-gray-400 hover:text-white transition-colors"
              title="Edit Lifespan"
            >
              <SettingsIcon />
            </button>
          )}
        </div>
        <div className="w-full h-full flex-1 relative">
            {lifespanConfig.dob && (
                <DeathClock
                    soundEnabled={soundEnabled}
                    dob={lifespanConfig.dob}
                    expectedEndDate={lifespanConfig.expectedEndDate}
                />
            )}
        </div>
        <SoundToggle soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
      </div>
    </div>
  );
};

export default App;