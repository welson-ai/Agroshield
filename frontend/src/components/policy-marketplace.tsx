'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePolicyMarketplace, type Listing, type Offer } from '@/hooks/usePolicyMarketplace'
import { formatEther } from 'viem'
import { Clock, DollarSign, TrendingUp, User } from 'lucide-react'

export function PolicyMarketplace() {
  const { 
    activeListings, 
    sellerListings, 
    listPolicy, 
    delistPolicy, 
    makeOffer, 
    acceptOffer, 
    buyPolicy,
    getListing,
    getOffers,
    isLoadingRead 
  } = usePolicyMarketplace()

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [listingOffers, setListingOffers] = useState<Offer[]>([])
  const [showCreateListing, setShowCreateListing] = useState(false)

  const [listingForm, setListingForm] = useState({
    policyId: '',
    price: '',
    durationDays: '7'
  })

  const [offerForm, setOfferForm] = useState({
    amount: ''
  })

  useEffect(() => {
    if (selectedListing) {
      loadOffers(selectedListing.policyId.toString())
    }
  }, [selectedListing])

  const loadOffers = async (listingId: string) => {
    const offers = await getOffers(Number(listingId))
    if (offers) {
      setListingOffers(offers)
    }
  }

  const handleCreateListing = async () => {
    try {
      await listPolicy(
        Number(listingForm.policyId),
        listingForm.price,
        Number(listingForm.durationDays)
      )
      setShowCreateListing(false)
      setListingForm({ policyId: '', price: '', durationDays: '7' })
    } catch (error) {
      console.error('Failed to create listing:', error)
    }
  }

  const handleMakeOffer = async (listingId: number) => {
    try {
      await makeOffer(listingId, offerForm.amount)
      setOfferForm({ amount: '' })
      loadOffers(listingId.toString())
    } catch (error) {
      console.error('Failed to make offer:', error)
    }
  }

  const handleAcceptOffer = async (listingId: number, offerId: number) => {
    try {
      await acceptOffer(listingId, offerId)
      loadOffers(listingId.toString())
    } catch (error) {
      console.error('Failed to accept offer:', error)
    }
  }

  const handleBuyPolicy = async (listingId: number) => {
    try {
      await buyPolicy(listingId)
    } catch (error) {
      console.error('Failed to buy policy:', error)
    }
  }

  const formatPrice = (price: bigint) => {
    return `${parseFloat(formatEther(price)).toFixed(2)} cUSD`
  }

  const formatTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const isExpired = (expiresAt: bigint) => {
    return Number(expiresAt) * 1000 < Date.now()
  }

  if (isLoadingRead) {
    return <div className="flex justify-center p-8">Loading marketplace...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Policy Marketplace</h1>
        <Button onClick={() => setShowCreateListing(true)}>
          List Policy
        </Button>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="create">Create Listing</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings?.map((listingId: bigint) => (
              <Card key={listingId.toString()} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Policy #{listingId.toString()}</CardTitle>
                    <Badge variant={isExpired(selectedListing?.expiresAt || 0n) ? "destructive" : "default"}>
                      {isExpired(selectedListing?.expiresAt || 0n) ? "Expired" : "Active"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Listed by {selectedListing?.seller.slice(0, 6)}...{selectedListing?.seller.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{formatPrice(selectedListing?.price || 0n)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expires: {formatTime(selectedListing?.expiresAt || 0n)}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleBuyPolicy(Number(listingId))}
                        className="flex-1"
                      >
                        Buy Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedListing(selectedListing)}
                      >
                        View Offers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerListings?.map((listingId: bigint) => (
              <Card key={listingId.toString()}>
                <CardHeader>
                  <CardTitle className="text-lg">My Listing #{listingId.toString()}</CardTitle>
                  <CardDescription>
                    Price: {formatPrice(selectedListing?.price || 0n)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      Status: <Badge variant={isExpired(selectedListing?.expiresAt || 0n) ? "destructive" : "default"}>
                        {isExpired(selectedListing?.expiresAt || 0n) ? "Expired" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Offers
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => delistPolicy(Number(listingId))}
                      >
                        Delist
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>List Your Policy</CardTitle>
              <CardDescription>
                List your insurance policy on the marketplace for other users to purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyId">Policy ID</Label>
                  <Input
                    id="policyId"
                    type="number"
                    placeholder="Enter policy ID"
                    value={listingForm.policyId}
                    onChange={(e) => setListingForm(prev => ({ ...prev, policyId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (cUSD)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={listingForm.price}
                    onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="7"
                  value={listingForm.durationDays}
                  onChange={(e) => setListingForm(prev => ({ ...prev, durationDays: e.target.value }))}
                />
              </div>
              <Button onClick={handleCreateListing} className="w-full">
                Create Listing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Offers Modal */}
      {selectedListing && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Offers for Policy #{selectedListing.policyId.toString()}</CardTitle>
            <CardDescription>
              Current price: {formatPrice(selectedListing.price)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offerAmount">Your Offer (cUSD)</Label>
              <div className="flex gap-2">
                <Input
                  id="offerAmount"
                  type="number"
                  placeholder="Enter offer amount"
                  value={offerForm.amount}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="flex-1"
                />
                <Button onClick={() => handleMakeOffer(Number(selectedListing.policyId))}>
                  Make Offer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Current Offers</h4>
              {listingOffers.length === 0 ? (
                <p className="text-muted-foreground">No offers yet</p>
              ) : (
                <div className="space-y-2">
                  {listingOffers.map((offer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}</span>
                        <span className="font-semibold">{formatPrice(offer.amount)}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptOffer(Number(selectedListing.policyId), index)}
                      >
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
