
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface QuoteData {
  content: string;
  author: string;
}

interface StoredQuote {
  quote: QuoteData;
  date: string; // YYYY-MM-DD format
}

const fallbackQuote: QuoteData = {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
};


const Quote: React.FC = () => {
    const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-quote-collapsed');
    const [storedQuote, setStoredQuote] = useLocalStorage<StoredQuote | null>('daily-quote', null);
    const [quote, setQuote] = React.useState<QuoteData>(fallbackQuote);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchNewQuote = async () => {
            setIsLoading(true);
            try {
                // Using dummyjson.com as a reliable alternative API
                const response = await fetch('https://dummyjson.com/quotes/random');
                if (!response.ok) {
                    throw new Error('Failed to fetch quote from API');
                }
                const data = await response.json();
                
                const newQuote: QuoteData = {
                    content: data.quote,
                    author: data.author || 'Unknown',
                };

                setQuote(newQuote);
                setStoredQuote({
                    quote: newQuote,
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                });
            } catch (error) {
                console.error("Error fetching new quote:", error);
                setQuote(fallbackQuote); // Use fallback on error
            } finally {
                setIsLoading(false);
            }
        };

        const today = new Date().toISOString().split('T')[0];
        
        if (storedQuote && storedQuote.date === today) {
            setQuote(storedQuote.quote);
            setIsLoading(false);
        } else {
            fetchNewQuote();
        }
    }, []);

    const quoteContent = () => {
        if (isLoading) {
            return <p className="font-serif-italic text-lg text-gray-400">Loading today's wisdom...</p>;
        }
        return (
            <>
                <p className="font-serif-italic text-sm text-gray-300 line-clamp-2">
                    "{quote.content}"
                </p>
                <p className="text-right text-gray-500 mt-1 text-xs">— {quote.author}</p>
            </>
        );
    }

    return (
        <div className="bg-[#121212] p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="flex justify-between items-center cursor-pointer" onClick={toggleCollapsed}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Quote of the Day</h3>
                <button className="p-1" aria-label={isCollapsed ? 'Expand quote' : 'Collapse quote'}>
                    <CollapseIcon isCollapsed={isCollapsed} />
                </button>
            </div>
            <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-24 opacity-100 mt-2'}`}>
                {quoteContent()}
            </div>
        </div>
    );
};

export default Quote;