import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageCircle, Sparkles, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConversationStartersProps {
  targetUserId: string;
  targetUserName: string;
  onSelectMessage?: (message: string) => void;
}

export default function ConversationStarters({ 
  targetUserId, 
  targetUserName,
  onSelectMessage 
}: ConversationStartersProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const generateSuggestions = useMutation({
    mutationFn: async (targetUserId: string): Promise<{ suggestions: string[] }> => {
      return await apiRequest("/api/ai/conversation-starters", "POST", { targetUserId });
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le message a été copié dans votre presse-papiers",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Suggestions de Conversation IA
          </span>
          <Button
            onClick={() => generateSuggestions.mutate(targetUserId)}
            disabled={generateSuggestions.isPending}
            size="sm"
            variant="outline"
          >
            {generateSuggestions.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Générer"
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Messages personnalisés basés sur vos profils compatibles :
            </p>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm mb-3">{suggestion}</p>
                <div className="flex gap-2">
                  {onSelectMessage && (
                    <Button
                      onClick={() => onSelectMessage(suggestion)}
                      size="sm"
                      className="flex-1"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Utiliser
                    </Button>
                  )}
                  <Button
                    onClick={() => copyToClipboard(suggestion)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Générez des suggestions de conversation personnalisées
            </p>
            <p className="text-xs mt-1">
              Basées sur vos intérêts communs et vos pratiques
            </p>
          </div>
        )}

        {generateSuggestions.error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded p-2">
            Erreur : {generateSuggestions.error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}