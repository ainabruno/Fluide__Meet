import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, Users, Plus, Pin, Lock, Eye, Heart, 
  Calendar, Settings, Shield, Crown, Sparkles, BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  moderatorIds: string[];
  topicCount?: number;
  lastActivity?: string;
}

interface ForumTopic {
  id: number;
  categoryId: number;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  lastReplyByName?: string;
  createdAt: string;
}

interface CommunityGroup {
  id: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  maxMembers: number;
  currentMembers: number;
  creatorId: string;
  creatorName: string;
  tags: string[];
  imageUrl?: string;
  membershipStatus?: string;
}

export default function Community() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: topics = [] } = useQuery<ForumTopic[]>({
    queryKey: ["/api/forum/topics", { category: selectedCategory, search: searchQuery }],
  });

  const { data: groups = [] } = useQuery<CommunityGroup[]>({
    queryKey: ["/api/community/groups"],
  });

  const createTopicMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/forum/topics", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setNewTopicOpen(false);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/community/groups", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      setNewGroupOpen(false);
    },
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Il y a moins d'une heure";
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Communauté Fluide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Rejoignez les discussions, partagez vos expériences et connectez-vous avec 
          la communauté autour du tantra, des relations conscientes et du développement personnel
        </p>
      </div>

      <Tabs defaultValue="forums" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="groups">Groupes</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        {/* Forums */}
        <TabsContent value="forums" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="Rechercher dans les forums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {user && (
              <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau sujet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau sujet</DialogTitle>
                    <DialogDescription>
                      Partagez vos questions, expériences ou insights avec la communauté
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Catégorie</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Titre</label>
                      <Input placeholder="Titre de votre sujet..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea 
                        placeholder="Partagez vos pensées..." 
                        className="min-h-32"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags (optionnel)</label>
                      <Input placeholder="tantra, polyamour, communication..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setNewTopicOpen(false)}>
                        Annuler
                      </Button>
                      <Button>Publier</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Catégories principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category.id.toString())}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <MessageSquare 
                        className="h-6 w-6" 
                        style={{ color: category.color }} 
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {category.isPrivate && <Lock className="h-3 w-3" />}
                        {category.requiresApproval && <Shield className="h-3 w-3" />}
                        <span>{category.topicCount || 0} sujets</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{category.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste des sujets */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory ? 
                  `Sujets - ${categories.find(c => c.id.toString() === selectedCategory)?.name}` :
                  "Derniers sujets"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                        {topic.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                        <h3 className="font-semibold hover:text-primary cursor-pointer">
                          {topic.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {topic.content.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {topic.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Par {topic.authorName}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{topic.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{topic.replyCount}</span>
                        </div>
                        <span>{formatTimeAgo(topic.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groupes */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Groupes Communautaires</h2>
            {user && (
              <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un groupe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                      Créez un espace privé pour échanger avec des personnes partageant vos intérêts
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Nom du groupe" />
                    <Textarea placeholder="Description du groupe" />
                    <Input placeholder="Tags (séparés par des virgules)" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setNewGroupOpen(false)}>
                        Annuler
                      </Button>
                      <Button>Créer</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.currentMembers}/{group.maxMembers} membres</span>
                        {group.isPrivate && <Lock className="h-4 w-4" />}
                      </div>
                    </div>
                    {group.imageUrl && (
                      <img 
                        src={group.imageUrl} 
                        alt={group.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {group.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {group.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Créé par {group.creatorName}
                  </div>

                  <Button className="w-full" variant={group.membershipStatus === "member" ? "secondary" : "default"}>
                    {group.membershipStatus === "member" ? "Membre" :
                     group.membershipStatus === "pending" ? "Demande en cours" :
                     group.requiresApproval ? "Demander à rejoindre" : "Rejoindre"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blog */}
        <TabsContent value="blog" className="space-y-6">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Blog Communautaire</h3>
            <p className="text-muted-foreground mb-6">
              Prochainement : un espace pour partager des articles approfondis et des réflexions
            </p>
            <Button variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Être notifié du lancement
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}