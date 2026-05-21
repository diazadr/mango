"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { AccordionButton } from "@/src/components/ui/public/AccordionButton";
import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { api } from "@/src/lib/http/axios";
import { Loader2 } from "lucide-react";

export const ProductCatalogSection = () => {
  const t = useTranslations("ProductCatalogSection");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/v1/public/products?per_page=3")
      .then(res => setProducts(res.data.data || []))
      .catch(err => console.error("Gagal memuat produk:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="products">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight mb-6 tracking-tight">
              {t("title_part1")} <span className="text-accent">{t("title_part2")}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
              {t("description")}
            </p>
          </motion.div>
        </div>

        {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t("no_products")}
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {products.map((item) => (
              <div
                key={item.id}
                className="group bg-transparent hover:shadow-2xl hover:shadow-foreground/5 dark:hover:shadow-none transition-all duration-500 flex flex-col h-full relative text-left"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)"
                }}
              >
                <div 
                  className="bg-transparent flex flex-col w-full flex-1 transition-transform duration-500"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 39px) 0, 100% 39px, 100% 100%, 0 100%)"
                  }}
                >
                  <a href={`/products/${item.slug}`} className="w-full flex flex-col flex-1 cursor-pointer focus:outline-none group/link">
                    <div className="w-full h-64 relative shrink-0 overflow-hidden bg-muted">
                      <img 
                        src={item.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    <div className="py-6 pr-6 pl-0 flex flex-col flex-1 items-start text-left w-full relative z-10">
                      <h3 className="text-xl font-heading font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 tracking-tight mb-3">
                        {item.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6 line-clamp-3">
                        {item.description || t("no_description")}
                      </p>

                      <span className="mt-auto w-max px-5 py-2 rounded-full border border-foreground/30 text-foreground text-sm font-semibold tracking-wide transition-colors duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white pointer-events-none">
                        {t("card_button")}
                      </span>
                    </div>
                  </a>

                  {item.umkm && (
                    <div className="pb-6 pt-0 pr-6 pl-0 flex items-center gap-4 bg-transparent text-left w-full mt-auto relative z-20"> 
                        <a href={`/umkm/${item.umkm.slug}`} className="flex items-center gap-4 w-full group/company hover:opacity-80 transition-opacity duration-300">
                          <img 
                              src={item.umkm.logo_url || `https://ui-avatars.com/api/?name=${item.umkm.name}&background=random`} 
                              alt={`Logo ${item.umkm.name}`}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-border shadow-sm"
                          />
                          <div className="flex flex-col gap-1 w-full overflow-hidden">
                              <span className="text-sm font-heading font-bold tracking-wide text-card-foreground group-hover/company:text-primary leading-tight line-clamp-1 transition-colors duration-300">
                                  {item.umkm.name}
                              </span>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin size={12} className="shrink-0" />
                                  <span className="line-clamp-1">{item.umkm.regency}</span>
                              </div>
                          </div>
                        </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center pt-4"
        >
            <a href="/products">
              <AccordionButton>
                  {t("view_all_button")}
              </AccordionButton>
            </a>
        </motion.div>
      </div>
    </section>
  );
};
