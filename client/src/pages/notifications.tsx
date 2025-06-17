import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageCircle, Calendar, Users, Heart, Check, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId: string;
  actionUrl: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message': return <MessageCircle className="h-5 w-5" />;
    case 'event': return <Calendar className="h-5 w-5" />;
    case 'forum': return <Users className="h-5 w-5" />;
    case 'match': return <Heart className="h-5 w-5" />;
    default: return <Bell className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'message': return 'text-blue-500';
    case 'event': return 'text-green-500';
    case 'forum': return 'text-purple-500';
    case 'match': return 'text-pink-500';
    default: return 'text-gray-500';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const filteredNotifications = notifications.filter((notif: Notification) => 
    filter === 'all' || notif.type === filter
  );

  const unreadCount = notifications.filter((notif: Notification) => !notif.isRead).length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline"
            onClick={() => {
              notifications.forEach((notif: Notification) => {
                if (!notif.isRead) {
                  markAsReadMutation.mutate(notif.id);
                }
              });
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="event">Événements</TabsTrigger>
          <TabsTrigger value="forum">Forums</TabsTrigger>
          <TabsTrigger value="match">Matchs</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                <p className="text-muted-foreground text-center">
                  Vous n'avez aucune notification dans cette catégorie.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md cursor-pointer ${
                  notification.isRead ? 'opacity-75' : 'border-primary/20 bg-primary/5'
                }`}
                onClick={() => window.location.href = notification.actionUrl}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`${getNotificationColor(notification.type)} mt-1`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{notification.content}</p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}