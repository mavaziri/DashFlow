import type {
  User,
  Order,
  LoginRecord,
  OrderStatus,
  ActivityType,
  ApiResponse,
} from '@/types';
import { UserStorageService } from './userStorageService';

export class ApiService {
  private static readonly API_DELAY = 500;

  private static async delay(ms: number = ApiService.API_DELAY): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async getUsers(): Promise<ApiResponse<User[]>> {
    await ApiService.delay();
    try {
      const users = UserStorageService.getAllUsers();

      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve users',
      };
    }
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    await ApiService.delay();
    try {
      const usersResponse = await ApiService.getUsers();
      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          error: 'Failed to retrieve user data',
        };
      }

      const user = usersResponse.data.find((u) => u.id === id);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve user',
      };
    }
  }

  static async getOrders(): Promise<ApiResponse<Order[]>> {
    await ApiService.delay();
    try {
      const ordersData = await import('@/data/orders.json');
      const orders: Order[] = ordersData.default.map((order: unknown) => ({
        ...(order as Order),
        createdAt: new Date((order as Order).createdAt),
        updatedAt: new Date((order as Order).updatedAt),
        orderDate: new Date((order as Order).orderDate),
        status: (order as Order).status as OrderStatus,
      }));

      return {
        success: true,
        data: orders,
        message: 'Orders retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve orders',
      };
    }
  }

  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    await ApiService.delay();
    try {
      const ordersResponse = await ApiService.getOrders();
      if (!ordersResponse.success || !ordersResponse.data) {
        return {
          success: false,
          error: 'Failed to retrieve order data',
        };
      }

      const order = ordersResponse.data.find((o) => o.id === id);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        data: order,
        message: 'Order retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve order',
      };
    }
  }

  static async getLoginRecords(): Promise<ApiResponse<LoginRecord[]>> {
    await ApiService.delay();
    try {
      const loginData = await import('@/data/loginRecords.json');
      const loginRecords: LoginRecord[] = loginData.default.map(
        (record: unknown) => ({
          ...(record as LoginRecord),
          createdAt: new Date((record as LoginRecord).createdAt),
          updatedAt: new Date((record as LoginRecord).updatedAt),
          timestamp: new Date((record as LoginRecord).timestamp),
          activityType: (record as LoginRecord).activityType as ActivityType,
        })
      );

      return {
        success: true,
        data: loginRecords,
        message: 'Login records retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve login records',
      };
    }
  }

  static async getRecentLoginRecords(
    limit: number = 10
  ): Promise<ApiResponse<LoginRecord[]>> {
    await ApiService.delay();
    try {
      const recordsResponse = await ApiService.getLoginRecords();
      if (!recordsResponse.success || !recordsResponse.data) {
        return {
          success: false,
          error: 'Failed to retrieve login records',
        };
      }

      const recentRecords = recordsResponse.data
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return {
        success: true,
        data: recentRecords,
        message: 'Recent login records retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve recent login records',
      };
    }
  }

  static async authenticateUser(username: string): Promise<ApiResponse<User>> {
    await ApiService.delay();
    try {
      const usersResponse = await ApiService.getUsers();
      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          error: 'Authentication service unavailable',
        };
      }

      const user = usersResponse.data.find(
        (u) => u.email === username || u.mobileNumber === username
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      return {
        success: true,
        data: user,
        message: 'Authentication successful',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  static async validateUserExists(
    email: string,
    mobileNumber: string
  ): Promise<ApiResponse<boolean>> {
    await ApiService.delay();
    try {
      const usersResponse = await ApiService.getUsers();
      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          error: 'Validation service unavailable',
        };
      }

      const userExists = usersResponse.data.some(
        (u) => u.email === email || u.mobileNumber === mobileNumber
      );

      return {
        success: true,
        data: userExists,
        message: userExists ? 'User already exists' : 'User does not exist',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Validation failed',
      };
    }
  }
}
