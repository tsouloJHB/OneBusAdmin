import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ContentCopy as CopyIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import CompanyUserForm from './CompanyUserForm';
import { User } from '../../types';
import { formatDate } from '../../utils/busCompanyUtils';
import { busCompanyService } from '../../services/busCompanyService';

interface CompanyUsersProps {
    companyId: number | string;
    companyName: string;
}

const CompanyUsers: React.FC<CompanyUsersProps> = ({ companyId, companyName }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const togglePasswordVisibility = (userId: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here if available
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setOpenForm(true);
    };

    const handleDelete = async (userId: string | number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await busCompanyService.deleteCompanyUser(companyId, userId);
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            setError(err.message || 'Failed to delete user');
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setOpenForm(true);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/api/bus-companies/${companyId}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Company Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage administrators and staff for {companyName}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        disabled={loading}
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">Loading users...</Typography>
                </Paper>
            ) : users.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No users found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add a user to manage this company's operations
                    </Typography>
                    <Button variant="outlined" onClick={handleAdd}>
                        Add First User
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Password</TableCell>
                                <TableCell>Date Added</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {user.fullName} {user.surname}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {user.position || '-'}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role.replace('_', ' ')}
                                            size="small"
                                            color={user.role === 'COMPANY_ADMIN' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {visiblePasswords[user.id] ? (user.password || 'N/A') : '••••••••'}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => togglePasswordVisibility(user.id)}
                                            >
                                                {visiblePasswords[user.id] ? <VisibilityOffIcon fontSize="inherit" /> : <VisibilityIcon fontSize="inherit" />}
                                            </IconButton>
                                            <Tooltip title={user.password ? "Copy password" : "Password not stored (created before update)"}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => copyToClipboard(user.password || '')}
                                                        disabled={!user.password}
                                                    >
                                                        <CopyIcon fontSize="inherit" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {user.createdAt ? formatDate(new Date(user.createdAt)) : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Tooltip title="Edit User">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(user)}
                                                    color="primary"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete User">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(user.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <CompanyUserForm
                open={openForm}
                companyId={companyId}
                user={selectedUser}
                onSuccess={() => {
                    fetchUsers();
                    setOpenForm(false);
                    setSelectedUser(null);
                }}
                onCancel={() => {
                    setOpenForm(false);
                    setSelectedUser(null);
                }}
            />
        </Box>
    );
};

export default CompanyUsers;
