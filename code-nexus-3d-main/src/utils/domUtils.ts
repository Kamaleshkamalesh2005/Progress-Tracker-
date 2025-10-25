/**
 * Safe DOM manipulation utilities to prevent deferred DOM node errors
 */

/**
 * Safely creates and triggers a download link
 * @param blob - The blob to download
 * @param filename - The filename for the download
 * @returns Promise that resolves when download is complete
 */
export const safeDownloadBlob = async (blob: Blob, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !document) {
        reject(new Error('Not in browser environment'));
        return;
      }

      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up immediately
      setTimeout(() => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
          resolve();
        } catch (cleanupError) {
          console.warn('Cleanup error (non-critical):', cleanupError);
          resolve(); // Still resolve as the download likely succeeded
        }
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      reject(error);
    }
  });
};

/**
 * Safely checks if an element exists in the DOM
 * @param element - The element to check
 * @returns boolean indicating if element is in DOM
 */
export const isElementInDOM = (element: Element | null): boolean => {
  if (!element) return false;
  
  try {
    return document.body.contains(element);
  } catch {
    return false;
  }
};

/**
 * Safely removes an element from DOM
 * @param element - The element to remove
 * @returns boolean indicating if removal was successful
 */
export const safeRemoveElement = (element: Element | null): boolean => {
  if (!element) return false;
  
  try {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
