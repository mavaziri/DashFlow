'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';
import type {
  Order,
  OrderStatus,
  ApiResponse,
  PaginatedResponse,
  SearchParameters,
  FilterCriteria,
} from '@/types';
import { FilterOperator, SortOrder } from '@/types';
import type { Order as PrismaOrder } from '@prisma/client';

function mapPrismaOrderToOrder(prismaOrder: PrismaOrder): Order {
  return {
    id: prismaOrder.id,
    orderNumber: prismaOrder.orderNumber,
    buyerName: prismaOrder.buyerName,
    status: prismaOrder.status as OrderStatus,
    orderDate: prismaOrder.orderDate,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
  };
}

function buildWhereClause<T extends Record<string, unknown>>(
  filters?: FilterCriteria<T>[]
): Record<string, unknown> {
  if (!filters || filters.length === 0) {
    return {};
  }

  const where: Record<string, unknown> = {};

  filters.forEach((filter) => {
    const field = String(filter.field);
    const value = filter.value;

    switch (filter.operator) {
      case FilterOperator.EQUALS:
        where[field] = value;
        break;
      case FilterOperator.CONTAINS:
        where[field] = { contains: value, mode: 'insensitive' };
        break;
      case FilterOperator.STARTS_WITH:
        where[field] = { startsWith: value, mode: 'insensitive' };
        break;
      case FilterOperator.ENDS_WITH:
        where[field] = { endsWith: value, mode: 'insensitive' };
        break;
      case FilterOperator.GREATER_THAN:
        where[field] = { gt: value };
        break;
      case FilterOperator.LESS_THAN:
        where[field] = { lt: value };
        break;
    }
  });

  return where;
}

export async function createOrder(input: {
  orderNumber: string;
  buyerName: string;
  status: OrderStatus;
  orderDate: Date;
}): Promise<ApiResponse<Order>> {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: input.orderNumber },
    });

    if (existingOrder) {
      return {
        success: false,
        error: 'Order with this order number already exists',
      };
    }

    const prismaOrder = await prisma.order.create({
      data: {
        orderNumber: input.orderNumber,
        buyerName: input.buyerName,
        status: input.status,
        orderDate: input.orderDate,
      },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: mapPrismaOrderToOrder(prismaOrder),
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: 'Failed to create order',
    };
  }
}

const getCachedOrders = unstable_cache(
  async () => {
    const prismaOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return prismaOrders.map(mapPrismaOrderToOrder);
  },
  ['all-orders'],
  { tags: ['orders'], revalidate: 60 }
);

export async function getOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const orders = await getCachedOrders();

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error('Get orders error:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
    };
  }
}

export async function searchOrders(
  params: SearchParameters<Order>
): Promise<PaginatedResponse<Order>> {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhereClause(params.filters);

    if (params.query) {
      where.OR = [
        { orderNumber: { contains: params.query, mode: 'insensitive' } },
        { buyerName: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const orderBy = params.sortBy
      ? { [String(params.sortBy)]: params.sortOrder ?? SortOrder.ASC }
      : { createdAt: SortOrder.DESC };

    const [prismaOrders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const orders = prismaOrders.map(mapPrismaOrderToOrder);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: orders,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Search orders error:', error);
    return {
      success: false,
      error: 'Failed to search orders',
    };
  }
}

export async function getOrderById(id: string): Promise<ApiResponse<Order>> {
  try {
    const prismaOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!prismaOrder) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    return {
      success: true,
      data: mapPrismaOrderToOrder(prismaOrder),
    };
  } catch (error) {
    console.error('Get order by ID error:', error);
    return {
      success: false,
      error: 'Failed to fetch order',
    };
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  try {
    const prismaOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: mapPrismaOrderToOrder(prismaOrder),
      message: 'Order status updated successfully',
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return {
      success: false,
      error: 'Failed to update order status',
    };
  }
}

export async function deleteOrder(id: string): Promise<ApiResponse<null>> {
  try {
    await prisma.order.delete({
      where: { id },
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: null,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    console.error('Delete order error:', error);
    return {
      success: false,
      error: 'Failed to delete order',
    };
  }
}
