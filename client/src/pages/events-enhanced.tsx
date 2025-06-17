import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, MapPin, Users, Heart, Star, Filter, CalendarDays, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  category: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  isRecurring: boolean;
  recurringPattern?: string;
  organizerId: string;
  organizerName: string;
  tags: string[];
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tantra': return 'bg-purple-100 text-purple-800';
    case 'social': return 'bg-blue-100 text-blue-800';
    case 'wellness': return 'bg-green-100 text-green-800';
    case 'education': return 'bg-orange-100 text-orange-800';
    case 'workshop': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'tantra': return 'Tantra';
    case 'social': return 'Social';
    case 'wellness': return 'Bien-être';
    case 'education': return 'Éducation';
    case 'workshop': return 'Atelier';
    default: return category;
  }
};

export default function EventsEnhanced() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: calendarEvents = [], isLoading } = useQuery({
    queryKey: ['/api/events/calendar', { 
      month: selectedDate?.getMonth() || new Date().getMonth(),
      year: selectedDate?.getFullYear() || new Date().getFullYear()
    }],
  });

  const joinWaitlistMutation = useMutation({
    mutationFn: (eventId: number) => 
      apiRequest('POST', `/api/events/${eventId}/join-waitlist`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/calendar'] });
    },
  });

  const filteredEvents = calendarEvents.filter((event: Event) => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getEventsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter((event: Event) => event.date === dateStr);
  };

  const upcomingEvents = filteredEvents.filter((event: Event) => 
    new Date(event.date) >= new Date()
  ).slice(0, 6);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const isEventFull = (event: Event) => {
    return event.currentParticipants >= event.maxParticipants;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Événements & Ateliers</h1>
          <p className="text-muted-foreground">
            Participez aux événements de la communauté Fluide
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Créer un événement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher des événements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="tantra">Tantra</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="wellness">Bien-être</SelectItem>
                <SelectItem value="education">Éducation</SelectItem>
                <SelectItem value="workshop">Ateliers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="my-events">Mes événements</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvents: (date) => getEventsByDate(date).length > 0
                  }}
                  modifiersClassNames={{
                    hasEvents: "bg-primary/20 font-semibold"
                  }}
                />
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedDate ? (
                    `Événements du ${selectedDate.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}`
                  ) : (
                    'Sélectionnez une date'
                  )}
                </h3>
              </div>

              {selectedDate && getEventsByDate(selectedDate).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
                    <p className="text-muted-foreground text-center">
                      Aucun événement prévu pour cette date.
                    </p>
                  </CardContent>
                </Card>
              ) : selectedDate ? (
                <div className="space-y-4">
                  {getEventsByDate(selectedDate).map((event: Event) => (
                    <Card 
                      key={event.id} 
                      className="transition-all hover:shadow-md cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge className={getCategoryColor(event.category)}>
                                {getCategoryLabel(event.category)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{event.time} ({event.duration}min)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{event.currentParticipants}/{event.maxParticipants}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Events */}
        <TabsContent value="upcoming" className="space-y-4">
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
              {upcomingEvents.map((event: Event) => (
                <Card 
                  key={event.id} 
                  className="transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(event.category)}>
                        {getCategoryLabel(event.category)}
                      </Badge>
                      {event.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Récurrent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time} ({event.duration}min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {event.currentParticipants}/{event.maxParticipants} participants
                        </span>
                      </div>
                      <span className="font-semibold">
                        {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {isEventFull(event) ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinWaitlistMutation.mutate(event.id);
                        }}
                      >
                        Rejoindre la liste d'attente
                      </Button>
                    ) : (
                      <Button className="w-full">
                        S'inscrire
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Events */}
        <TabsContent value="my-events" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mes événements</h3>
              <p className="text-muted-foreground text-center mb-4">
                Gérez vos inscriptions et vos événements créés.
              </p>
              <Button>Voir mes inscriptions</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.title}
              <Badge className={getCategoryColor(selectedEvent?.category || '')}>
                {getCategoryLabel(selectedEvent?.category || '')}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <p className="text-muted-foreground">{selectedEvent.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.time} ({selectedEvent.duration}min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>Organisé par {selectedEvent.organizerName}</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedEvent.price === 0 ? 'Gratuit' : `${selectedEvent.price}€`}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Fermer
                </Button>
                {isEventFull(selectedEvent) ? (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => joinWaitlistMutation.mutate(selectedEvent.id)}
                  >
                    Liste d'attente
                  </Button>
                ) : (
                  <Button className="flex-1">
                    S'inscrire à l'événement
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}