"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { ThemeToggle } from "@/src/components/layouts/dashboard/ThemeToggle";
import { useLocale } from "next-intl";
import { usePathname as useI18nPathname, useRouter } from "@/src/i18n/navigation";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const t = useTranslations("PublicNavbar");
  const rawPathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const locale = useLocale();
  const router = useRouter();
  const i18nPathname = useI18nPathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'id' ? 'en' : 'id';
    router.replace(i18nPathname, { locale: nextLocale as any });
  };

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
    { href: "/blog", label: t("blog"), active: pathname.startsWith("/blog") },
    { href: "/products", label: t("products"), active: pathname.startsWith("/products") },
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
                alt={t("alt_mango_logo")}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <span
              className={`text-xl lg:text-2xl font-sans font-black tracking-tight transition-colors duration-500 ${
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
            {navLinks.map((link) => (
                <Link 
                    key={link.href} 
                    href={getHref(link.href)} 
                    className={`nav-link ${linkStyle} ${link.active ? "text-primary font-bold" : ""}`}
                >
                    {link.label}
                </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-colors ${
                (isScrolled || !isHome)
                  ? "text-foreground hover:text-primary hover:bg-muted"
                  : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
              }`}
            >
              <Globe size={16} />
              <span className="uppercase">{locale === 'id' ? 'EN' : 'ID'}</span>
            </button>

            {/* Theme Toggle — uses .icon-btn, overridden for hero transparency */}
            <ThemeToggle className={heroIconStyle} />

            {/* Login — same nav-link style as other links */}
            <Link
              href="/login"
              className={`nav-link ${
                (isScrolled || !isHome)
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
            <button
              onClick={toggleLocale}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-colors ${
                !isScrolled && !open && isHome
                  ? "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Globe size={16} className="mr-1" />
              <span className="uppercase">{locale === 'id' ? 'EN' : 'ID'}</span>
            </button>

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
              aria-label={t("label_toggle_menu")}
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="mobile-nav-link"
                  >
                    {link.label}
                  </Link>
                ))}

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
