'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEventListeners } from '@/hooks/useEventListeners'
import { formatEther } from 'viem'
import { Bell, X, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Shield, Coins } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: React.ReactNode
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  const events = useEventListeners()

  useEffect(() => {
    // Process events and create notifications
    const newNotifications: Notification[] = []

    // Pool events
    if (events.liquidityProvided) {
      newNotifications.push({
        id: `liquidity-${Date.now()}`,
        type: 'success',
        title: 'Liquidity Provided',
        message: `Someone provided ${formatEther(events.liquidityProvided.args.amount)} cUSD to the pool`,
        timestamp: new Date(),
        read: false,
        icon: <DollarSign className="h-4 w-4" />
      })
    }

    if (events.liquidityWithdrawn) {
      newNotifications.push({
        id: `withdrawal-${Date.now()}`,
        type: 'info',
        title: 'Liquidity Withdrawn',
        message: `Someone withdrew ${formatEther(events.liquidityWithdrawn.args.amount)} cUSD from the pool`,
        timestamp: new Date(),
        read: false,
        icon: <DollarSign className="h-4 w-4" />
      })
    }

    // Policy events
    if (events.policyCreated) {
      newNotifications.push({
        id: `policy-${Date.now()}`,
        type: 'success',
        title: 'New Policy Created',
        message: `Policy #${events.policyCreated.args.policyId} created for ${formatEther(events.policyCreated.args.coverage)} cUSD coverage`,
        timestamp: new Date(),
        read: false,
        icon: <Shield className="h-4 w-4" />
      })
    }

    if (events.premiumPaid) {
      newNotifications.push({
        id: `premium-${Date.now()}`,
        type: 'success',
        title: 'Premium Paid',
        message: `Premium of ${formatEther(events.premiumPaid.args.amount)} cUSD paid for policy #${events.premiumPaid.args.policyId}`,
        timestamp: new Date(),
        read: false,
        icon: <DollarSign className="h-4 w-4" />
      })
    }

    // Oracle events
    if (events.weatherDataSubmitted) {
      newNotifications.push({
        id: `weather-${Date.now()}`,
        type: 'info',
        title: 'Weather Data Updated',
        message: `New weather data submitted: ${events.weatherDataSubmitted.args.rainfall}mm rainfall`,
        timestamp: new Date(),
        read: false,
        icon: <AlertTriangle className="h-4 w-4" />
      })
    }

    if (events.payoutTriggered) {
      newNotifications.push({
        id: `payout-${Date.now()}`,
        type: 'success',
        title: 'Payout Triggered! 🎉',
        message: `Automatic payout of ${formatEther(events.payoutTriggered.args.amount)} cUSD triggered for policy #${events.payoutTriggered.args.policyId}`,
        timestamp: new Date(),
        read: false,
        icon: <CheckCircle className="h-4 w-4" />
      })
    }

    // Marketplace events
    if (events.policyListed) {
      newNotifications.push({
        id: `listing-${Date.now()}`,
        type: 'info',
        title: 'Policy Listed',
        message: `Policy #${events.policyListed.args.policyId} listed for ${formatEther(events.policyListed.args.price)} cUSD`,
        timestamp: new Date(),
        read: false,
        icon: <TrendingUp className="h-4 w-4" />
      })
    }

    if (events.offerMade) {
      newNotifications.push({
        id: `offer-${Date.now()}`,
        type: 'info',
        title: 'New Offer Received',
        message: `Offer of ${formatEther(events.offerMade.args.amount)} cUSD made on your policy listing`,
        timestamp: new Date(),
        read: false,
        icon: <TrendingUp className="h-4 w-4" />
      })
    }

    // Staking events
    if (events.stakePositionCreated) {
      newNotifications.push({
        id: `stake-${Date.now()}`,
        type: 'success',
        title: 'New Stake Position',
        message: `Stake position created with ${formatEther(events.stakePositionCreated.args.amount)} cUSD`,
        timestamp: new Date(),
        read: false,
        icon: <Coins className="h-4 w-4" />
      })
    }

    if (events.rewardsClaimed) {
      newNotifications.push({
        id: `rewards-${Date.now()}`,
        type: 'success',
        title: 'Rewards Claimed! 🎉',
        message: `${formatEther(events.rewardsClaimed.args.rewardAmount)} cUSD rewards claimed`,
        timestamp: new Date(),
        read: false,
        icon: <Coins className="h-4 w-4" />
      })
    }

    // Add new notifications to the list
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)) // Keep last 50 notifications
    }
  }, [events])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-hidden shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Real-time Notifications</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button size="sm" variant="outline" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={clearNotifications}>
                  Clear
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNotifications(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} bg-opacity-10`}>
                          <div className={`${getNotificationColor(notification.type)} text-white`}>
                            {notification.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</p>
                        </div>
                      </div>
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
