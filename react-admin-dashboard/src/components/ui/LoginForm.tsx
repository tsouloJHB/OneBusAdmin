import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  DirectionsBus,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types';
import { ModernCard, ModernButton, ThemeToggle, OneBusLogo } from './';
import { designTokens } from '../../theme';

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
  const theme = useTheme();
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        padding: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%)`,
          zIndex: 0,
        },
      }}
      role="main"
      aria-label="Login page"
    >
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}>
        <ThemeToggle variant="icon" size="medium" />
      </Box>

      <ModernCard
        variant="glass"
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 420 },
          zIndex: 1,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <OneBusLogo 
              size={72} 
              variant="gradient-bg"
              sx={{
                mb: 3,
              }}
            />
            
            <Typography 
              variant="h3" 
              component="h1" 
              id="login-title"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 700,
                mb: 1,
                // Use gradient text only in light mode, solid color in dark mode
                ...(theme.palette.mode === 'light' ? {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : {
                  color: theme.palette.primary.main,
                }),
              }}
            >
              OneBus Admin
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 400,
              }}
            >
              Sign in to manage your fleet
            </Typography>
          </Box>

          {loginError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: designTokens.borderRadius.md,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                },
              }}
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
                      minHeight: 56,
                      borderRadius: designTokens.borderRadius.md,
                    },
                    '& .MuiOutlinedInput-root': {
                      transition: designTokens.transitions.medium,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: theme.palette.primary.main,
                      },
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
                            borderRadius: designTokens.borderRadius.md,
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
                      minHeight: 56,
                      borderRadius: designTokens.borderRadius.md,
                    },
                    '& .MuiOutlinedInput-root': {
                      transition: designTokens.transitions.medium,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              )}
            />

            <ModernButton
              type="submit"
              variant="gradient"
              fullWidth
              loading={isFormLoading}
              sx={{
                mt: 4,
                mb: 2,
                height: 56,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isFormLoading ? 'Signing in...' : 'Sign In'}
            </ModernButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              Need help? Contact your system administrator
            </Typography>
          </Box>
        </Box>
      </ModernCard>
    </Box>
  );
};

export default LoginForm;