import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, Star, PlayCircle, BookOpen, Award, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessonsCount: number;
  difficulty: string;
  price: number;
  isPremium: boolean;
  rating: number;
  enrolledCount: number;
  thumbnailUrl: string | null;
  topics: string[];
  progress: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  type: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  order: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-orange-100 text-orange-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    case 'expert': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'Débutant';
    case 'intermediate': return 'Intermédiaire';
    case 'advanced': return 'Avancé';
    case 'expert': return 'Expert';
    default: return difficulty;
  }
};

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video': return <PlayCircle className="h-4 w-4" />;
    case 'interactive': return <BookOpen className="h-4 w-4" />;
    case 'quiz': return <Award className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

export default function Courses() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['/api/courses', selectedCourse, 'lessons'],
    enabled: !!selectedCourse,
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: number) => 
      apiRequest('POST', `/api/courses/${courseId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
  });

  const filteredCourses = courses.filter((course: Course) => 
    difficultyFilter === 'all' || course.difficulty === difficultyFilter
  );

  const myCourses = courses.filter((course: Course) => course.progress > 0);
  const availableCourses = courses.filter((course: Course) => course.progress === 0);

  if (selectedCourse) {
    const course = courses.find((c: Course) => c.id === selectedCourse);
    if (!course) return null;

    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCourse(null)}
            className="p-0 h-auto"
          >
            Cours
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {getDifficultyLabel(course.difficulty)}
                  </Badge>
                  {course.isPremium && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{course.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{course.lessonsCount} leçons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{course.rating}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{course.enrolledCount} étudiants</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Instructeur</p>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Sujets couverts</p>
                  <div className="flex flex-wrap gap-1">
                    {course.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {course.progress === 0 && (
                  <Button 
                    className="w-full"
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    {course.price > 0 ? `S'inscrire - ${course.price}€` : 'S\'inscrire gratuitement'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenu du cours</CardTitle>
              </CardHeader>
              <CardContent>
                {lessonsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson: Lesson) => (
                      <Card 
                        key={lesson.id}
                        className={`transition-all ${
                          lesson.isUnlocked 
                            ? 'hover:shadow-md cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        } ${lesson.isCompleted ? 'border-green-200 bg-green-50' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              lesson.isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : lesson.isUnlocked 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {getLessonIcon(lesson.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{lesson.title}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type === 'video' ? 'Vidéo' : 
                                     lesson.type === 'interactive' ? 'Interactif' : 'Quiz'}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {lesson.duration}min
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Cours & Formations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Approfondissez vos connaissances en relations alternatives, tantra et développement personnel
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrer par niveau :</span>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Cours disponibles</TabsTrigger>
          <TabsTrigger value="enrolled">Mes cours ({myCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: Course) => (
                <Card 
                  key={course.id} 
                  className="transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {getDifficultyLabel(course.difficulty)}
                      </Badge>
                      {course.isPremium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {course.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{course.lessonsCount} leçons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{course.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{course.enrolledCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {course.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.topics.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Par {course.instructor}
                      </span>
                      <span className="font-semibold">
                        {course.price > 0 ? `${course.price}€` : 'Gratuit'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          {myCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun cours commencé</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Inscrivez-vous à un cours pour commencer votre apprentissage.
                </p>
                <Button onClick={() => document.querySelector('[value="available"]')?.click()}>
                  Parcourir les cours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course: Course) => (
                <Card 
                  key={course.id} 
                  className="transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {getDifficultyLabel(course.difficulty)}
                      </Badge>
                      <Badge variant="secondary">En cours</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Par {course.instructor}</span>
                      <span>{course.lessonsCount} leçons</span>
                    </div>

                    <Button className="w-full" size="sm">
                      Continuer le cours
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}