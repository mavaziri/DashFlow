import { v4 as uuidv4 } from 'uuid';
import { FilterOperator, OrderStatus, SortOrder } from '@/types';
import type {
  BaseEntity,
  User,
  Order,
  LoginRecord,
  ActivityType,
  FilterCriteria,
  SearchParameters,
  PaginatedResponse,
  PaginationMeta,
} from '@/types';
import { UserRegistrationFormData } from '@/schemas/validation';

export abstract class BaseRecord<T extends BaseEntity> implements BaseEntity {
  [key: string]: unknown;

  constructor(
    public readonly id: string = uuidv4(),
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  public abstract toJSON(): T;

  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}

export class UserRecord extends BaseRecord<User> implements User {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly mobileNumber: string;
  public readonly address: string;
  [key: string]: unknown;

  constructor(data: UserRegistrationFormData) {
    super();

    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.mobileNumber = data.mobileNumber;
    this.address = data.address;
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public toJSON(): User {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      mobileNumber: this.mobileNumber,
      address: this.address,
      fullName: this.fullName,
    };
  }
}

export class OrderRecord extends BaseRecord<Order> implements Order {
  public readonly orderNumber: string;
  public readonly buyerName: string;
  public readonly status: OrderStatus;
  public readonly orderDate: Date;
  [key: string]: unknown;

  constructor(buyerName: string, status: OrderStatus = OrderStatus.PENDING) {
    super();
    this.orderNumber = this.generateOrderNumber();
    this.buyerName = buyerName;
    this.status = status;
    this.orderDate = new Date();
  }

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  public toJSON(): Order {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      orderNumber: this.orderNumber,
      buyerName: this.buyerName,
      status: this.status,
      orderDate: this.orderDate,
    };
  }
}

export class SessionRecord
  extends BaseRecord<LoginRecord>
  implements LoginRecord
{
  public readonly timestamp: Date;

  // [key: string]: unknown;

  constructor(
    public readonly userId: string,
    public readonly activityType: ActivityType,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {
    super();

    this.timestamp = new Date();
  }

  public toJSON(): LoginRecord {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      userId: this.userId,
      activityType: this.activityType,
      timestamp: this.timestamp,
      ...(this.ipAddress !== undefined && { ipAddress: this.ipAddress }),
      ...(this.userAgent !== undefined && { userAgent: this.userAgent }),
    };
  }
}

export class DataService<T extends BaseEntity> {
  private data: T[] = [];

  public add(item: T): void {
    this.data.push(item);
  }

  public findById(id: string): T | undefined {
    return this.data.find((item) => item.id === id);
  }

  public findAll(): T[] {
    return [...this.data];
  }

  public findBy<K extends keyof T>(field: K, value: T[K]): T[] {
    return this.data.filter((item) => item[field] === value);
  }

  public search(params: SearchParameters<T>): PaginatedResponse<T> {
    let filteredData = [...this.data];

    if (params.query && typeof params.query === 'string') {
      const query = params.query.toLowerCase();
      filteredData = filteredData.filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === 'string' && value.toLowerCase().includes(query)
        )
      );
    }

    if (params.filters && params.filters.length > 0) {
      filteredData = filteredData.filter((item) =>
        params.filters!.every((filter) => this.applyFilter(item, filter))
      );
    }

    if (params.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        debugger;
        if (aValue < bValue)
          return params.sortOrder === SortOrder.DESC ? 1 : -1;
        if (aValue > bValue)
          return params.sortOrder === SortOrder.DESC ? -1 : 1;
        return 0;
      });
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMeta = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      success: true,
      data: paginatedData,
      meta,
    };
  }

  private applyFilter(item: T, filter: FilterCriteria<T>): boolean {
    const itemValue = item[filter.field];
    const filterValue = filter.value;

    switch (filter.operator) {
      case FilterOperator.EQUALS:
        return itemValue === filterValue;
      case FilterOperator.CONTAINS:
        return (
          typeof itemValue === 'string' &&
          typeof filterValue === 'string' &&
          itemValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      case FilterOperator.STARTS_WITH:
        return (
          typeof itemValue === 'string' &&
          typeof filterValue === 'string' &&
          itemValue.toLowerCase().startsWith(filterValue.toLowerCase())
        );
      case FilterOperator.ENDS_WITH:
        return (
          typeof itemValue === 'string' &&
          typeof filterValue === 'string' &&
          itemValue.toLowerCase().endsWith(filterValue.toLowerCase())
        );
      case FilterOperator.GREATER_THAN:
        return itemValue > filterValue;
      case FilterOperator.LESS_THAN:
        return itemValue < filterValue;
      default:
        return false;
    }
  }

  public count(): number {
    return this.data.length;
  }

  public clear(): void {
    this.data = [];
  }
}
