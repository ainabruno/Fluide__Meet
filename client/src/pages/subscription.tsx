import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, Crown, Star, Zap, Users, Heart, Shield, 
  Gift, TrendingUp, Calculator, Euro, CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  stripeId?: string;
}

interface UserSubscription {
  id: number;
  planId: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

interface AffiliateStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  referrals: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
}

export default function Subscription() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: userSubscription } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription/user"],
  });

  const { data: affiliateStats } = useQuery<AffiliateStats>({
    queryKey: ["/api/affiliate/stats"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      setIsProcessing(true);
      return apiRequest("/api/subscription/create", {
        method: "POST",
        body: JSON.stringify({ planId, billingPeriod }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/user"] });
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/subscription/cancel", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/user"] });
    },
  });

  const filteredPlans = plans.filter(plan => 
    plan.billingPeriod === billingPeriod || plan.billingPeriod === "one-time"
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getDiscountPercent = (monthlyPrice: number, yearlyPrice: number) => {
    const yearlyMonthly = yearlyPrice / 12;
    return Math.round((1 - yearlyMonthly / monthlyPrice) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Abonnements & Affiliation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Accédez aux fonctionnalités premium et participez au programme d'affiliation 
          pour générer des revenus en recommandant Fluide
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Abonnements</TabsTrigger>
          <TabsTrigger value="affiliate">Programme Partenaire</TabsTrigger>
          <TabsTrigger value="earnings">Revenus & Analytics</TabsTrigger>
        </TabsList>

        {/* Plans d'abonnement */}
        <TabsContent value="plans" className="space-y-6">
          {/* Basculeur mensuel/annuel */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingPeriod === "monthly" ? "font-medium" : "text-muted-foreground"}>
              Mensuel
            </span>
            <Switch
              checked={billingPeriod === "yearly"}
              onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
            />
            <span className={billingPeriod === "yearly" ? "font-medium" : "text-muted-foreground"}>
              Annuel
            </span>
            {billingPeriod === "yearly" && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                -25% d'économie
              </Badge>
            )}
          </div>

          {/* Abonnement actuel */}
          {userSubscription && (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Votre abonnement actuel
                    </CardTitle>
                    <CardDescription>
                      Plan {userSubscription.plan.name} - {userSubscription.status}
                    </CardDescription>
                  </div>
                  <Badge variant={userSubscription.status === "active" ? "default" : "secondary"}>
                    {userSubscription.status === "active" ? "Actif" : userSubscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Période actuelle</p>
                    <p className="font-medium">
                      {formatDate(userSubscription.currentPeriodStart)} - {formatDate(userSubscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renouvellement</p>
                    <p className="font-medium">
                      {userSubscription.cancelAtPeriodEnd ? "Sera annulé" : "Automatique"}
                    </p>
                  </div>
                </div>
                
                {!userSubscription.cancelAtPeriodEnd && (
                  <Button 
                    variant="outline" 
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    Annuler l'abonnement
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Plans disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
                      {plan.price > 0 && (
                        <span className="text-base font-normal text-muted-foreground">
                          /{plan.billingPeriod === "monthly" ? "mois" : "an"}
                        </span>
                      )}
                    </div>
                    {billingPeriod === "yearly" && plan.price > 0 && (
                      <p className="text-sm text-green-600">
                        Économisez {getDiscountPercent(plan.price * 12 / 10, plan.price)}% par rapport au mensuel
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.isPopular ? "default" : "outline"}
                    disabled={isProcessing || (userSubscription?.planId === plan.id)}
                    onClick={() => subscribeMutation.mutate(plan.id)}
                  >
                    {isProcessing ? (
                      "Traitement..."
                    ) : userSubscription?.planId === plan.id ? (
                      "Plan actuel"
                    ) : plan.price === 0 ? (
                      "Plan actuel"
                    ) : (
                      "S'abonner"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Programme d'affiliation */}
        <TabsContent value="affiliate" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Programme Partenaire Fluide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Gagnez des commissions en recommandant Fluide à votre audience. 
              Jusqu'à 30% de commission sur chaque abonnement généré.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Commissions attractives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 30% sur les plans Premium</li>
                  <li>• 25% sur les plans Expert</li>
                  <li>• 20% sur les plans Basic</li>
                  <li>• Paiements mensuels garantis</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience cible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Communauté polyamour</li>
                  <li>• Professionnels du bien-être</li>
                  <li>• Coachs en développement</li>
                  <li>• Influenceurs lifestyle</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Outils fournis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Liens personnalisés</li>
                  <li>• Bannières créatives</li>
                  <li>• Analytics détaillés</li>
                  <li>• Support dédié</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Votre lien d'affiliation</CardTitle>
              <CardDescription>
                Partagez ce lien pour commencer à gagner des commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={`https://fluide.app/ref/${user?.id || 'USER_ID'}`}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-muted"
                />
                <Button variant="outline">Copier</Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Clics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Conversions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0€</div>
                  <div className="text-sm text-muted-foreground">Commissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0%</div>
                  <div className="text-sm text-muted-foreground">Taux conversion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics et revenus */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliateStats?.totalEarnings || 0}€
                </div>
                <p className="text-xs text-muted-foreground">
                  Depuis le début
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliateStats?.thisMonthEarnings || 0}€
                </div>
                <p className="text-xs text-muted-foreground">
                  +0% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Référrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliateStats?.referrals || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Utilisateurs référés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux conversion</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliateStats?.conversionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Conversions/visiteurs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historique des paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun paiement encore</p>
                <p className="text-sm">Vos commissions apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>

          {/* Ressources marketing */}
          <Card>
            <CardHeader>
              <CardTitle>Ressources Marketing</CardTitle>
              <CardDescription>
                Outils pour promouvoir Fluide efficacement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div>
                    <div className="font-medium">Bannières web</div>
                    <div className="text-sm text-muted-foreground">
                      Pack de visuels optimisés
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div>
                    <div className="font-medium">Templates emails</div>
                    <div className="text-sm text-muted-foreground">
                      Messages prêts à envoyer
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div>
                    <div className="font-medium">Posts réseaux sociaux</div>
                    <div className="text-sm text-muted-foreground">
                      Contenu pour Instagram, Twitter
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div>
                    <div className="font-medium">Guide de vente</div>
                    <div className="text-sm text-muted-foreground">
                      Arguments et objections
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}