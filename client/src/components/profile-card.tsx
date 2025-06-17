import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircleQuestion, MapPin, Flag, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ProfileCardProps {
  profile: {
    id: number;
    userId: string;
    displayName: string;
    bio?: string;
    location?: string;
    birthDate?: string;
    gender?: string;
    orientation?: string;
    values?: string[];
    practices?: string[];
    intentions?: string[];
    isVerified?: boolean;
  };
  variant?: "default" | "compact";
  showActions?: boolean;
}

export default function ProfileCard({ 
  profile, 
  variant = "default", 
  showActions = true 
}: ProfileCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const age = profile.birthDate 
    ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear()
    : null;

  const interactionMutation = useMutation({
    mutationFn: async ({ targetUserId, type }: { targetUserId: string; type: string }) => {
      await apiRequest("POST", "/api/interactions", { targetUserId, type });
    },
    onSuccess: (_, variables) => {
      if (variables.type === "like") {
        setIsLiked(true);
        toast({
          title: "Like envoyé!",
          description: "Votre intérêt a été transmis.",
        });
      } else if (variables.type === "block") {
        toast({
          title: "Profil bloqué",
          description: "Cette personne ne pourra plus vous contacter.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/search"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer cette action.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    interactionMutation.mutate({ targetUserId: profile.userId, type: "like" });
  };

  const handleBlock = () => {
    if (confirm("Êtes-vous sûr de vouloir bloquer ce profil ?")) {
      interactionMutation.mutate({ targetUserId: profile.userId, type: "block" });
    }
  };

  const handleReport = () => {
    if (confirm("Signaler ce profil pour contenu inapproprié ?")) {
      interactionMutation.mutate({ targetUserId: profile.userId, type: "report" });
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" alt={profile.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg">
                {profile.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-neutral-600 truncate">
                  {profile.displayName}
                </h3>
                {profile.isVerified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              {(profile.location || age) && (
                <div className="flex items-center space-x-2 text-sm text-neutral-500">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {age && <span>• {age} ans</span>}
                </div>
              )}
              {profile.values && profile.values.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.values.slice(0, 2).map((value, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                  {profile.values.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.values.length - 2}
                    </Badge>
                  )}
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
      <div className="relative">
        {/* Profile Image */}
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src="" alt={profile.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
              {profile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Verification Badge */}
        {profile.isVerified && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Name and Basic Info */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-neutral-600 mb-2">
            {profile.displayName}
          </h3>
          
          <div className="flex items-center text-sm text-neutral-500 space-x-2 mb-3">
            {profile.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
            {age && <span>• {age} ans</span>}
            {profile.gender && <span>• {profile.gender}</span>}
          </div>

          {profile.bio && (
            <p className="text-neutral-600 text-sm line-clamp-3 mb-4">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Values */}
        {profile.values && profile.values.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Valeurs</h4>
            <div className="flex flex-wrap gap-1">
              {profile.values.slice(0, 3).map((value, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {value}
                </Badge>
              ))}
              {profile.values.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.values.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Practices */}
        {profile.practices && profile.practices.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Pratiques</h4>
            <div className="flex flex-wrap gap-1">
              {profile.practices.slice(0, 3).map((practice, index) => (
                <Badge key={index} className="bg-primary/10 text-primary text-xs">
                  {practice}
                </Badge>
              ))}
              {profile.practices.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.practices.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Intentions */}
        {profile.intentions && profile.intentions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Intentions</h4>
            <div className="flex flex-wrap gap-1">
              {profile.intentions.slice(0, 2).map((intention, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {intention}
                </Badge>
              ))}
              {profile.intentions.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.intentions.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-blue-600"
              onClick={handleLike}
              disabled={isLiked || interactionMutation.isPending}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? "Liké" : "Like"}
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageCircleQuestion className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBlock}
              disabled={interactionMutation.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReport}
              disabled={interactionMutation.isPending}
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
