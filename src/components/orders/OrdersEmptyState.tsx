import { EmptyState } from '@/components/ui/empty-state';
import { PackagePlus, ShoppingCart, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

/**
 * OrdersEmptyState - Enhanced empty state for orders list
 * Includes helpful guidance for creating orders
 * Validates: Requirements 14.1, 14.2
 */
export const OrdersEmptyState = ({ onCreateOrder }: { onCreateOrder: () => void }) => {
  const { elderlyMode } = useStore();

  const orderTips = [
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Create Order",
      description: "Add medicines you need to reorder from your pharmacy"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Track Delivery",
      description: "Monitor order status and expected delivery dates"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Link Medicines",
      description: "Connect orders to your medicine list for stock tracking"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <EmptyState
        icon={<PackagePlus className="w-8 h-8" />}
        title="No orders yet"
        description="Create your first order to track medicine deliveries and manage your pharmacy orders in one place."
        action={{
          label: "Create Your First Order",
          onClick: onCreateOrder,
          icon: <PackagePlus className="w-5 h-5" />
        }}
      />

      {/* Order Tips */}
      <div className="max-w-3xl mx-auto">
        <h3 className={cn(
          "text-center text-lg font-semibold text-white mb-6",
          elderlyMode && "text-xl"
        )}>
          What you can do with orders
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orderTips.map((tip, index) => (
            <div
              key={index}
              className={cn(
                "glass backdrop-blur-md bg-background-secondary/50 border border-white/10",
                "rounded-xl p-6 text-center transition-all duration-200",
                "hover:scale-105 hover:shadow-glow hover:border-violet-500/30"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-magenta-600/20 flex items-center justify-center mx-auto mb-3 text-magenta-400">
                {tip.icon}
              </div>
              <h4 className={cn(
                "font-semibold text-white mb-2",
                elderlyMode && "text-lg"
              )}>
                {tip.title}
              </h4>
              <p className={cn(
                "text-sm text-gray-400",
                elderlyMode && "text-base"
              )}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Help Text */}
        <div className={cn(
          "mt-8 text-center text-sm text-gray-400",
          elderlyMode && "text-base"
        )}>
          <p>
            💡 <strong className="text-white">Pro Tip:</strong> You can paste order details from emails or messages for quick entry
          </p>
        </div>
      </div>
    </div>
  );
};

OrdersEmptyState.displayName = "OrdersEmptyState";
