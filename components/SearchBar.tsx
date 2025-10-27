
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.2C17.96 15.93 17.22 17.21 16.09 18.06V20.66H19.95C21.66 19.01 22.56 16.81 22.56 14.05V12.25Z" fill="#4285F4"/>
        <path d="M12 23C15.24 23 17.95 21.92 19.95 20.66L16.09 18.06C14.99 18.79 13.62 19.23 12 19.23C9.09 19.23 6.61 17.3 5.56 14.78H1.58V17.46C3.52 20.94 7.42 23 12 23Z" fill="#34A853"/>
        <path d="M5.56 14.78C5.35 14.22 5.23 13.62 5.23 13C5.23 12.38 5.35 11.78 5.56 11.22V8.54H1.58C0.87 9.99 0.43 11.45 0.43 13C0.43 14.55 0.87 16.01 1.58 17.46L5.56 14.78Z" fill="#FBBC05"/>
        <path d="M12 6.77C13.73 6.77 15.11 7.4 16.29 8.5L20.04 4.75C17.95 2.87 15.24 1.77 12 1.77C7.42 1.77 3.52 4.06 1.58 7.54L5.56 10.22C6.61 7.7 9.09 5.77 12 5.77V6.77Z" fill="#EA4335"/>
    </svg>
);

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchBar: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-search-collapsed');
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  // Debounce effect for fetching suggestions
  React.useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(trimmedQuery)}&limit=5&namespace=0&format=json&origin=*`,
          { signal }
        );
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const results = data[1] || [];
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setActiveIndex(-1); // Reset active index on new suggestions
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  // Effect to handle clicks outside the search component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = (searchQuery: string, newTab: boolean = false) => {
    if (!searchQuery.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };
  
  const handleSuggestionSelect = (suggestion: string, isNewTab: boolean = false) => {
      setQuery(suggestion);
      setShowSuggestions(false);
      performSearch(suggestion, isNewTab);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(query);
  };

  const handleSuggestionClick = (suggestion: string, e: React.MouseEvent) => {
    const isNewTab = e.ctrlKey || e.metaKey;
    handleSuggestionSelect(suggestion, isNewTab);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission as we handle it manually
      
      // If a suggestion is active, use it
      if (activeIndex > -1 && showSuggestions && suggestions.length > 0) {
        handleSuggestionSelect(suggestions[activeIndex], e.ctrlKey || e.metaKey);
      } else {
        // Otherwise, use the text from the input field
        setShowSuggestions(false); // Hide suggestions on search
        performSearch(query, e.ctrlKey || e.metaKey);
      }
      return; // Stop further processing for Enter key
    }

    // Navigation and Escape should only work when suggestions are visible
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={searchContainerRef} className={`bg-[#121212] p-4 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 relative ${showSuggestions && !isCollapsed ? 'z-10' : ''}`}>
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleCollapsed}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Search</h3>
        <button className="p-1" aria-label={isCollapsed ? 'Expand search bar' : 'Collapse search bar'}>
          <CollapseIcon isCollapsed={isCollapsed} />
        </button>
      </div>
      <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out ${showSuggestions && !isCollapsed ? 'overflow-visible' : 'overflow-hidden'} ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-60 opacity-100 mt-3'}`}>
        <form onSubmit={handleFormSubmit} className="w-full relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GoogleIcon />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => query.trim().length > 1 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Type anything and press Enter to search"
              className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="search-suggestions-listbox"
              aria-activedescendant={activeIndex > -1 ? `suggestion-${activeIndex}` : undefined}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <ul 
                id="search-suggestions-listbox"
                role="listbox"
                className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg overflow-hidden"
                onMouseLeave={() => setActiveIndex(-1)}
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  id={`suggestion-${index}`}
                  onClick={(e) => handleSuggestionClick(suggestion, e)}
                  onMouseDown={(e) => e.preventDefault()} // Prevents input from losing focus
                  onMouseOver={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-white cursor-pointer transition-colors duration-200 ${index === activeIndex ? 'bg-cyan-900/50' : ''}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchBar;