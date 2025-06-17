import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Filter, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

const EVENT_CATEGORIES = [
  "Tous",
  "Tantra",
  "Atelier",
  "Méditation", 
  "Rencontre",
  "Formation",
  "Conférence"
];

export default function Events() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

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
    queryKey: ["/api/events", { 
      category: selectedCategory === "Tous" ? undefined : selectedCategory,
      upcoming: showUpcomingOnly,
      limit: 50 
    }],
    retry: false,
    enabled: !!user,
  });

  const { data: userRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/user/event-registrations"],
    retry: false,
    enabled: !!user,
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

  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const upcomingEvents = filteredEvents.filter((event: any) => new Date(event.startDate) > new Date());
  const featuredEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-neutral-600 mb-2">
                Événements & Ateliers
              </h1>
              <p className="text-neutral-500">
                Découvrez et participez aux événements de la communauté
              </p>
            </div>
            <Button className="mt-4 md:mt-0 bg-primary hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Organiser un événement
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Rechercher un événement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={showUpcomingOnly ? "default" : "outline"}
                  onClick={() => setShowUpcomingOnly(true)}
                  className="flex-1 md:flex-none"
                >
                  À venir
                </Button>
                <Button
                  variant={!showUpcomingOnly ? "default" : "outline"}
                  onClick={() => setShowUpcomingOnly(false)}
                  className="flex-1 md:flex-none"
                >
                  Tous
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-playfair font-bold text-neutral-600 mb-6">
              Événements vedettes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* My Registrations */}
        {userRegistrations && userRegistrations.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Mes inscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userRegistrations.slice(0, 6).map((registration: any) => (
                    <EventCard 
                      key={registration.eventId} 
                      event={registration.event} 
                      variant="compact"
                      showRegistration={false}
                    />
                  ))}
                </div>
                {userRegistrations.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Voir toutes mes inscriptions ({userRegistrations.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-bold text-neutral-600">
              {showUpcomingOnly ? "Événements à venir" : "Tous les événements"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Filter className="w-4 h-4" />
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
            </div>
          </div>

          {eventsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                  Aucun événement trouvé
                </h3>
                <p className="text-neutral-500 mb-6">
                  {searchTerm || selectedCategory !== "Tous" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Il n'y a pas d'événements disponibles pour le moment"
                  }
                </p>
                {(searchTerm || selectedCategory !== "Tous") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("Tous");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories d'événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Tantra</h4>
                <p className="text-sm text-neutral-500">
                  Ateliers et formations pour explorer les pratiques tantriques sacrées
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Rencontres</h4>
                <p className="text-sm text-neutral-500">
                  Événements sociaux pour rencontrer la communauté dans un cadre détendu
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Méditation</h4>
                <p className="text-sm text-neutral-500">
                  Sessions de méditation et pratiques de pleine conscience
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Ateliers</h4>
                <p className="text-sm text-neutral-500">
                  Apprentissage pratique sur divers sujets liés au bien-être
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Formations</h4>
                <p className="text-sm text-neutral-500">
                  Formations approfondies animées par des expert·e·s
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <h4 className="font-semibold text-neutral-600 mb-2">Conférences</h4>
                <p className="text-sm text-neutral-500">
                  Conférences et discussions sur les relations alternatives
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
