import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Camera, MapPin, Heart, Shield, Users, Star } from "lucide-react";

const GENDERS = ["Femme", "Homme", "Non-binaire", "Fluide", "Autre"];
const ORIENTATIONS = ["Hétérosexuel·le", "Homosexuel·le", "Bisexuel·le", "Pansexuel·le", "Asexuel·le", "Autre"];
const RELATIONSHIP_STYLES = ["Monogamie", "Polyamorie", "Relation ouverte", "Anarchie relationnelle", "Célibat", "Exploratoire"];
const PRACTICES = ["Tantra", "BDSM", "Mindfulness", "Massage", "Méditation", "Danse", "Yoga", "Communication Non-Violente"];
const VALUES = ["Consentement explicite", "Communication ouverte", "Respect mutuel", "Inclusivité", "Authenticité", "Bienveillance", "Exploration", "Croissance personnelle"];
const INTENTIONS = ["Rencontres", "Amitié", "Apprentissage", "Exploration", "Relation sérieuse", "Événements", "Communauté"];

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    birthDate: "",
    gender: "",
    orientation: "",
    location: "",
    relationshipStyle: [] as string[],
    practices: [] as string[],
    values: [] as string[],
    intentions: [] as string[],
  });

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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profiles/me"],
    retry: false,
    enabled: !!user,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/profiles", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil créé",
        description: "Votre profil a été créé avec succès!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profiles/me", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      setIsEditing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "",
        gender: profile.gender || "",
        orientation: profile.orientation || "",
        location: profile.location || "",
        relationshipStyle: profile.relationshipStyle || [],
        practices: profile.practices || [],
        values: profile.values || [],
        intentions: profile.intentions || [],
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      updateProfileMutation.mutate(formData);
    } else {
      createProfileMutation.mutate(formData);
    }
  };

  if (isLoading || profileLoading) {
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
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-neutral-600 mb-2">
            {profile ? "Mon Profil" : "Créer mon profil"}
          </h1>
          <p className="text-neutral-500">
            {profile ? "Gérez vos informations personnelles et préférences" : "Créez votre profil pour rejoindre la communauté"}
          </p>
        </div>

        {!profile ? (
          // Create Profile Form
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Créer votre profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="displayName">Nom d'affichage *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Comment souhaitez-vous être appelé·e ?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Ville, région"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Présentation</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Parlez-vous... Quelles sont vos passions, vos intentions ?"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Genre</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map(gender => (
                          <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select value={formData.orientation} onValueChange={(value) => handleInputChange("orientation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIENTATIONS.map(orientation => (
                          <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Style relationnel</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {RELATIONSHIP_STYLES.map(style => (
                      <div key={style} className="flex items-center space-x-2">
                        <Checkbox
                          id={`relationship-${style}`}
                          checked={formData.relationshipStyle.includes(style)}
                          onCheckedChange={() => toggleArrayValue("relationshipStyle", style)}
                        />
                        <Label htmlFor={`relationship-${style}`} className="text-sm">{style}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Pratiques d'intérêt</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {PRACTICES.map(practice => (
                      <div key={practice} className="flex items-center space-x-2">
                        <Checkbox
                          id={`practice-${practice}`}
                          checked={formData.practices.includes(practice)}
                          onCheckedChange={() => toggleArrayValue("practices", practice)}
                        />
                        <Label htmlFor={`practice-${practice}`} className="text-sm">{practice}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Valeurs importantes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {VALUES.map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`value-${value}`}
                          checked={formData.values.includes(value)}
                          onCheckedChange={() => toggleArrayValue("values", value)}
                        />
                        <Label htmlFor={`value-${value}`} className="text-sm">{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Intentions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {INTENTIONS.map(intention => (
                      <div key={intention} className="flex items-center space-x-2">
                        <Checkbox
                          id={`intention-${intention}`}
                          checked={formData.intentions.includes(intention)}
                          onCheckedChange={() => toggleArrayValue("intentions", intention)}
                        />
                        <Label htmlFor={`intention-${intention}`} className="text-sm">{intention}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-blue-600"
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending ? "Création..." : "Créer mon profil"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Display Profile
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-2">
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-playfair font-bold text-neutral-600 mb-1">
                        {profile.displayName}
                      </h2>
                      {profile.location && (
                        <div className="flex items-center text-neutral-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        {profile.gender && <span>{profile.gender}</span>}
                        {profile.orientation && <span>• {profile.orientation}</span>}
                        {profile.birthDate && (
                          <span>• {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()} ans</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Modifier le profil
                  </Button>
                </div>
                
                {profile.bio && (
                  <div className="mt-6">
                    <p className="text-neutral-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Relationship Style */}
              {profile.relationshipStyle && profile.relationshipStyle.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Heart className="w-5 h-5 mr-2 text-secondary" />
                      Style relationnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.relationshipStyle.map((style: string, index: number) => (
                        <Badge key={index} variant="secondary">{style}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Values */}
              {profile.values && profile.values.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Shield className="w-5 h-5 mr-2 text-accent" />
                      Valeurs importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.values.map((value: string, index: number) => (
                        <Badge key={index} variant="outline">{value}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Practices */}
              {profile.practices && profile.practices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Star className="w-5 h-5 mr-2 text-primary" />
                      Pratiques d'intérêt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.practices.map((practice: string, index: number) => (
                        <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                          {practice}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Intentions */}
              {profile.intentions && profile.intentions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Users className="w-5 h-5 mr-2 text-neutral-600" />
                      Intentions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.intentions.map((intention: string, index: number) => (
                        <Badge key={index} variant="secondary">{intention}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Edit Modal/Form */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Modifier mon profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="displayName">Nom d'affichage *</Label>
                        <Input
                          id="displayName"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange("displayName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Localisation</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Présentation</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="birthDate">Date de naissance</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Genre</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map(gender => (
                              <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select value={formData.orientation} onValueChange={(value) => handleInputChange("orientation", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIENTATIONS.map(orientation => (
                              <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-blue-600"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
