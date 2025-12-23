export interface Service {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  marginPercentage?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceEconomics {
  serviceId: string;
  name: string;
  totalRevenue: number;
  avgDuration: number;
  margin: number;
  appointmentCount: number;
  revenuePerHour: number;
}

export interface CreateServiceInput {
  shopId: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  marginPercentage?: number;
}
