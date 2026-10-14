import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';

export function MedicineInput({ onSelect, searchMedicines, addMedicine }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (query.length > 0) {
            const results = searchMedicines(query);
            setSuggestions(results);
            setIsOpen(true);
            setHighlightedIndex(-1);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query, searchMedicines]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (name) => {
        onSelect(name);
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleAddNew = () => {
        if (!query.trim()) return;
        const added = addMedicine(query);
        if (added) {
            handleSelect(query);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < suggestions.length ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                handleSelect(suggestions[highlightedIndex]);
            } else if (query) {
                // If exact match exists in suggestions, select it, else add new
                const exactMatch = suggestions.find(s => s.toLowerCase() === query.toLowerCase());
                if (exactMatch) {
                    handleSelect(exactMatch);
                } else {
                    handleAddNew();
                }
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="medicine-search-container" style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <div className="flex-row" style={{ gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type medicine name..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="search-input"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            className="btn-ghost"
                            style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && (suggestions.length > 0 || query) && (
                <div className="suggestions-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    marginTop: '4px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((item, index) => (
                        <div
                            key={item}
                            onClick={() => handleSelect(item)}
                            className={`suggestion-item ${index === highlightedIndex ? 'active' : ''}`}
                            style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                backgroundColor: index === highlightedIndex ? 'var(--color-primary-light)' : 'transparent',
                                color: index === highlightedIndex ? 'var(--color-primary-hover)' : 'inherit',
                                borderBottom: '1px solid var(--color-background)'
                            }}
                        >
                            {item}
                        </div>
                    ))}
                    {suggestions.length === 0 && query && (
                        <div
                            onClick={handleAddNew}
                            style={{ padding: '12px', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={16} />
                            <span>Add "<strong>{query}</strong>" to database</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
