import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from "@gsap/react";

// Utilities para inicializar GSAP con sus plugins
export function registerGSAPPlugins() {
  // Los plugins como SplitText están disponibles solo en versiones comerciales
  // o mediante la membresía Club GSAP, pero podemos usar GSAP core
  gsap.registerPlugin();
}

// Hook para texto con animación de entrada
export function useTextReveal(rootElement: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!rootElement.current) return;
    
    // Seleccionar elementos de texto
    const titles = rootElement.current.querySelectorAll('.gsap-title');
    const paragraphs = rootElement.current.querySelectorAll('.gsap-paragraph');
    const buttons = rootElement.current.querySelectorAll('.gsap-button');
    
    // Timeline para secuenciar las animaciones
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Animación de títulos
    tl.fromTo(
      titles, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 }
    );
    
    // Animación de párrafos
    tl.fromTo(
      paragraphs, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
      "-=0.4" // Comenzar antes de que terminen las animaciones de títulos
    );
    
    // Animación de botones
    tl.fromTo(
      buttons, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
      "-=0.3" // Comenzar antes de que terminen las animaciones de párrafos
    );
    
    return () => {
      tl.kill();
    };
  }, { scope: rootElement, ...options });
}

// Componente para hacer zoom y destacar elementos
export function useZoomFocus(element: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!element.current) return;
    
    const tl = gsap.timeline({ 
      scrollTrigger: {
        trigger: element.current,
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });
    
    tl.fromTo(
      element.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }
    );
    
    return () => {
      tl.kill();
    };
  }, { scope: element, ...options });
}

// Efecto de desplazamiento paralax para imágenes o fondos
export function useParallaxEffect(element: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!element.current) return;
    
    // Movimiento paralax básico
    gsap.to(element.current, {
      y: "30%",
      ease: "none",
      scrollTrigger: {
        trigger: element.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5
      }
    });
    
    return () => {
      // Limpieza
    };
  }, { scope: element, ...options });
}

// Efecto de entrada de tarjetas en cascada
export function useStaggerCards(containerRef: React.RefObject<HTMLElement>, options = {}) {
  useGSAP(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.gsap-card');
    
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%"
        }
      }
    );
    
    return () => {
      // Limpieza
    };
  }, { scope: containerRef, ...options });
}

// Hook para animación de recorrido de texto (typing)
export function useTypingEffect(text: string, speed: number = 40) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text, speed]);
  
  return { displayedText, isTyping };
}

// Componente para animación de conteo
export function useCountUp(end: number, duration: number = 2, delay: number = 0) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!elementRef.current) return;
    
    gsap.to(elementRef.current, {
      innerHTML: end,
      duration: duration,
      delay: delay,
      ease: "power1.inOut",
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: elementRef.current,
        start: "top 80%"
      }
    });
    
    return () => {
      // Limpieza
    };
  }, { scope: elementRef });
  
  return { count, setCount, elementRef };
}

// Componente para cargar GSAP ScrollTrigger si es necesario
export function useGSAPScrollTrigger() {
  useEffect(() => {
    // En una implementación real, cargaríamos el plugin ScrollTrigger
    // Pero como no tenemos acceso al plugin comercial, solo simulamos la carga
    console.log("ScrollTrigger would be loaded here if available");
    
    return () => {
      // Limpieza al desmontar
    };
  }, []);
}