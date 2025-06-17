import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MessageCircleQuestion, Users, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", { upcoming: true, limit: 3 }],
    retry: false,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/profiles/search", { limit: 6 }],
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-rose-50/30">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
                  <Heart className="text-white w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-3">
                    Bienvenue, {user.firstName || 'Membre'} !
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Votre espace personnel pour explorer et vous connecter en toute conscience
                  </p>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 gradient-primary rounded-full blur-lg opacity-30 scale-110" />
                  <img 
                    src={user.profileImageUrl || "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
                    alt="Profile"
                    className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                </div>
              </div>
            </div>
            
            {!user.profile && (
              <div className="mt-8 glass-effect rounded-2xl p-6 border border-yellow-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Complétez votre profil</h3>
                      <p className="text-muted-foreground">Créez votre profil pour commencer à explorer la communauté</p>
                    </div>
                  </div>
                  <Button className="button-glow gradient-primary text-white px-6 py-3 rounded-xl shadow-lg">
                    Créer mon profil
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass-effect card-hover rounded-2xl p-6 text-center border border-border/50">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">2,847</div>
                <div className="text-sm text-muted-foreground">Membres actifs</div>
              </div>
              <div className="glass-effect card-hover rounded-2xl p-6 text-center border border-border/50">
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">156</div>
                <div className="text-sm text-muted-foreground">Événements/mois</div>
              </div>
              <div className="glass-effect card-hover rounded-2xl p-6 text-center border border-border/50">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircleQuestion className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">12.5k</div>
                <div className="text-sm text-muted-foreground">Messages échangés</div>
              </div>
              <div className="glass-effect card-hover rounded-2xl p-6 text-center border border-border/50">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Événements à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-600">{event.title}</h4>
                          <p className="text-sm text-neutral-500">{event.location}</p>
                          <div className="flex items-center mt-2">
                            <Badge variant="outline" className="mr-2">{event.category}</Badge>
                            <span className="text-sm text-neutral-400">
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          S'inscrire
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Aucun événement à venir pour le moment</p>
                  </div>
                )}
                <div className="mt-6 text-center">
                  <Button variant="outline" className="w-full">
                    Voir tous les événements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-secondary" />
                  Profils suggérés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : profiles && profiles.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {profiles.slice(0, 4).map((profile: any) => (
                      <div key={profile.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mr-3"></div>
                          <div>
                            <h4 className="font-semibold text-neutral-600">{profile.displayName}</h4>
                            <p className="text-sm text-neutral-500">{profile.location}</p>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{profile.bio}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {profile.values?.slice(0, 2).map((value: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Heart className="w-4 h-4 mr-1" />
                            Like
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircleQuestion className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Aucun profil suggéré pour le moment</p>
                  </div>
                )}
                <div className="mt-6 text-center">
                  <Button variant="outline" className="w-full">
                    Découvrir plus de profils
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Rechercher des profils
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Parcourir les événements
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircleQuestion className="w-4 h-4 mr-2" />
                  Mes conversations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ressources éducatives
                </Button>
              </CardContent>
            </Card>

            {/* Community Spotlight */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À la une</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold">Événement vedette</span>
                    </div>
                    <h4 className="font-semibold text-neutral-600 mb-1">Atelier Tantra Sacré</h4>
                    <p className="text-sm text-neutral-500 mb-3">
                      Découvrez les pratiques tantriques dans un cadre bienveillant
                    </p>
                    <Button size="sm" className="w-full">
                      En savoir plus
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Heart className="w-4 h-4 text-secondary mr-1" />
                      <span className="text-sm font-semibold">Nouveau guide</span>
                    </div>
                    <h4 className="font-semibold text-neutral-600 mb-1">Communication Non-Violente</h4>
                    <p className="text-sm text-neutral-500 mb-3">
                      Améliorez vos relations avec la CNV
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Lire maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Values */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nos valeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-sm text-neutral-600">Consentement explicite</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-secondary rounded-full mr-3"></div>
                    <span className="text-sm text-neutral-600">Inclusivité totale</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
                    <span className="text-sm text-neutral-600">Respect mutuel</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-neutral-600">Exploration sécurisée</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
