"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  ClipboardCheck, MessageSquare, Wrench, Cpu, 
  ShieldCheck, ArrowRight, Zap, Factory, 
  Globe, BarChart3, Users, Building2 
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";
import { Button } from "@/src/components/ui/button";

export const PublicServiceCatalogView = () => {
  const t = useTranslations("PublicNavbar");

  const services = [
    {
      id: "assessment",
      icon: <ClipboardCheck size={32} />,
      title: "Asesmen Kematangan Industri",
      description: "Evaluasi mendalam tingkat kesiapan Industri 4.0 usaha Anda menggunakan metodologi INDI 4.0 yang diakui secara nasional.",
      features: ["Skoring Otomatis", "Analisis 6 Dimensi", "Laporan Komprehensif"],
      color: "bg-blue-500",
      link: "/register"
    },
    {
      id: "mentoring",
      icon: <MessageSquare size={32} />,
      title: "Pendampingan Ahli (Mentoring)",
      description: "Konsultasi eksklusif dengan para ahli dari POLMAN Bandung untuk menyelesaikan tantangan teknis dan manajemen bisnis.",
      features: ["Advisor Berpengalaman", "Sesi Privat", "Penyelesaian Masalah"],
      color: "bg-orange-500",
      link: "/register"
    },
    {
      id: "reservation",
      icon: <Wrench size={32} />,
      title: "Reservasi Mesin & Fasilitas",
      description: "Akses ke fasilitas Smart Manufacturing dan mesin-mesin industri canggih milik UPT SIKIM dan Politeknik.",
      features: ["Booking Online", "Operator Ahli", "Fasilitas Modern"],
      color: "bg-green-500",
      link: "/register"
    },
    {
      id: "tech-info",
      icon: <Cpu size={32} />,
      title: "Informasi Teknologi Terapan",
      description: "Dapatkan akses ke katalog teknologi tepat guna dan inovasi terbaru untuk meningkatkan efisiensi produksi Anda.",
      features: ["IoT Industri", "Otomasi Mesin", "Sistem Cerdas"],
      color: "bg-purple-500",
      link: "/blog"
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="max-w-4xl mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Zap size={14} /> Solusi Industri Terpadu
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-7xl font-bold text-foreground mb-8 uppercase tracking-tight leading-[0.95]"
            >
              Katalog <span className="text-primary">Layanan</span> <br />Penuh MANGO
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              Kami menyediakan ekosistem pendukung lengkap untuk membantu Industri Kecil dan Menengah (IKM) bertransformasi menuju Industri 4.0 dengan lebih cepat dan terukur.
            </motion.p>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-10 bg-card border border-border/50 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${service.color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                
                <div className={`w-16 h-16 rounded-2xl ${service.color} text-white flex items-center justify-center mb-8 shadow-lg shadow-${service.color.split('-')[1]}-500/20`}>
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">{service.title}</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                  {service.description}
                </p>

                <div className="space-y-3 mb-10 mt-auto">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                      <div className={`w-1.5 h-1.5 rounded-full ${service.color}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <Link href={service.link}>
                  <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest group-hover:scale-[1.02] transition-transform">
                    Gunakan Layanan <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Industrial Integration Section */}
          <div className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-20 pointer-events-none" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-8 uppercase tracking-tight leading-tight">
                  Integrasi <span className="text-primary">Ekosistem</span> <br />Manufaktur Cerdas
                </h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  Platform MANGO bekerja sama dengan Politeknik Manufaktur Bandung dan UPT SIKIM untuk menghadirkan layanan yang benar-benar dibutuhkan oleh industri saat ini.
                </p>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-primary">100+</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">IKM Terdaftar</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-primary">50+</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ahli Industri</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-primary">20+</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fasilitas Mesin</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-primary">5+</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Kawasan Industri</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FeatureCard icon={<Factory />} title="Fasilitas Produksi" desc="Akses mesin CNC, Injection Molding, dan 3D Print." />
                <FeatureCard icon={<Globe />} title="Akses Pasar" desc="Promosikan produk IKM ke jaringan bisnis nasional." />
                <FeatureCard icon={<BarChart3 />} title="Efisiensi Biaya" desc="Optimasi proses produksi dengan teknologi digital." />
                <FeatureCard icon={<Users />} title="Jejaring Bisnis" desc="Berhubungan langsung dengan vendor dan pemasok." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors">
    <div className="text-primary mb-4">{icon}</div>
    <h4 className="font-bold mb-1 uppercase text-sm tracking-tight">{title}</h4>
    <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
  </div>
);