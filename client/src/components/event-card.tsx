import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Euro, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description?: string;
    category: string;
    location?: string;
    startDate: string;
    endDate?: string;
    maxParticipants?: number;
    price?: string;
    imageUrl?: string;
    organizerId: string;
  };
  variant?: "default" | "compact";
  showRegistration?: boolean;
}

export default function EventCard({ 
  event, 
  variant = "default", 
  showRegistration = true 
}: EventCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistered, setIsRegistered] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isUpcoming = startDate > new Date();
  const isPastEvent = startDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tantra':
        return 'bg-primary/10 text-primary';
      case 'atelier':
        return 'bg-secondary/10 text-secondary';
      case 'méditation':
        return 'bg-accent/10 text-accent';
      case 'rencontre':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const registrationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/register`, {});
    },
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Inscription confirmée!",
        description: "Vous êtes maintenant inscrit·e à cet événement.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour vous inscrire.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de vous inscrire à cet événement.",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    registrationMutation.mutate();
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
                {!isUpcoming && (
                  <Badge variant="outline" className="text-xs">
                    {isPastEvent ? "Terminé" : "En cours"}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-neutral-600 mb-1 line-clamp-1">
                {event.title}
              </h3>
              <div className="flex items-center text-sm text-neutral-500 mb-2">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(startDate)}
              </div>
              {event.location && (
                <div className="flex items-center text-sm text-neutral-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.location}
                </div>
              )}
            </div>
            <div className="text-right">
              {event.price && parseFloat(event.price) > 0 ? (
                <div className="text-lg font-bold text-primary">
                  {event.price}€
                </div>
              ) : (
                <div className="text-lg font-bold text-secondary">
                  Gratuit
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-primary/30" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-primary">
            {startDate.toLocaleDateString('fr-FR', { day: 'numeric' })}
          </div>
          <div className="text-xs text-neutral-600">
            {startDate.toLocaleDateString('fr-FR', { month: 'short' })}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          {event.price && parseFloat(event.price) > 0 ? (
            <Badge className="bg-primary text-white">
              <Euro className="w-3 h-3 mr-1" />
              {event.price}
            </Badge>
          ) : (
            <Badge className="bg-secondary text-white">
              Gratuit
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Category and Status */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getCategoryColor(event.category)}>
            {event.category}
          </Badge>
          {!isUpcoming && (
            <Badge variant="outline" className="text-xs">
              {isPastEvent ? "Terminé" : "En cours"}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-neutral-600 mb-2">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="text-neutral-600 text-sm line-clamp-3 mb-4">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-neutral-500">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(startDate)}
          </div>
          
          <div className="flex items-center text-sm text-neutral-500">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(startDate)}
            {endDate && ` - ${formatTime(endDate)}`}
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-neutral-500">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
          )}

          {event.maxParticipants && (
            <div className="flex items-center text-sm text-neutral-500">
              <Users className="w-4 h-4 mr-2" />
              {event.maxParticipants} participants max
            </div>
          )}
        </div>

        {/* Action Button */}
        {showRegistration && isUpcoming && (
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-blue-600"
              onClick={handleRegister}
              disabled={isRegistered || registrationMutation.isPending}
            >
              {registrationMutation.isPending 
                ? "Inscription..." 
                : isRegistered 
                ? "Inscrit·e" 
                : "S'inscrire"
              }
            </Button>
            <Button variant="outline">
              En savoir plus
            </Button>
          </div>
        )}

        {!isUpcoming && (
          <Button variant="outline" className="w-full" disabled>
            {isPastEvent ? "Événement terminé" : "En cours"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
