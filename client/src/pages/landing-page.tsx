import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useToast } from "@/hooks/use-toast";
import {
  CustomSplitText,
  registerGSAPPlugins,
  useFloatingElement,
  useShakeEffect,
  ANIMATION_EFFECTS,
} from "@/components/gsap-animations";
import AnimatedTitle from "@/components/animated-title";
import {
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
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BillingToggle from "../components/billing-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import DemoDialog from "@/components/demo-dialog";
import demoGifPath from "@assets/DemoGIF.gif";
import { MobileMenu } from "@/components/mobile-menu";
import { BottomBar } from "@/components/bottom-bar";
import { ProfileFAB } from "@/components/profile-fab";
import { LandingHeader } from "@/components/landing-header";

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
      className="feature-card bg-gradient-to-br from-white via-gray-50/80 to-primary/[0.02] dark:from-gray-800 dark:via-gray-900 dark:to-primary/[0.03] p-6 rounded-xl shadow-soft border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:via-gray-50 hover:to-primary/[0.08] dark:hover:from-gray-800 dark:hover:via-gray-900 dark:hover:to-primary/[0.12]"
    >
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-3 rounded-lg transition-colors group-hover:from-primary/15 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20">
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
  features: any;
  isPopular?: boolean;
  ctaText: string;
  freeLabel: string;
  perMonth: string;
  yearlyPrice?: string;
  savings?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const priceAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: "easeOut" },
  };
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
          {t("landing.pricing.popular")}
        </div>
      )}
      <CardHeader
        className={`${isPopular ? "bg-primary/5 dark:bg-primary/10" : ""}`}
      >
        <CardTitle className="text-xl font-bold text-center dark:text-white">
          {name}
        </CardTitle>
        <div className="mt-4 text-center">
          <motion.div
            key={price}
            variants={priceAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ display: "inline-block" }}
          >
            <span className="text-3xl font-bold dark:text-white">{price}</span>
          </motion.div>
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
  const [] = useLocation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  // Check for audience user trying to access creator features
  useEffect(() => {
    const audienceTriedAccess = localStorage.getItem('audienceTriedCreatorAccess');
    const attemptingCreatorLogin = localStorage.getItem('attemptingCreatorLogin');
    
    if (audienceTriedAccess === 'true' || attemptingCreatorLogin === 'true') {
      // Clear the flags
      localStorage.removeItem('audienceTriedCreatorAccess');
      localStorage.removeItem('attemptingCreatorLogin');
      
      // Show error message
      toast({
        title: t("auth.notCreatorAccount", "No es una cuenta de creador"),
        description: t("auth.notCreatorAccountDesc", "No es una cuenta de creador. Por favor registrate como creador si querés usar las funciones de Fanlist para creadores."),
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [toast, t]);

  // Hero title ref para animación avanzada (estilo GSAP.com)
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Modal de demostración */}
      <DemoDialog open={isDemoOpen} onOpenChange={setIsDemoOpen} />

      {/* Header */}
      <LandingHeader />

      {/* Hero Principal */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido principal */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {t("landing.hero.title")}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                {t("landing.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/auth?direct=true&register=true">
                  <Button
                    size="lg"
                    className="font-medium text-base bg-primary hover:bg-primary/90 text-white px-8 py-3"
                    onClick={() => {
                      localStorage.setItem('attemptingCreatorLogin', 'true');
                    }}
                  >
                    Crea tu Fanlist gratis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsDemoOpen(true)}
                  size="lg"
                  variant="outline"
                  className="font-medium text-base px-8 py-3"
                >
                  {t("landing.cta.seeDemo")}
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("landing.hero.noCreditCard")}
              </p>
            </motion.div>

            {/* Imagen/Demo a la derecha */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:order-2"
            >
              <div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden cursor-pointer"
                onClick={() => setIsDemoOpen(true)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={demoGifPath}
                    alt="Demo de Fanlist"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-white/90 text-gray-900 hover:bg-white"
                    >
                      ▶ Ver Demo
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("landing.howItWorks.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t(`landing.howItWorks.step${step}.title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(`landing.howItWorks.step${step}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("landing.benefits.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("landing.benefits.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[1, 2, 3, 4].map((benefit) => (
              <motion.div
                key={benefit}
                variants={fadeIn}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t(`landing.benefits.benefit${benefit}.title`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t(`landing.benefits.benefit${benefit}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("landing.testimonials.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <Testimonial
                key={testimonial}
                quote={t(`landing.testimonials.testimonial${testimonial}.quote`)}
                author={t(`landing.testimonials.testimonial${testimonial}.author`)}
                role={t(`landing.testimonials.testimonial${testimonial}.role`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Listo para dejar que tu audiencia te diga qué crear?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de creadores que ya están usando Fanlist para crear contenido que su audiencia realmente quiere ver.
            </p>
            <Link href="/auth?direct=true&register=true">
              <Button
                size="lg"
                className="font-medium text-lg bg-primary hover:bg-primary/90 text-white px-12 py-4"
                onClick={() => {
                  localStorage.setItem('attemptingCreatorLogin', 'true');
                }}
              >
                Empieza gratis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t("landing.hero.noCreditCard")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer placeholder for future implementation */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t("landing.footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
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
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <BillingToggle
                value={billingPeriod}
                onChange={setBillingPeriod}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <PricingCard
                name="Free Plan"
                price="Free"
                description="Ideal for creators just starting out"
                features={[
                  "1 active public leaderboard",
                  "Up to 10 visible ideas",
                  "100 votes/month",
                  "App domain: fanlist.live/YourName",
                  "Basic analytics",
                  "Community support",
                ]}
                ctaText="Get started free"
                freeLabel="Free"
                perMonth="/month"
              />
              <PricingCard
                name="Pro Plan"
                price={billingPeriod === "monthly" ? "$5" : "$3"}
                yearlyPrice={billingPeriod === "monthly" ? "$4" : "$2.40"}
                description="For creators ready to grow"
                features={[
                  "1 active public leaderboard",
                  "Up to 50 visible ideas",
                  "5,000 votes/month",
                  "No platform branding",
                  "Advanced analytics",
                  "Priority support",
                  "CSV export",
                  "Custom domain support",
                ]}
                isPopular={true}
                ctaText="Start free trial"
                freeLabel="Free"
                perMonth="/month"
                savings="Save $7.20/year"
              />
            </div>
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
                  <Link
                    href="/features"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.features")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.pricing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.demo")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roadmap"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.product.roadmap")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.resources.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.blog")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentation"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.documentation")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.guides")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/success-stories"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.resources.success")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.company.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.team")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.company.careers")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t("landing.footer.legal.title")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {t("landing.footer.legal.cookies")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={new URL("@/assets/logo.png", import.meta.url).href}
                alt="Logo"
                className="h-6 w-6 object-contain"
              />
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

      {/* Barra inferior para móvil */}
      <BottomBar />

      {/* Botón flotante de perfil para móvil */}
      <ProfileFAB />
    </div>
  );
}
