
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const Goal: React.FC = () => {
  const [goal, setGoal] = useLocalStorage<string>('today-goal', '');
  const [inputValue, setInputValue] = React.useState(goal);
  const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-goal-collapsed');


  const handleSave = () => {
    setGoal(inputValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSave();
        (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-[#121212] p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
        <div className="flex justify-between items-center cursor-pointer" onClick={toggleCollapsed}>
            <h3 className="font-cursive text-2xl text-cyan-400">Today’s Goal :</h3>
            <button className="p-1" aria-label={isCollapsed ? 'Expand goal' : 'Collapse goal'}>
                <CollapseIcon isCollapsed={isCollapsed} />
            </button>
        </div>
        <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-12 opacity-100 mt-2'}`}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Write your goal here..."
                className="w-full bg-transparent border-b border-gray-700 text-white py-1 text-sm focus:outline-none focus:border-cyan-500 transition-colors duration-300"
            />
        </div>
    </div>
  );
};

export default Goal;