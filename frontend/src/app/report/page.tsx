
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertTriangle, CheckCircle2, Sparkles, X, FileText, Loader2 } from "lucide-react";
import { useIssues } from "@/lib/store";
import { IssueCategory, IssueStatus } from "@/lib/mock-data";

export default function ReportPage() {
  const router = useRouter();
  const { addIssue } = useIssues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [landlord, setLandlord] = useState(""); // New State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Configuration Error", {
        description: "Cloudinary keys are missing in .env.local"
      });
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // 5MB
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        newUrls.push(data.secure_url);
      }

      if (newUrls.length > 0) {
        setUploadedImages(prev => [...prev, ...newUrls]);
        toast.success(`Uploaded ${newUrls.length} file(s)`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image(s). Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);

    // Simulate AI Analysis
    if (val.length > 5) {
      setIsAnalyzing(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:8000/classify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: val }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("AI Response:", data); // Debug log
            const suggested = data.category; // e.g. "Safety", "Harassment"

            if (suggested) {
              const lower = suggested.toLowerCase();

              const map: Record<string, string> = {
                'safety': 'safety',
                'maintenance': 'maintenance',
                'harassment': 'harassment',
                'discrimination': 'discrimination',
                'unfair rent': 'unfair-rent', // Handle potential spaces
                'unfair-rent': 'unfair-rent'
              };

              // Check if we have a valid mapping, otherwise default or ignore
              if (map[lower]) {
                setCategory(map[lower]);
              } else {
                // Try direct assignment if it matches any value (fallback)
                if (['safety', 'maintenance', 'harassment', 'discrimination', 'unfair-rent'].includes(lower)) {
                  setCategory(lower);
                }
              }
            }
          }
        } catch (error) {
          console.error("Classification failed:", error);
        }
        setIsAnalyzing(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Convert 'safety' -> 'Safety' for the type
    const categoryMap: Record<string, IssueCategory> = {
      'safety': 'Safety',
      'maintenance': 'Maintenance',
      'harassment': 'Harassment',
      'discrimination': 'Discrimination',
      'unfair-rent': 'Safety' // Default fallback or mapped type
    };

    const finalCategory = categoryMap[category] || 'Safety';

    addIssue({
      id: `new-${Date.now()}`,
      title,
      description,
      category: finalCategory,
      status: 'Reported',
      location,
      landlordName: landlord || "Unknown",
      date: new Date().toISOString(),
      upvotes: 0,
      isVerified: false,
      images: uploadedImages
    });

    toast.success("Report Submitted Successfully", {
      description: "Redirecting to community dashboard...",
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Report a Housing Issue</h1>
          <p className="text-muted-foreground">
            Submit reports anonymously. Help us identify and fix housing problems in your community.
          </p>
        </div>

        <Card className="border-white/10 bg-card/50 backdrop-blur-sm shadow-2xl relative overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible. Your identity will remain anonymous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Description (AI Powered)</Label>
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-primary flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3 animate-spin" /> Analyzing content...
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail (e.g., 'There is a fire hazard in the hallway...')"
                  className="min-h-[120px] bg-background/50 focus:bg-background transition-colors"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Safety Hazard</SelectItem>
                    <SelectItem value="maintenance">Maintenance Delay</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="unfair-rent">Unfair Rent Practices</SelectItem>
                  </SelectContent>
                </Select>
                {category && !isAnalyzing && description.length > 5 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    Category suggested by AI based on description.
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Building / Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Green Valley Apts"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                  <p className="text-[10px] text-muted-foreground pt-1">
                    * Include city name for better map accuracy (e.g. "Whitefield, Bangalore")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landlord">Landlord / Owner Name</Label>
                  <Input
                    id="landlord"
                    placeholder="e.g., Sharma Properties"
                    value={landlord}
                    onChange={(e) => setLandlord(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Evidence (Optional)</Label>

                {/* File List */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {uploadedImages.map((url, idx) => {
                      const isPdf = url.toLowerCase().endsWith('.pdf');
                      return (
                        <div key={idx} className="relative group bg-background/50 border rounded-md p-2 flex items-center gap-2 overflow-hidden">
                          {isPdf ? (
                            <FileText className="h-8 w-8 text-blue-400 shrink-0" />
                          ) : (
                            <img src={url} alt="Evidence" className="h-12 w-12 object-cover rounded bg-muted" />
                          )}
                          <span className="text-xs truncate flex-1 text-muted-foreground">{url.split('/').pop()}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  className={`border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm text-muted-foreground">Click to upload photos or documents</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">supports JPG, PNG, PDF</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4">
                {category === 'safety' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">For immediate life-threatening emergencies, please call emergency services (100 or 112) immediately.</p>
                  </motion.div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Anonymous Report"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Your personal details are encrypted and never shared.
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
