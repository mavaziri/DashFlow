import type { User } from '@/types';
import usersData from '@/data/users.json';

const STORAGE_KEY = 'dashflow_registered_users';

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

      const parsed: User[] = JSON.parse(stored);
      return parsed.map((user) => {
        const {
          id,
          createdAt,
          updatedAt,
          firstName,
          lastName,
          email,
          mobileNumber,
          address,
          fullName,
        } = user;

        return {
          id: id,
          createdAt: new Date(createdAt),
          updatedAt: new Date(updatedAt),
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobileNumber: mobileNumber,
          address: address,
          fullName: fullName,
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
