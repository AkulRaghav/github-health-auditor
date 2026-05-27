"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import { GitBranch, Shield, History, Share2 } from "lucide-react";

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <div className="relative flex min-h-[80vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600"
                style={{ filter: "url(#squircle-sm)" }}
              >
                <GitBranch className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold">Sign in to RepoHealth</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Connect your GitHub account for enhanced features
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-8 space-y-3">
              {[
                { icon: Shield, text: "Audit private repositories" },
                { icon: History, text: "Track health score over time" },
                { icon: Share2, text: "Save and share reports" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                >
                  <item.icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Sign in button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-medium text-black transition-all hover:bg-neutral-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </motion.button>

            <p className="mt-6 text-center text-xs text-neutral-600">
              The app works without sign-in too. Auth enables private repos and history.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
