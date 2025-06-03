import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  ArrowRight,
  Check,
  Users,
  Star,
  Plus,
  Share2,
  Vote,
  Sparkles,
  Heart,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import DemoDialog from "@/components/demo-dialog";
import demoGifPath from "@assets/DemoGIF.gif";
import { LandingHeader } from "@/components/landing-header";

const fadeIn = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Estilos para el efecto de split text
const splitTextStyles = `
  .char {
    display: inline-block;
    transform-origin: center;
    will-change: transform;
  }
  
  .word {
    display: inline-block;
    margin-right: 0.25em;
  }
`;

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
      className="bg-gradient-to-br from-white via-gray-50/80 to-primary/[0.02] dark:from-gray-800 dark:via-gray-900 dark:to-primary/[0.03] p-6 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:via-gray-50 hover:to-primary/[0.08] dark:hover:from-gray-800 dark:hover:via-gray-900 dark:hover:to-primary/[0.12]"
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const titleRef = useRef(null);

  useEffect(() => {
    const audienceTriedAccess = localStorage.getItem(
      "audienceTriedCreatorAccess"
    );
    const attemptingCreatorLogin = localStorage.getItem(
      "attemptingCreatorLogin"
    );

    if (audienceTriedAccess === "true" || attemptingCreatorLogin === "true") {
      localStorage.removeItem("audienceTriedCreatorAccess");
      localStorage.removeItem("attemptingCreatorLogin");

      toast({
        title: t("auth.notCreatorAccount", "No es una cuenta de creador"),
        description: t(
          "auth.notCreatorAccountDesc",
          "No es una cuenta de creador. Por favor registrate como creador si querés usar las funciones de Fanlist para creadores."
        ),
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [toast, t]);

  useEffect(() => {
    gsap.registerPlugin(SplitText);

    if (titleRef.current) {
      const splitTitle = new SplitText(titleRef.current, {
        type: "chars,words",
        charsClass: "char",
        wordsClass: "word",
      });

      gsap.from(splitTitle.chars, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        stagger: 0.02,
        ease: "back.out(1.7)",
        delay: 0.2,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-indigo-950/10">
      <style>{splitTextStyles}</style>
      <DemoDialog open={isDemoOpen} onOpenChange={setIsDemoOpen} />
      <LandingHeader />

      {/* Hero Principal */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={floatingAnimation}
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
          />
          <motion.div 
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"
          />
          <motion.div 
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
            className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 blur-xl"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/5"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left"
            >
              <h1
                ref={titleRef}
                className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4 leading-tight"
              >
                {t("landing.hero.title")}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                {t("landing.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/auth?direct=true&register=true">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      size="lg"
                      className="font-medium text-base bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        localStorage.setItem("attemptingCreatorLogin", "true");
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("landing.cta.startFree")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => setIsDemoOpen(true)}
                    size="lg"
                    variant="outline"
                    className="font-medium text-base px-8 py-3 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-600 dark:hover:border-purple-400 dark:hover:bg-purple-950/30 transition-all duration-300"
                  >
                    {t("landing.cta.seeDemo")}
                  </Button>
                </motion.div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("landing.hero.noCreditCard")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:order-2"
            >
              <div
                className="bg-gradient-to-br from-white via-gray-50/80 to-primary/[0.02] dark:from-gray-800 dark:via-gray-900 dark:to-primary/[0.03] border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                onClick={() => setIsDemoOpen(true)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={demoGifPath}
                    alt="Demo de Fanlist"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-white/90 to-white/80 text-gray-900 hover:from-white hover:to-white/90 backdrop-blur-sm"
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-green-300 to-blue-400 rounded-full opacity-10 blur-2xl"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("landing.howItWorks.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: Plus, step: 1, gradient: "from-emerald-500 to-teal-500", bgGradient: "from-emerald-50 to-teal-50", darkBg: "dark:from-emerald-950/20 dark:to-teal-950/20" },
              { icon: Share2, step: 2, gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50", darkBg: "dark:from-blue-950/20 dark:to-cyan-950/20" },
              { icon: Vote, step: 3, gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50", darkBg: "dark:from-purple-950/20 dark:to-pink-950/20" },
            ].map(({ icon: Icon, step, gradient, bgGradient, darkBg }) => (
              <motion.div 
                key={step} 
                variants={fadeIn} 
                whileHover={{ y: -5, scale: 1.02 }}
                className={`text-center p-6 rounded-2xl bg-gradient-to-br ${bgGradient} ${darkBg} backdrop-blur-sm border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${gradient} text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  animate={pulseAnimation}
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950/10 dark:to-emerald-950/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-gradient-to-r from-green-300 to-blue-400 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 mb-4">
              {t("landing.benefits.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("landing.benefits.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              { benefit: 1, icon: Target, gradient: "from-emerald-500 to-green-500", bgGradient: "from-emerald-50 to-green-50", darkBg: "dark:from-emerald-950/20 dark:to-green-950/20" },
              { benefit: 2, icon: Heart, gradient: "from-pink-500 to-rose-500", bgGradient: "from-pink-50 to-rose-50", darkBg: "dark:from-pink-950/20 dark:to-rose-950/20" },
              { benefit: 3, icon: Zap, gradient: "from-yellow-500 to-orange-500", bgGradient: "from-yellow-50 to-orange-50", darkBg: "dark:from-yellow-950/20 dark:to-orange-950/20" },
              { benefit: 4, icon: TrendingUp, gradient: "from-purple-500 to-indigo-500", bgGradient: "from-purple-50 to-indigo-50", darkBg: "dark:from-purple-950/20 dark:to-indigo-950/20" },
            ].map(({ benefit, icon: Icon, gradient, bgGradient, darkBg }) => (
              <motion.div
                key={benefit}
                variants={fadeIn}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${bgGradient} ${darkBg} p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                    animate={pulseAnimation}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
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
                quote={t(
                  `landing.testimonials.testimonial${testimonial}.quote`
                )}
                author={t(
                  `landing.testimonials.testimonial${testimonial}.author`
                )}
                role={t(`landing.testimonials.testimonial${testimonial}.role`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 dark:from-gray-900 dark:via-violet-950/20 dark:to-purple-950/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={floatingAnimation}
            className="absolute top-10 left-1/4 w-24 h-24 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full opacity-20 blur-xl"
          />
          <motion.div 
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1.5 } }}
            className="absolute bottom-10 right-1/4 w-32 h-32 bg-gradient-to-r from-fuchsia-400 to-pink-500 rounded-full opacity-20 blur-xl"
          />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 mb-4"
            >
              ¿Listo para dejar que tu audiencia te diga qué crear?
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Únete a miles de creadores que ya están usando Fanlist para crear
              contenido que su audiencia realmente quiere ver.
            </motion.p>
            <motion.div variants={fadeIn}>
              <Link href="/auth?direct=true&register=true">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    size="lg"
                    className="font-medium text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white px-12 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300"
                    onClick={() => {
                      localStorage.setItem("attemptingCreatorLogin", "true");
                    }}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Empieza gratis
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.p 
              variants={fadeIn}
              className="text-sm text-gray-500 dark:text-gray-400 mt-4"
            >
              {t("landing.hero.noCreditCard")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-800/50 py-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t("landing.footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
