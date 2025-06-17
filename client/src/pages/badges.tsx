import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Award, Star, Crown, Heart, Users, BookOpen, 
  MessageSquare, Calendar, Target, Zap, Shield, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserBadge {
  id: number;
  badgeId: number;
  badge: {
    id: number;
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    color: string;
    requirements: string;
  };
  earnedAt: string;
  isVisible: boolean;
}

interface AvailableBadge {
  id: number;
  name: string;
  description: string;
  category: string;
  iconUrl?: string;
  color: string;
  requirements: string;
  progress?: number;
  isEarned: boolean;
}

export default function Badges() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ["/api/badges/user"],
  });

  const { data: availableBadges = [] } = useQuery<AvailableBadge[]>({
    queryKey: ["/api/badges/available", { category: selectedCategory }],
  });

  const categories = [
    { value: "all", label: "Tous", icon: Award },
    { value: "skill", label: "Compétences", icon: Star },
    { value: "achievement", label: "Accomplissements", icon: Crown },
    { value: "participation", label: "Participation", icon: Users },
    { value: "learning", label: "Apprentissage", icon: BookOpen },
    { value: "community", label: "Communauté", icon: Heart },
  ];

  const getBadgeIcon = (category: string) => {
    switch (category) {
      case "skill": return Star;
      case "achievement": return Crown;
      case "participation": return Users;
      case "learning": return BookOpen;
      case "community": return Heart;
      default: return Award;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const earnedBadgesCount = userBadges.length;
  const totalBadgesCount = availableBadges.length;
  const completionPercentage = totalBadgesCount > 0 ? (earnedBadgesCount / totalBadgesCount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Badges & Certifications</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Suivez votre progression et célébrez vos accomplissements dans votre parcours 
          de développement personnel et relationnel
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges obtenus</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedBadgesCount}</div>
            <p className="text-xs text-muted-foreground">
              sur {totalBadgesCount} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnedBadgesCount < 5 ? "Débutant" :
               earnedBadgesCount < 15 ? "Intermédiaire" :
               earnedBadgesCount < 30 ? "Avancé" : "Expert"}
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur vos accomplissements
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Mes Badges</TabsTrigger>
          <TabsTrigger value="available">Disponibles</TabsTrigger>
        </TabsList>

        {/* Badges obtenus */}
        <TabsContent value="earned" className="space-y-6">
          {earnedBadgesCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBadges.map((userBadge) => {
                const IconComponent = getBadgeIcon(userBadge.badge.category);
                return (
                  <Card key={userBadge.id} className="relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 w-full h-2"
                      style={{ backgroundColor: userBadge.badge.color }}
                    />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${userBadge.badge.color}20` }}
                        >
                          <IconComponent 
                            className="h-6 w-6" 
                            style={{ color: userBadge.badge.color }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{userBadge.badge.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {userBadge.badge.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription>{userBadge.badge.description}</CardDescription>
                      
                      <div className="text-sm">
                        <p className="font-medium mb-2">Conditions :</p>
                        <p className="text-muted-foreground">{userBadge.badge.requirements}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Obtenu le {formatDate(userBadge.earnedAt)}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium">Débloqué</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun badge encore</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez à participer pour obtenir vos premiers badges !
                </p>
                <Button>Découvrir les défis</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Badges disponibles */}
        <TabsContent value="available" className="space-y-6">
          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.category);
              return (
                <Card key={badge.id} className={`relative overflow-hidden ${badge.isEarned ? 'opacity-60' : ''}`}>
                  <div 
                    className="absolute top-0 left-0 w-full h-2"
                    style={{ backgroundColor: badge.color }}
                  />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <IconComponent 
                          className="h-6 w-6" 
                          style={{ color: badge.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {badge.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{badge.description}</CardDescription>
                    
                    <div className="text-sm">
                      <p className="font-medium mb-2">Pour débloquer :</p>
                      <p className="text-muted-foreground">{badge.requirements}</p>
                    </div>

                    {badge.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{badge.progress}%</span>
                        </div>
                        <Progress value={badge.progress} />
                      </div>
                    )}

                    <div className="pt-2">
                      {badge.isEarned ? (
                        <Badge className="w-full justify-center bg-green-100 text-green-800">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Débloqué
                        </Badge>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          En cours
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Section récents accomplissements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Accomplissements récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userBadges.slice(0, 3).map((userBadge) => (
              <div key={userBadge.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${userBadge.badge.color}20` }}
                >
                  <Award className="h-5 w-5" style={{ color: userBadge.badge.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{userBadge.badge.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Obtenu le {formatDate(userBadge.earnedAt)}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
            ))}
            
            {userBadges.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Vos futurs accomplissements apparaîtront ici
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}