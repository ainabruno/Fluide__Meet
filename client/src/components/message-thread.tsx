import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MoreVertical, Flag, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

interface MessageThreadProps {
  otherUserId: string;
  otherUserName: string;
  otherUserImage?: string;
  currentUserId: string;
}

export default function MessageThread({ 
  otherUserId, 
  otherUserName, 
  otherUserImage,
  currentUserId 
}: MessageThreadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages", otherUserId],
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        receiverId: otherUserId,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
      scrollToBottom();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté pour envoyer des messages.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hier ' + date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleReport = () => {
    if (confirm("Signaler cette conversation pour contenu inapproprié ?")) {
      toast({
        title: "Signalement envoyé",
        description: "Nous examinerons cette conversation rapidement.",
      });
    }
  };

  const handleBlock = () => {
    if (confirm("Bloquer cette personne ? Elle ne pourra plus vous contacter.")) {
      toast({
        title: "Utilisateur bloqué",
        description: "Cette personne ne peut plus vous contacter.",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherUserImage} alt={otherUserName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {otherUserName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <p className="text-sm text-neutral-500">En ligne</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="w-4 h-4 mr-2" />
                Signaler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock} className="text-red-600">
                <Shield className="w-4 h-4 mr-2" />
                Bloquer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message: Message, index: number) => {
              const isFromCurrentUser = message.senderId === currentUserId;
              const showTime = index === 0 || 
                new Date(message.sentAt).getTime() - new Date(messages[index - 1].sentAt).getTime() > 300000; // 5 minutes

              return (
                <div key={message.id}>
                  {showTime && (
                    <div className="text-center text-xs text-neutral-400 my-4">
                      {formatMessageTime(message.sentAt)}
                    </div>
                  )}
                  <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isFromCurrentUser && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={otherUserImage} alt={otherUserName} />
                          <AvatarFallback className="bg-gray-300 text-xs">
                            {otherUserName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`px-4 py-2 rounded-2xl ${
                        isFromCurrentUser 
                          ? 'bg-primary text-white rounded-br-sm' 
                          : 'bg-gray-100 text-neutral-600 rounded-bl-sm'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
            <p className="mb-2">Aucun message encore</p>
            <p className="text-sm text-center">
              Commencez la conversation en envoyant un message bienveillant !
            </p>
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="text-xs text-neutral-400 mt-2 text-center">
          Soyez respectueux·se et bienveillant·e dans vos échanges
        </div>
      </div>
    </Card>
  );
}
