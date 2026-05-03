// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

// // Data Dummy Testimonial (Dibatasi 3, teks dibuat lebih singkat)
// const testimonials = [
//   {
//     id: 1,
//     name: "Budi Santoso",
//     role: "Direktur Utama",
//     company: "PT Maju Jaya Manufaktur",
//     logo: "https://ui-avatars.com/api/?name=MJM&background=0D8ABC&color=fff&size=128",
//     content: "Sejak bergabung dengan ekosistem ini, efisiensi produksi kami meningkat drastis. Sistem otomasi cerdas yang diterapkan berhasil mengurangi downtime mesin hingga 40% dan memberikan visibilitas data real-time."
//   },
//   {
//     id: 2,
//     name: "Siti Rahmawati",
//     role: "Kepala Produksi",
//     company: "CV Presisi Logam",
//     logo: "https://ui-avatars.com/api/?name=CPL&background=EA580C&color=fff&size=128",
//     content: "Melalui program asesmen dan implementasi bertahap, kami mampu melakukan digitalisasi pada lini produksi utama. Hasilnya, cacat produk menurun signifikan dan kualitas ekspor kami lebih terjamin."
//   },
//   {
//     id: 3,
//     name: "Ahmad Wijaya",
//     role: "Founder",
//     company: "Smart Plastik Indonesia",
//     logo: "https://ui-avatars.com/api/?name=SPI&background=16A34A&color=fff&size=128",
//     content: "Dukungan para ahli benar-benar membuka mata kami terhadap potensi industri 4.0. Mereka mentransfer knowledge tentang cara mengoptimalkan layout pabrik dan menerapkan lean manufacturing secara efektif."
//   }
// ];

// export const TestimonialSection = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const nextTestimonial = () => {
//     setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//   };

//   const prevTestimonial = () => {
//     setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
//   };

//   return (
//     <section className="py-24 bg-slate-950 relative overflow-hidden" id="testimonials">
      
//       {/* Background Ornament */}
//       <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1e477e]/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />

//       <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
//         {/* Layout Grid: Kiri untuk Judul, Kanan untuk Testimonial */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
//           {/* --- HEADER SECTION (KIRI) --- */}
//           <div className="lg:col-span-5 flex flex-col justify-center">
//             <motion.div 
//               initial={{ opacity: 0, x: -20 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true, margin: "-100px" }}
//               transition={{ duration: 0.6 }}
//               className="text-left" 
//             >
//               <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight tracking-tight uppercase">
//                 Mereka yang <br className="hidden lg:block"/> <span className="text-orange-500">Tumbuh Bersama</span> Kami
//               </h2>
//             </motion.div>
//           </div>

//           {/* --- TESTIMONIAL SLIDER (KANAN) --- */}
//           <div className="lg:col-span-7 relative flex items-center justify-center gap-4">
            
//             {/* Navigation Button Left (Desktop) */}
//             <button 
//               onClick={prevTestimonial}
//               className="hidden md:flex shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-slate-700 bg-slate-800 text-slate-300 items-center justify-center hover:bg-[#1e477e] hover:text-white hover:border-[#1e477e] transition-all duration-300 shadow-sm cursor-pointer z-20"
//               aria-label="Previous Testimonial"
//             >
//               <ChevronLeft size={24} />
//             </button>

//             {/* Testimonial Card Container */}
//             <div className="w-full relative">
              
//               <div 
//                 className="relative bg-secondary/80 backdrop-blur-md border border-slate-800/50 p-6 md:p-10 min-h-[320px] flex flex-col justify-center shadow-2xl shadow-black/50"
//                 style={{
//                   clipPath: "polygon(0 0, calc(100% - 60px) 0, 100% 60px, 100% 100%, 60px 100%, 0 calc(100% - 60px))"
//                 }}
//               >
//                 {/* Quote Icon */}
//                 <div className="absolute top-6 left-6 md:top-8 md:left-8 text-foreground">
//                   <Quote size={40} className="rotate-180" />
//                 </div>

//                 <div className="relative z-10 flex flex-col items-center text-center mt-4">
//                   <AnimatePresence mode="wait">
//                     <motion.div
//                       key={currentIndex}
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       transition={{ duration: 0.3, ease: "easeInOut" }}
//                       className="flex flex-col items-center w-full"
//                     >
//                       <p className="text-base md:text-lg font-heading font-medium text-slate-300 leading-relaxed mb-8 italic">
//                         "{testimonials[currentIndex].content}"
//                       </p>

//                       <div className="flex flex-row items-center justify-center gap-4 text-left w-full">
//                         {/* Logo PT */}
//                         <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-slate-700 shadow-sm shrink-0">
//                           <img 
//                             src={testimonials[currentIndex].logo} 
//                             alt={`Logo ${testimonials[currentIndex].company}`}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
                        
//                         {/* Teks Informasi */}
//                         <div className="flex flex-col">
//                           <h4 className="text-sm md:text-base font-bold font-heading text-blue-400 uppercase tracking-wide leading-tight">
//                             {testimonials[currentIndex].company}
//                           </h4>
//                           <p className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider mt-1">
//                             {testimonials[currentIndex].name}
//                           </p>
//                           <p className="text-[10px] md:text-xs text-muted-foreground font-sans">
//                             {testimonials[currentIndex].role}
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               </div>
              
//               {/* Mobile Navigation & Dots */}
//               <div className="flex items-center justify-center gap-6 mt-8">
//                 {/* Left Button (Mobile Only) */}
//                 <button 
//                   onClick={prevTestimonial}
//                   className="md:hidden shrink-0 w-10 h-10 rounded-full border border-slate-800 bg-secondary text-slate-300 flex items-center justify-center hover:bg-[#1e477e] hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
//                   aria-label="Previous Testimonial"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>

//                 {/* Dots Indicator */}
//                 <div className="flex gap-2">
//                   {testimonials.map((_, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setCurrentIndex(idx)}
//                       className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
//                         idx === currentIndex ? "bg-orange-500 w-8" : "bg-slate-700 w-2.5 hover:bg-slate-500"
//                       }`}
//                       aria-label={`Go to slide ${idx + 1}`}
//                     />
//                   ))}
//                 </div>

//                 {/* Right Button (Mobile Only) */}
//                 <button 
//                   onClick={nextTestimonial}
//                   className="md:hidden shrink-0 w-10 h-10 rounded-full border border-slate-800 bg-secondary text-slate-300 flex items-center justify-center hover:bg-[#1e477e] hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
//                   aria-label="Next Testimonial"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               </div>

//             </div>

//             {/* Navigation Button Right (Desktop) */}
//             <button 
//               onClick={nextTestimonial}
//               className="hidden md:flex shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-slate-700 bg-slate-800 text-slate-300 items-center justify-center hover:bg-[#1e477e] hover:text-white hover:border-[#1e477e] transition-all duration-300 shadow-sm cursor-pointer z-20"
//               aria-label="Next Testimonial"
//             >
//               <ChevronRight size={24} />
//             </button>

//           </div>

//         </div>

//       </div>
//     </section>
//   );
// };