import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, MessageSquare, Calendar, User, Filter } from 'lucide-react';
import { useLocation } from 'wouter';

interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  description: string;
  relevanceScore: number;
  [key: string]: any;
}

interface SearchResults {
  profiles: SearchResult[];
  forums: SearchResult[];
  groups: SearchResult[];
  events: SearchResult[];
}

const getResultIcon = (type: string) => {
  switch (type) {
    case 'profile': return <User className="h-5 w-5" />;
    case 'forum_topic': return <MessageSquare className="h-5 w-5" />;
    case 'group': return <Users className="h-5 w-5" />;
    case 'event': return <Calendar className="h-5 w-5" />;
    default: return <Search className="h-5 w-5" />;
  }
};

const getResultColor = (type: string) => {
  switch (type) {
    case 'profile': return 'text-blue-500';
    case 'forum_topic': return 'text-purple-500';
    case 'group': return 'text-green-500';
    case 'event': return 'text-orange-500';
    default: return 'text-gray-500';
  }
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [, setLocation] = useLocation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/search/global', { q: debouncedQuery }],
    enabled: debouncedQuery.length >= 2,
  });

  const results: SearchResults = searchData?.results || { profiles: [], forums: [], groups: [], events: [] };
  const suggestions: string[] = searchData?.suggestions || [];
  const totalResults = searchData?.totalResults || 0;

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'profile':
        setLocation(`/search?user=${result.id}`);
        break;
      case 'forum_topic':
        setLocation(`/community?tab=forums&topic=${result.id}`);
        break;
      case 'group':
        setLocation(`/community?tab=groups&group=${result.id}`);
        break;
      case 'event':
        setLocation(`/events?event=${result.id}`);
        break;
    }
  };

  const allResults = [
    ...results.profiles,
    ...results.forums,
    ...results.groups,
    ...results.events
  ].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Recherche Globale</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trouvez des profils, discussions, groupes et événements sur Fluide
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Rechercher des profils, discussions, groupes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && query.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {debouncedQuery.length >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Résultats de recherche
              {totalResults > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({totalResults} résultats)
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : totalResults === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
                <p className="text-muted-foreground text-center">
                  Essayez avec d'autres mots-clés ou parcourez les suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Tous ({allResults.length})</TabsTrigger>
                <TabsTrigger value="profiles">Profils ({results.profiles.length})</TabsTrigger>
                <TabsTrigger value="forums">Forums ({results.forums.length})</TabsTrigger>
                <TabsTrigger value="groups">Groupes ({results.groups.length})</TabsTrigger>
                <TabsTrigger value="events">Événements ({results.events.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {allResults.map((result, index) => (
                  <Card 
                    key={`${result.type}-${result.id}-${index}`}
                    className="transition-all hover:shadow-md cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${getResultColor(result.type)} mt-1`}>
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{result.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {result.type === 'profile' ? 'Profil' :
                                 result.type === 'forum_topic' ? 'Forum' :
                                 result.type === 'group' ? 'Groupe' : 'Événement'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(result.relevanceScore * 100)}% pertinent
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{result.description}</p>
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Individual category tabs */}
              {['profiles', 'forums', 'groups', 'events'].map((category) => (
                <TabsContent key={category} value={category} className="space-y-3">
                  {results[category as keyof SearchResults].map((result, index) => (
                    <Card 
                      key={`${result.type}-${result.id}-${index}`}
                      className="transition-all hover:shadow-md cursor-pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`${getResultColor(result.type)} mt-1`}>
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{result.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(result.relevanceScore * 100)}% pertinent
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{result.description}</p>
                            {result.memberCount && (
                              <p className="text-sm text-muted-foreground">
                                {result.memberCount} membres
                              </p>
                            )}
                            {result.date && (
                              <p className="text-sm text-muted-foreground">
                                {new Date(result.date).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}

      {debouncedQuery.length < 2 && query.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Commencez votre recherche</h3>
            <p className="text-muted-foreground text-center">
              Tapez au moins 2 caractères pour commencer à chercher dans la communauté Fluide.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}