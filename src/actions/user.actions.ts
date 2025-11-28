'use server';

import { prisma } from '@/lib/prisma';
import { signIn } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import type {
  User,
  UserRegistrationData,
  ApiResponse,
  AuthUser,
} from '@/types';
import type { User as PrismaUser } from '@prisma/client';
import { AuthError } from 'next-auth';

const SALT_ROUNDS = 10;

type CreateUserInput = UserRegistrationData & { password: string };

function mapPrismaUserToUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    email: prismaUser.email,
    mobileNumber: prismaUser.mobileNumber,
    address: prismaUser.address,
    fullName: `${prismaUser.firstName} ${prismaUser.lastName}`,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  };
}

export async function createUser(
  input: CreateUserInput
): Promise<ApiResponse<User>> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const prismaUser = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: hashedPassword,
        mobileNumber: input.mobileNumber,
        address: input.address,
      },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: mapPrismaUserToUser(prismaUser),
      message: 'User created successfully',
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      error: 'Failed to create user',
    };
  }
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  try {
    const prismaUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const users = prismaUsers.map(mapPrismaUserToUser);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      error: 'Failed to fetch users',
    };
  }
}

export async function getUserById(id: string): Promise<ApiResponse<User>> {
  try {
    const prismaUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: mapPrismaUserToUser(prismaUser),
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return {
      success: false,
      error: 'Failed to fetch user',
    };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<ApiResponse<AuthUser>> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    const prismaUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const authUser: AuthUser = {
      id: prismaUser.id,
      email: prismaUser.email,
      fullName: `${prismaUser.firstName} ${prismaUser.lastName}`,
      mobileNumber: prismaUser.mobileNumber,
    };

    return {
      success: true,
      data: authUser,
      message: 'Authentication successful',
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserRegistrationData, 'email'>>
): Promise<ApiResponse<User>> {
  try {
    const prismaUser = await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: mapPrismaUserToUser(prismaUser),
      message: 'User updated successfully',
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: 'Failed to update user',
    };
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: null,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: 'Failed to delete user',
    };
  }
}
