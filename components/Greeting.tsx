
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const Greeting: React.FC = () => {
  const [time, setTime] = React.useState(new Date());
  const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-greeting-collapsed');

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 11) return 'Good morning';
    if (hour >= 11 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 23) return 'Good evening';
    return 'Good night';
  };

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-[#121212] p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
        <div className="flex justify-between items-center cursor-pointer" onClick={toggleCollapsed}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Welcome</h3>
            <button className="p-1" aria-label={isCollapsed ? 'Expand greeting' : 'Collapse greeting'}>
                <CollapseIcon isCollapsed={isCollapsed} />
            </button>
        </div>
        <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-32 opacity-100 mt-2'}`}>
            <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
            <p className="text-base text-gray-400">{formattedDate}</p>
        </div>
    </div>
  );
};

export default Greeting;