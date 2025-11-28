'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import {
  userRegistrationSchema,
  type UserRegistrationFormData,
} from '@/schemas/validation';
import { createUser } from '@/actions/user.actions';
import type { User } from '@/types';

interface RegistrationFormProps {
  onRegistrationSuccess?: (user: User) => void;
  onNavigateToLogin?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationSuccess,
  onNavigateToLogin,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: UserRegistrationFormData): Promise<void> => {
    setIsSubmitting(true);

    setSubmitError(null);

    setSubmitSuccess(false);

    try {
      const response = await createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        mobileNumber: data.mobileNumber,
        address: data.address,
      });

      if (response.success && response.data) {
        setSubmitSuccess(true);

        reset();

        onRegistrationSuccess?.(response.data);
      } else {
        setSubmitError(response.error || 'Registration failed');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h3 className="mb-0">Create Your Account</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {submitSuccess && (
                <Alert variant="success" className="mb-4">
                  <Alert.Heading>Registration Successful!</Alert.Heading>
                  <p className="mb-0">
                    Your account has been created successfully. You can now log
                    in to your account.
                  </p>
                  {onNavigateToLogin && (
                    <div className="mt-3">
                      <Button
                        variant="outline-success"
                        onClick={onNavigateToLogin}
                      >
                        Go to Login
                      </Button>
                    </div>
                  )}
                </Alert>
              )}

              {submitError && (
                <Alert variant="danger" className="mb-4">
                  <strong>Registration Failed:</strong> {submitError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        First Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your first name"
                        {...register('firstName')}
                        isInvalid={!!errors.firstName}
                        disabled={isSubmitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Last Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your last name"
                        {...register('lastName')}
                        isInvalid={!!errors.lastName}
                        disabled={isSubmitting}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Email Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    {...register('email')}
                    isInvalid={!!errors.email}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    isInvalid={!!errors.password}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters with uppercase,
                    lowercase, and number.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Mobile Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your mobile number (e.g., +1234567890)"
                    {...register('mobileNumber')}
                    isInvalid={!!errors.mobileNumber}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mobileNumber?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your full address"
                    {...register('address')}
                    isInvalid={!!errors.address}
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>

                {onNavigateToLogin && (
                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Already have an account?{' '}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={onNavigateToLogin}
                        disabled={isSubmitting}
                      >
                        Sign in here
                      </Button>
                    </p>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationForm;
