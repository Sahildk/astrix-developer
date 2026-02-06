
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, MapPin, BarChart3, Users, Map as MapIcon } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/magnetic";

function HeroGrid() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="absolute left-[-10%] top-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/20 opacity-20 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/20 opacity-20 blur-[120px]" />
    </div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      <HeroGrid />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-visible">
        <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-8 text-center lg:text-left z-10"
                >
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Trusted by 10,000+ Tenants
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                        RECLAIM <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-500">YOUR HOME.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        The first anonymous reporting platform designed to hold landlords accountable and make housing safe for everyone.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Link href="/report">
                            <Magnetic>
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_var(--primary)] text-white w-full sm:w-auto">
                                    Start Reporting <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Magnetic>
                        </Link>
                        <Link href="/heatmap">
                            <Magnetic>
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 w-full sm:w-auto backdrop-blur-sm">
                                    Explore Map
                                </Button>
                            </Magnetic>
                        </Link>
                    </div>
                    
                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                     <div className="flex -space-x-3 pl-2">
                         {["deadpool.png", "moonknight.jpg", "spiderman.jpg", "venom.png"].map((img, i) => (
                             <Magnetic key={i}>
                                <div className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-zinc-800 cursor-pointer hover:z-10 transition-all">
                                     <Image
                                        src={`/images/${img}`}
                                        alt={`User ${i + 1}`}
                                        fill
                                        className="object-cover"
                                     />
                                </div>
                             </Magnetic>
                         ))}
                     </div>
                         <p>Join the community watch today.</p>
                    </div>
                </motion.div>

                {/* Hero Image / 3D Element */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden lg:block h-[600px] w-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse" />
                    <motion.div 
                        style={{ y }}
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="relative z-10 w-full h-full flex items-center justify-center"
                    >
                         <div className="relative w-[120%] h-[120%]">
                             <Image 
                                src="/hero-city.png" 
                                alt="Futuristic City" 
                                fill 
                                className="object-contain drop-shadow-2xl"
                                priority
                             />
                         </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="w-full bg-white/5 border-y border-white/10 overflow-hidden py-4 backdrop-blur-md">
          <div className="flex items-center animate-infinite-scroll whitespace-nowrap min-w-full">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-12 items-center text-muted-foreground font-semibold uppercase tracking-widest text-sm pr-12">
                    <span>Safety First</span> • <span>Anonymous Reporting</span> • <span>Community Driven</span> • <span>Real-time Alerts</span> • <span>AI Verification</span> • <span>Landlord Accountability</span> • <span>Transparent Housing</span> •
                  </div>
               ))}
          </div>
      </div>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 container mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">Why TenantWatch?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
             Tools designed for the modern tenant.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-6 max-w-6xl mx-auto h-auto md:h-[600px]">
             {/* Feature 1 - Large Left */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:row-span-2 md:col-span-1 bg-card/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
            >
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div>
                     <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                        <Shield className="h-6 w-6" />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2">100% Anonymous</h3>
                     <p className="text-muted-foreground">Report issues without fear. We use advanced encryption to protect your identity from landlords.</p>
                 </div>
                 <div className="mt-8 relative h-40 bg-zinc-900/50 rounded-xl border border-white/5 p-4">
                     <div className="flex items-center gap-3 mb-3">
                         <div className="h-8 w-8 rounded-full bg-zinc-700" />
                         <div className="h-2 w-24 bg-zinc-700 rounded-full" />
                     </div>
                     <div className="space-y-2">
                        <div className="h-2 w-full bg-zinc-800 rounded-full" />
                        <div className="h-2 w-3/4 bg-zinc-800 rounded-full" />
                     </div>
                     <div className="absolute bottom-4 right-4 text-xs text-green-400 font-mono">ENCRYPTED</div>
                 </div>
             </motion.div>

             {/* Feature 2 - Wide Top Right */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-2 bg-gradient-to-br from-primary/20 to-purple-600/10 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group"
             >
                 <div className="z-10 relative max-w-xs">
                     <h3 className="text-2xl font-bold text-white mb-2 ml-3">Live Heatmap</h3>
                     <p className="text-muted-foreground ml-3">Visualize danger zones in real-time before you sign a lease.</p>
                 </div>
                 <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('/hero-city.png')] bg-cover opacity-20 group-hover:opacity-40 transition-opacity mix-blend-overlay" />
                 <div className="z-10 mt-6 md:mt-0">
                     <Button variant="secondary" className="rounded-full">View Map</Button>
                 </div>
             </motion.div>

             {/* Feature 3 - Small Bottom Middle */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-card/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center group"
             >
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:rotate-12 transition-transform">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Analysis</h3>
             </motion.div>

             {/* Feature 4 - Small Bottom Right */}
             <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-card/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center group"
             >
                <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Verified Reviews</h3>
             </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5" />
           <div className="container mx-auto max-w-4xl text-center relative z-10">
               <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                   DON'T LIVE IN <br /><span className="text-primary">THE DARK.</span>
               </h2>
               <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                   Join the fastest growing tenant community and help us build a transparent housing market for everyone.
               </p>
               <Link href="/report">
                <Magnetic>
                    <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-white text-black hover:bg-gray-200">
                        Join the Movement
                    </Button>
                </Magnetic>
               </Link>
           </div>
      </section>

    </div>
  );
}

// Helper icon
function AlertTriangle(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
  }
