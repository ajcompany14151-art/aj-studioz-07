"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const Greeting = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";
  
  return (
    <div
      className="relative mx-auto mt-4 flex size-full max-w-4xl flex-col justify-center px-4 sm:mt-8 sm:px-6 md:mt-20 md:px-8"
      key="overview"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 size-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 size-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 size-48 rounded-full bg-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Enhanced AI Branding */}
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="mb-8 flex flex-col items-center gap-6 sm:mb-12"
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        {/* AJ STUDIOZ Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="relative size-20 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl sm:size-24">
            <div className="size-full overflow-hidden rounded-2xl bg-background">
              <Image
                src="/logo.jpg"
                alt="AJ STUDIOZ AI"
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </div>
          </div>
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
        </motion.div>

        {/* Brand Title */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            AJ STUDIOZ
          </h1>
          <p className="mt-2 bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80 bg-clip-text text-lg font-medium text-transparent sm:text-xl">
            AI Assistant
          </p>
        </motion.div>
      </motion.div>

      {session?.user && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center justify-center gap-4 sm:mb-8"
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.6 }}
        >
          <div className="group flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-0.5 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl sm:size-16 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800">
            <div className="size-full overflow-hidden rounded-xl">
              <Image
                src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`}
                alt={session.user.name || "User"}
                width={64}
                height={64}
                className="size-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
                unoptimized
              />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
      >
        Hello {userName}! 👋
      </motion.div>
      
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center text-lg text-muted-foreground sm:text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 1.0 }}
      >
        What would you like to explore today?
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:mt-12"
      >
        {[
          { icon: "💬", title: "Chat", desc: "Natural conversations" },
          { icon: "📝", title: "Create", desc: "Documents & artifacts" },
          { icon: "🧠", title: "Learn", desc: "Comprehensive answers" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
            className="group rounded-2xl bg-muted/30 p-4 text-center transition-all duration-300 hover:bg-muted/50 hover:scale-105"
          >
            <div className="mb-2 text-2xl transition-transform duration-300 group-hover:scale-110">
              {feature.icon}
            </div>
            <div className="font-semibold text-foreground">{feature.title}</div>
            <div className="text-sm text-muted-foreground">{feature.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
