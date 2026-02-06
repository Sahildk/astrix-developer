
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Map, LayoutDashboard, FileText, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Magnetic from "@/components/ui/magnetic";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAdmin(!!token);
  }, [pathname]);

  // ... (useEffect)

  const routes = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/report", label: "Report Issue", icon: FileText },
    { href: "/heatmap", label: "Community Map", icon: Map },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const menuVariants: Variants = {
    initial: {
      scaleY: 0,
    },
    animate: {
      scaleY: 1,
      transition: {
        duration: 0.5,
        ease: [0.12, 0, 0.39, 0],
      },
    },
    exit: {
      scaleY: 0,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const containerVariants: Variants = {
    initial: {
      transition: {
        staggerChildren: 0.09,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.09,
        staggerDirection: 1,
      },
    },
  };

  const mobileLinkVariants: Variants = {
    initial: {
      y: 20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.37, 0, 0.63, 1],
      },
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        ease: [0, 0.55, 0.45, 1],
        duration: 0.5,
      },
    },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-50 relative">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-foreground">Tenant<span className="text-primary">Watch</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                pathname === route.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {route.label}
              {pathname === route.href && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 top-full block h-[2px] w-full bg-primary mt-1"
                />
              )}
            </Link>
          ))}
          <Magnetic>
            {isAdmin ? (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Link href="/admin/login">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  Sign In
                </Button>
              </Link>
            )}
          </Magnetic>
        </nav>

        {/* Mobile Nav Button */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 w-10 h-10 flex flex-col justify-center items-center focus:outline-none"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <motion.div
                animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-foreground origin-center rounded-full"
              />
              <motion.div
                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                className="w-full h-0.5 bg-foreground rounded-full"
              />
              <motion.div
                animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-foreground origin-center rounded-full"
              />
            </div>
          </button>
        </div>

        {/* Full Screen Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed left-0 top-0 w-full h-screen origin-top bg-background text-foreground p-8 flex flex-col items-center md:hidden z-40 border-b border-white/10"
            >
              <div className="flex flex-col h-full justify-between w-full max-w-sm mx-auto pt-24 pb-10 px-4">
                <motion.div
                  variants={containerVariants}
                  initial="initial"
                  animate="open"
                  exit="initial"
                  className="flex flex-col gap-6 items-start w-full"
                >
                  {routes.map((route) => (
                    <div key={route.href} className="overflow-hidden w-full">
                      <motion.div variants={mobileLinkVariants}>
                        <Link
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-3xl font-bold tracking-tight hover:text-primary transition-colors flex items-center gap-4 w-full",
                            pathname === route.href ? "text-primary bg-primary/5 pl-4 -ml-4 border-l-4 border-primary" : "text-muted-foreground"
                          )}
                        >
                          <route.icon className="h-6 w-6 opacity-70" /> {route.label}
                        </Link>
                      </motion.div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
                  exit={{ opacity: 0 }}
                  className="w-full border-t border-white/10 pt-8"
                >
                  <Magnetic>
                    {isAdmin ? (
                      <Link href="/admin">
                        <Button variant="outline" className="w-full text-lg h-12 border-primary/50 text-primary hover:bg-primary/10">
                          Admin Panel
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin/login">
                        <Button className="w-full text-lg h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </Magnetic>

                  <div className="mt-8 flex justify-center gap-6 text-muted-foreground text-sm">
                    <Link href="#">Terms</Link>
                    <Link href="#">Privacy</Link>
                    <Link href="#">Support</Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
