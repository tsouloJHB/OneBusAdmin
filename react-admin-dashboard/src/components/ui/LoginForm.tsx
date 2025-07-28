import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types';

// Validation schema
const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess,
  redirectTo = '/dashboard' 
}) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoginError(null);
      await login(data);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect behavior
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle different types of errors
      if (error?.response?.status === 401) {
        setLoginError('Invalid username or password. Please try again.');
      } else if (error?.response?.status === 429) {
        setLoginError('Too many login attempts. Please try again later.');
      } else if (error?.response?.data?.fieldErrors) {
        // Handle field-specific validation errors from server
        const fieldErrors = error.response.data.fieldErrors;
        Object.keys(fieldErrors).forEach((field) => {
          setError(field as keyof LoginRequest, {
            type: 'server',
            message: fieldErrors[field],
          });
        });
      } else if (error?.message) {
        setLoginError(error.message);
      } else {
        setLoginError('Login failed. Please check your connection and try again.');
      }
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'grey.100',
        padding: { xs: 1, sm: 2 },
      }}
      role="main"
      aria-label="Login page"
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 400 },
          boxShadow: 3,
          mx: { xs: 1, sm: 0 },
        }}
        role="form"
        aria-labelledby="login-title"
      >
        <CardContent sx={{ padding: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              id="login-title"
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
            >
              Admin Dashboard
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              Sign in to access the bus management system
            </Typography>
          </Box>

          {loginError && (
            <Alert 
              severity="error" 
              sx={{ marginBottom: 2 }}
              onClose={() => setLoginError(null)}
            >
              {loginError}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            noValidate
            role="form"
            aria-labelledby="login-title"
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={isFormLoading}
                  required
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person 
                          color={errors.username ? 'error' : 'action'} 
                          aria-hidden="true"
                        />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="username"
                  autoFocus
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: 56, // Ensure minimum touch target
                    },
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isFormLoading}
                  required
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock 
                          color={errors.password ? 'error' : 'action'} 
                          aria-hidden="true"
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={handleTogglePasswordVisibility}
                          disabled={isFormLoading}
                          edge="end"
                          sx={{
                            minWidth: 44,
                            minHeight: 44,
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="current-password"
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: 56, // Ensure minimum touch target
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isFormLoading}
              sx={{
                marginTop: 3,
                marginBottom: 2,
                height: 48,
              }}
            >
              {isFormLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Signing in...</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact your system administrator
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;