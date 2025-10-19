"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const Greeting = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";
  
  return (
    <div
      className="mx-auto mt-2 flex size-full max-w-3xl flex-col justify-center px-3 sm:mt-4 sm:px-4 md:mt-16 md:px-8"
      key="overview"
    >
      {session?.user && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4"
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-muted sm:size-14">
            <Image
              src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`}
              alt={session.user.name || "User"}
              width={56}
              height={56}
              className="size-full rounded-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground sm:text-xl">
              Hello, {userName}!
            </div>
            <div className="text-sm text-muted-foreground sm:text-base">
              How can I help you today?
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl text-zinc-900 dark:text-zinc-50 sm:text-3xl md:text-4xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        {session?.user ? "What can I help you with?" : "Welcome to AJ STUDIOZ"}
      </motion.div>
      
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-lg text-zinc-500 sm:text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        How can I help you today?
      </motion.div>
    </div>
  );
};
