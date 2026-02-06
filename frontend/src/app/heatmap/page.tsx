"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
// import { MOCK_ISSUES } from "@/lib/mock-data"; // Removed
import { useIssues } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with Leaflet
const HeatmapView = dynamic(() => import("@/components/heatmap-view"), {
    loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse text-muted-foreground">Loading Map Data...</div>,
    ssr: false
});

export default function HeatmapPage() {
    const { issues } = useIssues();
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

    const neighborhoodData = useMemo(() => {
        return issues.reduce((acc, issue) => {
            if (!acc[issue.location]) {
                acc[issue.location] = { count: 0, severity: 0, issues: [] };
            }
            acc[issue.location].count += 1;
            acc[issue.location].issues.push(issue);
            return acc;
        }, {} as Record<string, { count: number, severity: number, issues: typeof issues }>);
    }, [issues]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-col md:flex-row p-4 border-b border-white/10 flex justify-between items-start md:items-center bg-background/80 backdrop-blur gap-4 z-10 relative">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <MapPin className="text-primary" /> Community Heatmap
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground">Visualizing report density across neighborhoods.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div> High Severity</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Moderate</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Low Severity</div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Map Visualization */}
                <div className="flex-1 relative z-0">
                    <HeatmapView
                        onSelectNeighborhood={setSelectedNeighborhood}
                        selectedNeighborhood={selectedNeighborhood}
                        issues={issues} // Pass issues to the map view if it supports it, assuming it helps
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
