import { NextRequest, NextResponse } from 'next/server';

// In-Memory Storage (später durch Datenbank ersetzen)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { subscription, userAgent, timestamp } = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store subscription (mit endpoint als unique key)
    subscriptions.set(subscription.endpoint, {
      subscription,
      userAgent,
      timestamp,
      createdAt: new Date().toISOString()
    });

    console.log(`New push subscription registered. Total: ${subscriptions.size}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription registered',
      totalSubscriptions: subscriptions.size
    });

  } catch (error) {
    console.error('Error storing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

// GET route to check subscription status
export async function GET() {
  return NextResponse.json({
    totalSubscriptions: subscriptions.size,
    isActive: subscriptions.size > 0
  });
} 