import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Clock, MessageCircle, Video, Heart, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MentorMatch {
  id: number;
  mentorId: string;
  mentorName: string;
  mentorExpertise: string[];
  mentorExperience: string;
  compatibilityScore: number;
  availability: string;
  sessionType: string;
  pricePerSession: number;
  description: string;
}

export default function Mentorship() {
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/mentorship/matches'],
  });

  const requestMutation = useMutation({
    mutationFn: (data: { mentorId: string; message: string; sessionType: string }) => 
      apiRequest('POST', '/api/mentorship/request', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/matches'] });
      setDialogOpen(false);
      setRequestMessage('');
      setSelectedSessionType('');
    },
  });

  const handleRequestMentorship = (mentor: MentorMatch) => {
    setSelectedMentor(mentor);
    setDialogOpen(true);
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text_chat': return <MessageCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Appel vidéo';
      case 'text_chat': return 'Chat textuel';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Mentorat & Accompagnement</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trouvez un mentor expérimenté pour vous accompagner dans votre parcours en relations alternatives
        </p>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça fonctionne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Matching intelligent</h3>
              <p className="text-sm text-muted-foreground">
                Notre algorithme vous propose des mentors compatibles avec vos besoins
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Première prise de contact</h3>
              <p className="text-sm text-muted-foreground">
                Envoyez une demande personnalisée au mentor de votre choix
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Accompagnement personnalisé</h3>
              <p className="text-sm text-muted-foreground">
                Bénéficiez d'un soutien adapté à votre situation unique
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentor matches */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mentors recommandés pour vous</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((mentor: MentorMatch) => (
              <Card key={mentor.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {mentor.mentorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{mentor.mentorName}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {Math.round(mentor.compatibilityScore * 100)}% compatible
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{mentor.mentorExperience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Disponible {mentor.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{mentor.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Domaines d'expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.mentorExpertise.map((expertise, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Score de compatibilité</p>
                    <div className="space-y-1">
                      <Progress value={mentor.compatibilityScore * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Basé sur vos préférences et votre profil
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSessionTypeIcon(mentor.sessionType)}
                      <span className="text-sm">{getSessionTypeLabel(mentor.sessionType)}</span>
                    </div>
                    <span className="font-semibold">
                      {mentor.pricePerSession === 0 ? 'Gratuit' : `${mentor.pricePerSession}€/session`}
                    </span>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleRequestMentorship(mentor)}
                  >
                    Demander un accompagnement
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de mentorat</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedMentor.mentorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedMentor.mentorName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMentor.mentorExperience}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type de session préféré</label>
                <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez le type de session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Appel vidéo</SelectItem>
                    <SelectItem value="text_chat">Chat textuel</SelectItem>
                    <SelectItem value="phone">Appel téléphonique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message personnel</label>
                <Textarea
                  placeholder="Présentez-vous et expliquez ce qui vous amène à chercher un mentor..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  Un message personnalisé augmente vos chances d'acceptation
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (selectedMentor && selectedSessionType && requestMessage.trim()) {
                      requestMutation.mutate({
                        mentorId: selectedMentor.mentorId,
                        message: requestMessage,
                        sessionType: selectedSessionType
                      });
                    }
                  }}
                  disabled={!selectedSessionType || !requestMessage.trim() || requestMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la demande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}