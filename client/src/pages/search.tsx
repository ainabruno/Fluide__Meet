import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import ProfileCard from "@/components/profile-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, MapPin, Users, Heart, Sliders } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const GENDERS = ["Femme", "Homme", "Non-binaire", "Fluide", "Autre"];
const ORIENTATIONS = ["Hétérosexuel·le", "Homosexuel·le", "Bisexuel·le", "Pansexuel·le", "Asexuel·le", "Autre"];
const RELATIONSHIP_STYLES = ["Monogamie", "Polyamorie", "Relation ouverte", "Anarchie relationnelle", "Célibat", "Exploratoire"];
const PRACTICES = ["Tantra", "BDSM", "Mindfulness", "Massage", "Méditation", "Danse", "Yoga", "Communication Non-Violente"];
const VALUES = ["Consentement explicite", "Communication ouverte", "Respect mutuel", "Inclusivité", "Authenticité", "Bienveillance", "Exploration", "Croissance personnelle"];
const INTENTIONS = ["Rencontres", "Amitié", "Apprentissage", "Exploration", "Relation sérieuse", "Événements", "Communauté"];

export default function Search() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 65,
    location: "",
    gender: "",
    orientation: "",
    relationshipStyles: [] as string[],
    practices: [] as string[],
    values: [] as string[],
    intentions: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/profiles/search", {
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      location: filters.location || undefined,
      practices: filters.practices.length > 0 ? filters.practices.join(',') : undefined,
      values: filters.values.length > 0 ? filters.values.join(',') : undefined,
      intentions: filters.intentions.length > 0 ? filters.intentions.join(',') : undefined,
      limit: 50,
    }],
    retry: false,
    enabled: !!user,
  });

  const toggleArrayFilter = (filterKey: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: (prev[filterKey] as string[]).includes(value)
        ? (prev[filterKey] as string[]).filter(item => item !== value)
        : [...(prev[filterKey] as string[]), value]
    }));
  };

  const resetFilters = () => {
    setFilters({
      minAge: 18,
      maxAge: 65,
      location: "",
      gender: "",
      orientation: "",
      relationshipStyles: [],
      practices: [],
      values: [],
      intentions: [],
    });
    setSearchTerm("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.gender) count++;
    if (filters.orientation) count++;
    if (filters.relationshipStyles.length > 0) count++;
    if (filters.practices.length > 0) count++;
    if (filters.values.length > 0) count++;
    if (filters.intentions.length > 0) count++;
    if (filters.minAge !== 18 || filters.maxAge !== 65) count++;
    return count;
  };

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

  const filteredProfiles = profiles?.filter((profile: any) => {
    if (!searchTerm) return true;
    return profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           profile.location?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Age Range */}
      <div>
        <Label className="text-base font-semibold">Âge</Label>
        <div className="mt-3">
          <Slider
            value={[filters.minAge, filters.maxAge]}
            onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minAge: min, maxAge: max }))}
            min={18}
            max={80}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{filters.minAge} ans</span>
            <span>{filters.maxAge} ans</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="text-base font-semibold">Localisation</Label>
        <Input
          id="location"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ville, région..."
          className="mt-2"
        />
      </div>

      {/* Gender */}
      <div>
        <Label className="text-base font-semibold">Genre</Label>
        <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Tous les genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les genres</SelectItem>
            {GENDERS.map(gender => (
              <SelectItem key={gender} value={gender}>{gender}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orientation */}
      <div>
        <Label className="text-base font-semibold">Orientation</Label>
        <Select value={filters.orientation} onValueChange={(value) => setFilters(prev => ({ ...prev, orientation: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Toutes orientations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes orientations</SelectItem>
            {ORIENTATIONS.map(orientation => (
              <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Relationship Styles */}
      <div>
        <Label className="text-base font-semibold">Style relationnel</Label>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {RELATIONSHIP_STYLES.map(style => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={`relationship-${style}`}
                checked={filters.relationshipStyles.includes(style)}
                onCheckedChange={() => toggleArrayFilter("relationshipStyles", style)}
              />
              <Label htmlFor={`relationship-${style}`} className="text-sm">{style}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Practices */}
      <div>
        <Label className="text-base font-semibold">Pratiques d'intérêt</Label>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {PRACTICES.map(practice => (
            <div key={practice} className="flex items-center space-x-2">
              <Checkbox
                id={`practice-${practice}`}
                checked={filters.practices.includes(practice)}
                onCheckedChange={() => toggleArrayFilter("practices", practice)}
              />
              <Label htmlFor={`practice-${practice}`} className="text-sm">{practice}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <Label className="text-base font-semibold">Valeurs importantes</Label>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {VALUES.map(value => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`value-${value}`}
                checked={filters.values.includes(value)}
                onCheckedChange={() => toggleArrayFilter("values", value)}
              />
              <Label htmlFor={`value-${value}`} className="text-sm">{value}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Intentions */}
      <div>
        <Label className="text-base font-semibold">Intentions</Label>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {INTENTIONS.map(intention => (
            <div key={intention} className="flex items-center space-x-2">
              <Checkbox
                id={`intention-${intention}`}
                checked={filters.intentions.includes(intention)}
                onCheckedChange={() => toggleArrayFilter("intentions", intention)}
              />
              <Label htmlFor={`intention-${intention}`} className="text-sm">{intention}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={resetFilters} variant="outline" className="w-full">
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-neutral-600 mb-2">
            Recherche de profils
          </h1>
          <p className="text-neutral-500">
            Découvrez des personnes qui partagent vos valeurs et intentions
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtres
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <FiltersContent />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar and Mobile Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Rechercher par nom, bio, localisation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Mobile Filter Button */}
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="relative">
                          <Sliders className="w-4 h-4 mr-2" />
                          Filtres
                          {getActiveFiltersCount() > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {getActiveFiltersCount()}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80">
                        <SheetHeader>
                          <SheetTitle>Filtres de recherche</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-100px)]">
                          <FiltersContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-600">Filtres actifs</h3>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Tout effacer
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.location && (
                      <Badge variant="secondary" className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {filters.location}
                      </Badge>
                    )}
                    {filters.gender && (
                      <Badge variant="secondary">Genre: {filters.gender}</Badge>
                    )}
                    {filters.orientation && (
                      <Badge variant="secondary">Orientation: {filters.orientation}</Badge>
                    )}
                    {(filters.minAge !== 18 || filters.maxAge !== 65) && (
                      <Badge variant="secondary">
                        Âge: {filters.minAge}-{filters.maxAge} ans
                      </Badge>
                    )}
                    {filters.practices.map(practice => (
                      <Badge key={practice} className="bg-primary/10 text-primary">
                        {practice}
                      </Badge>
                    ))}
                    {filters.values.map(value => (
                      <Badge key={value} variant="outline">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-neutral-500">
                  <Users className="w-4 h-4" />
                  <span>
                    {profilesLoading 
                      ? "Recherche en cours..." 
                      : `${filteredProfiles.length} profil${filteredProfiles.length > 1 ? 's' : ''} trouvé${filteredProfiles.length > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </div>

              {profilesLoading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              ) : filteredProfiles.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProfiles.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                      Aucun profil trouvé
                    </h3>
                    <p className="text-neutral-500 mb-6">
                      {getActiveFiltersCount() > 0 || searchTerm
                        ? "Essayez de modifier vos critères de recherche"
                        : "Il n'y a pas de profils disponibles pour le moment"
                      }
                    </p>
                    {(getActiveFiltersCount() > 0 || searchTerm) && (
                      <Button variant="outline" onClick={resetFilters}>
                        Réinitialiser la recherche
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Search Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Conseils pour une recherche respectueuse
                    </h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Lisez attentivement les profils avant d'interagir</li>
                      <li>• Respectez les intentions et limites de chacun·e</li>
                      <li>• Privilégiez des messages personnalisés et bienveillants</li>
                      <li>• Le consentement est la base de toute interaction</li>
                    </ul>
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
