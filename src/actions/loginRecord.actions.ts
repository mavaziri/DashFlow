'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { LoginRecord, ApiResponse } from '@/types';
import { ActivityType } from '@/types';
import type { LoginRecord as PrismaLoginRecord } from '@prisma/client';

function mapPrismaLoginRecordToLoginRecord(
  prismaRecord: PrismaLoginRecord
): LoginRecord {
  return {
    id: prismaRecord.id,
    userId: prismaRecord.userId,
    activityType: prismaRecord.activityType as ActivityType,
    timestamp: prismaRecord.timestamp,
    ipAddress: prismaRecord.ipAddress ?? undefined,
    userAgent: prismaRecord.userAgent ?? undefined,
    createdAt: prismaRecord.createdAt,
    updatedAt: prismaRecord.updatedAt,
  };
}

export async function createLoginRecord(input: {
  userId: string;
  activityType: ActivityType;
  ipAddress?: string;
  userAgent?: string;
}): Promise<ApiResponse<LoginRecord>> {
  try {
    const prismaRecord = await prisma.loginRecord.create({
      data: {
        userId: input.userId,
        activityType: input.activityType,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: mapPrismaLoginRecordToLoginRecord(prismaRecord),
      message: 'Login record created successfully',
    };
  } catch (error) {
    console.error('Create login record error:', error);
    return {
      success: false,
      error: 'Failed to create login record',
    };
  }
}

export async function getLoginRecords(): Promise<ApiResponse<LoginRecord[]>> {
  try {
    const prismaRecords = await prisma.loginRecord.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
      },
    });

    const records = prismaRecords.map(mapPrismaLoginRecordToLoginRecord);

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('Get login records error:', error);
    return {
      success: false,
      error: 'Failed to fetch login records',
    };
  }
}

export async function getRecentLoginRecords(
  limit: number = 10
): Promise<ApiResponse<LoginRecord[]>> {
  try {
    const prismaRecords = await prisma.loginRecord.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: true,
      },
    });

    const records = prismaRecords.map(mapPrismaLoginRecordToLoginRecord);

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('Get recent login records error:', error);
    return {
      success: false,
      error: 'Failed to fetch recent login records',
    };
  }
}

export async function getLoginRecordsByUserId(
  userId: string
): Promise<ApiResponse<LoginRecord[]>> {
  try {
    const prismaRecords = await prisma.loginRecord.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    const records = prismaRecords.map(mapPrismaLoginRecordToLoginRecord);

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('Get login records by user ID error:', error);
    return {
      success: false,
      error: 'Failed to fetch login records',
    };
  }
}

export async function deleteLoginRecord(
  id: string
): Promise<ApiResponse<null>> {
  try {
    await prisma.loginRecord.delete({
      where: { id },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: null,
      message: 'Login record deleted successfully',
    };
  } catch (error) {
    console.error('Delete login record error:', error);
    return {
      success: false,
      error: 'Failed to delete login record',
    };
  }
}
