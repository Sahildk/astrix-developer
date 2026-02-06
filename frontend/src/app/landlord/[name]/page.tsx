"use client";

import { use, useState } from "react";
import { useIssues } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, AlertTriangle, CheckCircle2, Clock, XCircle, FileText, Image as ImageIcon } from "lucide-react";
import { IssueStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandlordProfilePage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = use(params);
    const router = useRouter();
    const { issues } = useIssues();

    const decodedName = decodeURIComponent(name);
    const landlordIssues = issues.filter(i => i.landlordName === decodedName);

    // Stats
    const totalIssues = landlordIssues.length;
    const resolvedIssues = landlordIssues.filter(i => i.status === 'Resolved').length;
    const safetyIssues = landlordIssues.filter(i => i.category === 'Safety').length;
    const uniqueBuildings = new Set(landlordIssues.map(i => i.location)).size;

    const StatusIcon = ({ status }: { status: IssueStatus }) => {
        switch (status) {
            case 'Resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'Under Review': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'Dismissed': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <FileText className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: IssueStatus) => {
        switch (status) {
            case 'Resolved': return "bg-green-500/10 text-green-500 border-green-500/20";
            case 'Under Review': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'Dismissed': return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="nr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Header */}
                <Card className="w-full md:w-1/3 bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{decodedName}</CardTitle>
                        <CardDescription>Landlord / Property Group</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-muted-foreground">Properties Monitored</span>
                            <span className="font-bold">{uniqueBuildings}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-muted-foreground">Total Reports</span>
                            <span className="font-bold">{totalIssues}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                            <span className="text-muted-foreground">Risk Score</span>
                            <Badge variant={safetyIssues > 2 ? "destructive" : "outline"}>
                                {safetyIssues > 2 ? "High Risk" : "Moderate"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Issues List */}
                <div className="flex-1 space-y-4 w-full">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" /> Reported Issues History
                    </h2>

                    {landlordIssues.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No reports found for this landlord.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {landlordIssues.map((issue, index) => (
                                <motion.div
                                    key={issue.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-card/30 hover:bg-card/50 transition-colors border-white/5">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{issue.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {issue.location}
                                                        <span>•</span>
                                                        {new Date(issue.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("capitalize whitespace-nowrap", getStatusColor(issue.status))}
                                                >
                                                    <span className="mr-1"><StatusIcon status={issue.status} /></span>
                                                    {issue.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                                                {issue.images && issue.images.length > 0 && (
                                                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] h-5 px-1.5">
                                                        <ImageIcon className="h-3 w-3" />
                                                        <span>{issue.images.length}</span>
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}</div>
                    )}
                </div>
            </div >
        </div >
    );
}
