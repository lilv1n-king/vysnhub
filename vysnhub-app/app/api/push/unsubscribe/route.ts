import { NextRequest, NextResponse } from 'next/server';

// Import the same storage (in production, use shared database)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Remove subscription
    const deleted = subscriptions.delete(endpoint);

    if (deleted) {
      console.log(`Push subscription removed. Remaining: ${subscriptions.size}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Push subscription removed',
        totalSubscriptions: subscriptions.size
      });
    } else {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
} 