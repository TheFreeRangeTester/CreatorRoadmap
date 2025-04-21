import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CloudLightning, ArrowRight, Check, CircleCheck, Zap, Users, LineChart, Award, Layers, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import DemoDialog from "@/components/demo-dialog";
import demoGifPath from "@assets/DemoGIF.gif";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Componente de tarjeta de característica
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={fadeIn}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
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
  ctaText
}: { 
  name: string, 
  price: string, 
  description: string, 
  features: string[],
  isPopular?: boolean,
  ctaText: string
}) {
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
      <CardHeader className={`${isPopular ? "bg-primary/5 dark:bg-primary/10" : ""}`}>
        <CardTitle className="text-xl font-bold text-center dark:text-white">
          {name}
        </CardTitle>
        <div className="mt-4 text-center">
          <span className="text-3xl font-bold dark:text-white">{price}</span>
          {price !== "Gratis" && <span className="text-gray-500 dark:text-gray-400 ml-1">/mes</span>}
        </div>
        <CardDescription className="text-center mt-2 text-gray-600 dark:text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CircleCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
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
  role 
}: { 
  quote: string, 
  author: string, 
  role: string 
}) {
  return (
    <motion.div 
      variants={fadeIn}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const { t } = useTranslation();

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
                IdeaVote
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                  {t('landing.menu.features')}
                </a>
                <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                  {t('landing.menu.pricing')}
                </a>
                <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                  {t('landing.menu.testimonials')}
                </a>
              </div>
              <LanguageToggle />
              <ThemeToggle />
              {user ? (
                <Button onClick={() => navigate("/dashboard")}>
                  {t('landing.cta.goDashboard')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth">
                    <Button variant="outline">{t('landing.cta.login')}</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>{t('landing.cta.register')}</Button>
                  </Link>
                </div>
              )}
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
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary-600 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800/50 mb-4">
                {t('landing.hero.tagline')}
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300"
            >
              {t('landing.hero.title')}
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              {t('landing.hero.subtitle')}
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                <Button 
                  size="lg" 
                  className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                  onClick={() => navigate("/dashboard")}
                >
                  {t('landing.cta.goDashboard')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button size="lg" className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white">
                    {t('landing.cta.startFree')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Button onClick={() => setIsDemoOpen(true)} size="lg" variant="outline" className="font-medium text-base">
                {t('landing.cta.seeDemo')}
              </Button>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-8 text-sm text-gray-500 dark:text-gray-400"
            >
              {t('landing.hero.noCreditCard')}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
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
                    <p className="text-lg font-medium text-white mb-2 drop-shadow-md">{t('landing.hero.leaderboardPreview')}</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="backdrop-blur-sm"
                    >
                      {t('landing.hero.seeFullDemo')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
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
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">5,000+</p>
              <p className="text-gray-600 dark:text-gray-400">Creadores activos</p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">2M+</p>
              <p className="text-gray-600 dark:text-gray-400">Votos mensuales</p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</p>
              <p className="text-gray-600 dark:text-gray-400">Satisfacción</p>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">35%</p>
              <p className="text-gray-600 dark:text-gray-400">↑ en engagement</p>
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
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 dark:text-white"
            >
              Todas las herramientas que necesitas para conectar con tu audiencia
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              Diseñado específicamente para creadores de contenido que quieren hacer crecer su comunidad e involucrar a su audiencia en el proceso creativo.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Leaderboards interactivos" 
              description="Crea leaderboards atractivos donde tu audiencia puede votar por sus ideas favoritas y ver los resultados en tiempo real."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Sugerencias de la comunidad" 
              description="Permite que tu audiencia sugiera ideas directamente en tu leaderboard, potenciando la participación y el sentido de comunidad."
            />
            <FeatureCard 
              icon={<LineChart className="h-6 w-6 text-primary" />}
              title="Analíticas detalladas" 
              description="Obtén insights valiosos sobre qué contenido prefiere tu audiencia y cómo evolucionan estas preferencias con el tiempo."
            />
            <FeatureCard 
              icon={<Award className="h-6 w-6 text-primary" />}
              title="Personalización avanzada" 
              description="Adapta la apariencia de tus leaderboards para que coincidan con tu marca personal, incluyendo colores, logos y estilos."
            />
            <FeatureCard 
              icon={<Layers className="h-6 w-6 text-primary" />}
              title="Múltiples leaderboards" 
              description="Organiza diferentes tipos de contenido o categorías en leaderboards separados para mantener todo ordenado."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-primary" />}
              title="Compartible en cualquier lugar" 
              description="Integra fácilmente tus leaderboards en tu sitio web, redes sociales o newsletters para maximizar su alcance."
            />
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
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
              Planes que se adaptan a tu crecimiento
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              Desde creadores que están empezando hasta profesionales con grandes comunidades, tenemos un plan para cada etapa de tu viaje.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <PricingCard 
              name="Plan Gratuito" 
              price="Gratis" 
              description="Ideal para creadores que recién empiezan"
              features={[
                "1 leaderboard activo",
                "Hasta 10 ideas visibles",
                "Límite de 100 votos/mes",
                "Personalización básica",
                "Analytics básicos",
                "Dominio app (tuvoto.app/creador)"
              ]}
              ctaText="Empezar gratis"
            />
            <PricingCard 
              name="Plan Pro" 
              price="$9" 
              description="Para creadores activos con contenido regular"
              features={[
                "Hasta 3 leaderboards activos",
                "Hasta 50 ideas por leaderboard",
                "5,000 votos/mes",
                "Personalización intermedia",
                "Integración con redes sociales",
                "Analytics más detallados",
                "Exportación CSV",
                "Sin branding de plataforma"
              ]}
              isPopular={true}
              ctaText="Probar gratis por 14 días"
            />
            <PricingCard 
              name="Creator Pro" 
              price="$29" 
              description="Para creadores que monetizan su contenido"
              features={[
                "Leaderboards ilimitados",
                "Ideas ilimitadas",
                "Votos ilimitados",
                "Embedding en sitios propios",
                "Dominio personalizado",
                "Colaboración con equipo",
                "Integraciones de monetización",
                "Prioridad en soporte",
                "Acceso a features beta"
              ]}
              ctaText="Contactar ventas"
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
              Lo que dicen nuestros creadores
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-lg text-gray-600 dark:text-gray-300"
            >
              Descubre cómo IdeaVote ha ayudado a creadores a conectar mejor con su audiencia y crear contenido más relevante.
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
              quote="Desde que empecé a usar IdeaVote, la participación de mi audiencia ha aumentado un 40%. Ahora realmente sé qué quieren ver y mi canal ha crecido mucho más rápido."
              author="Carlos Martínez"
              role="YouTuber de Tecnología"
            />
            <Testimonial 
              quote="Mis seguidores adoran poder votar y sugerir temas para mi podcast. IdeaVote se ha convertido en una parte esencial de mi estrategia de contenido."
              author="Sofía Gómez"
              role="Podcaster"
            />
            <Testimonial 
              quote="La facilidad para integrar los leaderboards en mi sitio web y la capacidad de personalización son increíbles. Mi comunidad se siente más involucrada que nunca."
              author="Javier Rodríguez"
              role="Streamer"
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
              Conecta con tu audiencia hoy mismo
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de creadores que ya están usando IdeaVote para crear contenido más relevante y aumentar su engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg" 
                  className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                  onClick={() => navigate("/dashboard")}
                >
                  Ir al Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button size="lg" className="font-medium text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white">
                    Comenzar gratis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Button onClick={() => setIsDemoOpen(true)} size="lg" variant="outline" className="font-medium text-base">
                Ver demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No se requiere tarjeta de crédito para comenzar
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Características</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Precios</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Demo</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Documentación</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Guías</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Casos de éxito</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compañía</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Equipo</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Contacto</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Empleo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Términos de servicio</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <CloudLightning className="h-6 w-6 text-primary" />
              <h1 className="ml-2 text-lg font-bold text-neutral-800 dark:text-white">
                IdeaVote
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} IdeaVote. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}