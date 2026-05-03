"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { AccordionButton } from "@/src/components/ui/public/AccordionButton";
import { useTranslations } from "next-intl";

interface Manufacturer {
  name: string;
  logo: string;
  location: string;
  phone: string; 
  url: string;
}

interface CatalogItem {
  id: string;
  titleKey: string;
  descKey: string;
  image: string;
  url: string;
  manufacturer: Manufacturer;
}

const catalogItems: CatalogItem[] = [
  {
    id: "prod-1",
    titleKey: "prod_1_title",
    descKey: "prod_1_desc",
    image: "https://images.unsplash.com/photo-1580983546522-878f8bba2310?auto=format&fit=crop&w=800&q=80",
    url: "/catalog/prod-1",
    manufacturer: {
      name: "PT Inovasi Mekatronika",
      logo: "https://ui-avatars.com/api/?name=IM&background=0D8ABC&color=fff",
      location: "Kawasan Industri, Bandung",
      phone: "+62 811-2345-6789",
      url: "/company/inovasi-mekatronika"
    }
  },
  {
    id: "prod-2",
    titleKey: "prod_2_title",
    descKey: "prod_2_desc",
    image: "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&w=800&q=80",
    url: "/catalog/prod-2",
    manufacturer: {
      name: "CV Baja Presisi",
      logo: "https://ui-avatars.com/api/?name=BP&background=EA580C&color=fff",
      location: "Cikarang, Jawa Barat",
      phone: "+62 21-898-7766",
      url: "/company/cv-baja-presisi"
    }
  },
  {
    id: "prod-3",
    titleKey: "prod_3_title",
    descKey: "prod_3_desc",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80",
    url: "/catalog/prod-3",
    manufacturer: {
      name: "PT Plastik Cerdas",
      logo: "https://ui-avatars.com/api/?name=PC&background=16A34A&color=fff",
      location: "Tangerang Selatan",
      phone: "+62 857-1122-3344",
      url: "/company/plastik-cerdas"
    }
  }
];

export const ProductCatalogSection = () => {
  const t = useTranslations("ProductCatalogSection");

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
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight mb-6 tracking-tight uppercase">
              {t("title_part1")} <span className="text-accent">{t("title_part2")}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
              {t("description")}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {catalogItems.map((item) => (
            <div
              key={item.id}
              className="group bg-card hover:shadow-2xl hover:shadow-foreground/5 dark:hover:shadow-none transition-all duration-500 flex flex-col h-full relative text-left"
              style={{
                clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)"
              }}
            >
              <div 
                className="bg-card flex flex-col w-full flex-1 transition-transform duration-500"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 39px) 0, 100% 39px, 100% 100%, 0 100%)"
                }}
              >
                <a href={item.url} className="w-full flex flex-col flex-1 cursor-pointer focus:outline-none group/link">
                  <div className="w-full h-64 relative shrink-0 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={t(`items.${item.titleKey}`)} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="py-6 pr-6 pl-0 flex flex-col flex-1 items-start text-left w-full relative z-10">
                    <h3 className="text-xl font-heading font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 uppercase tracking-tight mb-3">
                      {t(`items.${item.titleKey}`)}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6 line-clamp-3">
                      {t(`items.${item.descKey}`)}
                    </p>

                    <span className="mt-auto w-max px-5 py-2 rounded-full border border-foreground/30 text-foreground text-sm font-semibold tracking-wide transition-colors duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white uppercase pointer-events-none">
                      {t("card_button")}
                    </span>
                  </div>
                </a>

                <div className="pb-6 pt-0 pr-6 pl-0 flex items-center gap-4 bg-card text-left w-full mt-auto relative z-20"> 
                    <a href={item.manufacturer.url} className="flex items-center gap-4 w-full group/company hover:opacity-80 transition-opacity duration-300">
                      <img 
                          src={item.manufacturer.logo} 
                          alt={`Logo ${item.manufacturer.name}`}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-border shadow-sm"
                      />
                      <div className="flex flex-col gap-1 w-full overflow-hidden">
                          <span className="text-sm font-heading font-bold uppercase tracking-wide text-card-foreground group-hover/company:text-primary leading-tight line-clamp-1 transition-colors duration-300">
                              {item.manufacturer.name}
                          </span>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin size={12} className="shrink-0" />
                              <span className="line-clamp-1">{item.manufacturer.location}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone size={12} className="shrink-0" />
                              <span>{item.manufacturer.phone}</span>
                          </div>
                      </div>
                    </a>
                </div>
              </div>
            </div>
          ))}
        </div>

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