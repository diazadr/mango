"use client";

import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
// Menggunakan Lucide untuk ikon UI standar
import { Mail, Phone, MapPin } from 'lucide-react';
// Menggunakan React Icons khusus untuk logo brand/sosial media
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export const PublicFooter = () => {
    const t = useTranslations("PublicFooter");
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand & About */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white tracking-tight font-heading mb-4">
                            MANGO
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            {t("description")}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <FaFacebookF size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <FaTwitter size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <FaLinkedinIn size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Kolom 2: Layanan Kami (Sesuai JSON: services_title) */}
                    <div>
                        <h4 className="text-white font-bold mb-6 font-heading tracking-wide uppercase text-sm">
                            {t("services_title")}
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/advisor" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                                    {t("services.advisor")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/assessment" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                                    {t("services.assessment")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/reservation" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                                    {t("services.reservation")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/smart-manufacturing" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                                    {t("services.smart_mfg")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Kolom 3: Perusahaan (Sesuai JSON: company_title) */}
                    <div>
                        <h4 className="text-white font-bold mb-6 font-heading tracking-wide uppercase text-sm">
                            {t("company_title")}
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-sm text-slate-400 hover:text-primary transition-colors">
                                    {t("company.about")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/partners" className="text-sm text-slate-400 hover:text-primary transition-colors">
                                    {t("company.partners")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-slate-400 hover:text-primary transition-colors">
                                    {t("company.blog")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-sm text-slate-400 hover:text-primary transition-colors">
                                    {t("company.careers")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Kolom 4: Kontak (Sesuai JSON: contact_title) */}
                    <div>
                        <h4 className="text-white font-bold mb-6 font-heading tracking-wide uppercase text-sm">
                            {t("contact_title")}
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>{t("contact.address")}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span>{t("contact.phone")}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span>{t("contact.email")}</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        &copy; {currentYear} {t("copyright")}
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">
                            {t("legal.privacy")}
                        </Link>
                        <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
                            {t("legal.terms")}
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};