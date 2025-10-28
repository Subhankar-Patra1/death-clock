import React, { useState } from 'react';

interface Link {
  id: string;
  name: string;
  url: string;
  favicon?: string;
}

const QuickLinks: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([
    { id: '1', name: 'YouTube', url: 'https://youtube.com', favicon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
    { id: '2', name: 'Gmail', url: 'https://gmail.com', favicon: 'https://www.google.com/s2/favicons?domain=gmail.com&sz=64' },
    { id: '3', name: 'GitHub', url: 'https://github.com', favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
    { id: '4', name: 'Twitter', url: 'https://twitter.com', favicon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=64' },
    { id: '5', name: 'Reddit', url: 'https://reddit.com', favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64' },
    { id: '6', name: 'Netflix', url: 'https://netflix.com', favicon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingFavicons, setLoadingFavicons] = useState<Set<string>>(new Set());
  const faviconTimeouts = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addNewLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      name: 'New Site',
      url: 'https://'
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: 'name' | 'url', value: string) => {
    const updatedLinks = links.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);

    // If URL is being updated, fetch favicon with debounce
    if (field === 'url' && value && value.length > 7) {
      // Clear existing timeout for this link
      const existingTimeout = faviconTimeouts.current.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout for favicon fetching
      const timeoutId = setTimeout(() => {
        fetchFavicon(value, id);
      }, 1000); // 1 second delay to avoid too many requests while typing
      
      faviconTimeouts.current.set(id, timeoutId);
    }
  };

  const fetchFavicon = async (url: string, linkId: string) => {
    try {
      // Add to loading state
      setLoadingFavicons(prev => new Set(prev).add(linkId));
      
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      
      // Use Google's favicon service (most reliable)
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      // Update the link with favicon
      setLinks(currentLinks =>
        currentLinks.map(link =>
          link.id === linkId ? { ...link, favicon: faviconUrl } : link
        )
      );
      
    } catch (error) {
      console.log('Failed to fetch favicon for:', url);
    } finally {
      // Remove from loading state
      setLoadingFavicons(prev => {
        const newSet = new Set(prev);
        newSet.delete(linkId);
        return newSet;
      });
      faviconTimeouts.current.delete(linkId);
    }
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="bg-[#121212] p-4 rounded-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Quick Links
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <div>
          {/* Scrollable Links Container */}
          <div
            className="space-y-2 mb-3 quicklinks-scrollbar"
            style={{
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: '#1a1a1a'
            }}
          >
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 bg-[#2a2a2a] p-2 rounded"
              >
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateLink(link.id, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 bg-[#0a0a0f] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                />
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    placeholder="URL"
                    className="w-full bg-[#0a0a0f] text-white border border-gray-600 rounded px-2 py-1 text-sm pr-8"
                  />
                  {loadingFavicons.has(link.id) && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-red-500 hover:text-red-400 p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={addNewLink}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
          >
            + Add New Link
          </button>
        </div>
      ) : (
        /* View Mode - Icons Only */
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-cyan-500 transition-all duration-300 hover:scale-110 group"
              title={link.name}
            >
              {link.favicon ? (
                <img
                  src={link.favicon}
                  alt={`${link.name} icon`}
                  className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                  {link.name.charAt(0).toUpperCase()}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickLinks;