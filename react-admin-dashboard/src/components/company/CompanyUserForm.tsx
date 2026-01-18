import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { RegisterRequest, User } from '../../types';
import authService from '../../services/authService';
import { busCompanyService } from '../../services/busCompanyService';

interface CompanyUserFormProps {
    open: boolean;
    companyId: number | string;
    user?: User | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CompanyUserForm: React.FC<CompanyUserFormProps> = ({
    open,
    companyId,
    user,
    onSuccess,
    onCancel
}) => {
    const [formData, setFormData] = useState<Partial<RegisterRequest>>({
        fullName: '',
        surname: '',
        position: '',
        email: '',
        companyId: typeof companyId === 'string' ? parseInt(companyId, 10) : companyId
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                surname: user.surname || '',
                position: user.position || '',
                email: user.email,
                companyId: typeof companyId === 'string' ? parseInt(companyId, 10) : companyId
            });
        } else {
            setFormData({
                fullName: '',
                surname: '',
                position: '',
                email: '',
                companyId: typeof companyId === 'string' ? parseInt(companyId, 10) : companyId
            });
        }
    }, [user, companyId, open]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof RegisterRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.fullName || !formData.email) {
            setError('Name and Email are required');
            setLoading(false);
            return;
        }

        try {
            if (user) {
                // Update existing user
                await busCompanyService.updateCompanyUser(companyId, user.id, {
                    fullName: formData.fullName,
                    surname: formData.surname,
                    position: formData.position,
                    email: formData.email,
                    role: user.role // Keep same role for now, or could add role selector
                });
            } else {
                // Register new user
                await authService.registerCompanyAdmin({
                    ...formData,
                    companyId: typeof companyId === 'string' ? parseInt(companyId, 10) : companyId
                } as RegisterRequest);
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error(`Failed to ${user ? 'update' : 'register'} user:`, err);
            setError(err.message || `Failed to ${user ? 'update' : 'register'} user`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            fullName: '',
            surname: '',
            position: '',
            email: '',
            companyId: typeof companyId === 'string' ? parseInt(companyId, 10) : companyId
        });
        setError(null);
        onCancel();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{user ? 'Edit Company User' : 'Add Company User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}

                        {!user && (
                            <Alert severity="info">
                                Password will be auto-generated: [CompanyName]onebus#[Year]
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                required
                                disabled={loading}
                            />
                            <TextField
                                label="Surname"
                                fullWidth
                                value={formData.surname}
                                onChange={(e) => handleChange('surname', e.target.value)}
                                disabled={loading}
                            />
                        </Box>

                        <TextField
                            label="Position / Role"
                            fullWidth
                            value={formData.position}
                            onChange={(e) => handleChange('position', e.target.value)}
                            disabled={loading}
                            placeholder="e.g. Fleet Manager"
                        />

                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                            disabled={loading}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? (user ? 'Saving...' : 'Creating...') : (user ? 'Save Changes' : 'Create User')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CompanyUserForm;
