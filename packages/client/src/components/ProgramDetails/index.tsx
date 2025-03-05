import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

interface ProcessingTimes {
  exampleCountries?: Record<string, string>;
  inCanada?: string;
}

interface ImmigrationProgram {
  id: string;
  programName: string;
  category: 'Temporary Residence' | 'Permanent Residence';
  description: string;
  visaOffices: string;
  milestoneUpdates: string[];
  processingTimes: ProcessingTimes;
}

interface ProgramDetailsProps {
  program: ImmigrationProgram;
}

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {program.programName}
          </Typography>
          <Chip
            label={program.category}
            color={program.category === 'Permanent Residence' ? 'primary' : 'secondary'}
          />
        </Box>

        <Typography variant="body1" color="textSecondary" paragraph>
          {program.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Visa Offices
        </Typography>
        <Typography variant="body2" paragraph>
          {program.visaOffices}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Milestone Updates
        </Typography>
        <List>
          {program.milestoneUpdates.map((milestone, index) => (
            <ListItem key={index}>
              <ListItemText primary={milestone} />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" gutterBottom>
          Processing Times
        </Typography>
        {program.processingTimes.exampleCountries && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Country</TableCell>
                  <TableCell>Processing Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(program.processingTimes.exampleCountries).map(([country, time]) => (
                  <TableRow key={country}>
                    <TableCell>{country}</TableCell>
                    <TableCell>{time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {program.processingTimes.inCanada && (
          <Typography variant="body2">
            Processing time in Canada: {program.processingTimes.inCanada}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramDetails; 