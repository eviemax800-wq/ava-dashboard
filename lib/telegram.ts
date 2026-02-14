/**
 * Telegram notification utility
 * Sends alerts to Ashan's Telegram for critical events
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export enum AlertSeverity {
  INFO = 'ℹ️',
  SUCCESS = '✅',
  WARNING = '⚠️',
  CRITICAL = '🚨',
  REVENUE = '💰',
  LAUNCH = '🚀',
}

interface TelegramAlert {
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: any;
}

export async function sendTelegramAlert({
  severity,
  title,
  message,
  data,
}: TelegramAlert): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return false;
  }

  try {
    const formattedMessage = formatTelegramMessage(severity, title, message, data);

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: formattedMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
}

function formatTelegramMessage(
  severity: AlertSeverity,
  title: string,
  message: string,
  data?: any
): string {
  let formatted = `${severity} *${title}*\n\n${message}`;

  if (data) {
    formatted += '\n\n```json\n' + JSON.stringify(data, null, 2) + '\n```';
  }

  formatted += `\n\n_${new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Melbourne',
    dateStyle: 'medium',
    timeStyle: 'short',
  })}_`;

  return formatted;
}

// Predefined alert templates
export const TelegramAlerts = {
  // Critical system failures
  mayaDown: () =>
    sendTelegramAlert({
      severity: AlertSeverity.CRITICAL,
      title: 'Maya Automation Down',
      message:
        'Instagram DM automation has stopped. 2FA required or session expired.\n\n*Action needed:* Manual login required.',
    }),

  heartbeatFailed: (error: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.CRITICAL,
      title: 'Heartbeat Failed',
      message: `Autonomous heartbeat encountered a critical error.\n\n\`${error}\``,
    }),

  // Revenue milestones
  firstRevenue: (amount: number, product: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.REVENUE,
      title: 'First Revenue! 🎉',
      message: `You just made your first $${amount} from ${product}!`,
    }),

  mrrMilestone: (mrr: number, milestone: number) =>
    sendTelegramAlert({
      severity: AlertSeverity.REVENUE,
      title: `$${milestone} MRR Reached!`,
      message: `Current MRR: $${mrr}\n\nCongratulations on hitting this milestone!`,
    }),

  // Launch alerts
  productLaunched: (product: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.LAUNCH,
      title: 'Product Launched',
      message: `${product} is now LIVE! 🎉`,
    }),

  launchBlocker: (blocker: string, impact: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.WARNING,
      title: 'Launch Blocker Identified',
      message: `*Blocker:* ${blocker}\n*Impact:* ${impact}`,
    }),

  // System health
  criticalError: (system: string, error: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.CRITICAL,
      title: `${system} Critical Error`,
      message: `\`${error}\`\n\n*Action needed:* Immediate attention required.`,
    }),

  systemRestored: (system: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.SUCCESS,
      title: `${system} Restored`,
      message: 'System is back online and operating normally.',
    }),

  // Task completion
  blockerCleared: (title: string) =>
    sendTelegramAlert({
      severity: AlertSeverity.SUCCESS,
      title: 'Blocker Cleared',
      message: `✅ ${title} has been resolved!`,
    }),

  // Weekly summaries
  weeklyReport: (stats: {
    mrr: number;
    mrrChange: number;
    tasksCompleted: number;
    blockers: number;
  }) =>
    sendTelegramAlert({
      severity: AlertSeverity.INFO,
      title: 'Weekly Empire Report',
      message: `*This Week:*
• MRR: $${stats.mrr} (${stats.mrrChange >= 0 ? '+' : ''}${stats.mrrChange})
• Tasks completed: ${stats.tasksCompleted}
• Active blockers: ${stats.blockers}

Keep crushing it! 💪`,
    }),
};
