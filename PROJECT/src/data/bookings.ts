export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt: string;
};

// Mock bookings data
export const bookings: Booking[] = [
  {
    id: '1',
    roomId: '1',
    userId: '1',
    checkIn: '2025-07-10',
    checkOut: '2025-07-15',
    guests: 2,
    totalPrice: 1745,
    status: 'confirmed',
    createdAt: '2025-05-20T14:30:00.000Z',
  },
  {
    id: '2',
    roomId: '3',
    userId: '1',
    checkIn: '2025-08-05',
    checkOut: '2025-08-10',
    guests: 1,
    totalPrice: 1245,
    status: 'pending',
    createdAt: '2025-06-01T09:15:00.000Z',
  },
  {
    id: '3',
    roomId: '4',
    userId: '2',
    checkIn: '2025-06-20',
    checkOut: '2025-06-27',
    guests: 4,
    totalPrice: 6993,
    status: 'confirmed',
    createdAt: '2025-05-15T11:45:00.000Z',
  },
];