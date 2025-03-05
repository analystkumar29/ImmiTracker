import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm, Controller, Control } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getImmigrationTypes, getSubtypesByType } from "../../data/immigrationPrograms";
import { getCountryNames, getVisaProcessingCentres, VisaProcessingCentre } from "../../data/visaProcessingCentres";
import { createApplication } from "../../store/slices/applicationSlice";
import { AppDispatch } from "../../store";
import MobileNavigation from "../../components/MobileNavigation";
import MilestoneManager from "../../components/MilestoneManager";

interface FormValues {
  programType: string;
  programSubtype: string;
  country: string;
  visaProcessingCentre: string;
  submissionDate: Date | null;
}

interface ControlledSelectProps {
  name: "programType" | "programSubtype" | "country" | "visaProcessingCentre";
  label: string;
  control: Control<FormValues>;
  options: { value: string; label: string }[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string | undefined;
}

const validationSchema = yup.object().shape({
  programType: yup.string().required("Program type is required"),
  programSubtype: yup.string().required("Program subtype is required"),
  country: yup.string().required("Country is required"),
  visaProcessingCentre: yup.string().required("Visa processing centre is required"),
  submissionDate: yup.date().nullable().required("Submission date is required")
}) as yup.ObjectSchema<FormValues>;

const ControlledSelect: React.FC<ControlledSelectProps> = ({
  name,
  label,
  control,
  options,
  disabled = false,
  error = false,
  helperText
}) => (
  <FormControl fullWidth error={error}>
    <InputLabel>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select {...field} label={label} disabled={disabled}>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programTypes] = useState(getImmigrationTypes());
  const [programSubtypes, setProgramSubtypes] = useState<string[]>([]);
  const [countries] = useState(getCountryNames());
  const [visaCentres, setVisaCentres] = useState<VisaProcessingCentre[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      programType: '',
      programSubtype: '',
      country: '',
      visaProcessingCentre: '',
      submissionDate: null,
    },
  });

  const selectedProgramType = watch('programType');
  const selectedProgramSubtype = watch('programSubtype');
  const selectedCountry = watch('country');

  useEffect(() => {
    if (selectedProgramType) {
      const subtypes = getSubtypesByType(selectedProgramType);
      setProgramSubtypes(subtypes);
      setValue('programSubtype', '');
    }
  }, [selectedProgramType, setValue]);

  useEffect(() => {
    if (selectedProgramSubtype?.toLowerCase().includes('inside canada')) {
      setValue('country', 'Canada');
    }
  }, [selectedProgramSubtype, setValue]);

  useEffect(() => {
    if (selectedCountry) {
      const centres = getVisaProcessingCentres(selectedCountry);
      setVisaCentres(centres);
      setValue('visaProcessingCentre', '');
    }
  }, [selectedCountry, setValue]);

  const onFormSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);
      setSubmissionSuccess(false);
      
      const result = await dispatch(createApplication({
        type: data.programType,
        subType: data.programSubtype,
        country: data.country,
        city: data.visaProcessingCentre,
        submissionDate: data.submissionDate ? data.submissionDate.toISOString() : new Date().toISOString(),
      })).unwrap();
      
      console.log('Application created successfully:', result);
      
      setSubmissionSuccess(true);
      
      // Wait a brief moment to show the success state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard to see the timeline view
      navigate('/', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create application');
      console.error('Application creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {submissionSuccess ? 'Application created successfully!' : 'Creating your application...'}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {submissionSuccess 
            ? 'Redirecting you to your dashboard...' 
            : 'Please wait while we process your submission'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {isMobile ? (
        <MobileNavigation 
          title="Create New Application"
        />
      ) : (
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Application
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mx: isMobile ? -1 : 0 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ControlledSelect
                  name="programType"
                  label="Program Type"
                  control={control}
                  options={programTypes.map(type => ({ value: type, label: type }))}
                  error={!!errors.programType}
                  helperText={errors.programType?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <ControlledSelect
                  name="programSubtype"
                  label="Program Subtype"
                  control={control}
                  options={programSubtypes.map(subtype => ({ value: subtype, label: subtype }))}
                  disabled={!watch('programType')}
                  error={!!errors.programSubtype}
                  helperText={errors.programSubtype?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <ControlledSelect
                  name="country"
                  label="Country"
                  control={control}
                  options={countries.map(country => ({ value: country, label: country }))}
                  disabled={selectedProgramSubtype?.toLowerCase().includes("inside canada")}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <ControlledSelect
                  name="visaProcessingCentre"
                  label="Visa Processing Centre"
                  control={control}
                  options={visaCentres.map(centre => ({ value: centre.city, label: centre.city }))}
                  error={!!errors.visaProcessingCentre}
                  helperText={errors.visaProcessingCentre?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="submissionDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Submission Date"
                        maxDate={new Date()}
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                            inputProps: {
                              placeholder: "MM/DD/YYYY"
                            }
                          }
                        }}
                        sx={{
                          width: '100%',
                          '& .MuiInputBase-root': {
                            cursor: 'text'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  {!isMobile && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/applications')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    Create Application
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationForm; 