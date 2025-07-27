import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPointsResponse, PointTransactionResponse } from '@shared/schema';

export function PointsDisplay() {
  const { t } = useTranslation();

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

  const { data: transactionsData } = useQuery<PointTransactionResponse[]>({
    queryKey: ['/api/user/point-transactions'],
    queryFn: async () => {
      const res = await fetch('/api/user/point-transactions?limit=10', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    },
  });

  if (pointsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            {t('points.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-24 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          {t('points.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pointsData?.totalPoints || 0}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('points.currentPoints', { points: pointsData?.totalPoints || 0 })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {pointsData?.pointsEarned || 0}
            </div>
            <div className="text-muted-foreground">{t('points.earnedBy')}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {pointsData?.pointsSpent || 0}
            </div>
            <div className="text-muted-foreground">{t('points.spentOn')}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t('points.howToEarn.title')}</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {t('points.howToEarn.vote')}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {t('points.howToEarn.approvedIdea')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t('points.howToSpend.title')}</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-3 h-3 text-red-500" />
              {t('points.howToSpend.suggestion')}
            </div>
          </div>
        </div>

        {transactionsData && transactionsData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('points.pointsHistory')}</h4>
            <div className="space-y-1">
              {transactionsData.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {transaction.type === 'earned' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span>{t(`points.reasons.${transaction.reason}`)}</span>
                  </div>
                  <Badge
                    variant={transaction.type === 'earned' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}