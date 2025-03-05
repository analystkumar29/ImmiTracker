import { TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';

type FormTextFieldProps = {
  name: string;
} & Omit<TextFieldProps, 'name'>;

const FormTextField = ({ name, ...props }: FormTextFieldProps) => {
  const [field, meta] = useField(name);

  return (
    <TextField
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      fullWidth
      margin="normal"
    />
  );
};

export default FormTextField; 