export interface DailyMetrics {
  id: string;
  shopId: string;
  barberId?: string;
  date: Date;
  totalAppointments: number;
  completedAppointments: number;
  noShows: number;
  cancellations: number;
  grossRevenue: number;
  discounts: number;
  netRevenue: number;
  scheduledMinutes: number;
  availableMinutes: number;
  utilizationRate: number;
  slotsFilledByBackup: number;
  revenueRecovered: number;
  noShowCost: number;
  createdAt: Date;
}

export interface ProfitPerChair {
  barberId: string;
  barberName: string;
  revenue: number;
  discounts: number;
  noShowCost: number;
  netProfit: number;
  utilization: number;
  hourlyRate: number;
}

export interface ShopAnalytics {
  totalRevenue: number;
  netRevenue: number;
  utilizationRate: number;
  avgAppointmentValue: number;
  noShowRate: number;
  cancellationRate: number;
  backupFillRate: number;
  revenueRecovered: number;
  profitPerChair: ProfitPerChair[];
  topServices: ServiceEconomics[];
}

interface ServiceEconomics {
  serviceId: string;
  name: string;
  totalRevenue: number;
  avgDuration: number;
  margin: number;
  appointmentCount: number;
  revenuePerHour: number;
}

export interface AnalyticsQuery {
  shopId: string;
  startDate: Date;
  endDate: Date;
  barberId?: string;
}
