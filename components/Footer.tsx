"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Heart,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Rocket,
  Globe,
  BookOpen,
} from "lucide-react";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Templates", href: "#templates" },
      { name: "Pricing", href: "/pricing" },
      { name: "Demos", href: "/demos" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Tips & Guides", href: "/tips" },
      { name: "Support", href: "/support" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: FaTwitter, href: "https://twitter.com/eaglecode0001", label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { icon: FaGithub, href: "https://github.com/eaglecode", label: "GitHub", color: "hover:text-[#333]" },
    { icon: FaLinkedin, href: "https://www.linkedin.com/in/eagle-code-925768409", label: "LinkedIn", color: "hover:text-[#0077B5]" },
    { icon: SiDiscord, href: "https://discord.com/users/1504005995146379315", label: "Discord", color: "hover:text-[#5865F2]" },
    { icon: Mail, href: "mailto:eaglecode0001@gmail.com", label: "Email", color: "hover:text-amber-400" },
  ];

  return (
    
    <footer className="border-t border-white/5 bg-gradient-to-b from-zinc-900 to-black mt-16 w-full">

      
      {/* Main Footer Content - Full width with inner container for content */}
      <div className="w-full px-0">
        
        {/* Top Section with Newsletter - Full width */}
        <div className="border-b border-white/10 w-full">
          <div className="container mx-auto px-6 pt-12 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              




              
              {/* Brand Column */}
              <div className="lg:col-span-2 space-y-4">


                
             <p className="text-sm text-slate-400 leading-relaxed max-w-md">
  Generate, customize, deploy. EagleCode turns your ideas into scalable Next.js applications.
</p>
                
                {/* Social Links with Real Icons */}
                <div className="flex items-center gap-3 pt-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 ${social.color} hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5`}
                        aria-label={social.label}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Stay Updated</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Get the latest updates, tips, and AI development insights straight to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <button className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap">
                    Subscribe
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid - Full width */}
        <div className="border-b border-white/10 w-full">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Product
                </h3>
                <ul className="space-y-2">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  Resources
                </h3>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  Company
                </h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Legal
                </h3>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Full width */}
        <div className="w-full">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>© {currentYear} EagleCode.</span>
                <span>All rights reserved.</span>
                <span className="flex items-center gap-1 ml-2">
                  Made with <Heart className="w-3 h-3 text-red-400 fill-red-400/20" /> by EagleTeam
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  AI-Powered
                </span>
                <span>•</span>
                <span>Next.js 14</span>
                <span>•</span>
                <span>TypeScript</span>
                <span>•</span>
                <span>Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;