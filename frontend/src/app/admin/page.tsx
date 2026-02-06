"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIssue, fetchAdminIssues, updateIssueStatus } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, Clock, MapPin, Phone, Mail, XCircle, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [issues, setIssues] = useState<AdminIssue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple auth check
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }
        loadData();
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchAdminIssues();
        setIssues(data);
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const success = await updateIssueStatus(id, newStatus);
        if (success) {
            toast.success(`Marked as ${newStatus}`);
            // Optimistic update
            setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i));
        } else {
            toast.error("Failed to update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        router.push("/");
    };

    // Filtered Lists
    const pendingIssues = issues.filter(i => i.status === "Under Review");
    const activeIssues = issues.filter(i => i.status === "Reported");
    const resolvedIssues = issues.filter(i => i.status === "Resolved" || i.status === "Dismissed");

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin Data...</div>;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage reports and verification queue</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" size="sm" onClick={loadData}>
                            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-amber-500/10 border-amber-500/20">
                        <CardHeader className="py-4">
                            <CardTitle className="text-amber-500 flex items-center gap-2">
                                <Clock className="h-5 w-5" /> Pending Review
                            </CardTitle>
                            <CardDescription className="text-2xl font-bold text-foreground">
                                {pendingIssues.length}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardHeader className="py-4">
                            <CardTitle className="text-blue-500 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Active Reports
                            </CardTitle>
                            <CardDescription className="text-2xl font-bold text-foreground">
                                {activeIssues.length}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                        <CardHeader className="py-4">
                            <CardTitle className="text-green-500 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" /> Resolved/Closed
                            </CardTitle>
                            <CardDescription className="text-2xl font-bold text-foreground">
                                {resolvedIssues.length}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="pending" className="relative">
                            Review Queue
                            {pendingIssues.length > 0 && (
                                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                    {pendingIssues.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="active">Active Reports</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    {/* Pending Tab */}
                    <TabsContent value="pending" className="mt-6 space-y-4">
                        {pendingIssues.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-card/30 rounded-lg border border-dashed border-white/10">
                                <CheckCircle2 className="h-10 w-10 mx-auto text-green-500/50 mb-3" />
                                No pending reports. Good job!
                            </div>
                        ) : (
                            pendingIssues.map(issue => (
                                <AdminIssueCard
                                    key={issue.id}
                                    issue={issue}
                                    onApprove={() => handleStatusUpdate(issue.id, "Reported")}
                                    onDismiss={() => handleStatusUpdate(issue.id, "Dismissed")}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="mt-6 space-y-4">
                        {activeIssues.map(issue => (
                            <AdminIssueCard
                                key={issue.id}
                                issue={issue}
                                onResolve={() => handleStatusUpdate(issue.id, "Resolved")}
                                onDismiss={() => handleStatusUpdate(issue.id, "Dismissed")}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6 space-y-4">
                        {resolvedIssues.map(issue => (
                            <AdminIssueCard key={issue.id} issue={issue} readOnly />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function AdminIssueCard({
    issue,
    onApprove,
    onDismiss,
    onResolve,
    readOnly = false
}: {
    issue: AdminIssue;
    onApprove?: () => void;
    onDismiss?: () => void;
    onResolve?: () => void;
    readOnly?: boolean;
}) {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4 pb-2">
                <div className="space-y-1 w-full">
                    <CardTitle className="text-lg leading-tight">{issue.title}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1 min-w-0 truncate">
                            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{issue.location}</span>
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="truncate">{issue.landlordName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                            {issue.category}
                        </span>
                    </CardDescription>
                </div>
                <Badge variant={
                    issue.status === 'Resolved' ? 'default' :
                        issue.status === 'Dismissed' ? 'destructive' :
                            issue.status === 'Reported' ? 'outline' : 'secondary'
                } className="shrink-0 self-start md:self-center">
                    {issue.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                        <p className="text-sm">{issue.description}</p>

                        {/* Images */}
                        {issue.images && issue.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {issue.images.map((img, i) => (
                                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                        <img src={img} alt="Evidence" className="h-20 w-20 object-cover rounded-md border border-white/10 hover:opacity-80 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                            Reported on: {new Date(issue.date).toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Private Info Box */}
                        <div className="bg-background/40 p-3 rounded-md border border-white/5 space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Private Contact
                            </h4>
                            <div className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span>{issue.contactEmail || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{issue.contactPhone || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {!readOnly && (
                            <div className="flex flex-col gap-2">
                                {onApprove && (
                                    <Button onClick={onApprove} className="w-full bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Publish
                                    </Button>
                                )}
                                {onResolve && (
                                    <Button onClick={onResolve} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
                                    </Button>
                                )}
                                {onDismiss && (
                                    <Button onClick={onDismiss} variant="destructive" className="w-full">
                                        <XCircle className="h-4 w-4 mr-2" /> Dismiss / Reject
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
