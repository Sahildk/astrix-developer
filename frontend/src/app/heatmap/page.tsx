"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
// import { MOCK_ISSUES } from "@/lib/mock-data"; // Removed
import { useIssues } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dynamic import to avoid SSR issues with Leaflet
const HeatmapView = dynamic(() => import("@/components/heatmap-view"), {
    loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse text-muted-foreground">Loading Map Data...</div>,
    ssr: false
});

export default function HeatmapPage() {
    const { issues } = useIssues();
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            // Search Filter
            if (searchQuery && !issue.location.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Category Filter
            if (categoryFilter !== "all" && issue.category.toLowerCase().replace(" ", "-") !== categoryFilter) {
                return false;
            }
            // Date Filter
            if (dateFilter !== "all") {
                const date = new Date(issue.date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (dateFilter === "7days" && diffDays > 7) return false;
                if (dateFilter === "30days" && diffDays > 30) return false;
            }
            return true;
        });
    }, [issues, searchQuery, categoryFilter, dateFilter]);

    const neighborhoodData = useMemo(() => {
        return filteredIssues.reduce((acc, issue) => {
            if (!acc[issue.location]) {
                acc[issue.location] = { count: 0, severity: 0, issues: [] };
            }
            acc[issue.location].count += 1;
            acc[issue.location].issues.push(issue);
            return acc;
        }, {} as Record<string, { count: number, severity: number, issues: typeof issues }>);
    }, [filteredIssues]);

    // Auto-select if search results in only one neighborhood
    useMemo(() => {
        const locations = Object.keys(neighborhoodData);
        if (locations.length === 1 && searchQuery.length > 2) {
            setSelectedNeighborhood(locations[0]);
        }
    }, [neighborhoodData, searchQuery]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-col md:flex-row p-4 border-b border-white/10 flex justify-between items-start md:items-center bg-background/80 backdrop-blur gap-4 z-10 relative">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <MapPin className="text-primary" /> Community Heatmap
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground">Visualizing report density across neighborhoods.</p>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Input
                            placeholder="Search Neighborhood..."
                            className="h-8 w-40 md:w-56 bg-white/5 border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="safety">Safety Hazard</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="harassment">Harassment</SelectItem>
                            <SelectItem value="discrimination">Discrimination</SelectItem>
                            <SelectItem value="unfair-rent">Unfair Rent</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10">
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Map Visualization */}
                <div className="flex-1 relative z-0">
                    <HeatmapView
                        onSelectNeighborhood={setSelectedNeighborhood}
                        selectedNeighborhood={selectedNeighborhood}
                        issues={filteredIssues}
                    />
                </div>

                {/* Sidebar Details */}
                <div className={cn(
                    "fixed inset-0 z-50 md:static md:z-0 md:h-full transition-transform duration-300 bg-background/95 md:bg-card/50 backdrop-blur-xl border-l border-white/10",
                    selectedNeighborhood ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden",
                    "w-full md:w-80 flex flex-col"
                )}>
                    {selectedNeighborhood && neighborhoodData[selectedNeighborhood] ? (
                        <div className="flex flex-col h-full bg-background md:bg-transparent">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-card/50 md:bg-transparent">
                                <h2 className="text-xl font-bold">{selectedNeighborhood}</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedNeighborhood(null)}
                                    className="hover:bg-white/10 rounded-full"
                                >
                                    ✕ <span className="sr-only">Close</span>
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-muted-foreground">Total Reports</span>
                                    <Badge variant="outline">{neighborhoodData[selectedNeighborhood].count}</Badge>
                                </div>
                                {neighborhoodData[selectedNeighborhood].issues.map(issue => (
                                    <Card key={issue.id} className="p-3 bg-white/5 border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary" className="text-[10px]">{issue.category}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{new Date(issue.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-semibold text-sm mb-1">{issue.title}</h4>
                                        <p className="text-xs text-muted-foreground break-words">{issue.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden"></div>
                    )}
                </div>
            </div>
        </div>
    );
}
