import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutToggleProps {
    viewMode: "grid" | "table";
    onViewModeChange: (mode: "grid" | "table") => void;
}

export default function LayoutToggle({ viewMode, onViewModeChange }: LayoutToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-white text-primary shadow-sm hover:bg-white" : "text-slate-500 hover:text-slate-900"}`}
                onClick={() => onViewModeChange("grid")}
                title="Grid View"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${viewMode === "table" ? "bg-white text-primary shadow-sm hover:bg-white" : "text-slate-500 hover:text-slate-900"}`}
                onClick={() => onViewModeChange("table")}
                title="Table View"
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}
