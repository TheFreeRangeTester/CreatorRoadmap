import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Check,
  Users,
  Star,
  Plus,
  Share2,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <DemoDialog open={isDemoOpen} onOpenChange={setIsDemoOpen} />
      <LandingHeader />

      {/* Hero Principal */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-gray-900/20 bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4 leading-tight">
                {t("landing.hero.title")}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                {t("landing.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/auth?direct=true&register=true">
                  <Button
                    size="lg"
                    className="font-medium text-base bg-gradient-to-r from-primary via-blue-500 to-primary hover:from-primary/90 hover:via-blue-600 hover:to-primary/90 text-white px-8 py-3"
                    onClick={() => {
                      localStorage.setItem("attemptingCreatorLogin", "true");
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
                  className="font-medium text-base bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 px-8 py-3"
                >
                  {t("landing.cta.seeDemo")}
                </Button>
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
              <motion.div key={step} variants={fadeIn} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary via-blue-500 to-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
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
                className="bg-gradient-to-br from-white via-gray-50/80 to-primary/[0.02] dark:from-gray-800 dark:via-gray-900 dark:to-primary/[0.03] p-6 rounded-lg shadow-md border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:via-gray-50 hover:to-primary/[0.08] dark:hover:from-gray-800 dark:hover:via-gray-900 dark:hover:to-primary/[0.12]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
              ¿Listo para dejar que tu audiencia te diga qué crear?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de creadores que ya están usando Fanlist para crear
              contenido que su audiencia realmente quiere ver.
            </p>
            <Link href="/auth?direct=true&register=true">
              <Button
                size="lg"
                className="font-medium text-lg bg-gradient-to-r from-primary via-blue-500 to-primary hover:from-primary/90 hover:via-blue-600 hover:to-primary/90 text-white px-12 py-4"
                onClick={() => {
                  localStorage.setItem("attemptingCreatorLogin", "true");
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
