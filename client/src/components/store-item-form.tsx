import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertStoreItemSchema, updateStoreItemSchema } from '@shared/schema';
import type { StoreItemResponse } from '@shared/schema';

const createFormSchema = insertStoreItemSchema.extend({
  maxQuantity: z.coerce.number().min(1).optional(),
});

const updateFormSchema = updateStoreItemSchema.extend({
  maxQuantity: z.coerce.number().min(1).optional(),
});

interface StoreItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: StoreItemResponse;
}

export function StoreItemForm({ isOpen, onClose, onSuccess, initialData }: StoreItemFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasMaxQuantity, setHasMaxQuantity] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const isEditing = !!initialData;
  
  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(isEditing ? updateFormSchema : createFormSchema),
    defaultValues: {
      title: '',
      description: '',
      pointsCost: 10,
      maxQuantity: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        pointsCost: initialData.pointsCost,
        maxQuantity: initialData.maxQuantity ?? undefined,
      });
      setHasMaxQuantity(initialData.maxQuantity !== null);
      setIsActive(initialData.isActive);
    } else {
      form.reset({
        title: '',
        description: '',
        pointsCost: 10,
        maxQuantity: undefined,
      });
      setHasMaxQuantity(false);
      setIsActive(true);
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createFormSchema>) => {
      const payload = {
        ...data,
        maxQuantity: hasMaxQuantity ? data.maxQuantity : null,
        isActive: isActive,
      };
      const response = await apiRequest('/api/store/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('store.itemCreated'),
        description: t('store.itemCreated'),
      });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('store.createItem'),
        description: error.message || t('errors.generic'),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateFormSchema>) => {
      const payload = {
        ...data,
        maxQuantity: hasMaxQuantity ? data.maxQuantity : null,
        isActive: isActive,
      };
      const response = await apiRequest(`/api/store/items/${initialData!.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('store.itemUpdated'),
        description: t('store.itemUpdated'),
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: t('store.editItem'),
        description: error.message || t('errors.generic'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createFormSchema>) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const mutation = isEditing ? updateMutation : createMutation;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl glass-card text-center p-4 sm:p-6 lg:p-8 w-full max-w-none overflow-hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="font-heading text-base sm:text-lg lg:text-xl mb-2 break-words">
            {isEditing ? t('store.editItem') : t('store.createItem')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('store.itemTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Vale por una consulta personalizada"
                      maxLength={100}
                      className="glass-input rounded-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('store.itemDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe qué incluye este artículo y cómo se entregará"
                      rows={3}
                      maxLength={500}
                      className="glass-input rounded-2xl resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pointsCost"
              render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('store.pointsCost')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="10"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="glass-input rounded-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Switch
                  checked={hasMaxQuantity}
                  onCheckedChange={setHasMaxQuantity}
                />
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t('store.maxQuantity')}
                </label>
              </div>

              {hasMaxQuantity && (
                <FormField
                  control={form.control}
                  name="maxQuantity"
                  render={({ field }) => (
                    <FormItem className="text-center">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="5"
                          min="1"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="glass-input rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex items-center justify-center space-x-3 rounded-2xl glass-card border p-4 shadow-sm">
              <div className="space-y-0.5 text-center">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('store.isActive')}</label>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {t('store.available')}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex justify-center space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
                className="rounded-2xl"
              >
                {t('store.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="rounded-2xl modern-button"
              >
                {mutation.isPending
                  ? isEditing
                    ? t('store.updating')
                    : t('store.creating')
                  : t('store.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}