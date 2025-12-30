
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";

interface SearchResult {
    item: {
        title: string;
        make: { name: string };
        model: string;
        year?: number;
        price: number | string;
        slug: string;
        image?: string;
    };
}

interface SearchSuggestionsProps {
    suggestions: SearchResult[];
    visible: boolean;
    onClose: () => void;
}

export const SearchSuggestions = ({ suggestions, visible, onClose }: SearchSuggestionsProps) => {
    const navigate = useNavigate();

    if (!visible || suggestions.length === 0) return null;

    const handleSelect = (slug: string) => {
        navigate(`/listings/${slug}`);
        onClose();
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
            <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                Results found: {suggestions.length}
            </div>
            {suggestions.map(({ item }, index) => (
                <div
                    key={index}
                    onClick={() => handleSelect(item.slug)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 group"
                >
                    <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image ? (
                            <img
                                src={`${import.meta.env.VITE_MEDIA_URL}${item.image}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Search className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-dealership-primary transition-colors">
                            {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{item.make?.name} {item.model}</span>
                            {item.year && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span>{item.year}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-dealership-primary font-semibold">
                        <span>AWG {item.price}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                    </div>
                </div>
            ))}
            <div className="p-2 bg-gray-50 text-center text-xs text-gray-400">
                Press Enter to see all results
            </div>
        </div>
    );
};
