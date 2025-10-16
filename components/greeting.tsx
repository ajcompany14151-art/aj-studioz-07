"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const Greeting = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";
  
  return (
    <div
      className="mx-auto mt-12 flex size-full max-w-3xl flex-col justify-center px-6 sm:mt-16 sm:px-8 md:mt-24 md:px-12"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="mx-auto mb-8">
          <motion.div
            className="relative mx-auto size-20 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-1 shadow-2xl shadow-primary/30"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="size-full rounded-3xl bg-background p-2">
              <Image
                src="/logo.jpg"
                alt="AJ Studioz AI"
                width={80}
                height={80}
                className="rounded-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
        
        <motion.h1 
          className="gradient-text text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Hey{userName !== "there" ? `, ${userName}` : ""}!
        </motion.h1>
        
        <motion.p 
          className="text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          I'm <span className="font-bold text-foreground">AJ</span>, your premium AI assistant. What can I create for you today?
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="text-3xl mb-3">✨</div>
              <div className="text-sm font-bold text-foreground">Creative Ideas</div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Brainstorm innovative solutions</div>
            </div>
          </motion.div>
          
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="text-3xl mb-3">🎨</div>
              <div className="text-sm font-bold text-foreground">Content Creation</div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Write and refine anything</div>
            </div>
          </motion.div>
          
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-sm font-bold text-foreground">Smart Analysis</div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Solve complex problems</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
