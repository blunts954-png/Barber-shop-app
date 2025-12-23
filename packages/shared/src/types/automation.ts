export type AutomationType =
  | 'review_request'
  | 'reactivation'
  | 'birthday'
  | 'upsell'
  | 'membership';

export type NotificationType = 'sms' | 'email' | 'push';

export interface Automation {
  id: string;
  shopId: string;
  type: AutomationType;
  name: string;
  triggerConditions: Record<string, any>;
  messageTemplate: string;
  sendSms: boolean;
  sendEmail: boolean;
  sendPush: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  clientId: string;
  executedAt: Date;
  success: boolean;
  errorMessage?: string;
  opened: boolean;
  clicked: boolean;
  converted: boolean;
}

export interface CreateAutomationInput {
  shopId: string;
  type: AutomationType;
  name: string;
  triggerConditions: Record<string, any>;
  messageTemplate: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  subject?: string;
  body: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  appointmentId?: string;
  twilioSid?: string;
  sendgridMessageId?: string;
  createdAt: Date;
}
