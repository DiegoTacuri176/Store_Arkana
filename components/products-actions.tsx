"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProductActionsProps {
  productId: string;
  isFavoritedInitially: boolean;
}

export function ProductActions({ productId, isFavoritedInitially }: ProductActionsProps) {
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (loading) return;
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500)); 

    const newState = !isFavorited;
    setIsFavorited(newState);

    if (newState) {
      toast.success("¡Agregado a tus favoritos!");
    } else {
      toast.error("Eliminado de tus favoritos");
    }

    setLoading(false);
    
  };

  // --- Manejo del botón COMPARTIR ---
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
      .then(() => toast.success("¡Enlace compartido exitosamente!"))
      .catch((error) => {
        // En caso de que el usuario cancele o falle la API.
        if (error.name !== "AbortError") {
            toast.error("No se pudo compartir el enlace.");
            console.error("Error sharing:", error);
        }
      });
    } else {
      // Fallback: Copiar el enlace al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="flex gap-3">
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleToggleFavorite}
        disabled={loading}
        className={isFavorited ? "text-red-500 border-red-500 hover:bg-red-500/10" : "hover:text-red-500"}
      >
        {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500' : ''}`} />
        )}
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleShare}
        disabled={loading}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}