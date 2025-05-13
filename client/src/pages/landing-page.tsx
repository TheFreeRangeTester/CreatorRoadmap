import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CustomSplitText,
  registerGSAPPlugins,
  useFloatingElement,
  useShakeEffect,
  ANIMATION_EFFECTS,
} from "@/components/gsap-animations";
import AnimatedTitle from "@/components/animated-title";
import {
  CloudLightning,
  ArrowRight,
  Check,
  CircleCheck,
  Zap,
  Users,
  LineChart,
  Award,
  Layers,
  Globe,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
// No necesitamos importar useAuth para la página de inicio
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import DemoDialog from "@/components/demo-dialog";
import demoGifPath from "@assets/DemoGIF.gif";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Componente de tarjeta de característica
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className="feature-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de tarjeta de plan de precios
function PricingCard({
  name,
  price,
  description,
  features,
  isPopular,
  ctaText,
  freeLabel,
  perMonth,
}: {
  name: string;
  price: string;
  description: string;
  features: any; // Using any to handle i18n array return type
  isPopular?: boolean;
  ctaText: string;
  freeLabel: string;
  perMonth: string;
}) {
  // Ensure features is an array
  const featuresList: string[] = Array.isArray(features) ? features : [];
  return (
    <motion.div
      variants={fadeIn}
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border transition-all duration-300 hover:-translate-y-1 ${
        isPopular
          ? "border-primary/50 dark:border-primary/70 shadow-primary/10"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold text-center py-1.5">
          MÁS POPULAR
        </div>
      )}
      <CardHeader
        className={`${isPopular ? "bg-primary/5 dark:bg-primary/10" : ""}`}
      >
        <CardTitle className="text-xl font-bold text-center dark:text-white">
          {name}
        </CardTitle>
        <div className="mt-4 text-center">
          <span className="text-3xl font-bold dark:text-white">{price}</span>
          {price !== freeLabel && (
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              {perMonth}
            </span>
          )}
        </div>
        <CardDescription className="text-center mt-2 text-gray-600 dark:text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3">
          {featuresList.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CircleCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pb-6 px-6">
        <Button
          className={`w-full ${
            isPopular
              ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
              : ""
          }`}
          variant={isPopular ? "default" : "outline"}
        >
          {ctaText}
        </Button>
      </CardFooter>
    </motion.div>
  );
}

// Componente de testimonio
function Testimonial({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 italic">"{quote}"</p>
        <div>
          <p className="font-semibold dark:text-white">{author}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const { t } = useTranslation();

  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const featuresRef = useRef(null);

  // Inicializar los plugins de GSAP
  useEffect(() => {
    // Registra los plugins personalizados
    registerGSAPPlugins();
    // Registra ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    return () => {
      // Limpiar cuando el componente se desmonte
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Hero title ref para animación avanzada (estilo GSAP.com)
  const heroTitle3DRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const heroGraphicRef = useRef(null);
  const heroButtonRef = useRef(null);

  // Ya no necesitamos useAdvancedTextReveal, usaremos el componente AnimatedText

  // Añadir efecto de flotación al gráfico del hero
  useFloatingElement(heroGraphicRef, {
    amplitude: 15,
    frequency: 4,
    rotation: true,
  });

  // Efecto de vibración en hover para el botón
  useShakeEffect(heroButtonRef, {
    intensity: 0.5,
    speed: 0.05,
    trigger: "hover",
  });

  // Animaciones principales con la implementación anterior para mantener compatibilidad
  useEffect(() => {
    try {
      // Set initial states to avoid flickering
      if (heroTitleRef.current && heroTextRef.current) {
        gsap.set([heroTitleRef.current, heroTextRef.current], {
          opacity: 0,
        });
      }

      // Set initial state for badge
      if (heroBadgeRef.current) {
        gsap.set(heroBadgeRef.current, {
          scale: 0.8,
          opacity: 0,
        });
      }

      // Create a timeline for better control
      const tl = gsap.timeline({ delay: 0.2 });

      // Badge pop animation
      if (heroBadgeRef.current) {
        tl.to(heroBadgeRef.current, {
          scale: 1.1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(2)",
        }).to(heroBadgeRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power1.out",
        });
      }

      // Hero title animation usando nuestra implementación CustomSplitText
      if (heroTitleRef.current) {
        const titleSplit = new CustomSplitText(heroTitleRef.current, {
          type: "chars",
        });
        tl.fromTo(
          titleSplit.chars,
          { opacity: 0, y: 40, rotationX: -90 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: "back.out(1.7)",
          }
        );
      }

      // Hero text fade in con efecto mejorado
      if (heroTextRef.current) {
        tl.fromTo(
          heroTextRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.4" // Start a bit before the previous animation finishes
        );
      }

      // Features cards stagger animation with better controls
      if (featuresRef.current) {
        gsap.fromTo(
          ".feature-card",
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // Clean up to avoid conflicts
          }
        );
      }
    } catch (error) {
      console.error("Error en animaciones GSAP:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Modal de demostración */}
      <DemoDialog open={isDemoOpen} onOpenChange={setIsDemoOpen} />
      {/* Header */}
      <header className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CloudLightning className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-bold text-neutral-800 dark:text-white">
                Fanlist
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="#features"
                  className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                >
                  {t("landing.menu.features")}
                </a>
                <a
                  href="#pricing"
                  className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                >
                  {t("landing.menu.pricing")}
                </a>
                <a
                  href="#testimonials"
                  className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                >
                  {t("landing.menu.testimonials")}
                </a>
              </div>
              <div className="flex gap-2">
                <Link href="/auth?direct=true">
                  <Button variant="outline">{t("landing.cta.login")}</Button>
                </Link>
                <Link href="/auth?direct=true&register=true">
                  <Button>{t("landing.cta.register")}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-gray-900/20 bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <div ref={heroBadgeRef}>
              <Badge
                variant="outline"
                className="px-3 py-1 bg-primary/10 text-primary-600 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800/50 mb-4"
              >
                {t("landing.hero.tagline")}
              </Badge>
            </div>

            {/* Título con animación antigua para compatibilidad */}
            <h1
              ref={heroTitleRef}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 hidden"
            >
              {t("landing.hero.title")}
            </h1>

            {/* Título con animación 3D al estilo GSAP.com */}
            <div className="mb-6">
              <AnimatedTitle
                text={t("landing.hero.title")}
                effect={ANIMATION_EFFECTS.TEXT_REVEAL}
                className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
                direction="center"
              />
            </div>

            <p
              ref={heroTextRef}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div ref={heroButtonRef}>
                <Link href="/auth?direct=true&register=true">
                  <Button
                    size="lg"
                    className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                  >
                    {t("landing.cta.startFree")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <Button
                onClick={() => setIsDemoOpen(true)}
                size="lg"
                variant="outline"
                className="font-medium text-base"
              >
                {t("landing.cta.seeDemo")}
              </Button>
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              {t("landing.hero.noCreditCard")}
            </div>

            <div
              ref={heroGraphicRef}
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden cursor-pointer"
              onClick={() => setIsDemoOpen(true)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={demoGifPath}
                  alt="Demostración de IdeaVote"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium text-white mb-2 drop-shadow-md">
                      {t("landing.hero.leaderboardPreview")}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="backdrop-blur-sm"
                    >
                      {t("landing.hero.seeFullDemo")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                5,000+
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("landing.stats.activeCreators")}
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                2M+
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("landing.stats.votesMonthly")}
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                98%
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("landing.stats.satisfaction")}
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                35%
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {t("landing.stats.engagement")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="mb-4">
              <AnimatedTitle
                text={t("landing.features.title")}
                effect={ANIMATION_EFFECTS.BLINKING_CURSOR}
                className="text-3xl md:text-4xl font-bold dark:text-white"
              />
            </div>
            <motion.p
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              {t("landing.features.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            ref={featuresRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title={t("landing.features.leaderboards.title")}
              description={t("landing.features.leaderboards.description")}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title={t("landing.features.suggestions.title")}
              description={t("landing.features.suggestions.description")}
            />
            <FeatureCard
              icon={<LineChart className="h-6 w-6 text-primary" />}
              title={t("landing.features.analytics.title")}
              description={t("landing.features.analytics.description")}
            />
            <FeatureCard
              icon={<Award className="h-6 w-6 text-primary" />}
              title={t("landing.features.customization.title")}
              description={t("landing.features.customization.description")}
            />
            <FeatureCard
              icon={<Layers className="h-6 w-6 text-primary" />}
              title={t("landing.features.multiple.title")}
              description={t("landing.features.multiple.description")}
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-primary" />}
              title={t("landing.features.sharing.title")}
              description={t("landing.features.sharing.description")}
            />
          </motion.div>
        </div>
      </section>

      {/* Visual showcase */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div variants={fadeIn} className="order-2 md:order-1">
                <div className="mb-6">
                  <AnimatedTitle
                    text={t(
                      "landing.showcase.title",
                      "Decisiones basadas en datos para tu contenido"
                    )}
                    effect={ANIMATION_EFFECTS.GLITCH}
                    className="text-3xl md:text-4xl font-bold dark:text-white leading-tight"
                  />
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {t(
                    "landing.showcase.description",
                    "Conoce exactamente lo que tu audiencia desea ver y crea contenido que resuene con ellos, generando más engagement y crecimiento para tu marca personal."
                  )}
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-1 mt-1">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t(
                        "landing.showcase.bullet1",
                        "Mayor engagement de tu audiencia con votaciones interactivas"
                      )}
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-1 mt-1">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t(
                        "landing.showcase.bullet2",
                        "Datos en tiempo real sobre las preferencias de tus seguidores"
                      )}
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-1 mt-1">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t(
                        "landing.showcase.bullet3",
                        "Personalización completa para adaptarse a tu marca"
                      )}
                    </p>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="order-1 md:order-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {/* Aquí iría una imagen o gráfico, usando un placeholder por ahora */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <div className="max-w-[80%] p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-primary">
                              FN
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm dark:text-white">
                              Fanlist Dashboard
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Ideas en tiempo real
                            </p>
                          </div>
                        </div>
                        <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded-full">
                          Live
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-yellow-900">
                                1
                              </span>
                            </div>
                            <span className="text-sm dark:text-white">
                              Tutorial avanzado de edición
                            </span>
                          </div>
                          <div className="text-xs font-medium">342 votos</div>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-gray-900">
                                2
                              </span>
                            </div>
                            <span className="text-sm dark:text-white">
                              Revisión de equipos de streaming
                            </span>
                          </div>
                          <div className="text-xs font-medium">289 votos</div>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold text-amber-100">
                                3
                              </span>
                            </div>
                            <span className="text-sm dark:text-white">
                              Colaboración con artistas
                            </span>
                          </div>
                          <div className="text-xs font-medium">251 votos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="mb-4">
              <AnimatedTitle
                text={t("landing.howItWorks.title", "Cómo funciona Fanlist")}
                effect={ANIMATION_EFFECTS.BOUNCE}
                className="text-3xl md:text-4xl font-bold dark:text-white"
              />
            </div>
            <motion.p
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              {t(
                "landing.howItWorks.subtitle",
                "Un proceso simple para mantener conectados a tus fans"
              )}
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-10"
            >
              <motion.div
                variants={fadeIn}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  {t("landing.howItWorks.step1.title", "Crea tu leaderboard")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    "landing.howItWorks.step1.description",
                    "Configura rápidamente un leaderboard personalizado para que tu audiencia pueda interactuar"
                  )}
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  {t(
                    "landing.howItWorks.step2.title",
                    "Comparte con tu audiencia"
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    "landing.howItWorks.step2.description",
                    "Comparte el enlace único con tus seguidores en tus redes sociales o sitio web"
                  )}
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  {t(
                    "landing.howItWorks.step3.title",
                    "Recibe feedback y crece"
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    "landing.howItWorks.step3.description",
                    "Analiza los resultados y utiliza el feedback para crear contenido que realmente conecte"
                  )}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 dark:text-white"
            >
              {t("landing.pricing.title")}
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              {t("landing.pricing.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <PricingCard
              name={t("landing.pricing.freePlan.name")}
              price={t("landing.pricing.freePlan.price")}
              description={t("landing.pricing.freePlan.description")}
              features={
                t("landing.pricing.freePlan.features", {
                  returnObjects: true,
                }) as string[]
              }
              ctaText={t("landing.pricing.freePlan.ctaText")}
              freeLabel={t("landing.pricing.freePlan.price")}
              perMonth={t("landing.pricing.price.perMonth")}
            />
            <PricingCard
              name={t("landing.pricing.proPlan.name")}
              price={t("landing.pricing.proPlan.price")}
              description={t("landing.pricing.proPlan.description")}
              features={
                t("landing.pricing.proPlan.features", {
                  returnObjects: true,
                }) as string[]
              }
              isPopular={true}
              ctaText={t("landing.pricing.proPlan.ctaText")}
              freeLabel={t("landing.pricing.freePlan.price")}
              perMonth={t("landing.pricing.price.perMonth")}
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 dark:text-white"
            >
              {t("landing.testimonials.title")}
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              {t("landing.testimonials.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <Testimonial
              quote={t("landing.testimonials.testimonial1.quote")}
              author={t("landing.testimonials.testimonial1.author")}
              role={t("landing.testimonials.testimonial1.role")}
            />
            <Testimonial
              quote={t("landing.testimonials.testimonial2.quote")}
              author={t("landing.testimonials.testimonial2.author")}
              role={t("landing.testimonials.testimonial2.role")}
            />
            <Testimonial
              quote={t("landing.testimonials.testimonial3.quote")}
              author={t("landing.testimonials.testimonial3.author")}
              role={t("landing.testimonials.testimonial3.role")}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {t("landing.cta.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("landing.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?direct=true&register=true">
                <Button
                  size="lg"
                  className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                >
                  {t("landing.cta.startButton")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button
                onClick={() => setIsDemoOpen(true)}
                size="lg"
                variant="outline"
                className="font-medium text-base"
              >
                {t("landing.cta.demoButton")}
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t("landing.cta.noCreditCard")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.product.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.demo")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.roadmap")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.resources.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.blog")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.documentation")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.guides")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.success")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.company.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.about")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.team")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.contact")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.careers")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.legal.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.terms")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <CloudLightning className="h-6 w-6 text-primary" />
              <h1 className="ml-2 text-lg font-bold text-neutral-800 dark:text-white">
                Fanlist
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Fanlist.{" "}
              {t("landing.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
