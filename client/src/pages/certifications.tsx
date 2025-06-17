import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Clock, CheckCircle, BookOpen, Users, Star, Trophy, Target } from 'lucide-react';

interface Certification {
  id: number;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  badgeColor: string;
  badgeIcon: string;
  difficultyLevel: string;
  estimatedTime: string;
  isEarned: boolean;
  progress: number;
}

const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'débutant': return 'bg-green-100 text-green-800';
    case 'intermédiaire': return 'bg-orange-100 text-orange-800';
    case 'avancé': return 'bg-red-100 text-red-800';
    case 'expert': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'communication': return <Users className="h-5 w-5" />;
    case 'mentorship': return <Star className="h-5 w-5" />;
    case 'spirituality': return <Award className="h-5 w-5" />;
    case 'leadership': return <Trophy className="h-5 w-5" />;
    default: return <Award className="h-5 w-5" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'communication': return 'Communication';
    case 'mentorship': return 'Mentorat';
    case 'spirituality': return 'Spiritualité';
    case 'leadership': return 'Leadership';
    default: return category;
  }
};

export default function Certifications() {
  const [activeTab, setActiveTab] = useState('available');

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['/api/certifications'],
  });

  const earnedCertifications = certifications.filter((cert: Certification) => cert.isEarned);
  const inProgressCertifications = certifications.filter((cert: Certification) => 
    !cert.isEarned && cert.progress > 0
  );
  const availableCertifications = certifications.filter((cert: Certification) => 
    !cert.isEarned && cert.progress === 0
  );

  const categories = [...new Set(certifications.map((cert: Certification) => cert.category))];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Certifications & Badges</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Validez vos compétences et obtenez des certifications reconnues par la communauté Fluide
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{earnedCertifications.length}</div>
            <div className="text-sm text-muted-foreground">Certifications obtenues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{inProgressCertifications.length}</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{availableCertifications.length}</div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Catégories</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">Obtenues ({earnedCertifications.length})</TabsTrigger>
          <TabsTrigger value="progress">En cours ({inProgressCertifications.length})</TabsTrigger>
          <TabsTrigger value="available">Disponibles ({availableCertifications.length})</TabsTrigger>
        </TabsList>

        {/* Earned Certifications */}
        <TabsContent value="earned" className="space-y-4">
          {earnedCertifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune certification obtenue</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Commencez votre parcours de certification pour valider vos compétences.
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Voir les certifications disponibles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedCertifications.map((cert: Certification) => (
                <Card key={cert.id} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cert.category)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(cert.category)}
                        </Badge>
                      </div>
                      <div className="text-2xl" style={{ color: cert.badgeColor }}>
                        {cert.badgeIcon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{cert.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Certification obtenue</span>
                    </div>

                    <div className="space-y-2">
                      <Badge className={getDifficultyColor(cert.difficultyLevel)}>
                        Niveau {cert.difficultyLevel}
                      </Badge>
                    </div>

                    <Button variant="outline" className="w-full">
                      Voir le certificat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* In Progress Certifications */}
        <TabsContent value="progress" className="space-y-4">
          {inProgressCertifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune certification en cours</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choisissez une certification et commencez votre parcours d'apprentissage.
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Parcourir les certifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCertifications.map((cert: Certification) => (
                <Card key={cert.id} className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cert.category)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(cert.category)}
                        </Badge>
                      </div>
                      <div className="text-2xl" style={{ color: cert.badgeColor }}>
                        {cert.badgeIcon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{cert.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression</span>
                        <span>{cert.progress}%</span>
                      </div>
                      <Progress value={cert.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Prochaines étapes :</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {cert.requirements.slice(0, 2).map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      Continuer le parcours
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Certifications */}
        <TabsContent value="available" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-80 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCertifications.map((cert: Certification) => (
                <Card key={cert.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cert.category)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(cert.category)}
                        </Badge>
                      </div>
                      <div className="text-2xl" style={{ color: cert.badgeColor }}>
                        {cert.badgeIcon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{cert.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{cert.estimatedTime}</span>
                      </div>
                      <Badge className={getDifficultyColor(cert.difficultyLevel)}>
                        {cert.difficultyLevel}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Prérequis :</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {cert.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      Commencer la certification
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories de certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryCount = certifications.filter((cert: Certification) => cert.category === category).length;
              const earnedCount = earnedCertifications.filter((cert: Certification) => cert.category === category).length;
              
              return (
                <div key={category} className="text-center space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-semibold">{getCategoryLabel(category)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {earnedCount}/{categoryCount} certifications
                  </p>
                  <Progress value={(earnedCount / categoryCount) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}