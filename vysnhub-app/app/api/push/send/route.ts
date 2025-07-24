import { NextRequest, NextResponse } from 'next/server';

// Für Production: npm install web-push
// import webpush from 'web-push';

// Mock implementation für Development
// In Production: echte web-push library verwenden
const mockWebPush = {
  sendNotification: async (subscription: any, payload: string) => {
    console.log('Mock: Sending push notification');
    console.log('Subscription endpoint:', subscription.endpoint);
    console.log('Payload:', payload);
    return { success: true };
  }
};

// VAPID Configuration (in Production: echte VAPID Keys verwenden)
// const VAPID_DETAILS = {
//   publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'mock-public-key',
//   privateKey: process.env.VAPID_PRIVATE_KEY || 'mock-private-key',
//   subject: process.env.VAPID_SUBJECT || 'mailto:admin@vysn.com'
// };

// Shared storage (in production, use database)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { type, title, body, url, targetEndpoint, image, actions } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      image: image || null,
      data: {
        url: url || '/',
        type: type || 'general',
        timestamp: Date.now()
      },
      actions: actions || [
        { action: 'open', title: 'Öffnen' },
        { action: 'close', title: 'Schließen' }
      ],
      requireInteraction: false,
      tag: type || 'default'
    };

    const payload = JSON.stringify(notificationPayload);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Determine which subscriptions to send to
    const targetSubscriptions = targetEndpoint 
      ? [subscriptions.get(targetEndpoint)].filter(Boolean)
      : Array.from(subscriptions.values());

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found' },
        { status: 404 }
      );
    }

    // Send notifications
    for (const subData of targetSubscriptions) {
      try {
        const subscription = subData.subscription;
        
        // In Production: Use real web-push
        // await webpush.sendNotification(subscription, payload);
        
        // Mock implementation
        await mockWebPush.sendNotification(subscription, payload);
        
        results.push({
          endpoint: subscription.endpoint,
          success: true
        });
        successCount++;

      } catch (error: any) {
        console.error('Failed to send notification:', error);
        
        // If subscription is invalid, remove it
        if (error.statusCode === 410) {
          subscriptions.delete(subData.subscription.endpoint);
        }
        
        results.push({
          endpoint: subData.subscription.endpoint,
          success: false,
          error: error.message
        });
        errorCount++;
      }
    }

    console.log(`Push notifications sent: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      totalSubscriptions: subscriptions.size,
      results: results.slice(0, 10) // Limit response size
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// GET route for notification types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      'order_update',
      'delivery_notification', 
      'stock_alert',
      'new_product',
      'system_maintenance',
      'test'
    ],
    totalActiveSubscriptions: subscriptions.size
  });
} 