import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Euro, Users, Video, Calendar, Phone, Mail, Globe } from "lucide-react";

interface ProfessionalProfile {
  id: number;
  businessName: string;
  description?: string;
  specialties: string[];
  yearsExperience?: number;
  location?: string;
  website?: string;
  phone?: string;
  professionalEmail?: string;
  languages: string[];
  sessionTypes: string[];
  isVerified: boolean;
  rating: string;
  totalReviews: number;
  profileImageUrl?: string;
}

interface ProfessionalService {
  id: number;
  title: string;
  description?: string;
  category: string;
  duration?: number;
  price?: string;
  currency: string;
  isOnline: boolean;
  isInPerson: boolean;
  maxParticipants?: number;
  requirements?: string;
}

export default function Professionals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const { data: professionals = [] } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/professionals", { 
      search: searchQuery, 
      specialty: selectedSpecialty, 
      location: selectedLocation 
    }],
  });

  const specialties = [
    "Tantra", "Thérapie de couple", "Coaching relationnel", "Sexothérapie",
    "Méditation", "Breathwork", "Massage thérapeutique", "Conseil en polyamorie"
  ];

  const locations = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Nice", "Nantes", "Strasbourg"
  ];

  const formatPrice = (price: string, currency: string) => {
    return `${price}${currency === 'EUR' ? '€' : currency}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Professionnels du Bien-être</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trouvez des thérapeutes, coachs et praticiens spécialisés dans le tantra, 
          les relations alternatives et le développement personnel
        </p>
      </div>

      {/* Filtres de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un professionnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher par nom ou mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les spécialités</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les villes</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Onglets pour différentes catégories */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="therapists">Thérapeutes</TabsTrigger>
          <TabsTrigger value="coaches">Coachs</TabsTrigger>
          <TabsTrigger value="practitioners">Praticiens</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{professional.businessName}</CardTitle>
                      {professional.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    {professional.profileImageUrl && (
                      <img 
                        src={professional.profileImageUrl} 
                        alt={professional.businessName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                  
                  {professional.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{professional.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({professional.totalReviews} avis)
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {professional.description}
                  </CardDescription>

                  {/* Spécialités */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Spécialités :</h4>
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {professional.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Informations pratiques */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {professional.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{professional.location}</span>
                      </div>
                    )}
                    
                    {professional.yearsExperience && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{professional.yearsExperience} ans d'expérience</span>
                      </div>
                    )}

                    {professional.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{professional.languages.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Types de sessions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Types de sessions :</h4>
                    <div className="flex flex-wrap gap-1">
                      {professional.sessionTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      Voir le profil
                    </Button>
                    <Button variant="outline" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {professionals.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Aucun professionnel trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </TabsContent>

        {/* Autres onglets avec le même contenu filtré */}
        <TabsContent value="therapists">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Thérapeutes spécialisés</h3>
            <p className="text-muted-foreground">
              Professionnels certifiés en thérapie de couple et sexothérapie
            </p>
          </div>
        </TabsContent>

        <TabsContent value="coaches">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Coachs en relations</h3>
            <p className="text-muted-foreground">
              Accompagnement personnalisé pour votre développement relationnel
            </p>
          </div>
        </TabsContent>

        <TabsContent value="practitioners">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Praticiens tantriques</h3>
            <p className="text-muted-foreground">
              Experts en pratiques tantriques et développement spirituel
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Section pour devenir professionnel */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vous êtes un professionnel ?</CardTitle>
          <CardDescription className="text-lg">
            Rejoignez notre communauté de praticiens certifiés et développez votre activité
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Visibilité accrue</h3>
              <p className="text-sm text-muted-foreground">
                Atteignez une clientèle ciblée et passionnée
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Gestion simplifiée</h3>
              <p className="text-sm text-muted-foreground">
                Outils de réservation et de paiement intégrés
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Réputation</h3>
              <p className="text-sm text-muted-foreground">
                Système d'avis et de recommandations
              </p>
            </div>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
            Créer mon profil professionnel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}