// components/ClientMotionDiv.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ClientMotionDiv({ children, ...props }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div {...props}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
}