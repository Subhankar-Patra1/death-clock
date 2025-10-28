
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useCollapsibleWidget } from '../hooks/useCollapsibleWidget';

// --- Icons ---
const iconMap: { [key: string]: React.ReactElement } = {
  YouTube: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.41 19.83,18.65C19.18,18.8 14.67,19 12,19C9.33,19 4.82,18.8 4.17,18.65C3.27,18.41 2.69,17.73 2.44,16.83C2.16,15.8 2,14.19 2,12L2.06,11.16C2.06,10.56 2.09,9.87 2.16,9.07C2.22,8.27 2.31,7.64 2.44,7.17C2.69,6.27 3.27,5.59 4.17,5.35C4.82,5.2 9.33,5 12,5C14.67,5 19.18,5.2 19.83,5.35C20.73,5.59 21.31,6.27 21.56,7.17Z" /></svg>,
  Gmail: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" /></svg>,
  Medium: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7,12.5C7,12.2 7.1,12 7.2,11.8L12.8,3.3C12.9,3.1 13.1,3 13.3,3C13.6,3 13.8,3.1 13.9,3.3L15.9,6.5L18.8,3.4C18.9,3.2 19.1,3 19.4,3C19.6,3 19.8,3.1 20,3.3L21.7,5.6C21.9,5.8 22,6.1 22,6.3C22,6.6 21.9,6.8 21.7,7L16.8,14.2C16.6,14.4 16.3,14.5 16.1,14.5C15.8,14.5 15.6,14.4 15.5,14.2L13.5,11L10,18.4L11.5,20.7C11.7,21 11.5,21.3 11.2,21.3H3.6C3.3,21.3 3.2,21.1 3.3,20.8L7,12.5Z" /></svg>,
  GitHub: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" /></svg>,
  Notion: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5,2H3.5C2.67,2 2,2.67 2,3.5V20.5C2,21.33 2.67,22 3.5,22H20.5C21.33,22 22,21.33 22,20.5V3.5C22,2.67 21.33,2 20.5,2M10.74,15.19L8.41,12.75L8.32,17.55H6.16V6.45H8.32L12.5,11.11V6.45H14.65V14.05L15.53,13.11L17.84,17.55H15.69L13.8,14.28L10.93,17.55H10.74Z" /></svg>,
  Calendar: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M19 7H5V5H19V7M7 10H12V15H7V10Z" /></svg>,
  Generic: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
};
const DragHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5"></circle>
        <circle cx="15" cy="5" r="1.5"></circle>
        <circle cx="9" cy="12" r="1.5"></circle>
        <circle cx="15" cy="12" r="1.5"></circle>
        <circle cx="9" cy="19" r="1.5"></circle>
        <circle cx="15" cy="19" r="1.5"></circle>
    </svg>
);
const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface Link {
  id: string;
  name: string;
  url: string;
  icon: string;
  favicon?: string;
}

const initialLinks: Link[] = [
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', icon: 'YouTube' },
  { id: 'gmail', name: 'Gmail', url: 'https://gmail.com', icon: 'Gmail' },
  { id: 'medium', name: 'Medium', url: 'https://medium.com', icon: 'Medium' },
  { id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'GitHub' },
  { id: 'notion', name: 'Notion', url: 'https://notion.so', icon: 'Notion' },
  { id: 'calendar', name: 'Calendar', url: 'https://calendar.google.com', icon: 'Calendar' },
];

const QuickLinks: React.FC = () => {
  const [links, setLinks] = useLocalStorage<Link[]>('quick-links', initialLinks);
  
  // Migration: Add IDs to existing links that don't have them
  React.useEffect(() => {
    const linksNeedingIds = links.some(link => !link.id);
    if (linksNeedingIds) {
      const updatedLinks = links.map((link, index) => ({
        ...link,
        id: link.id || `migrated-${index}-${Date.now()}`
      }));
      setLinks(updatedLinks);
    }
  }, []);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCollapsed, toggleCollapsed] = useCollapsibleWidget('widget-quicklinks-collapsed');
  
  const dragItem = React.useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [loadingFavicons, setLoadingFavicons] = React.useState<Set<number>>(new Set());
  const faviconTimeouts = React.useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Function to extract domain from URL
  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return '';
    }
  };

  // Function to fetch favicon
  const fetchFavicon = async (url: string, index: number): Promise<string | null> => {
    const domain = getDomainFromUrl(url);
    if (!domain) return null;

    setLoadingFavicons(prev => new Set(prev).add(index));

    try {
      // Try multiple favicon sources
      const faviconSources = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`
      ];

      for (const faviconUrl of faviconSources) {
        try {
          const response = await fetch(faviconUrl, { mode: 'no-cors' });
          // For no-cors, we can't check response status, so we assume it worked
          return faviconUrl;
        } catch {
          continue;
        }
      }
      
      // Fallback to Google's favicon service (most reliable)
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    } finally {
      setLoadingFavicons(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };


  const handleLinkChange = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
    
    // If URL is being changed and it's a valid URL, fetch favicon with debounce
    if (field === 'url' && value && value.length > 7) {
      // Clear existing timeout for this index
      const existingTimeout = faviconTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout for favicon fetching
      const timeoutId = setTimeout(async () => {
        const favicon = await fetchFavicon(value, index);
        if (favicon) {
          setLinks(currentLinks => {
            const updatedLinks = [...currentLinks];
            if (updatedLinks[index] && updatedLinks[index].url === value) {
              updatedLinks[index] = { ...updatedLinks[index], favicon };
            }
            return updatedLinks;
          });
        }
        faviconTimeouts.current.delete(index);
      }, 1000); // 1 second delay to avoid too many requests while typing
      
      faviconTimeouts.current.set(index, timeoutId);
    }
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    const newId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setLinks([...links, { id: newId, name: 'New Site', url: 'https://', icon: 'Generic', favicon: undefined }]);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (index !== dragItem.current) {
        setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    const dragIndex = dragItem.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = [...links];
    const draggedItemContent = items[dragIndex];

    items.splice(dragIndex, 1);
    
    if (dragIndex < dropIndex) {
        items.splice(dropIndex - 1, 0, draggedItemContent);
    } else {
        items.splice(dropIndex, 0, draggedItemContent);
    }

    setLinks(items);
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };
  
  const handleDragEnd = () => {
    dragItem.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };


  const editContent = (
    <div className="space-y-2">
      <div 
        className="h-64 overflow-y-scroll space-y-2 pr-2 border border-gray-700 rounded-lg p-2 bg-[#0a0a0f]" 
        style={{
          scrollbarWidth: 'auto',
          scrollbarColor: '#6b7280 #0a0a0f',
          overflowY: 'scroll'
        }}
      >
        {links.map((link, index) => (
          <div 
            key={link.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`relative flex items-center space-x-2 bg-[#1a1a1a] p-2 rounded-lg transition-opacity duration-300 ${
              draggedIndex === index ? 'opacity-30' : 'opacity-100'
            }`}
          >
            {dragOverIndex === index && (
              <div className="absolute top-[-2px] left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></div>
            )}
            <span className="cursor-move text-gray-500 touch-none">
              <DragHandleIcon />
            </span>
            <div className="flex items-center justify-center w-6 h-6">
              {loadingFavicons.has(index) ? (
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              ) : link.favicon ? (
                <img 
                  src={link.favicon} 
                  alt={`${link.name} favicon`}
                  className="w-5 h-5 rounded-sm"
                  onError={(e) => {
                    // Fallback to generic icon if favicon fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`text-gray-400 ${link.favicon ? 'hidden' : ''}`}>
                {iconMap[link.icon] || iconMap['Generic']}
              </span>
            </div>
            <input
              type="text"
              value={link.name}
              onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
              placeholder="Name"
              className="flex-grow bg-[#0a0a0f] text-white border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoComplete="off"
              spellCheck="false"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              placeholder="https://example.com"
              className="flex-grow bg-[#0a0a0f] text-white border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              onClick={() => handleDeleteLink(index)}
              className="text-red-500 hover:text-red-400 p-1"
              title="Remove Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddLink}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm"
      >
        + Add New Link
      </button>
    </div>
  );

  const viewContent = (
      <div className="max-h-60 overflow-y-auto">
        <div className="flex flex-wrap gap-4 pb-2">
          {links.map((link, index) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.name}
              className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-cyan-500 transition-colors duration-300 group"
            >
            {link.favicon ? (
              <img 
                src={link.favicon} 
                alt={`${link.name} favicon`}
                className="w-6 h-6 rounded-sm group-hover:scale-110 transition-transform duration-200"
                onError={(e) => {
                  // Fallback to generic icon if favicon fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`${link.favicon ? 'hidden' : ''}`}>
              {iconMap[link.icon] || iconMap['Generic']}
            </span>
          </a>
        ))}
        </div>
      </div>
  );

  return (
    <div className="bg-[#121212] p-4 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
      <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Quick Links</h3>
          <div className="flex items-center space-x-2">
            <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
                >
                {isEditing ? "Done" : "Edit"}
            </button>
            <button onClick={toggleCollapsed} className="p-1" aria-label={isCollapsed ? 'Expand quick links' : 'Collapse quick links'}>
                <CollapseIcon isCollapsed={isCollapsed} />
            </button>
          </div>
      </div>
      <div className={`transition-[max-height,opacity,margin] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 !mt-0' : 'max-h-[500px] opacity-100 mt-3'}`}>
        {isEditing ? editContent : viewContent}
      </div>
    </div>
  );
};

export default QuickLinks;