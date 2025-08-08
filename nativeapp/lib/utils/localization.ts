import { VysnProduct } from '../types/product';

/**
 * Utility function to get localized product category names
 * This can be extended to include German translations for category names
 */
export function getLocalizedCategoryName(category: string, language: string = 'en'): string {
  const categoryTranslations: Record<string, Record<string, string>> = {
    'en': {
      // Add category translations if needed
    },
    'de': {
      // Add German category translations if needed
    }
  };

  return categoryTranslations[language]?.[category] || category;
}

/**
 * Utility function to format product specifications in the current language
 */
export function formatProductSpecs(product: VysnProduct, language: string = 'en'): string {
  const specs: string[] = [];
  
  if (product.wattage) {
    specs.push(`${product.wattage}W`);
  }
  
  if (product.cct) {
    specs.push(`${product.cct}K`);
  }
  
  if (product.lumen) {
    const lumenLabel = language === 'de' ? 'Lumen' : 'lm';
    specs.push(`${product.lumen} ${lumenLabel}`);
  }
  
  return specs.join(' • ');
}

/**
 * Get localized status text for projects
 */
export function getLocalizedStatus(status: string, t: (key: string) => string): string {
  const statusMap: Record<string, string> = {
    'planning': t('projects.planning'),
    'in_progress': t('projects.inProgress'),
    'completed': t('projects.completed'),
    'on_hold': t('projects.onHold'),
  };
  
  return statusMap[status] || status;
}

/**
 * Get localized priority text for projects
 */
export function getLocalizedPriority(priority: string, t: (key: string) => string): string {
  const priorityMap: Record<string, string> = {
    'high': t('projects.high'),
    'medium': t('projects.medium'),
    'low': t('projects.low'),
  };
  
  return priorityMap[priority] || priority;
}