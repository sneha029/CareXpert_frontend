import DOMPurify from 'dompurify';

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
};

export const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Allow relative paths (start with / or ./ or ../)
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '/placeholder.svg';
  } catch {
    // If URL parsing fails, treat as relative path
    return url;
  }
};
