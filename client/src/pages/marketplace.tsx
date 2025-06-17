import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Download, Package, BookOpen, Headphones, Palette } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  isDigital: boolean;
  shippingInfo?: string;
  tags: string[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'guides': return <BookOpen className="h-5 w-5" />;
    case 'audio': return <Headphones className="h-5 w-5" />;
    case 'physical': return <Package className="h-5 w-5" />;
    case 'digital': return <Download className="h-5 w-5" />;
    case 'art': return <Palette className="h-5 w-5" />;
    default: return <Package className="h-5 w-5" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'guides': return 'Guides & E-books';
    case 'audio': return 'Contenus Audio';
    case 'physical': return 'Produits Physiques';
    case 'digital': return 'Contenus Numériques';
    case 'art': return 'Art & Créations';
    default: return category;
  }
};

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/products', { 
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: searchQuery || undefined 
    }],
  });

  const filteredProducts = products.filter((product: Product) => {
    if (priceFilter === 'free' && product.price > 0) return false;
    if (priceFilter === 'paid' && product.price === 0) return false;
    if (priceFilter === 'under-25' && product.price >= 25) return false;
    if (priceFilter === 'over-25' && product.price < 25) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'newest': return b.id - a.id;
      default: return b.reviewCount - a.reviewCount; // popular
    }
  });

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'guides', label: 'Guides & E-books' },
    { value: 'audio', label: 'Contenus Audio' },
    { value: 'physical', label: 'Produits Physiques' },
    { value: 'digital', label: 'Contenus Numériques' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Marketplace Fluide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez des ressources créées par la communauté pour enrichir votre parcours
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="under-25">Moins de 25€</SelectItem>
                <SelectItem value="over-25">Plus de 25€</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Populaires</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Produits disponibles ({sortedProducts.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-80 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground text-center">
                Essayez d'ajuster vos filtres ou parcourez toutes les catégories.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product: Product) => (
              <Card key={product.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(product.category)}
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(product.category)}
                      </Badge>
                    </div>
                    {product.isDigital && (
                      <Badge variant="secondary" className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        Numérique
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} avis)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Par {product.sellerName}
                      </span>
                      <span className="text-lg font-bold">
                        {product.price === 0 ? 'Gratuit' : `${product.price}${product.currency === 'EUR' ? '€' : product.currency}`}
                      </span>
                    </div>
                    
                    {product.shippingInfo && (
                      <p className="text-xs text-muted-foreground">
                        {product.shippingInfo}
                      </p>
                    )}
                  </div>

                  <Button className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.price === 0 ? 'Télécharger' : 'Acheter'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Featured Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>Créateurs populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Dr. Sarah L.', 'Luna M.', 'Shakti D.'].map((seller) => (
              <div key={seller} className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {seller.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold">{seller}</h3>
                <p className="text-sm text-muted-foreground">
                  Créateur vérifié avec {Math.floor(Math.random() * 20) + 5} produits
                </p>
                <Button variant="outline" size="sm">
                  Voir les produits
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}