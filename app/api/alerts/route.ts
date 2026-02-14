import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramAlert, AlertSeverity, TelegramAlerts } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    let success = false;

    switch (type) {
      case 'maya-down':
        success = await TelegramAlerts.mayaDown();
        break;

      case 'heartbeat-failed':
        success = await TelegramAlerts.heartbeatFailed(data?.error || 'Unknown error');
        break;

      case 'first-revenue':
        success = await TelegramAlerts.firstRevenue(data?.amount, data?.product);
        break;

      case 'mrr-milestone':
        success = await TelegramAlerts.mrrMilestone(data?.mrr, data?.milestone);
        break;

      case 'product-launched':
        success = await TelegramAlerts.productLaunched(data?.product);
        break;

      case 'launch-blocker':
        success = await TelegramAlerts.launchBlocker(data?.blocker, data?.impact);
        break;

      case 'critical-error':
        success = await TelegramAlerts.criticalError(data?.system, data?.error);
        break;

      case 'system-restored':
        success = await TelegramAlerts.systemRestored(data?.system);
        break;

      case 'blocker-cleared':
        success = await TelegramAlerts.blockerCleared(data?.title);
        break;

      case 'weekly-report':
        success = await TelegramAlerts.weeklyReport(data);
        break;

      case 'custom':
        // For custom alerts
        success = await sendTelegramAlert({
          severity: (data?.severity as AlertSeverity) || AlertSeverity.INFO,
          title: data?.title || 'Alert',
          message: data?.message || '',
          data: data?.extra,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown alert type' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ success: true, message: 'Alert sent' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send alert' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Alert API error:', error);
    return NextResponse.json(
      { error: 'Failed to process alert', details: String(error) },
      { status: 500 }
    );
  }
}
