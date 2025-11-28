import { Layout } from '@/components/layout/Layout';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vendors, searchMedicines, getMedicinesByVendor } from '@/data/vendors';
import { MedicineProduct, VendorType } from '@/types/vendor';
import { Search, Package, Clock, Star, Truck, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrdersStore = () => {
  const { elderlyMode } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorType | 'all'>('all');

  // Filter medicines based on search and vendor
  const filteredMedicines = useMemo(() => {
    let medicines = searchQuery.trim() 
      ? searchMedicines(searchQuery)
      : vendors.flatMap(v => getMedicinesByVendor(v.id));
    
    if (selectedVendor !== 'all') {
      medicines = medicines.filter(m => m.vendor === selectedVendor);
    }
    
    return medicines;
  }, [searchQuery, selectedVendor]);

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
            <Package className="inline mr-2" size={elderlyMode ? 32 : 28} />
            Medicine Store
          </h1>
          <p className="text-muted-foreground mt-1">Order medicines from trusted pharmacies</p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search medicines by name, generic name, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('pl-10', elderlyMode && 'h-12 text-lg')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendors Tabs */}
        <Tabs value={selectedVendor} onValueChange={(v) => setSelectedVendor(v as VendorType | 'all')}>
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Vendors
            </TabsTrigger>
            {vendors.map(vendor => (
              <TabsTrigger
                key={vendor.id}
                value={vendor.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="mr-1">{vendor.logo}</span>
                {vendor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedVendor} className="mt-6">
            {/* Vendor Info Cards */}
            {selectedVendor !== 'all' && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  {vendors.filter(v => v.id === selectedVendor).map(vendor => (
                    <div key={vendor.id} className="flex items-start gap-4">
                      <div className="text-4xl">{vendor.logo}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-primary" />
                            <span>{vendor.deliveryTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500" />
                            <span>{vendor.rating} Rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck size={16} className="text-primary" />
                            <span>₹{vendor.deliveryFee} Delivery</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No medicines found. Try a different search or vendor.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredMedicines.map(medicine => {
                  const vendor = vendors.find(v => v.id === medicine.vendor);
                  
                  return (
                    <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className={cn('text-base', elderlyMode && 'text-lg')}>
                              {medicine.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
                          </div>
                          <span className="text-2xl">{vendor?.logo}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Manufacturer:</span>
                            <span className="font-medium">{medicine.manufacturer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Strength:</span>
                            <span className="font-medium">{medicine.strength}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pack Size:</span>
                            <span className="font-medium">{medicine.packSize}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {medicine.requiresPrescription && (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle size={12} className="mr-1" />
                              Rx Required
                            </Badge>
                          )}
                          {medicine.discount > 0 && (
                            <Badge className="bg-green-500 text-xs">
                              {medicine.discount}% OFF
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold">₹{medicine.price}</span>
                              {medicine.discount > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{medicine.mrp}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{vendor?.name}</p>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => window.open(vendor?.website, '_blank')}
                            disabled={!medicine.inStock}
                            className="gradient-primary"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OrdersStore;
