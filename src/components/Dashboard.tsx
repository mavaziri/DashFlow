'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Alert,
  Navbar,
  Nav,
  Dropdown,
} from 'react-bootstrap';
import { format } from 'date-fns';
import {
  orderSearchSchema,
  type OrderSearchFormData,
} from '@/schemas/validation';
import { DataService } from '@/utils/classes';
import {
  ActivityType,
  type Order,
  type LoginRecord,
  type AuthUser,
  type PaginatedResponse,
  type FilterCriteria,
  FilterOperator,
  OrderStatus,
  SortOrder,
} from '@/types';

interface DashboardProps {
  user: AuthUser;
  onLogout?: () => void;
}

interface OrderSearchData {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

const defaultOrderSearchData: OrderSearchData = {
  orders: [],
  loading: true,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [recentLogins, setRecentLogins] = useState<LoginRecord[]>([]);
  const [orderState, setOrderState] = useState<OrderSearchData>(
    defaultOrderSearchData
  );

  const orderService = useMemo(() => new DataService<Order>(), []);

  const { register, handleSubmit, reset } = useForm<OrderSearchFormData>({
    resolver: zodResolver(orderSearchSchema),
    defaultValues: {
      sortBy: 'orderDate',
      sortOrder: SortOrder.DESC,
      page: 1,
      limit: 10,
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    try {
      const ordersData = await import('@/data/orders.json');
      const orders: Order[] = ordersData.default.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        orderDate: new Date(order.orderDate),
        status: order.status as OrderStatus,
      }));

      orderService.clear();
      orders.forEach((order) => orderService.add(order));

      const loginData = await import('@/data/loginRecords.json');
      const loginRecords: LoginRecord[] = loginData.default
        .map((record) => ({
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          timestamp: new Date(record.timestamp),
          activityType: record.activityType as ActivityType,
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      setRecentLogins(loginRecords);

      await searchOrders({});
    } catch (error) {
      console.error('Error loading initial data:', error);
      setOrderState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  };

  const searchOrders = async (
    searchParams: Partial<OrderSearchFormData>
  ): Promise<void> => {
    setOrderState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const filters: FilterCriteria<Order>[] = [];

      if (searchParams.status) {
        filters.push({
          field: 'status',
          value: searchParams.status,
          operator: FilterOperator.EQUALS,
        });
      }

      if (searchParams.buyerName) {
        filters.push({
          field: 'buyerName',
          value: searchParams.buyerName,
          operator: FilterOperator.CONTAINS,
        });
      }

      if (searchParams.orderNumber) {
        filters.push({
          field: 'orderNumber',
          value: searchParams.orderNumber,
          operator: FilterOperator.CONTAINS,
        });
      }

      const searchParameters = {
        query: searchParams.query || undefined,
        filters,
        sortBy: searchParams.sortBy || 'orderDate',
        sortOrder: searchParams.sortOrder || SortOrder.DESC,
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
      };

      const result: PaginatedResponse<Order> =
        orderService.search(searchParameters);

      setOrderState({
        orders: result.data || [],
        loading: false,
        error: null,
        totalCount: result.meta?.totalItems || 0,
        currentPage: result.meta?.currentPage || 1,
      });
    } catch (error) {
      console.error('Error searching orders:', error);
      setOrderState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to search orders',
      }));
    }
  };

  const onSearch = (data: OrderSearchFormData): void => {
    searchOrders(data);
  };

  const handleClearFilters = (): void => {
    reset();
    searchOrders({});
  };

  const getStatusVariant = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.PROCESSING:
        return 'info';
      case OrderStatus.SHIPPED:
        return 'primary';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date): string => {
    try {
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      onLogout?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Tokeniko Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  {user.fullName}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>
                    <small className="text-muted">{user.email}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Sign Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-4">
          <Col>
            <Alert variant="success" className="mb-0">
              <Alert.Heading>Welcome back, {user.fullName}!</Alert.Heading>
              <p className="mb-0">
                You're successfully logged in to your dashboard. Manage your
                orders and view recent activities below.
              </p>
            </Alert>
          </Col>
        </Row>

        <Row>
          <Col lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">Recent Login Activities</h5>
              </Card.Header>
              <Card.Body>
                {recentLogins.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentLogins.map((record) => (
                      <div key={record.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <Badge
                              bg={
                                record.activityType === ActivityType.LOGIN
                                  ? 'success'
                                  : 'secondary'
                              }
                              className="me-2"
                            >
                              {record.activityType}
                            </Badge>
                            <small className="text-muted">
                              {formatDate(record.timestamp)}
                            </small>
                          </div>
                        </div>
                        {record.ipAddress && (
                          <small className="text-muted d-block mt-1">
                            IP: {record.ipAddress}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No recent activities found.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Orders Management</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSearch)} className="mb-4">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Search Orders</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by order number or buyer name..."
                          {...register('query')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select {...register('status')}>
                          <option value="">All Statuses</option>
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort By</Form.Label>
                        <Form.Select {...register('sortBy')}>
                          <option value="orderDate">Order Date</option>
                          <option value="orderNumber">Order Number</option>
                          <option value="buyerName">Buyer Name</option>
                          <option value="status">Status</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Buyer Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Filter by buyer name..."
                          {...register('buyerName')}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Order Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Filter by order number..."
                          {...register('orderNumber')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={orderState.loading}
                    >
                      {orderState.loading ? 'Searching...' : 'Search Orders'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={handleClearFilters}
                      disabled={orderState.loading}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Form>

                {orderState.error && (
                  <Alert variant="danger" className="mb-3">
                    {orderState.error}
                  </Alert>
                )}

                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Buyer Name</th>
                        <th>Order Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderState.loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : orderState.orders.length > 0 ? (
                        orderState.orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <code>{order.orderNumber}</code>
                            </td>
                            <td>{order.buyerName}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>
                              <Badge bg={getStatusVariant(order.status)}>
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-muted"
                          >
                            No orders found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {orderState.totalCount > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Showing {orderState.orders.length} of{' '}
                      {orderState.totalCount} orders
                    </small>
                    <small className="text-muted">
                      Page {orderState.currentPage}
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
