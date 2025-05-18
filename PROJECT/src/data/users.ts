export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
};

// Mock users data
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=john',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=jane',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@azurehaven.com',
    phone: '+1 (555) 789-0123',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin',
  },
];