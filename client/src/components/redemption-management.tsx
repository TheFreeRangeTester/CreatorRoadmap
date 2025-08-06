import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Package, ChevronLeft, ChevronRight, Mail, Calendar, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { StoreRedemptionResponse } from '@shared/schema';

interface RedemptionData {
  redemptions: StoreRedemptionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function RedemptionManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const { data, isLoading } = useQuery<RedemptionData>({
    queryKey: ['/api/store/redemptions', currentPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: currentPage.toString() });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const response = await apiRequest(`/api/store/redemptions?${params}`);
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'pending' | 'completed' }) =>
      apiRequest(`/api/store/redemptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store/redemptions'] });
      toast({
        title: t('redemptions.statusUpdated'),
        description: t('redemptions.statusUpdated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('redemptions.statusUpdateError'),
        description: error.message || t('errors.generic'),
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (id: number, status: 'pending' | 'completed') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">{t('redemptions.loadingRedemptions')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const redemptions = data?.redemptions || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            {t('redemptions.title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('redemptions.description')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'completed') => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t('redemptions.pendingRedemptions')}</SelectItem>
              <SelectItem value="completed">{t('redemptions.completedRedemptions')}</SelectItem>
              <SelectItem value="all">{t('redemptions.allRedemptions')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {pagination?.total || 0} {t('redemptions.allRedemptions')}
            </span>
          </div>
        </div>
      </div>

      {redemptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">{t('redemptions.noRedemptions')}</p>
            <p className="text-muted-foreground">
              {t('redemptions.noRedemptions')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-heading leading-tight">
                <Package className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{t('redemptions.allRedemptions')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">{t('redemptions.userName')}</TableHead>
                      <TableHead className="w-[300px]">{t('redemptions.item')}</TableHead>
                      <TableHead className="w-[120px] text-center">{t('redemptions.pointsSpent')}</TableHead>
                      <TableHead className="w-[140px] text-center">{t('redemptions.date')}</TableHead>
                      <TableHead className="w-[120px] text-center">{t('redemptions.status')}</TableHead>
                      <TableHead className="w-[140px] text-center">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{redemption.userUsername}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {redemption.userEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div>
                            <div className="font-medium text-sm leading-tight mb-1">{redemption.storeItemTitle}</div>
                            <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {redemption.storeItemDescription}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {redemption.pointsSpent} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(redemption.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={redemption.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {redemption.status === 'completed'
                              ? t('redemptions.completed')
                              : t('redemptions.pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={redemption.status}
                            onValueChange={(value: 'pending' | 'completed') =>
                              handleStatusChange(redemption.id, value)
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending" className="text-xs">
                                {t('redemptions.pending')}
                              </SelectItem>
                              <SelectItem value="completed" className="text-xs">
                                {t('redemptions.completed')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('redemptions.pagination.page', {
                  current: pagination.page,
                  total: pagination.totalPages,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('redemptions.pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  {t('redemptions.pagination.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}