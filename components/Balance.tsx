
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

interface BalanceData {
  amount: number;
  lastUpdated: string | null;
}

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const Balance: React.FC = () => {
  const [balanceData, setBalanceData] = useLocalStorage<BalanceData>('bank-balance', {
    amount: 0.00,
    lastUpdated: null,
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(balanceData.amount.toFixed(2));
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-balance-collapsed');
  
  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newAmount = parseFloat(inputValue) || 0;
    setBalanceData({
      amount: newAmount,
      lastUpdated: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSave();
    }
    if (e.key === 'Escape') {
        setInputValue(balanceData.amount.toFixed(2));
        setIsEditing(false);
    }
  };

  const formatLastUpdated = () => {
    if (!balanceData.lastUpdated) return 'Never';
    return new Date(balanceData.lastUpdated).toLocaleString();
  }

  return (
    <div className="bg-[#121212] p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Current Bank Balance</h3>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-md transition-colors"
                >
                {isEditing ? 'Cancel' : 'Edit'}
            </button>
             <button onClick={toggleCollapsed} className="p-1" aria-label={isCollapsed ? 'Expand balance' : 'Collapse balance'}>
                <CollapseIcon isCollapsed={isCollapsed} />
            </button>
        </div>
      </div>
       <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-24 opacity-100 mt-2'}`}>
        {isEditing ? (
            <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#0a0a0f] text-red-500 text-3xl font-bold focus:outline-none text-center"
            />
        ) : (
            <p className="text-3xl font-bold text-red-500">
            ₹{balanceData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        )}
        <p className="text-xs text-gray-600 mt-0.5">Last updated: {formatLastUpdated()}</p>
      </div>
    </div>
  );
};

export default Balance;