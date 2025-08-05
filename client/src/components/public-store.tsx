import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Store, ShoppingCart, Gift, Star, Package } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { StoreItemResponse, UserPointsResponse } from '@shared/schema';

interface PublicStoreProps {
  creatorUsername: string;
  isAuthenticated: boolean;
}

export function PublicStore({ creatorUsername, isAuthenticated }: PublicStoreProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<StoreItemResponse | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);

  const { data: storeItems = [], isLoading } = useQuery<StoreItemResponse[]>({
    queryKey: ['/api/creators', creatorUsername, 'store'],
    queryFn: async () => {
      const response = await apiRequest(`/api/creators/${creatorUsername}/store`);
      return response.json();
    },
  });

  const { data: userPoints } = useQuery<UserPointsResponse>({
    queryKey: ['/api/user/points'],
    queryFn: async () => {
      const response = await apiRequest('/api/user/points');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const redeemMutation = useMutation({
    mutationFn: (itemId: number) =>
      apiRequest(`/api/creators/${creatorUsername}/store/${itemId}/redeem`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creators', creatorUsername, 'store'] });
      toast({
        title: t('store.redeemSuccess'),
        description: t('store.redeemSuccess'),
      });
      setIsRedeemDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: t('store.redeemError'),
        description: error.message || t('errors.generic'),
        variant: 'destructive',
      });
    },
  });

  const handleRedeem = (item: StoreItemResponse) => {
    if (!isAuthenticated) {
      toast({
        title: t('common.loginRequired'),
        description: t('common.loginRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (!userPoints || userPoints.totalPoints < item.pointsCost) {
      toast({
        title: t('store.insufficientPoints'),
        description: t('store.insufficientPoints'),
        variant: 'destructive',
      });
      return;
    }

    setSelectedItem(item);
    setIsRedeemDialogOpen(true);
  };

  const confirmRedeem = () => {
    if (selectedItem) {
      redeemMutation.mutate(selectedItem.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (storeItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">{t('store.emptyStore')}</p>
          <p className="text-muted-foreground">{t('store.noActiveItems')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6" />
            {t('store.browseStore')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('store.description')}
          </p>
        </div>
        {isAuthenticated && userPoints && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{userPoints.totalPoints} {t('points.title')}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {storeItems.map((item) => {
          const isAvailable = item.isAvailable && item.isActive;
          const canAfford = isAuthenticated && userPoints && userPoints.totalPoints >= item.pointsCost;
          const isOutOfStock = item.maxQuantity !== null && item.currentQuantity >= item.maxQuantity;

          return (
            <Card key={item.id} className={`relative rounded-3xl glass-card ${!isAvailable ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2 contained-text pr-2">{item.title}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {item.pointsCost}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 contained-text leading-relaxed">
                  {item.description}
                </p>
                
                {item.maxQuantity !== null && (
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
                    <span className="text-muted-foreground contained-text">{t('store.itemsLeft')}:</span>
                    <span className="font-medium text-orange-600">
                      {item.maxQuantity - item.currentQuantity}
                    </span>
                  </div>
                )}
                
                {isOutOfStock && (
                  <div className="mb-4">
                    <Badge variant="destructive" className="w-full justify-center">
                      {t('store.outOfStock')}
                    </Badge>
                  </div>
                )}

                <Button
                  onClick={() => handleRedeem(item)}
                  disabled={!isAvailable || !canAfford || isOutOfStock}
                  className="w-full"
                  variant={canAfford ? "default" : "outline"}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('store.redeemButton', { points: item.pointsCost })}
                </Button>

                {isAuthenticated && !canAfford && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    {t('store.insufficientPoints')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('store.redeemButton', { points: selectedItem?.pointsCost || 0 })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">{selectedItem.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedItem.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{selectedItem.pointsCost} {t('points.title')}</span>
                  </div>
                </div>
                
                {userPoints && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t('points.currentPoints', { points: userPoints.totalPoints })}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('points.availableForSuggestions')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {userPoints.totalPoints - selectedItem.pointsCost} {t('points.title')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('points.title')}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsRedeemDialogOpen(false)}
                disabled={redeemMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={confirmRedeem}
                disabled={redeemMutation.isPending}
              >
                {redeemMutation.isPending ? t('store.updating') : t('store.redeemButton', { points: selectedItem?.pointsCost || 0 })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}