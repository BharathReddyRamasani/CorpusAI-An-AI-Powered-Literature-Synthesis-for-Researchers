import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SelectionToolbar } from '../ui/SelectionToolbar';
import { motion } from 'framer-motion';

const AmbientBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[var(--color-background)]">
    <motion.div
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-[var(--color-primary)] opacity-[0.05] filter blur-[120px]"
    />
    <motion.div
      animate={{
        x: [0, -100, 100, 0],
        y: [0, 100, -50, 0],
        scale: [1, 0.8, 1.1, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
      className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vh] rounded-full bg-[var(--color-accent)] opacity-[0.04] filter blur-[150px]"
    />
    <motion.div
      animate={{
        x: [0, 50, -100, 0],
        y: [0, 100, -100, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
      className="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vh] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_50%,var(--color-accent))] opacity-[0.05] filter blur-[120px]"
    />
  </div>
);

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-transparent w-full relative z-0">
      <AmbientBackground />
      <SelectionToolbar />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto relative w-full h-full z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
