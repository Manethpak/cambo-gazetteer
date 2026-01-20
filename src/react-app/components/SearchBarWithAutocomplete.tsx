import { Search, Loader2, Clock, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TypeLabel } from "./TypeLabel";
import { getEnglishName, getKhmerName } from "@/libs/name";
import { AdministrativeUnit, Type } from "@/types";

interface AutocompleteResult extends Omit<AdministrativeUnit, "path"> {
  path?: string;
}

interface SearchBarWithAutocompleteProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = "cambo-gazetteer-recent-searches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== query.toLowerCase(),
    );
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

function removeRecentSearch(query: string) {
  try {
    const searches = getRecentSearches();
    const updated = searches.filter(
      (s) => s.toLowerCase() !== query.toLowerCase(),
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

export function SearchBarWithAutocomplete({
  initialValue = "",
  placeholder = "Search provinces, districts, communes, villages...",
  className = "",
  onSearch,
  autoFocus = false,
}: SearchBarWithAutocompleteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 1) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setSelectedIndex(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Autocomplete error:", error);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      saveRecentSearch(trimmed);
      setRecentSearches(getRecentSearches());
      setIsOpen(false);
      setSuggestions([]);

      if (onSearch) {
        onSearch(trimmed);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [navigate, onSearch],
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: AutocompleteResult) => {
      setIsOpen(false);
      setSuggestions([]);

      // Navigate to location page instead of search
      navigate(`/location/${suggestion.code}`);
    },
    [navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems =
      suggestions.length + (query.trim() === "" ? recentSearches.length : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (query.trim() === "" && selectedIndex < recentSearches.length) {
            // Selected a recent search
            const selected = recentSearches[selectedIndex];
            setQuery(selected);
            handleSearch(selected);
          } else if (
            suggestions[
              selectedIndex - (query.trim() === "" ? recentSearches.length : 0)
            ]
          ) {
            // Selected a suggestion
            const adjustedIndex =
              selectedIndex - (query.trim() === "" ? recentSearches.length : 0);
            handleSelectSuggestion(suggestions[adjustedIndex]);
          } else if (suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleRemoveRecent = (e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation();
    removeRecentSearch(searchTerm);
    setRecentSearches(getRecentSearches());
  };

  const showDropdown =
    isOpen &&
    (suggestions.length > 0 ||
      (query.trim() === "" && recentSearches.length > 0));

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-14 pr-36 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <button
          type="button"
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          role="listbox"
        >
          {/* Recent Searches */}
          {query.trim() === "" && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={`recent-${search}`}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setQuery(search);
                      handleSearch(search);
                    }
                  }}
                  tabIndex={0}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? "bg-brand-50 text-brand-700"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{search}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecent(e, search)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                    aria-label={`Remove ${search} from recent searches`}
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {query.trim() !== "" && (
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => {
                const adjustedIndex =
                  query.trim() === "" ? index + recentSearches.length : index;
                return (
                  <div
                    key={suggestion.code}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelectSuggestion(suggestion);
                    }}
                    tabIndex={0}
                    role="option"
                    aria-selected={selectedIndex === adjustedIndex}
                    className={`px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                      selectedIndex === adjustedIndex
                        ? "bg-brand-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 font-khmer truncate">
                            {getKhmerName(suggestion as AdministrativeUnit)}
                          </span>
                          <TypeLabel type={suggestion.type as Type} />
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {getEnglishName(suggestion as AdministrativeUnit)}
                        </div>
                        {suggestion.path && (
                          <div className="text-xs text-slate-400 mt-1 truncate">
                            {suggestion.path}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 text-sm font-mono text-brand-600 font-medium">
                        {suggestion.code}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query.trim() !== "" && suggestions.length === 0 && !loading && (
            <div className="p-6 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
