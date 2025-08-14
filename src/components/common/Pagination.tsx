import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 4) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 3) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = generatePages();
    const baseStyle =
        "w-8 h-8 p-0 text-sm rounded-md transition-colors flex items-center justify-center";
    
    const activeStyle =
        "bg-[rgb(206,131,57)] text-white hover:bg-[rgb(196,121,47)] shadow";
    const inactiveStyle =
        "border border-[rgb(206,131,57)] text-[rgb(206,131,57)] hover:bg-[rgb(206,131,57,0.1)]";

    return (
        <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
            <button
                className={`${baseStyle} ${inactiveStyle}`}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
                className={`${baseStyle} ${inactiveStyle}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((page, idx) =>
                typeof page === "number" ? (
                    <button
                        key={idx}
                        onClick={() => onPageChange(page)}
                        className={`${baseStyle} ${page === currentPage ? activeStyle : inactiveStyle}`}
                    >
                        {page}
                    </button>
                ) : (
                    <span
                        key={idx}
                        className="w-8 h-8 flex items-center justify-center text-sm text-gray-500"
                    >
                        ...
                    </span>
                )
            )}

            <button
                className={`${baseStyle} ${inactiveStyle}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="w-4 h-4" />
            </button>
            <button
                className={`${baseStyle} ${inactiveStyle}`}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight className="w-4 h-4" />
            </button>
        </div>
    );
};
