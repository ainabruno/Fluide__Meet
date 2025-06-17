import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Heart, MessageCircle, Lightbulb, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CompatibilityScore {
  score: number;
  explanation: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

interface CompatibilityScoreProps {
  targetUserId: string;
  targetUserName: string;
  onStartConversation?: () => void;
}

export default function CompatibilityScore({ 
  targetUserId, 
  targetUserName, 
  onStartConversation 
}: CompatibilityScoreProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityScore | null>(null);

  const calculateCompatibility = useMutation({
    mutationFn: async (targetUserId: string): Promise<CompatibilityScore> => {
      return await apiRequest("/api/ai/compatibility", "POST", { targetUserId });
    },
    onSuccess: (data) => {
      setCompatibility(data);
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellente compatibilité";
    if (score >= 60) return "Bonne compatibilité";
    if (score >= 40) return "Compatibilité modérée";
    return "Compatibilité limitée";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Analyse de Compatibilité
          </span>
          {!compatibility && (
            <Button
              onClick={() => calculateCompatibility.mutate(targetUserId)}
              disabled={calculateCompatibility.isPending}
              size="sm"
            >
              {calculateCompatibility.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Analyser"
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {compatibility ? (
          <>
            {/* Score principal */}
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(compatibility.score)}`}>
                {compatibility.score}%
              </div>
              <p className="text-sm text-muted-foreground">
                {getScoreLabel(compatibility.score)}
              </p>
              <Progress value={compatibility.score} className="w-full" />
            </div>

            {/* Explication */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">{compatibility.explanation}</p>
            </div>

            {/* Points forts */}
            {compatibility.strengths.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Heart className="h-4 w-4" />
                  Points forts
                </div>
                <div className="space-y-1">
                  {compatibility.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Défis potentiels */}
            {compatibility.challenges.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Défis à considérer
                </div>
                <div className="space-y-1">
                  {compatibility.challenges.map((challenge, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {challenge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommandations */}
            {compatibility.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <Lightbulb className="h-4 w-4" />
                  Conseils pour une rencontre réussie
                </div>
                <div className="space-y-2">
                  {compatibility.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                      <p className="text-xs">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {onStartConversation && compatibility.score >= 40 && (
              <div className="pt-2 border-t">
                <Button
                  onClick={onStartConversation}
                  className="w-full"
                  variant={compatibility.score >= 60 ? "default" : "outline"}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Envoyer un message à {targetUserName}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Découvrez votre compatibilité avec {targetUserName}
            </p>
            <p className="text-xs mt-1">
              Analyse basée sur vos valeurs, pratiques et intentions
            </p>
          </div>
        )}

        {calculateCompatibility.error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded p-2">
            Erreur lors de l'analyse : {calculateCompatibility.error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}