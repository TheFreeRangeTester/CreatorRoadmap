import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from './use-auth';

const ideaCountSchema = z.object({
  count: z.number().int().min(0),
  limit: z.number().int().min(0),
  hasReachedLimit: z.boolean()
});

export type IdeaQuota = z.infer<typeof ideaCountSchema>;

export const useIdeaQuota = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ideaQuota', user?.id],
    queryFn: async (): Promise<IdeaQuota> => {
      if (!user) {
        return { count: 0, limit: 10, hasReachedLimit: false };
      }
      
      const response = await fetch(`/api/user/idea-quota`);
      if (!response.ok) {
        throw new Error('Failed to fetch idea quota');
      }
      const data = await response.json();
      return ideaCountSchema.parse(data);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};