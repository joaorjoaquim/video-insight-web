import dayjs from 'dayjs';

export function formatSubmissionDate(isoDateString: string): string {
  if (!isoDateString) return '';
  
  try {
    const date = dayjs(isoDateString);
    
    // Check if date is valid
    if (!date.isValid()) {
      return '';
    }
    
    return `Submitted on ${date.format('MMM D, YYYY')}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
} 