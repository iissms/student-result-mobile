export const COLORS = {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#1C6DD0', // Main primary color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  accent: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#3FCA89', // Main accent color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FF9F43', // Main warning color
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#FF5A5A', // Main error color
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
};

export const FONTS = {
  light: 'System',
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const EXAM_TYPES = [
  'Midterm',
  'Final',
  'Quiz',
  'Assignment',
  'Project',
  'Test'
];

export const ACADEMIC_YEARS = [
  '2023-2024',
  '2022-2023',
  '2021-2022',
];

export const TERMS = [
  'Fall 2023',
  'Spring 2024',
  'Summer 2024',
  'Fall 2022',
  'Spring 2023',
  'Summer 2023',
];

export const GRADE_SCALE = {
  'A+': { min: 95, color: COLORS.accent[500] },
  'A': { min: 90, color: COLORS.accent[500] },
  'A-': { min: 85, color: COLORS.accent[400] },
  'B+': { min: 80, color: COLORS.primary[400] },
  'B': { min: 75, color: COLORS.primary[400] },
  'B-': { min: 70, color: COLORS.primary[300] },
  'C+': { min: 65, color: COLORS.warning[300] },
  'C': { min: 60, color: COLORS.warning[400] },
  'C-': { min: 55, color: COLORS.warning[500] },
  'D+': { min: 50, color: COLORS.warning[600] },
  'D': { min: 45, color: COLORS.error[300] },
  'F': { min: 0, color: COLORS.error[500] },
};