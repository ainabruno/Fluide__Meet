import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import MessageThread from "@/components/message-thread";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, Search, Plus, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Conversation {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    profile?: {
      displayName: string;
    };
  };
  lastMessage: {
    content: string;
    sentAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function Messages() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // For now, we'll use mock data since the conversations endpoint needs complex implementation
  const mockConversations: Conversation[] = [
    {
      user: {
        id: "user1",
        firstName: "Marie",
        lastName: "D.",
        profile: { displayName: "Marie" }
      },
      lastMessage: {
        content: "Merci pour cette belle discussion sur le tantra !",
        sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        senderId: "user1"
      },
      unreadCount: 2
    },
    {
      user: {
        id: "user2",
        firstName: "Alex",
        lastName: "M.",
        profile: { displayName: "Alex" }
      },
      lastMessage: {
        content: "À bientôt pour l'atelier de méditation !",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        senderId: user?.id || "current"
      },
      unreadCount: 0
    },
    {
      user: {
        id: "user3",
        firstName: "Sam",
        lastName: "K.",
        profile: { displayName: "Sam" }
      },
      lastMessage: {
        content: "J'ai adoré votre approche de la CNV",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        senderId: "user3"
      },
      unreadCount: 1
    }
  ];

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

  const filteredConversations = mockConversations.filter(conv => 
    conv.user.profile?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = selectedConversation 
    ? mockConversations.find(c => c.user.id === selectedConversation)
    : null;

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-neutral-600 mb-2">
            Messages
          </h1>
          <p className="text-neutral-500">
            Échangez avec la communauté dans un environnement bienveillant
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageCircleQuestion className="w-5 h-5 mr-2" />
                    Conversations
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-2 transition-colors ${
                          selectedConversation === conversation.user.id
                            ? 'bg-primary/5 border-l-primary'
                            : 'border-l-transparent'
                        }`}
                        onClick={() => setSelectedConversation(conversation.user.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage 
                                src={conversation.user.profileImageUrl} 
                                alt={conversation.user.profile?.displayName || conversation.user.firstName} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                {(conversation.user.profile?.displayName || conversation.user.firstName || "U").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-neutral-600 truncate">
                                {conversation.user.profile?.displayName || 
                                 `${conversation.user.firstName} ${conversation.user.lastName}`}
                              </h4>
                              <span className="text-xs text-neutral-400">
                                {formatLastMessageTime(conversation.lastMessage.sentAt)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              conversation.unreadCount > 0 ? 'text-neutral-600 font-medium' : 'text-neutral-500'
                            }`}>
                              {conversation.lastMessage.senderId === user.id && "Vous: "}
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
                    <MessageCircleQuestion className="w-12 h-12 mb-4 text-neutral-300" />
                    <p className="text-center">
                      {searchTerm ? "Aucune conversation trouvée" : "Aucune conversation"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedConv ? (
              <MessageThread
                otherUserId={selectedConv.user.id}
                otherUserName={selectedConv.user.profile?.displayName || 
                               `${selectedConv.user.firstName} ${selectedConv.user.lastName}`}
                otherUserImage={selectedConv.user.profileImageUrl}
                currentUserId={user.id}
              />
            ) : (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                  <MessageCircleQuestion className="w-24 h-24 mb-6 text-neutral-300" />
                  <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
                  <p className="text-center mb-6 max-w-md">
                    Choisissez une conversation dans la liste ou commencez à échanger avec 
                    des membres de la communauté
                  </p>
                  <div className="space-y-3 text-center">
                    <div className="flex items-center text-sm">
                      <Heart className="w-4 h-4 mr-2 text-secondary" />
                      Échanges bienveillants et respectueux
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageCircleQuestion className="w-4 h-4 mr-2 text-primary" />
                      Messagerie sécurisée et modérée
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Safety Notice */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Sécurité et bienveillance
                </h4>
                <p className="text-yellow-700 text-sm">
                  Nos échanges sont modérés pour garantir un environnement sûr. 
                  Signalez tout comportement inapproprié. Privilégiez toujours 
                  le consentement explicite dans vos interactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
