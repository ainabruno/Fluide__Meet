import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Video, 
  Mic, 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Star,
  Play,
  Download,
  ExternalLink,
  Heart,
  Users,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const RESOURCE_TYPES = ["Tous", "Article", "Vidéo", "Podcast", "Guide"];
const RESOURCE_CATEGORIES = [
  "Tous",
  "Consentement",
  "Tantra",
  "Polyamorie",
  "Communication",
  "Méditation",
  "Relation à soi",
  "BDSM",
  "Sexualité"
];

interface Resource {
  id: number;
  title: string;
  description?: string;
  content?: string;
  type: string;
  category: string;
  authorId?: string;
  imageUrl?: string;
  isPublished: boolean;
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export default function Resources() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

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

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/resources", {
      type: selectedType === "Tous" ? undefined : selectedType,
      category: selectedCategory === "Tous" ? undefined : selectedCategory,
      limit: 50
    }],
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

  const filteredResources = resources?.filter((resource: Resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'vidéo':
        return <Video className="w-5 h-5" />;
      case 'podcast':
        return <Mic className="w-5 h-5" />;
      case 'guide':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'vidéo':
        return 'bg-red-100 text-red-700';
      case 'podcast':
        return 'bg-purple-100 text-purple-700';
      case 'guide':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'consentement':
        return 'bg-primary/10 text-primary';
      case 'tantra':
        return 'bg-secondary/10 text-secondary';
      case 'polyamorie':
        return 'bg-accent/10 text-accent';
      case 'communication':
        return 'bg-yellow-100 text-yellow-700';
      case 'méditation':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredResources = filteredResources.slice(0, 3);
  const popularCategories = [
    { name: "Consentement", count: 12, description: "Guides essentiels sur le consentement explicite" },
    { name: "Communication", count: 8, description: "Améliorer la communication dans vos relations" },
    { name: "Tantra", count: 15, description: "Découvrir les pratiques tantriques sacrées" },
    { name: "Polyamorie", count: 6, description: "Comprendre la non-monogamie éthique" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-neutral-600 mb-2">
            Ressources éducatives
          </h1>
          <p className="text-neutral-500">
            Approfondissez vos connaissances avec nos guides, articles et contenus créés par la communauté
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher des ressources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-playfair font-bold text-neutral-600 mb-6">
              Ressources vedettes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredResources.map((resource: Resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                    {resource.imageUrl ? (
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(resource.type)}
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className={getTypeColor(resource.type)}>
                        {getTypeIcon(resource.type)}
                        <span className="ml-1">{resource.type}</span>
                      </Badge>
                    </div>
                    {resource.type.toLowerCase() === 'vidéo' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(resource.category)}>
                        {resource.category}
                      </Badge>
                      {resource.readingTime && (
                        <div className="flex items-center text-sm text-neutral-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {resource.readingTime} min
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-neutral-500 text-sm line-clamp-3 mb-4">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">
                        {formatDate(resource.createdAt)}
                      </span>
                      <Button size="sm" className="bg-primary hover:bg-blue-600">
                        {resource.type.toLowerCase() === 'vidéo' ? 'Regarder' : 
                         resource.type.toLowerCase() === 'podcast' ? 'Écouter' : 'Lire'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Resources List */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-playfair font-bold text-neutral-600">
                  Toutes les ressources
                </h2>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Filter className="w-4 h-4" />
                  {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''}
                </div>
              </div>

              {resourcesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="space-y-4">
                  {filteredResources.map((resource: Resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(resource.category)}>
                                {resource.category}
                              </Badge>
                              <Badge variant="outline">
                                {resource.type}
                              </Badge>
                              {resource.readingTime && (
                                <div className="flex items-center text-sm text-neutral-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {resource.readingTime} min
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                              {resource.title}
                            </h3>
                            {resource.description && (
                              <p className="text-neutral-500 text-sm line-clamp-2 mb-3">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-400">
                                Publié le {formatDate(resource.createdAt)}
                              </span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Voir
                                </Button>
                                <Button size="sm" className="bg-primary hover:bg-blue-600">
                                  {resource.type.toLowerCase() === 'vidéo' ? 'Regarder' : 
                                   resource.type.toLowerCase() === 'podcast' ? 'Écouter' : 'Lire'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                      Aucune ressource trouvée
                    </h3>
                    <p className="text-neutral-500 mb-6">
                      {searchTerm || selectedType !== "Tous" || selectedCategory !== "Tous"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Il n'y a pas de ressources disponibles pour le moment"
                      }
                    </p>
                    {(searchTerm || selectedType !== "Tous" || selectedCategory !== "Tous") && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedType("Tous");
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catégories populaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularCategories.map((category) => (
                  <div 
                    key={category.name} 
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-neutral-600">{category.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">{category.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liens utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Guide du consentement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Communication non-violente
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Sécurité et bien-être
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Glossaire inclusif
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Ressources communautaires
                    </h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Nos ressources sont créées par et pour la communauté, 
                      avec un focus sur la bienveillance et l'inclusivité.
                    </p>
                    <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                      Contribuer
                    </Button>
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
