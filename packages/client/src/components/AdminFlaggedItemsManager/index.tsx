import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getMilestoneTemplates, getApplicationTypes } from '../../utils/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`flagged-tabpanel-${index}`}
      aria-labelledby={`flagged-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminFlaggedItemsManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flaggedMilestones, setFlaggedMilestones] = useState<any[]>([]);
  const [flaggedAppTypes, setFlaggedAppTypes] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadFlaggedItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load flagged milestone templates
      const milestonesResponse = await getMilestoneTemplates('all', undefined, true);
      const flaggedMilestones = (milestonesResponse.data || []).filter(
        (template: any) => template.flagCount > 0
      ).sort((a: any, b: any) => b.flagCount - a.flagCount);
      
      setFlaggedMilestones(flaggedMilestones);
      
      // Load flagged application types
      const appTypesResponse = await getApplicationTypes(true);
      const flaggedAppTypes = (appTypesResponse.data || []).filter(
        (type: any) => type.flagCount > 0
      ).sort((a: any, b: any) => b.flagCount - a.flagCount);
      
      setFlaggedAppTypes(flaggedAppTypes);
    } catch (err) {
      console.error('Error loading flagged items:', err);
      setError('Failed to load flagged items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlaggedItems();
  }, []);

  const handleProcessFlagged = async (type: 'milestones' | 'applicationTypes') => {
    setProcessing(true);
    setError(null);
    
    try {
      const endpoint = type === 'milestones' 
        ? '/api/milestones/process-flagged'
        : '/api/application-types/process-flagged';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers here
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process flagged ${type}`);
      }
      
      // Reload data after processing
      await loadFlaggedItems();
      
    } catch (err) {
      console.error(`Error processing flagged ${type}:`, err);
      setError(`Failed to process flagged ${type}. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Flagged Items Manager</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={loadFlaggedItems} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label={`Flagged Milestones (${flaggedMilestones.length})`} />
          <Tab label={`Flagged Application Types (${flaggedAppTypes.length})`} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : flaggedMilestones.length > 0 ? (
            <>
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleProcessFlagged('milestones')}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <BlockIcon />}
                >
                  Process All Flagged Milestones
                </Button>
                <Typography variant="caption" display="block" mt={1} color="text.secondary">
                  This will mark all heavily flagged milestones as non-default
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Milestone Name</TableCell>
                      <TableCell>Program Type</TableCell>
                      <TableCell>Flag Count</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flaggedMilestones.map((milestone) => (
                      <TableRow key={milestone.id}>
                        <TableCell>{milestone.name}</TableCell>
                        <TableCell>
                          {milestone.programType}
                          {milestone.programSubType && ` / ${milestone.programSubType}`}
                        </TableCell>
                        <TableCell>{milestone.flagCount}</TableCell>
                        <TableCell>
                          {milestone.isApproved ? (
                            <Chip label="Approved" color="success" size="small" />
                          ) : (
                            <Chip label="Not Approved" color="warning" size="small" />
                          )}
                          {' '}
                          {milestone.isDefault ? (
                            <Chip label="Default" color="primary" size="small" />
                          ) : (
                            <Chip label="Custom" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={milestone.isApproved ? "Mark as unapproved" : "Approve"}>
                            <IconButton
                              color={milestone.isApproved ? "warning" : "success"}
                              size="small"
                            >
                              {milestone.isApproved ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography align="center" py={3}>
              No flagged milestones found
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : flaggedAppTypes.length > 0 ? (
            <>
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleProcessFlagged('applicationTypes')}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <BlockIcon />}
                >
                  Process All Flagged Application Types
                </Button>
                <Typography variant="caption" display="block" mt={1} color="text.secondary">
                  This will mark all unused but heavily flagged application types as non-default
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Application Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Flag Count</TableCell>
                      <TableCell>Used In</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flaggedAppTypes.map((appType) => (
                      <TableRow key={appType.id}>
                        <TableCell>{appType.name}</TableCell>
                        <TableCell>{appType.category}</TableCell>
                        <TableCell>{appType.flagCount}</TableCell>
                        <TableCell>{appType.useCount} applications</TableCell>
                        <TableCell>
                          {appType.isDefault ? (
                            <Chip label="Default" color="primary" size="small" />
                          ) : (
                            <Chip label="Custom" color="default" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography align="center" py={3}>
              No flagged application types found
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminFlaggedItemsManager; 