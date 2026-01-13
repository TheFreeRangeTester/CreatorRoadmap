import { useEffect, useRef } from "react";
import { ANIMATION_EFFECTS } from "./gsap-animations";
import gsap from "gsap";
import { CustomSplitText } from "./gsap-animations";

interface AnimatedTextProps {
  text: string;
  effect?: string;
  className?: string;
  delay?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  direction?: "ltr" | "rtl" | "center";
}

export default function AnimatedText({
  text,
  effect = ANIMATION_EFFECTS.TEXT_REVEAL,
  className = "",
  delay = 0,
  tag: Tag = "div",
  direction = "ltr",
}: AnimatedTextProps) {
  // Usando forwardRef para resolver problemas de tipado
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Inicialmente oculto
    gsap.set(textRef.current, { autoAlpha: 1 });

    // Crear split text
    const splitText = new CustomSplitText(textRef.current, { type: "chars" });

    // Aplicar estilos iniciales
    gsap.set(splitText.chars, {
      perspective: 400,
      opacity: 0,
    });

    // Determinar el orden de los caracteres
    let charSet = [...splitText.chars];
    if (direction === "rtl") {
      charSet.reverse();
    } else if (direction === "center") {
      const mid = Math.floor(charSet.length / 2);
      const left = charSet.slice(0, mid).reverse();
      const right = charSet.slice(mid);
      charSet = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < left.length) charSet.push(left[i]);
        if (i < right.length) charSet.push(right[i]);
      }
    }

    // Crear timeline
    const tl = gsap.timeline({
      delay,
      scrollTrigger: {
        trigger: textRef.current,
        start: "top 80%",
        toggleActions: "play none none reset",
      },
    });

    // Determinar el tipo de animación
    switch (effect) {
      case ANIMATION_EFFECTS.TEXT_REVEAL:
        tl.fromTo(
          charSet,
          {
            opacity: 0,
            rotationX: -90,
            translateY: 30,
          },
          {
            duration: 0.03,
            opacity: 1,
            rotationX: 0,
            translateY: 0,
            stagger: 0.02,
            ease: "expo.out",
          }
        );
        break;

      case ANIMATION_EFFECTS.GLITCH:
        // Efecto glitch
        charSet.forEach((char, index) => {
          tl.fromTo(
            char,
            {
              opacity: 0,
              scale: 0,
              color: "red",
              textShadow: "2px 2px 0 #0ff, -2px -2px 0 #f0f",
            },
            {
              opacity: 1,
              scale: 1,
              color: "",
              textShadow: "none",
              duration: 0.2,
              ease: "power1.inOut",
            },
            index * 0.01
          );

          // Añadir pulso glitch aleatorio
          if (index % 3 === 0) {
            tl.to(
              char,
              {
                opacity: 0.8,
                skewX: 20,
                color: "#0ff",
                duration: 0.05,
                yoyo: true,
                repeat: 1,
              },
              `>-0.1`
            );
          }
        });
        break;

      case ANIMATION_EFFECTS.BLINKING_CURSOR:
        // Efecto máquina de escribir
        tl.set(charSet, { opacity: 0 }).set(textRef.current, {
          position: "relative",
        });

        // Crear cursor
        const cursor = document.createElement("span");
        cursor.innerHTML = "|";
        cursor.style.position = "absolute";
        cursor.style.right = "-4px";
        cursor.style.top = "0";
        cursor.style.opacity = "1";
        textRef.current.appendChild(cursor);

        // Animar cursor
        tl.to(cursor, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
        });

        // Animar caracteres uno por uno
        charSet.forEach((char, i) => {
          tl.to(char, {
            opacity: 1,
            duration: 0.01,
            delay: i * 0.06,
          });
        });

        // Mover cursor mientras tipea
        charSet.forEach((char, i) => {
          if (i < charSet.length - 1) {
            const nextChar = charSet[i + 1] as HTMLElement;
            tl.to(
              cursor,
              {
                left: nextChar.offsetLeft + "px",
                duration: 0.05,
              },
              `>-0.05`
            );
          }
        });
        break;

      case ANIMATION_EFFECTS.BOUNCE:
        tl.fromTo(
          charSet,
          { opacity: 0, y: -100 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.03,
            duration: 0.8,
            ease: "bounce.out",
          }
        );
        break;

      default:
        // Animación por defecto - simple fade in
        tl.fromTo(
          charSet,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.02,
            duration: 0.5,
            ease: "power2.out",
          }
        );
    }

    return () => {
      tl.kill();
      if (splitText) {
        splitText.revert();
      }
      // Limpiar cursor si existe
      if (textRef.current && effect === ANIMATION_EFFECTS.BLINKING_CURSOR) {
        const cursor = textRef.current.querySelector("span:last-child");
        if (cursor) textRef.current.removeChild(cursor);
      }
    };
  }, [text, effect, delay, direction]);

  return (
    // @ts-expect-error - Dynamic tag ref typing issue
    <Tag ref={textRef} className={className}>
      {text}
    </Tag>
  );
}
