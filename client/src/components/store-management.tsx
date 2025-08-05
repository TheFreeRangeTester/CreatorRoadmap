import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, Store, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { StoreItemForm } from './store-item-form';
import type { StoreItemResponse } from '@shared/schema';

export function StoreManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItemResponse | null>(null);

  const { data: storeItems = [], isLoading } = useQuery<StoreItemResponse[]>({
    queryKey: ['/api/store/items'],
    queryFn: async () => {
      const response = await apiRequest('/api/store/items');
      return response.json();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => apiRequest(`/api/store/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store/items'] });
      toast({
        title: t('store.itemDeleted'),
        description: t('store.itemDeleted'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('store.deleteItem'),
        description: error.message || t('errors.generic'),
        variant: 'destructive',
      });
    },
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/store/items'] });
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ['/api/store/items'] });
  };

  const handleDeleteItem = (itemId: number) => {
    deleteItemMutation.mutate(itemId);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            {t('store.title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('store.description')}</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={storeItems.length >= 5}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {t('store.createItem')}
        </Button>
      </div>

      {storeItems.length >= 5 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              {t('store.maxItemsReached')}
            </p>
          </CardContent>
        </Card>
      )}

      {storeItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">{t('store.noItems')}</p>
            <p className="text-muted-foreground mb-4">{t('store.createFirst')}</p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {t('store.createItem')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {storeItems.map((item) => (
            <Card key={item.id} className="relative rounded-3xl glass-card">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2 contained-text pr-2">{item.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('store.deleteItem')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('store.confirmDelete')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t('store.deleteItem')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 contained-text leading-relaxed">
                  {item.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium contained-text">{t('store.pointsCost')}</span>
                    <Badge variant="secondary" className="text-xs">{item.pointsCost} pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium contained-text">{t('store.currentQuantity')}</span>
                    <span className="text-xs sm:text-sm">
                      {item.currentQuantity}
                      {item.maxQuantity !== null && ` / ${item.maxQuantity}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('common.status')}</span>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? t('store.available') : t('store.unavailable')}
                    </Badge>
                  </div>
                  {item.maxQuantity !== null && item.currentQuantity >= item.maxQuantity && (
                    <Badge variant="destructive" className="w-full justify-center">
                      {t('store.outOfStock')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <StoreItemForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      {editingItem && (
        <StoreItemForm
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
          initialData={editingItem}
        />
      )}
    </div>
  );
}