import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, BookOpen, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatResponse {
  message: string;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
}

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
    resources?: Array<{ title: string; description: string; url?: string; }>;
  }>>([]);

  const askAssistant = useMutation({
    mutationFn: async (question: string): Promise<ChatResponse> => {
      return await apiRequest("/api/ai/assistant", "POST", { question });
    },
    onSuccess: (response) => {
      setConversation(prev => [
        ...prev,
        { type: 'user', content: question },
        { 
          type: 'assistant', 
          content: response.message,
          suggestions: response.suggestions,
          resources: response.resources
        }
      ]);
      setQuestion("");
    },
  });

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
    askAssistant.mutate(quickQuestion);
  };

  const quickQuestions = [
    "Comment débuter dans le tantra ?",
    "Qu'est-ce que la polyamorie éthique ?",
    "Comment établir des limites saines ?",
    "Conseils pour la communication en relation ouverte",
    "Différence entre polyamorie et relation ouverte ?"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Assistant Fluide - Expert en Relations Alternatives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Questions rapides */}
          {conversation.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Questions fréquentes pour commencer :
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  
                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Lightbulb className="h-3 w-3" />
                        Suggestions :
                      </div>
                      <div className="space-y-1">
                        {msg.suggestions.map((suggestion, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ressources */}
                  {msg.resources && msg.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        Ressources recommandées :
                      </div>
                      <div className="space-y-2">
                        {msg.resources.map((resource, i) => (
                          <div key={i} className="bg-background/50 rounded p-2">
                            <p className="font-medium text-xs">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Zone de saisie */}
          <div className="flex gap-2">
            <Input
              placeholder="Posez votre question sur le tantra, la polyamorie..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && question.trim() && !askAssistant.isPending) {
                  askAssistant.mutate(question);
                }
              }}
              disabled={askAssistant.isPending}
            />
            <Button 
              onClick={() => askAssistant.mutate(question)}
              disabled={!question.trim() || askAssistant.isPending}
            >
              {askAssistant.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Envoyer"
              )}
            </Button>
          </div>

          {askAssistant.error && (
            <p className="text-sm text-destructive">
              Erreur : {askAssistant.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}