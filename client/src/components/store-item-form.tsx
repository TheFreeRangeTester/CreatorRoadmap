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
  const isEditing = !!initialData;
  
  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(isEditing ? updateFormSchema : createFormSchema),
    defaultValues: {
      title: '',
      description: '',
      pointsCost: 10,
      maxQuantity: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        pointsCost: initialData.pointsCost,
        maxQuantity: initialData.maxQuantity ?? undefined,
        isActive: initialData.isActive,
      });
      setHasMaxQuantity(initialData.maxQuantity !== null);
    } else {
      form.reset({
        title: '',
        description: '',
        pointsCost: 10,
        maxQuantity: undefined,
        isActive: true,
      });
      setHasMaxQuantity(false);
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createFormSchema>) => {
      const payload = {
        ...data,
        maxQuantity: hasMaxQuantity ? data.maxQuantity : null,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('store.editItem') : t('store.createItem')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('store.itemTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('store.itemTitle')}
                      maxLength={100}
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
                <FormItem>
                  <FormLabel>{t('store.itemDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('store.itemDescription')}
                      rows={3}
                      maxLength={500}
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
                <FormItem>
                  <FormLabel>{t('store.pointsCost')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="1000"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={hasMaxQuantity}
                  onCheckedChange={setHasMaxQuantity}
                />
                <label className="text-sm font-medium">
                  {t('store.maxQuantity')}
                </label>
              </div>

              {hasMaxQuantity && (
                <FormField
                  control={form.control}
                  name="maxQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('store.maxQuantity')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="1000"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('store.unlimited')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t('store.isActive')}</FormLabel>
                    <FormDescription>
                      {t('store.available')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                {t('store.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
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