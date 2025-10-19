import type { User } from '@/types';
import usersData from '@/data/users.json';

const STORAGE_KEY = 'tokeniko_registered_users';

export class UserStorageService {
  private static loadUsersFromStorage(): User[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored) as unknown[];
      return parsed.map((item) => {
        const user = item as Record<string, unknown>;
        return {
          id: user.id as string,
          createdAt: new Date(user.createdAt as string),
          updatedAt: new Date(user.updatedAt as string),
          firstName: user.firstName as string,
          lastName: user.lastName as string,
          email: user.email as string,
          mobileNumber: user.mobileNumber as string,
          address: user.address as string,
          fullName: user.fullName as string,
        };
      });
    } catch (error) {
      console.error('Error loading users from storage:', error);
      return [];
    }
  }

  private static saveUsersToStorage(users: User[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  static getAllUsers(): User[] {
    const defaultUsers: User[] = usersData.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));

    const storedUsers = this.loadUsersFromStorage();

    return [...defaultUsers, ...storedUsers];
  }

  static addUser(user: User): boolean {
    try {
      const existingUsers = this.getAllUsers();

      const userExists = existingUsers.some(
        (existingUser) =>
          existingUser.email === user.email ||
          existingUser.mobileNumber === user.mobileNumber
      );

      if (userExists) {
        return false;
      }

      const storedUsers = this.loadUsersFromStorage();
      storedUsers.push(user);
      this.saveUsersToStorage(storedUsers);

      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  }

  static userExists(email: string, mobileNumber: string): boolean {
    const allUsers = this.getAllUsers();
    return allUsers.some(
      (user) => user.email === email || user.mobileNumber === mobileNumber
    );
  }

  static findUserByCredentials(username: string): User | undefined {
    const allUsers = this.getAllUsers();
    return allUsers.find(
      (user) => user.email === username || user.mobileNumber === username
    );
  }
}
