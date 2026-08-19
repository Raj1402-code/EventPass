'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Activity,
  ChevronDown,
  Menu,
  X,
  Cpu,
  Truck,
  Shield,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Solutions', path: '/solutions', hasDropdown: true },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  const solutionItems = [
    {
      name: 'Transit AI',
      desc: 'Adaptive signal control for municipal bus corridors',
      path: '/solutions#transit-ai',
      icon: Cpu,
    },
    {
      name: 'Fleet Optimization',
      desc: 'Autonomous emergency routing & fleet telemetry',
      path: '/solutions#fleet',
      icon: Truck,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-panel shadow-md py-3 border-b border-gray-200/80'
          : 'bg-white/80 backdrop-blur-md py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group focus-visible:ring-2 focus-visible:ring-[#006D77] rounded-lg p-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006D77] to-[#83C5BE] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-gray-900 flex items-center">
              NEXUS
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#006D77]/10 text-[#006D77] rounded border border-[#006D77]/20">
                AI
              </span>
            </span>
            <span className="text-[10px] font-medium text-[#006D77] -mt-1 tracking-widest uppercase">
              Urban Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            if (link.hasDropdown) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setSolutionsDropdownOpen(true)}
                  onMouseLeave={() => setSolutionsDropdownOpen(false)}
                >
                  <Link
                    href={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 transition-colors ${
                      pathname.startsWith('/solutions')
                        ? 'text-[#006D77] bg-[#006D77]/10'
                        : 'text-gray-700 hover:text-[#006D77] hover:bg-gray-100/60'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Link>

                  {/* Dropdown Menu */}
                  {solutionsDropdownOpen && (
                    <div className="absolute top-full left-0 w-80 pt-2 animate-fadeIn">
                      <div className="glass-panel rounded-2xl shadow-xl border border-gray-200/80 p-3 space-y-2">
                        {solutionItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.path}
                              onClick={() => setSolutionsDropdownOpen(false)}
                              className="flex items-start p-3 rounded-xl hover:bg-[#006D77]/10 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-[#006D77]/10 text-[#006D77] group-hover:bg-[#006D77] group-hover:text-white flex items-center justify-center transition-colors mr-3 mt-0.5">
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 group-hover:text-[#006D77]">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#006D77] bg-[#006D77]/10'
                    : 'text-gray-700 hover:text-[#006D77] hover:bg-gray-100/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Protected Dashboard Link if logged in */}
          {status === 'authenticated' && (
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                pathname.startsWith('/dashboard')
                  ? 'text-[#006D77] bg-[#006D77]/10'
                  : 'text-gray-700 hover:text-[#006D77] hover:bg-gray-100/60'
              }`}
            >
              <Shield className="w-4 h-4 text-[#006D77]" />
              <span>Command Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Action Controls / Auth */}
        <div className="hidden md:flex items-center space-x-3">
          {status === 'authenticated' ? (
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
                  {session.user?.name?.split(' ')[0] || 'Engineer'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-500 hover:text-red-600"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Request Demo
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:text-[#006D77] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gray-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-semibold ${
                pathname === link.path
                  ? 'text-[#006D77] bg-[#006D77]/10'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {status === 'authenticated' ? (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-base font-semibold text-[#006D77] bg-[#006D77]/10"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Request Demo
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
