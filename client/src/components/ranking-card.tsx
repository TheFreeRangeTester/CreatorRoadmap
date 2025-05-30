import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { ChevronUp, Loader2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface RankingCardProps {
  rank: number;
  idea: {
    id: number;
    title: string;
    description: string;
    votes: number;
  };
  isVoting?: boolean;
  isVoted?: boolean;
  isSuccessVote?: boolean;
  onVote?: (ideaId: number) => void;
  isLoggedIn?: boolean;
}

export default function RankingCard({
  rank,
  idea,
  isVoting = false,
  isVoted = false,
  isSuccessVote = false,
  onVote,
  isLoggedIn = false,
}: RankingCardProps) {
  const { t } = useTranslation();
  
  // Definir gradientes basados en el ranking
  const gradientClasses = {
    1: "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600", // #1 Oro
    2: "bg-gradient-to-r from-purple-400 to-violet-600 hover:from-purple-500 hover:to-violet-700", // #2 Púrpura
    3: "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600", // #3 Rosa
    4: "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600", // #4 Azul
    5: "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600", // #5 Verde
    6: "bg-gradient-to-r from-orange-400 to-amber-600 hover:from-orange-500 hover:to-amber-700", // #6 Naranja
    7: "bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600", // #7 Celeste
    default: "bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600" // Default para el resto
  };

  // Seleccionar el gradiente basado en el ranking
  const gradientClass = rank <= 3 
    ? gradientClasses[rank as keyof typeof gradientClasses] 
    : gradientClasses.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: rank * 0.05, // Delay más corto para una carga más rápida
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      whileHover={{ scale: 1.01 }}
      className="will-change-transform"
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-stretch">
          {/* Indicador de posición */}
          <div className={`flex items-center justify-center w-16 text-white font-bold text-xl ${gradientClass} relative`}>
            <span className="relative z-10">{rank > 3 ? `#${rank}` : ''}</span>
            {rank <= 3 && (
              <span 
                className={`absolute trophy-icon text-2xl ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-700'}`}
                ref={(el) => {
                  if (el) {
                    gsap.fromTo(el, 
                      { scale: 0.8, opacity: 0, y: 10 },
                      { 
                        scale: 1, 
                        opacity: 1, 
                        y: 0,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.5)",
                        repeat: -1,
                        yoyo: true,
                        yoyoEase: "power2.out"
                      }
                    );
                  }
                }}
              >
                {rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉'}
              </span>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-bold dark:text-white">{idea.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{idea.description}</p>
          </div>

          {/* Sección de votos */}
          <div className="flex flex-col items-center justify-center px-4 border-l border-gray-100 dark:border-gray-800">
            {isLoggedIn ? (
              isVoted ? (
                <Button 
                  disabled
                  className="rounded-full w-12 h-12 text-white bg-green-500 hover:bg-green-500"
                  aria-label="Ya votado"
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => onVote && onVote(idea.id)}
                  disabled={isVoting || isSuccessVote}
                  className={`rounded-full w-12 h-12 text-white ${gradientClass} ${isSuccessVote ? "bg-green-500 hover:bg-green-500" : ""}`}
                  aria-label="Votar"
                >
                  {isVoting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isSuccessVote ? (
                    <ThumbsUp className="h-5 w-5 animate-bounce" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </Button>
              )
            ) : (
              <Button
                className={`rounded-full w-12 h-12 text-white ${gradientClass}`}
                aria-label={t("common.loginToVote")}
                onClick={() => {
                  // Store the current page for redirect after login
                  localStorage.setItem('redirectAfterAuth', window.location.href);
                  window.location.href = '/auth';
                }}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            )}
            <span className="mt-1 font-bold text-lg dark:text-white">{idea.votes}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}