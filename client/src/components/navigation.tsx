import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Heart, 
  Home, 
  Calendar, 
  MessageCircleQuestion, 
  Search, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Shield,
  Brain,
  Briefcase,
  Users,
  Sparkles,
  Crown,
  Award,
  CreditCard,
  Bell,
  GraduationCap,
  UserCheck,
  ShoppingCart,
  SearchCheck
} from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationSections = [
    {
      title: "Principal",
      items: [
        { name: "Accueil", href: "/", icon: Home, description: "Tableau de bord principal" },
        { name: "Recherche", href: "/search", icon: Search, description: "Découvrir des profils" },
        { name: "Recherche Globale", href: "/global-search", icon: SearchCheck, description: "Recherche avancée" },
        { name: "Messages", href: "/messages", icon: MessageCircleQuestion, description: "Conversations privées" },
        { name: "Notifications", href: "/notifications", icon: Bell, description: "Activité récente" },
      ]
    },
    {
      title: "Communauté",
      items: [
        { name: "Événements", href: "/events", icon: Calendar, description: "Ateliers et rencontres" },
        { name: "Forums", href: "/community", icon: Users, description: "Discussions et groupes" },
        { name: "Ressources", href: "/resources", icon: BookOpen, description: "Guides et articles" },
      ]
    },
    {
      title: "Apprentissage",
      items: [
        { name: "Cours", href: "/courses", icon: GraduationCap, description: "Formations en ligne" },
        { name: "Mentorat", href: "/mentorship", icon: UserCheck, description: "Accompagnement personnalisé" },
        { name: "Certifications", href: "/certifications", icon: Award, description: "Validez vos compétences" },
        { name: "Marketplace", href: "/marketplace", icon: ShoppingCart, description: "Ressources premium" },
      ]
    },
    {
      title: "Développement",
      items: [
        { name: "Bien-être", href: "/wellness", icon: Sparkles, description: "Journal et méditations" },
        { name: "Badges", href: "/badges", icon: Award, description: "Accomplissements" },
        { name: "IA Fluide", href: "/ai", icon: Brain, description: "Assistant intelligent" },
      ]
    },
    {
      title: "Services",
      items: [
        { name: "Professionnels", href: "/professionals", icon: Briefcase, description: "Thérapeutes et coachs" },
        { name: "Premium", href: "/subscription", icon: Crown, description: "Abonnements et affiliation" },
      ]
    }
  ];

  // Navigation simplifiée pour la barre horizontale
  const mainNavigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Recherche", href: "/search", icon: Search },
    { name: "Événements", href: "/events", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageCircleQuestion },
    { name: "Communauté", href: "/community", icon: Users },
    { name: "Bien-être", href: "/wellness", icon: Sparkles },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="ml-3 text-2xl font-playfair font-semibold text-neutral-600">
              Fluide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative flex items-center space-x-2 transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                        : "text-neutral-600 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium">{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </Button>
                </Link>
              );
            })}
            
            {/* Menu Plus avec sections organisées */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-neutral-600 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
                >
                  <Menu className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline font-medium">Plus</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-3 shadow-xl border border-border/50">
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-foreground mb-1">Menu complet</h4>
                  <p className="text-xs text-muted-foreground">Accédez à toutes les fonctionnalités</p>
                </div>
                {navigationSections.slice(2).map((section, sectionIndex) => (
                  <div key={section.title} className="mb-3">
                    <div className="flex items-center gap-2 px-1 py-2 mb-2">
                      <div className="w-1 h-4 bg-primary/30 rounded-full" />
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {section.title}
                      </h5>
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <DropdownMenuItem key={item.name} asChild className="p-0">
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                isActive 
                                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                                  : "hover:bg-muted/70 border border-transparent hover:border-border/50"
                              }`}
                            >
                              <div className={`p-2 rounded-lg transition-colors ${
                                isActive 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {item.name}
                                  {isActive && (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                    {sectionIndex < navigationSections.slice(2).length - 1 && (
                      <DropdownMenuSeparator className="my-3" />
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.profileImageUrl} 
                        alt={user?.firstName || "User"} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Sécurité</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 p-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={user?.profileImageUrl} 
                        alt={user?.firstName || "User"} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation organisée par sections */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {navigationSections.map((section, sectionIndex) => (
                      <div key={section.title} className="mb-6">
                        <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <nav className="space-y-1 px-2">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location === item.href;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <Button
                                  variant={isActive ? "default" : "ghost"}
                                  className={`w-full justify-start h-auto p-3 ${
                                    isActive 
                                      ? "bg-primary text-white shadow-lg" 
                                      : "text-neutral-600 hover:text-primary hover:bg-primary/5"
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-md mr-3 ${
                                    isActive 
                                      ? "bg-primary-foreground/20" 
                                      : "bg-muted"
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="font-medium text-sm">{item.name}</div>
                                    <div className="text-xs opacity-75 truncate">
                                      {item.description}
                                    </div>
                                  </div>
                                </Button>
                              </Link>
                            );
                          })}
                        </nav>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-4 space-y-2">
                    <Link href="/profile">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="mr-3 w-5 h-5" />
                        Mon profil
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="mr-3 w-5 h-5" />
                      Paramètres
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 w-5 h-5" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
