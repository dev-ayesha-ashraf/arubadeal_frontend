import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    className = ""
}: SearchBarProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Search className="w-5 h-5 text-[rgb(206,131,57)]" />
            <div className="relative flex-1">
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(206,131,57)] focus:border-transparent bg-white text-slate-900"
                />
                {value && (
                    <button
                        onClick={() => onChange("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
