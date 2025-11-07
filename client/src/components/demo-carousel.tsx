import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Import carousel images
// Orden correcto: 23 (ideas) -> 25 (audiencia) -> 26 (streaming)
import image1 from "@assets/carousel/carousel-ideas.png"; // Imagen 23 - Ideas y conceptos (PRIMERA)
import image2 from "@assets/carousel/carousel-engagement.png"; // Imagen 25 - Audiencia votando (SEGUNDA)
import image3 from "@assets/carousel/carousel-streaming.png"; // Imagen 26 - Streaming en vivo (TERCERA)

// Las traducciones se manejan dinámicamente en el componente
const imageData = [
  {
    src: image1,
    altKey: "carousel.slide1.alt",
    titleKey: "landing.carousel.slide1.title",
    descriptionKey: "landing.carousel.slide1.description",
  },
  {
    src: image2,
    altKey: "carousel.slide2.alt",
    titleKey: "landing.carousel.slide2.title",
    descriptionKey: "landing.carousel.slide2.description",
  },
  {
    src: image3,
    altKey: "carousel.slide3.alt",
    titleKey: "landing.carousel.slide3.title",
    descriptionKey: "landing.carousel.slide3.description",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function DemoCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { t } = useTranslation();

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev === imageData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? imageData.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Auto-play functionality - 5 seconds interval
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, current]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Carousel Container */}
      <div className="relative aspect-video overflow-hidden rounded-xl shadow-xl bg-gradient-to-br from-white via-gray-50/80 to-primary/[0.02] dark:from-gray-800 dark:via-gray-900 dark:to-primary/[0.03] border border-gray-200/50 dark:border-gray-700/50 group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                nextSlide();
              } else if (swipe > swipeConfidenceThreshold) {
                prevSlide();
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            <img
              src={imageData[current].src}
              alt={t(imageData[current].altKey)}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Overlay with content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl md:text-2xl font-bold mb-2"
                >
                  {t(imageData[current].titleKey)}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm md:text-base opacity-90"
                >
                  {t(imageData[current].descriptionKey)}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Hidden until hover */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {imageData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-gradient-to-r from-purple-600 to-blue-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          />
        ))}
      </div>
    </div>
  );
}
