import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useCandidateContext } from '../../context/CandidateContext';
import { processNaturalLanguageQuery } from '../../services/aiService';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { setFilters } = useCandidateContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Örnek öneriler - bunlar kullanıcının CommandBar'ı ilk açtığında göreceği önerilerdir
  const exampleQueries = [
    "Candidates from Istanbul",
    "Active candidates with salary above 35000 TL",
    "Rejected candidates with Computer Engineering education",
    "Candidates joined in the last 3 months with a score over 80%",
  ];

  // Komut paneli açıldığında inputa otomatik odaklanma
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Ctrl+K ile açma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Doğal dil sorgusunu işleme
  const handleExecuteQuery = async (queryText: string) => {
    setLoading(true);
    try {
      // AI servisine sorguyu gönder ve filtreleri oluştur
      const filters = await processNaturalLanguageQuery(queryText);
      
      // CandidateContext üzerinde filtreleri ayarla
      setFilters(filters);
      
      // Paneli kapat
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 outline-none text-base"
            placeholder="Type a natural language query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleExecuteQuery(query);
              }
            }}
          />
          {loading ? (
            <div className="spinner h-5 w-5 border-2 border-t-blue-500 rounded-full animate-spin" />
          ) : query.trim() ? (
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setQuery('')}
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="p-2 max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-2 text-sm text-gray-500">
              <h2 className="font-medium mb-2">Example queries:</h2>
              <ul className="space-y-1">
                {exampleQueries.map((example, index) => (
                  <li key={index}>
                    <button
                      className="w-full text-left p-2 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setQuery(example);
                      }}
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-2">
              <button
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded flex items-center"
                onClick={() => handleExecuteQuery(query)}
                disabled={loading}
              >
                <Search className="h-4 w-4 text-blue-500 mr-2" />
                <span>Search: <span className="font-medium">{query}</span></span>
              </button>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
          <div>Try asking for specific candidates or filtering criteria</div>
          <div>
            <kbd className="px-2 py-1 bg-gray-100 rounded">↩</kbd> to execute
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;