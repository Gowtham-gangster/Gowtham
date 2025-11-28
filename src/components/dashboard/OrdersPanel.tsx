import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { ExternalLink, ShoppingCart } from 'lucide-react';

export const OrdersPanel: React.FC<{ elderlyMode?: boolean }> = ({ elderlyMode }) => {
  const { medicines } = useStore();
  const [query, setQuery] = React.useState('');

  const searchOnWeb = (site: 'amazon' | 'google' | 'pharmacy') => {
    const q = encodeURIComponent(query || 'pharmacy');
    let url = '';
    if (site === 'amazon') url = `https://www.amazon.com/s?k=${q}`;
    if (site === 'google') url = `https://www.google.com/search?q=${q}+buy+medicine`;
    if (site === 'pharmacy') url = `https://www.walmart.com/search?q=${q}`;
    window.open(url, '_blank', 'noopener');
  };

  const suggestFromMedicines = () => {
    if (medicines.length > 0) setQuery(medicines[0].name);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2')}> 
          <ShoppingCart />
          Order Medicines
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-3', elderlyMode && 'p-6')}>
        <p className="text-sm text-muted-foreground">Search common stores for medicines and create orders from results.</p>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine name" />
          <Button variant="outline" onClick={suggestFromMedicines}>Suggest</Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => searchOnWeb('google')}>Search Google</Button>
          <Button onClick={() => searchOnWeb('amazon')}>Search Amazon</Button>
          <Button onClick={() => searchOnWeb('pharmacy')}>Search Pharmacy</Button>
        </div>

        <p className="text-xs text-muted-foreground">Tip: After finding a vendor page, copy the product details into the Orders page to create an order linked to your medicines.</p>
        <div className="pt-2">
          <Button variant="ghost" size="sm" onClick={() => window.open('https://www.google.com', '_blank')}>Open Store <ExternalLink className="ml-2" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersPanel;
