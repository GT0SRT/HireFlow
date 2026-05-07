import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  isSingleSelect?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  isSingleSelect = false,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the current input value to filter against
  const getSearchValue = () => {
    if (isSingleSelect) {
      return value;
    }
    // For multi-select (skills), get the last word after comma
    const parts = value.split(",");
    return parts[parts.length - 1].trim().toLowerCase();
  };

  useEffect(() => {
    const searchValue = getSearchValue();
    if (searchValue.length === 0) {
      setFiltered([]);
      setOpen(false);
      return;
    }

    const filtered = suggestions.filter((s) =>
      s.toLowerCase().startsWith(searchValue)
    );

    setFiltered(filtered);
    setOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [value, suggestions]);

  const handleSelect = (suggestion: string) => {
    if (isSingleSelect) {
      onChange(suggestion);
    } else {
      // For multi-select: replace the last word with the suggestion
      const parts = value.split(",");
      parts[parts.length - 1] = suggestion;
      onChange(parts.join(", "));
    }
    setOpen(false);
    setFiltered([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(filtered[selectedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onFocus={() => {
          const searchValue = getSearchValue();
          if (searchValue.length > 0 && filtered.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("glass", className)}
      />

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full text-left px-4 py-2 transition-colors",
                index === selectedIndex
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
