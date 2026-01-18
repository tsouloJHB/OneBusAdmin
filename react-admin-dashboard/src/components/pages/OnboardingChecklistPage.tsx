import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    LinearProgress,
    Divider,
    Chip,
    Paper,
    Alert,
} from '@mui/material';
import {
    Business,
    DirectionsBus,
    AltRoute,
    Map,
    GpsFixed,
    Person,
    Link as LinkIcon,
    CheckCircle,
    RadioButtonUnchecked,
} from '@mui/icons-material';

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    icon: React.ReactElement;
    completed: boolean;
}

const OnboardingChecklistPage: React.FC = () => {
    const [items, setItems] = useState<ChecklistItem[]>([
        {
            id: 'add-company',
            label: 'Add Company',
            description: 'Register the new bus company in the system.',
            icon: <Business />,
            completed: false,
        },
        {
            id: 'add-buses',
            label: 'Add Bus Numbers',
            description: 'Add the fleet of buses belonging to the company.',
            icon: <DirectionsBus />,
            completed: false,
        },
        {
            id: 'register-bus',
            label: 'Register Bus',
            description: 'Ensure all buses are properly registered in the system.',
            icon: <CheckCircle />,
            completed: false,
        },
        {
            id: 'add-routes',
            label: 'Add Routes',
            description: 'Define the basic routes the buses will take.',
            icon: <AltRoute />,
            completed: false,
        },
        {
            id: 'add-full-routes',
            label: 'Add Full Routes',
            description: 'Map out the detailed full routes including all stops.',
            icon: <Map />,
            completed: false,
        },

        {
            id: 'link-trackers',
            label: 'Link Trackers',
            description: 'Associate GPS trackers with specific buses.',
            icon: <GpsFixed />,
            completed: false,
        },
        {
            id: 'add-driver',
            label: 'Add Bus Driver',
            description: 'Create profiles for the bus drivers.',
            icon: <Person />,
            completed: false,
        },
        {
            id: 'link-driver-bus',
            label: 'Link Driver to Bus',
            description: 'Assign drivers to their specific buses.',
            icon: <LinkIcon />,
            completed: false,
        },
    ]);

    const handleToggle = (id: string) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const completedCount = items.filter((item) => item.completed).length;
    const progress = (completedCount / items.length) * 100;

    return (
        <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Company Onboarding Checklist
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Follow these steps to successfully onboard a new bus company onto the platform.
                </Typography>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="medium">
                            Onboarding Progress
                        </Typography>
                        <Chip
                            label={`${Math.round(progress)}% Complete`}
                            color={progress === 100 ? 'success' : 'primary'}
                            variant={progress === 100 ? 'filled' : 'outlined'}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {completedCount} of {items.length} steps completed
                    </Typography>
                </CardContent>
            </Card>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <List disablePadding>
                    {items.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => handleToggle(item.id)}
                                    sx={{
                                        p: 2,
                                        width: '100%',
                                        bgcolor: item.completed ? 'action.hover' : 'background.paper',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            bgcolor: 'action.selected',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                        <Checkbox
                                            edge="start"
                                            checked={item.completed}
                                            tabIndex={-1}
                                            disableRipple
                                            icon={<RadioButtonUnchecked />}
                                            checkedIcon={<CheckCircle color="success" />}
                                        />
                                    </ListItemIcon>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                        <Box sx={{
                                            mr: 2,
                                            p: 1,
                                            borderRadius: '50%',
                                            bgcolor: item.completed ? 'success.light' : 'action.selected',
                                            color: item.completed ? 'success.contrastText' : 'primary.main',
                                            display: 'flex',
                                        }}>
                                            {item.icon}
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={item.completed ? 'regular' : 'medium'} sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.secondary' : 'text.primary' }}>
                                                    {item.label}
                                                </Typography>
                                            }
                                            secondary={item.description}
                                        />
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Alert severity="info">
                    Tip: You can find these actions in the side menu under their respective categories.
                </Alert>
            </Box>
        </Box>
    );
};

export default OnboardingChecklistPage;
