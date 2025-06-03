import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Users,
  Star,
  Plus,
  Share2,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import DemoDialog from "@/components/demo-dialog";
import demoGifPath from "@assets/DemoGIF.gif";
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
                    {t("landing.cta.startFree")}
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
            {[
              { icon: Plus, step: 1 },
              { icon: Share2, step: 2 },
              { icon: Vote, step: 3 },
            ].map(({ icon: Icon, step }) => (
              <motion.div
                key={step}
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="h-8 w-8" />
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