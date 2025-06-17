import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, MessageCircle, Shield, Sparkles, Calendar } from "lucide-react";
import AIAssistant from "@/components/ai-assistant";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function AIFeatures() {
  const { user } = useAuth();

  const { data: eventRecommendations } = useQuery({
    queryKey: ["/api/ai/event-recommendations"],
    enabled: !!user,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Intelligence Artificielle Fluide
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos fonctionnalités IA avancées pour améliorer vos rencontres et votre parcours dans les relations alternatives
        </p>
      </div>

      <Tabs defaultValue="assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistant
          </TabsTrigger>
          <TabsTrigger value="compatibility" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Compatibilité
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Événements
          </TabsTrigger>
        </TabsList>

        {/* Assistant Éducatif */}
        <TabsContent value="assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Assistant Éducatif Spécialisé
              </CardTitle>
              <CardDescription>
                Votre guide expert en tantra, polyamorie et relations alternatives. 
                Posez toutes vos questions en toute confidentialité.
              </CardDescription>
            </CardHeader>
          </Card>
          <AIAssistant />
        </TabsContent>

        {/* Analyse de Compatibilité */}
        <TabsContent value="compatibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Analyse de Compatibilité IA
              </CardTitle>
              <CardDescription>
                Notre IA analyse vos profils pour évaluer votre compatibilité basée sur vos valeurs, 
                pratiques et intentions relationnelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Comment ça fonctionne :</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Analyse de vos pratiques tantriques et spirituelles</li>
                    <li>• Évaluation de la compatibilité des valeurs</li>
                    <li>• Comparaison des intentions relationnelles</li>
                    <li>• Score de compatibilité de 0 à 100%</li>
                    <li>• Conseils personnalisés pour une rencontre réussie</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Avantages :</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Gain de temps dans vos recherches</li>
                    <li>• Rencontres plus authentiques</li>
                    <li>• Réduction des malentendus</li>
                    <li>• Conseils d'experts personnalisés</li>
                    <li>• Respect de vos valeurs essentielles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions de Conversation */}
        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Suggestions de Conversation IA
              </CardTitle>
              <CardDescription>
                Notre IA génère des messages d'approche personnalisés basés sur vos intérêts communs 
                et vos pratiques partagées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto text-purple-500" />
                  <h3 className="font-semibold">Personnalisées</h3>
                  <p className="text-sm text-muted-foreground">
                    Chaque suggestion est unique et adaptée à votre relation potentielle
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Heart className="h-8 w-8 mx-auto text-pink-500" />
                  <h3 className="font-semibold">Respectueuses</h3>
                  <p className="text-sm text-muted-foreground">
                    Messages bienveillants qui respectent les valeurs de chacun
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <MessageCircle className="h-8 w-8 mx-auto text-blue-500" />
                  <h3 className="font-semibold">Engageantes</h3>
                  <p className="text-sm text-muted-foreground">
                    Conversations qui ouvrent naturellement le dialogue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modération et Sécurité */}
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modération IA et Sécurité
              </CardTitle>
              <CardDescription>
                Notre système de modération intelligent protège la communauté tout en respectant 
                la liberté d'expression sur les sujets de sexualité alternative.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600">Protection Active :</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Détection automatique du harcèlement</li>
                    <li>• Filtrage des contenus inappropriés</li>
                    <li>• Vérification de l'authenticité des profils</li>
                    <li>• Signalement automatique des comportements suspects</li>
                    <li>• Protection des informations personnelles</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600">Respect de la Liberté :</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Discussions ouvertes sur la sexualité</li>
                    <li>• Respect des pratiques alternatives</li>
                    <li>• Modération contextuelle intelligente</li>
                    <li>• Éducation plutôt que censure</li>
                    <li>• Transparence des décisions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommandations d'Événements */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recommandations d'Événements IA
              </CardTitle>
              <CardDescription>
                Notre IA analyse votre profil pour vous recommander les événements et ateliers 
                les plus pertinents pour votre parcours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventRecommendations?.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Événements recommandés pour vous :</h3>
                  <div className="grid gap-4">
                    {eventRecommendations.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.eventTitle}</h4>
                          <div className="text-sm text-green-600 font-medium">
                            {rec.score}% compatible
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    Complétez votre profil pour recevoir des recommandations personnalisées
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}