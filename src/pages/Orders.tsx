import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { Order, OrderItem, OrderDelivery, OrderVendor } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { OrdersEmptyState } from '@/components/orders/OrdersEmptyState';
import { cn } from '@/lib/utils';
import { PackagePlus, Trash2, Save, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '@/services/api';

function parseOrderText(text: string): OrderItem[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: OrderItem[] = [];
  for (const line of lines) {
    // Matches: Name (optional strength) Quantity (optional unit)
    // e.g. "Metformin 500mg 60 tabs", "Aspirin 100"
    const m = line.match(/^(.+?)(?:\s+(\d+(?:mg|mcg|g|ml)))?\s+(\d+)(?:\s*(tabs|caps|pills|bottles|strips|box|pack))?$/i);
    if (m) {
      items.push({
        id: generateId(),
        name: m[1].trim(),
        strength: m[2],
        quantity: parseInt(m[3]),
        unit: m[4] || undefined
      });
    } else {
      // Fallback for simpler format: Name Quantity
      const simple = line.match(/^(.+?)\s+(\d+)$/);
      if (simple) {
        items.push({
          id: generateId(),
          name: simple[1].trim(),
          quantity: parseInt(simple[2]),
          unit: undefined
        });
      }
    }
  }
  return items;
}

export const Orders = () => {
  const { orders, addOrder, updateOrder, deleteOrder, medicines, elderlyMode, user } = useStore();
  const [editing, setEditing] = useState<Order | null>(null);
  const [vendor, setVendor] = useState<OrderVendor>({ name: '' });
  const [delivery, setDelivery] = useState<OrderDelivery>({ status: 'pending' });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [pastedText, setPastedText] = useState('');

  const resetForm = () => {
    setEditing(null);
    setVendor({ name: '' });
    setDelivery({ status: 'pending' });
    setItems([]);
    setPastedText('');
  };

  const addItem = () => {
    setItems([...items, { id: generateId(), name: '', quantity: 1 }]);
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleParseText = () => {
    const parsed = parseOrderText(pastedText);
    setItems(parsed);
    toast.success(`Parsed ${parsed.length} item(s)`);
  };

  const handleSave = () => {
    if (!vendor.name || items.length === 0) {
      toast.error('Vendor and at least one item are required');
      return;
    }
    const order: Order = {
      id: editing?.id || generateId(),
      userId: user?.id || '',
      vendor,
      items: items.map(i => {
        const linked = medicines.find(m => m.name.toLowerCase() === i.name.toLowerCase());
        return { ...i, medicineId: linked?.id };
      }),
      createdAt: editing?.createdAt || new Date().toISOString(),
      notes: undefined,
      delivery
    };
    if (editing) {
      updateOrder(order.id, order);
      toast.success('Order updated');
    } else {
      addOrder(order);
      toast.success('Order added');
    }
    resetForm();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>Orders</h1>
          {!editing && (
            <Button className={cn('gradient-primary', elderlyMode && 'h-12 text-lg')} onClick={() => setEditing({ id: generateId(), userId: user?.id || '', vendor: { name: '' }, items: [], createdAt: new Date().toISOString(), delivery: { status: 'pending' } })}>
              <PackagePlus className="mr-2" size={20} />
              New Order
            </Button>
          )}
        </div>

        {editing ? (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className={cn(elderlyMode && 'text-xl')}>{editing?.id ? 'Edit Order' : 'New Order'}</CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4', elderlyMode && 'p-6')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input value={vendor.name} onChange={(e) => setVendor({ ...vendor, name: e.target.value })} className={cn(elderlyMode && 'h-12 text-lg')} />
                </div>
                <div className="space-y-2">
                  <Label>Vendor Email</Label>
                  <Input value={vendor.contactEmail || ''} onChange={(e) => setVendor({ ...vendor, contactEmail: e.target.value })} className={cn(elderlyMode && 'h-12 text-lg')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Status</Label>
                  <Select value={delivery.status} onValueChange={(v) => setDelivery({ ...delivery, status: v as OrderDelivery['status'] })}>
                    <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Date</Label>
                  <Input type="date" value={delivery.expectedDate || ''} onChange={(e) => setDelivery({ ...delivery, expectedDate: e.target.value })} className={cn(elderlyMode && 'h-12 text-lg')} />
                </div>
                <div className="space-y-2">
                  <Label>Delivered Date</Label>
                  <Input type="date" value={delivery.deliveredDate || ''} onChange={(e) => setDelivery({ ...delivery, deliveredDate: e.target.value })} className={cn(elderlyMode && 'h-12 text-lg')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Paste Order Text</Label>
                <Input value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder="e.g., Metformin 60 tabs" className={cn(elderlyMode && 'h-12 text-lg')} />
                <Button variant="outline" onClick={handleParseText} className={cn(elderlyMode && 'h-12 text-lg')}>Parse</Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Items</Label>
                  <Button variant="outline" onClick={addItem} className={cn('gap-1', elderlyMode && 'h-12 text-lg')}>
                    <Plus size={16} /> Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <Input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className={cn(elderlyMode && 'h-12 text-lg')} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))} className={cn(elderlyMode && 'h-12 text-lg')} />
                      </div>
                      <div className="col-span-3">
                        <Select value={item.medicineId || ''} onValueChange={(v) => updateItem(item.id, 'medicineId', v)}>
                          <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}><SelectValue placeholder="Link medicine" /></SelectTrigger>
                          <SelectContent>
                            {medicines.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input value={item.unit || ''} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className={cn(elderlyMode && 'h-12 text-lg')} />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={resetForm} className={cn(elderlyMode && 'h-12 text-lg')}>Cancel</Button>
                <Button onClick={handleSave} className={cn('gradient-primary', elderlyMode && 'h-12 text-lg')}>
                  <Save className="mr-2" /> Save Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <OrdersEmptyState onCreateOrder={() => setEditing({ id: generateId(), userId: user?.id || '', vendor: { name: '' }, items: [], createdAt: new Date().toISOString(), delivery: { status: 'pending' } })} />
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className={cn('flex items-center justify-between', elderlyMode && 'text-xl')}>
                      <span>{order.vendor.name}</span>
                      <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn('p-4 space-y-3', elderlyMode && 'p-6')}>
                    <div className="space-y-1">
                      {order.items.map((i) => (
                        <div key={i.id} className="flex justify-between">
                          <span>{i.name} {i.strength || ''}</span>
                          <span className="text-muted-foreground">{i.quantity} {i.unit || ''}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setEditing(order); setVendor(order.vendor); setDelivery(order.delivery); setItems(order.items); }} className={cn(elderlyMode && 'h-12 text-lg')}>
                        <Edit className="mr-2" /> Edit
                      </Button>
                      <Button variant="destructive" onClick={() => { deleteOrder(order.id); toast.success('Order deleted'); }} className={cn(elderlyMode && 'h-12 text-lg')}>
                        <Trash2 className="mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
