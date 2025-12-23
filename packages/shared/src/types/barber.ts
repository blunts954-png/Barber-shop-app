export interface WorkingHours {
  [day: string]: {
    slots: string[]; // ["09:00-12:00", "13:00-18:00"]
  };
}

export interface Barber {
  id: string;
  userId: string;
  shopId: string;
  bio?: string;
  specialties?: string[];
  workingHours: WorkingHours;
  avgRating: number;
  totalReviews: number;
  totalAppointments: number;
  utilizationRate: number;
  acceptsWalkIns: boolean;
  bookingBufferMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BarberPerformance {
  barberId: string;
  revenue: number;
  utilization: number;
  rebookingRate: number;
  avgRating: number;
  upsellRate: number;
  appointmentCount: number;
}

export interface CreateBarberInput {
  userId: string;
  shopId: string;
  bio?: string;
  specialties?: string[];
  workingHours?: WorkingHours;
}
