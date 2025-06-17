import { Heart, Shield, Users, Calendar, MessageCircle, Search, Book, Video, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <Heart className="text-white text-lg" />
                </div>
                <span className="ml-3 text-2xl font-playfair font-semibold text-neutral-600">Fluide</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">Découvrir</a>
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">Événements</a>
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">Ressources</a>
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">Communauté</a>
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin}>
                Connexion
              </Button>
              <Button onClick={handleLogin} className="bg-primary text-white hover:bg-blue-600">
                Inscription
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 opacity-20 bg-repeat" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3e8ff' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-8">
                <span className="text-sm font-medium text-primary mr-2">✨ Nouveau</span>
                <span className="text-sm text-muted-foreground">IA pour des connexions authentiques</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-playfair font-bold text-foreground leading-[1.1] mb-6">
                Connexions{" "}
                <span className="gradient-text">conscientes</span>{" "}
                et authentiques
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Découvrez une plateforme dédiée aux approches relationnelles alternatives. 
                Explorez le tantra, la polyamorie éthique et l'épanouissement personnel 
                dans un environnement sécurisé et bienveillant.
              </p>
              
              {/* Trust indicators redesigned */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="text-white w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Modération IA</p>
                  <p className="text-xs text-muted-foreground mt-1">Sécurité garantie</p>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="text-white w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Consentement</p>
                  <p className="text-xs text-muted-foreground mt-1">Éthique d'abord</p>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="text-white w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Inclusivité</p>
                  <p className="text-xs text-muted-foreground mt-1">Toutes identités</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="button-glow gradient-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Commencer gratuitement
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Découvrir les événements
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Diverse group of people in a supportive circle" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-primary rounded-full border-2 border-white"></div>
                    <div className="w-10 h-10 bg-secondary rounded-full border-2 border-white"></div>
                    <div className="w-10 h-10 bg-accent rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-600">2,847+</p>
                    <p className="text-sm text-neutral-500">Membres actifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-neutral-600 mb-4">
              Un espace conçu pour votre bien-être
            </h2>
            <p className="text-xl text-neutral-500 max-w-3xl mx-auto">
              Découvrez une plateforme qui privilégie la sécurité, le consentement et l'épanouissement personnel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="text-primary text-2xl w-8 h-8" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-neutral-600 mb-4">Profils authentiques</h3>
                <p className="text-neutral-500 mb-6">
                  Créez un profil détaillé avec vos valeurs, intentions et préférences. 
                  Badges de consentement pour affirmer vos principes.
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Vérification des profils
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Badges de valeurs partagées
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Photos modérées
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-secondary text-2xl w-8 h-8" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-neutral-600 mb-4">Messagerie sécurisée</h3>
                <p className="text-neutral-500 mb-6">
                  Échangez en toute sécurité avec des filtres anti-harcèlement et 
                  des outils de modération avancés.
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Filtres anti-harcèlement
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Signalement simple
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Modération 24/7
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="text-accent text-2xl w-8 h-8" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-neutral-600 mb-4">Événements & Ateliers</h3>
                <p className="text-neutral-500 mb-6">
                  Participez à des événements locaux, ateliers tantra et rencontres 
                  organisées par la communauté.
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Événements certifiés
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Inscription sécurisée
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Avis communauté
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-playfair font-bold text-neutral-600 mb-6">
                Une communauté qui vous ressemble
              </h2>
              <p className="text-xl text-neutral-500 mb-8">
                Rejoignez des milliers de personnes qui explorent les relations alternatives 
                dans un environnement respectueux et bienveillant.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary mb-2">2,847</div>
                    <div className="text-neutral-600">Membres actifs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-secondary mb-2">156</div>
                    <div className="text-neutral-600">Événements / mois</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-accent mb-2">98%</div>
                    <div className="text-neutral-600">Satisfaction</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-neutral-600">Support</div>
                  </CardContent>
                </Card>
              </div>

              {/* Community values */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-600 mb-1">Consentement explicite</h4>
                    <p className="text-neutral-500 text-sm">Chaque interaction est basée sur le respect mutuel et l'accord explicite.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="text-secondary w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-600 mb-1">Inclusivité totale</h4>
                    <p className="text-neutral-500 text-sm">Toutes les identités et orientations sont accueillies et respectées.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="text-accent w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-600 mb-1">Sécurité prioritaire</h4>
                    <p className="text-neutral-500 text-sm">Modération humaine et outils avancés pour votre protection.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Peaceful wellness community gathering in nature" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating testimonial card */}
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 gradient-primary rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-neutral-600">Marie, 34 ans</div>
                    <div className="text-sm text-neutral-500">Membre depuis 2 ans</div>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 italic">
                  "Enfin un espace où je peux être authentique sans jugement. 
                  La communauté est incroyablement bienveillante."
                </p>
                <div className="flex text-yellow-400 mt-2">
                  <span>★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-neutral-600 mb-4">
              Ressources éducatives
            </h2>
            <p className="text-xl text-neutral-500 max-w-3xl mx-auto">
              Approfondissez vos connaissances avec nos guides, articles et ressources créés par la communauté
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Peaceful reading and education scene with books about wellness and relationships" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>

            <div className="grid gap-6">
              {/* Resource 1 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Book className="text-primary w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-600 mb-2">Guide du Consentement</h3>
                      <p className="text-neutral-500 mb-4">
                        Apprenez les bases du consentement explicite et de la communication claire dans les relations.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Lecture 15 min</span>
                        <Button variant="ghost" className="text-primary hover:text-blue-600 font-semibold p-0">
                          Lire <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource 2 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mic className="text-secondary w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-600 mb-2">Podcast : Polyamorie Éthique</h3>
                      <p className="text-neutral-500 mb-4">
                        Série de conversations avec des experts et des pratiquants de la non-monogamie éthique.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">12 épisodes</span>
                        <Button variant="ghost" className="text-secondary hover:text-pink-600 font-semibold p-0">
                          Écouter <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource 3 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Video className="text-accent w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-600 mb-2">Vidéos : Pratiques Tantriques</h3>
                      <p className="text-neutral-500 mb-4">
                        Découvrez les exercices et pratiques tantriques pour approfondir votre connexion.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">8 vidéos</span>
                        <Button variant="ghost" className="text-accent hover:text-teal-600 font-semibold p-0">
                          Regarder <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6">
            Prêt·e à commencer votre exploration ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Rejoignez une communauté bienveillante de personnes qui explorent les relations alternatives 
            dans un environnement sécurisé et respectueux.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={handleLogin}
              className="bg-white text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100"
            >
              Créer mon profil gratuitement
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary"
            >
              Découvrir la communauté
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center">
              <Shield className="mr-2 w-4 h-4" />
              <span>100% Sécurisé</span>
            </div>
            <div className="flex items-center">
              <Heart className="mr-2 w-4 h-4" />
              <span>Modération humaine</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 w-4 h-4" />
              <span>Communauté inclusive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company info */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <Heart className="text-white text-lg w-6 h-6" />
                </div>
                <span className="ml-3 text-2xl font-playfair font-semibold">Fluide</span>
              </div>
              <p className="text-gray-300 mb-4">
                Plateforme de rencontres alternatives pour une communauté bienveillante et inclusive.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Découvrir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Événements</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ressources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Communauté</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Signaler un problème</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Charte communauté</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Fluide. Tous droits réservés. Fait avec ❤️ pour une communauté inclusive.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
