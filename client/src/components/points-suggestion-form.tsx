import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Coins, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPointsResponse } from '@shared/schema';

const SUGGESTION_COST = 3;

const suggestionFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(280, 'Description must be 280 characters or less'),
  creatorId: z.number(),
});

type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

interface PointsSuggestionFormProps {
  creatorId: number;
  creatorUsername: string;
  onSuccess?: () => void;
}

export function PointsSuggestionForm({ creatorId, creatorUsername, onSuccess }: PointsSuggestionFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: pointsData, isLoading: pointsLoading } = useQuery<UserPointsResponse>({
    queryKey: ['/api/user/points'],
    queryFn: async () => {
      const res = await fetch('/api/user/points', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch points');
      }
      return res.json();
    },
  });

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      creatorId,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SuggestionFormValues) => {
      const response = await fetch('/api/suggestions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit suggestion');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('suggestionForm.success'),
          description: t('suggestionForm.success'),
        });
        
        // Invalidate all points-related queries for immediate UI updates
        queryClient.invalidateQueries({ queryKey: ['/api/user/points'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/point-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/audience-stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/pending-ideas'] });
        
        // Reset form and hide it
        form.reset();
        setShowForm(false);
        
        // Call onSuccess callback if provided
        onSuccess?.();
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('errors.generic'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SuggestionFormValues) => {
    if (!pointsData || pointsData.totalPoints < SUGGESTION_COST) {
      toast({
        title: t('errors.notEnoughPoints'),
        description: t('points.pointsRequired', { points: SUGGESTION_COST }),
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(data);
  };

  const hasEnoughPoints = pointsData && pointsData.totalPoints >= SUGGESTION_COST;

  if (!showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{t('suggestIdea.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('suggestIdea.description')}</p>
          </div>
          {!pointsLoading && (
            <Badge variant={hasEnoughPoints ? 'default' : 'destructive'} className="flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {pointsData?.totalPoints || 0}
            </Badge>
          )}
        </div>
        
        {!hasEnoughPoints && !pointsLoading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('points.notEnoughPoints')} {t('suggestionForm.cost', { cost: SUGGESTION_COST })}
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={() => setShowForm(true)}
          disabled={!hasEnoughPoints || pointsLoading}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {t('suggestIdea.button')} ({SUGGESTION_COST} {t('points.title').toLowerCase()})
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('suggestionForm.title')}</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {t('suggestionForm.cost', { cost: SUGGESTION_COST })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suggestIdea.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('suggestIdea.titlePlaceholder')}
                      {...field}
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
                  <FormLabel>{t('suggestIdea.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('suggestIdea.descriptionPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  form.reset();
                }}
                className="flex-1"
              >
                {t('suggestIdea.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !hasEnoughPoints}
                className="flex-1"
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('suggestionForm.sending')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('suggestionForm.submit')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}