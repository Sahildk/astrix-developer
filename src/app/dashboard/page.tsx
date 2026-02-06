
"use client";

import { useState } from "react";
import { MOCK_ISSUES, Issue, IssueStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle2, Clock, XCircle, ChevronRight, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filterIssues = (status: string) => {
    if (status === "all") return MOCK_ISSUES;
    return MOCK_ISSUES.filter(i => i.status.toLowerCase().replace(" ", "-") === status);
  };

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Issue Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track the status of community-reported housing issues.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-card border border-white/10 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap">
                Total Reports: <span className="text-primary ml-1">{MOCK_ISSUES.length}</span>
            </div>
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-card border border-white/10 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap">
                Resolved: <span className="text-green-500 ml-1">{MOCK_ISSUES.filter(i => i.status === 'Resolved').length}</span>
            </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border border-white/10 p-1 w-full flex-wrap h-auto justify-start md:justify-center overflow-x-auto no-scrollbar">
          <TabsTrigger value="all" className="flex-1 md:flex-none">All Reports</TabsTrigger>
          <TabsTrigger value="reported" className="flex-1 md:flex-none">Reported</TabsTrigger>
          <TabsTrigger value="under-review" className="flex-1 md:flex-none">Under Review</TabsTrigger>
          <TabsTrigger value="resolved" className="flex-1 md:flex-none">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed" className="flex-1 md:flex-none">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterIssues(activeTab).map((issue, index) => (
                    <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <Badge variant="outline" className={cn("capitalize whitespace-nowrap", getStatusColor(issue.status))}>
                                    <span className="mr-1"><StatusIcon status={issue.status} /></span>
                                    {issue.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(issue.date).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg leading-tight mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {issue.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                {issue.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                {issue.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/5">
                                <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 text-foreground/80">
                                    {issue.category}
                                </span>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" /> {issue.upvotes}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
