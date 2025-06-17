import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  BookOpen, Plus, Play, Pause, Award, Target, Heart, 
  Smile, Meh, Frown, Zap, Moon, Sun, Calendar, TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface JournalEntry {
  id: number;
  title?: string;
  content: string;
  mood: string;
  energy: number;
  tags: string[];
  createdAt: string;
}

interface MeditationContent {
  id: number;
  title: string;
  description?: string;
  category: string;
  duration: number;
  difficulty: string;
  instructor: string;
  isPremium: boolean;
  rating: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  progress: number;
  status: string;
}

export default function Wellness() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [newEntryOpen, setNewEntryOpen] = useState(false);

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/wellness/journal"],
  });

  const { data: meditations = [] } = useQuery<MeditationContent[]>({
    queryKey: ["/api/wellness/meditations"],
  });

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ["/api/wellness/challenges"],
  });

  const createJournalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/wellness/journal", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wellness/journal"] });
      setNewEntryOpen(false);
    },
  });

  const moodOptions = [
    { value: "joyful", label: "Joyeux", icon: "😄", color: "bg-yellow-100 text-yellow-800" },
    { value: "calm", label: "Calme", icon: "😌", color: "bg-blue-100 text-blue-800" },
    { value: "excited", label: "Excité", icon: "🤩", color: "bg-orange-100 text-orange-800" },
    { value: "neutral", label: "Neutre", icon: "😐", color: "bg-gray-100 text-gray-800" },
    { value: "sad", label: "Triste", icon: "😢", color: "bg-indigo-100 text-indigo-800" },
    { value: "anxious", label: "Anxieux", icon: "😰", color: "bg-red-100 text-red-800" },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  const getMoodIcon = (mood: string) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.icon : "😐";
  };

  const getMoodColor = (mood: string) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.color : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Espace Bien-être</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Cultivez votre équilibre intérieur avec des outils de développement personnel, 
          méditations guidées et suivi de votre évolution
        </p>
      </div>

      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="journal">Journal Personnel</TabsTrigger>
          <TabsTrigger value="meditations">Méditations</TabsTrigger>
          <TabsTrigger value="challenges">Défis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Journal Personnel */}
        <TabsContent value="journal" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mon Journal</h2>
            <Button onClick={() => setNewEntryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entrée
            </Button>
          </div>

          {/* Quick mood tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Comment vous sentez-vous aujourd'hui ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => setSelectedMood(mood.value)}
                  >
                    <span className="text-2xl">{mood.icon}</span>
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Niveau d'énergie : {energyLevel[0]}/10
                  </label>
                  <Slider
                    value={energyLevel}
                    onValueChange={setEnergyLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <Textarea
                  placeholder="Qu'est-ce qui se passe dans votre esprit aujourd'hui ?"
                  className="min-h-24"
                />
                
                <div className="flex gap-2">
                  <Input placeholder="Tags (optionnel)" className="flex-1" />
                  <Button>Enregistrer</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal entries */}
          <div className="space-y-4">
            {journalEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {entry.title || formatDate(entry.createdAt)}
                        </CardTitle>
                        <CardDescription>
                          Énergie: {entry.energy}/10
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getMoodColor(entry.mood)}>
                      {moodOptions.find(m => m.value === entry.mood)?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{entry.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Méditations */}
        <TabsContent value="meditations" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Méditations Guidées</h2>
            <p className="text-muted-foreground">
              Découvrez des pratiques tantriques, de pleine conscience et de breathwork
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meditations.map((meditation) => (
              <Card key={meditation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{meditation.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{meditation.duration} min</span>
                        <span>•</span>
                        <span>{meditation.difficulty}</span>
                        {meditation.isPremium && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {meditation.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{meditation.description}</CardDescription>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span>Par {meditation.instructor}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{meditation.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Commencer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Défis */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Défis Relationnels</h2>
            <p className="text-muted-foreground">
              Exercices quotidiens pour améliorer vos relations et votre communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{challenge.category}</Badge>
                        <Badge variant="secondary">{challenge.difficulty}</Badge>
                        <Badge variant="outline">{challenge.duration}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl mb-1">
                        {challenge.status === "completed" ? "🏆" : 
                         challenge.status === "active" ? "⚡" : "🎯"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{challenge.description}</CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} />
                  </div>

                  <Button 
                    className="w-full" 
                    variant={challenge.status === "completed" ? "secondary" : "default"}
                  >
                    {challenge.status === "completed" ? "Terminé" :
                     challenge.status === "active" ? "Continuer" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Mes Insights</h2>
            <p className="text-muted-foreground">
              Analyse de votre évolution personnelle et relationnelle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mood trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution de l'humeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📈</div>
                  <p className="text-muted-foreground text-sm">
                    Votre humeur s'améliore de 15% ce mois-ci
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Energy patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Patterns d'énergie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-muted-foreground text-sm">
                    Pic d'énergie entre 9h-11h
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Growth areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Zones de croissance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🌱</div>
                  <p className="text-muted-foreground text-sm">
                    Focus sur la communication
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Accomplissements récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="font-medium">7 jours consécutifs de journal</p>
                    <p className="text-sm text-muted-foreground">Il y a 2 jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">🧘</div>
                  <div>
                    <p className="font-medium">Première méditation tantrique</p>
                    <p className="text-sm text-muted-foreground">Il y a 5 jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">💬</div>
                  <div>
                    <p className="font-medium">Défi communication terminé</p>
                    <p className="text-sm text-muted-foreground">Il y a 1 semaine</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}