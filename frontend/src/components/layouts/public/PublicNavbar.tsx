"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/src/components/layouts/dashboard/ThemeToggle";

import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const t = useTranslations("PublicNavbar");
  const rawPathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Clean pathname to check current page without locale
  const pathname = rawPathname.replace(/^\/[a-z]{2}/, "") || "/";
  const isHome = pathname === "/";

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 10) {
      setIsScrolled(false);
      setIsVisible(true);
    } else {
      setIsScrolled(true);

      if (currentScrollY > 100) {
        const lastScrollY = Number(
          document.documentElement.dataset.lastScrollY || "0"
        );
        if (currentScrollY > lastScrollY + 5) {
          setIsVisible(false);
          setOpen(false);
          setDropdownOpen(false);
        } else if (currentScrollY < lastScrollY - 5) {
          setIsVisible(true);
        }
      }
    }

    document.documentElement.dataset.lastScrollY = String(currentScrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Helper for hash links: redirect to home if on another page
  const getHref = (href: string) => {
    if (href.startsWith("#") && !isHome) {
      return `/${href}`;
    }
    return href;
  };

  const navLinks = [
    { href: "#about", label: t("about") },
    { href: "/blog", label: "Blog", active: pathname.startsWith("/blog") },
    { href: "/services", label: "Layanan", active: pathname.startsWith("/services") },
    { href: "#testimonials", label: t("testimonials") },
  ];

  const serviceLinks = [
    { href: "/services", label: "Katalog Layanan Penuh" },
    { href: "/products", label: "Katalog Produk IKM" },
    { href: "#features", label: t("features") },
  ];

  // Dynamic styles for hero (transparent) vs scrolled states
  const linkStyle = (isScrolled || !isHome)
    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10";

  const heroIconStyle = !isScrolled && isHome
    ? "border-white/20 bg-white/10 text-primary-foreground/70 hover:bg-white/20 hover:text-primary-foreground"
    : "";

  return (
    <nav
      id="public-navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Navbar Background */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out z-0 ${
          open
            ? "bg-background shadow-lg"
            : (isScrolled || !isHome)
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      />

      {/* Navbar Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between relative z-[60]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group z-50">
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
            >
              <img
                src="/images/logos/logo-mango.png"
                alt="MANGO Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
            <span
              className={`text-xl lg:text-2xl font-sans font-black tracking-tight uppercase transition-colors duration-500 ${
                isScrolled || open || !isHome
                  ? "text-foreground group-hover:text-primary"
                  : "text-primary-foreground"
              }`}
            >
              MAN<span className="text-accent">GO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.href === "/services") {
                 return (
                    <div
                        key={link.href}
                        className="relative"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <button className={`nav-link group ${linkStyle} ${link.active ? "text-primary font-bold" : ""}`}>
                            {link.label}
                            <ChevronDown
                                size={16}
                                className={`ml-1 transition-transform duration-200 ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="dropdown-panel !left-0 !right-auto !w-64 !mt-1 !rounded-[1.5rem]"
                                >
                                    {serviceLinks.map((sLink) => (
                                        <Link
                                            key={sLink.href}
                                            href={getHref(sLink.href)}
                                            onClick={() => setDropdownOpen(false)}
                                            className="dropdown-item py-3"
                                        >
                                            {sLink.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                 );
              }
              return (
                <Link 
                    key={link.href} 
                    href={getHref(link.href)} 
                    className={`nav-link ${linkStyle} ${link.active ? "text-primary font-bold" : ""}`}
                >
                    {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle — uses .icon-btn, overridden for hero transparency */}
            <ThemeToggle className={heroIconStyle} />

            {/* Login — same nav-link style as other links */}
            <Link
              href="/login"
              className={`nav-link ${
                isScrolled
                  ? "text-foreground hover:text-primary hover:bg-muted"
                  : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
              }`}
            >
              {t("login")}
            </Link>

            {/* Register CTA — accent color (orange = CTA only) */}
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-10 px-6 rounded-full bg-accent text-accent-foreground text-[13px] font-semibold tracking-wide shadow-md hover:bg-accent/90 transition-colors duration-200 cursor-pointer"
              >
                {t("register")}
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Theme Toggle — ghost variant for mobile */}
            <ThemeToggle
              variant="ghost"
              className={`${
                !isScrolled && !open
                  ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                  : ""
              }`}
            />

            {/* Hamburger — matches .icon-btn-ghost shape and sizing */}
            <button
              onClick={() => setOpen(!open)}
              className={`icon-btn-ghost ${
                isScrolled || open
                  ? "text-foreground hover:bg-muted"
                  : "text-primary-foreground hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                    className="absolute"
                  >
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                    className="absolute"
                  >
                    <Menu size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="md:hidden bg-background overflow-hidden absolute w-full z-40 border-t border-border"
            >
              <div className="px-6 py-6 pb-8 flex flex-col gap-1">
                {/* About */}
                <Link
                  href={navLinks[0].href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav-link"
                >
                  {navLinks[0].label}
                </Link>

                {/* Services Dropdown */}
                <div className="flex flex-col">
                  <button
                    onClick={() =>
                      setMobileDropdownOpen(!mobileDropdownOpen)
                    }
                    className="mobile-nav-link justify-between"
                  >
                    {t("services")}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        mobileDropdownOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-0.5 ml-4 pl-4 border-l-2 border-border overflow-hidden"
                      >
                        {serviceLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="py-2.5 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Testimonials */}
                <Link
                  href={navLinks[1].href}
                  onClick={() => setOpen(false)}
                  className="mobile-nav-link"
                >
                  {navLinks[1].label}
                </Link>

                {/* Divider */}
                <div className="dropdown-divider my-3" />

                {/* Auth Actions */}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mobile-nav-link"
                >
                  {t("login")}
                </Link>

                {/* Register CTA — accent/orange for CTA only */}
                <Link href="/register" onClick={() => setOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold tracking-wide shadow-md hover:bg-accent/90 transition-colors duration-200 mt-2 cursor-pointer"
                  >
                    {t("register")}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}