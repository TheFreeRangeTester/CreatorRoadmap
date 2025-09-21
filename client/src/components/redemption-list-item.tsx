import { motion } from "framer-motion";
import { User, Calendar, Package, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';
import type { StoreRedemptionResponse } from '@shared/schema';

interface RedemptionListItemProps {
  redemption: StoreRedemptionResponse;
  position: number;
  onStatusChange: (id: number, status: 'pending' | 'completed') => void;
  isUpdating: boolean;
}

export default function RedemptionListItem({
  redemption,
  position,
  onStatusChange,
  isUpdating,
}: RedemptionListItemProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: position * 0.05,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:shadow-lg transition-all duration-300 hover:border-gray-300/60 dark:hover:border-gray-600/60"
    >
      <div className="flex items-start gap-4">
        {/* Position Number */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="text-xl font-bold text-gray-500 dark:text-gray-400 min-w-[2rem] text-center">
            #{position}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left Side - User and Item Info */}
            <div className="flex-1 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{redemption.userUsername}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{redemption.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Item Info */}
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                    {redemption.storeItemTitle}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {redemption.storeItemDescription}
                  </div>
                </div>
              </div>

              {/* Date and Points */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(redemption.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {redemption.pointsSpent} pts
                </Badge>
              </div>
            </div>

            {/* Right Side - Status and Actions */}
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              {/* Status Badge */}
              <Badge
                variant={redemption.status === 'completed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {redemption.status === 'completed'
                  ? t('redemptions.completed')
                  : t('redemptions.pending')}
              </Badge>

              {/* Status Selector */}
              <Select
                value={redemption.status}
                onValueChange={(value: 'pending' | 'completed') =>
                  onStatusChange(redemption.id, value)
                }
                disabled={isUpdating}
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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}