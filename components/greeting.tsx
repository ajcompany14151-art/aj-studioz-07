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
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        What can I help with?
      </motion.div>
    </div>
  );
};
