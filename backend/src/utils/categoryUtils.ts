import { supabase } from '../config/database';

/**
 * Erkennt allgemeine Kategorie-Anfragen und gibt Übersichten zurück
 */

export interface CategoryOverview {
  categoryType: string;
  categories: Array<{
    name: string;
    count: number;
    examples?: string[];
  }>;
  totalProducts: number;
}

/**
 * Erkennt ob es sich um eine allgemeine Kategorie-Anfrage handelt
 */
export function isCategoryOverviewRequest(message: string): string | null {
  const msg = message.toLowerCase();
  
  // Schienensystem-Anfragen
  if (msg.includes('schienensystem') || msg.includes('track system') || 
      (msg.includes('phase') && (msg.includes('schiene') || msg.includes('track')))) {
    return 'track_systems';
  }
  
  // Weitere Kategorie-Patterns
  if (msg.includes('welche') && (msg.includes('kategorien') || msg.includes('arten'))) {
    return 'general_categories';
  }
  
  return null;
}

/**
 * Erstellt Übersicht für Schienensysteme
 */
export async function getTrackSystemOverview(): Promise<CategoryOverview> {
  try {
    // Hole alle Track-System Kategorien
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('category_2, group_name')
      .eq('availability', true)
      .ilike('category_2', '%track%');

    if (error) throw error;

    // Gruppiere nach Kategorien
    const categoryMap = new Map<string, number>();
    const products = allProducts || [];
    
    products.forEach(p => {
      if (p.category_2) {
        categoryMap.set(p.category_2, (categoryMap.get(p.category_2) || 0) + 1);
      }
    });

    // Erstelle Kategorie-Array
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      examples: [] // Könnte später mit Beispielprodukten erweitert werden
    }));

    return {
      categoryType: 'track_systems',
      categories,
      totalProducts: products.length
    };
    
  } catch (error) {
    console.error('Fehler beim Laden der Track-System Übersicht:', error);
    return {
      categoryType: 'track_systems',
      categories: [],
      totalProducts: 0
    };
  }
}

/**
 * Formatiert Kategorie-Übersicht zu lesbarem Text
 */
export function formatCategoryOverview(overview: CategoryOverview): string {
  if (overview.categories.length === 0) {
    return 'Leider haben wir derzeit keine Produkte in dieser Kategorie.';
  }

  let response = '';
  
  if (overview.categoryType === 'track_systems') {
    response = `Ja, wir haben verschiedene Schienensysteme! Insgesamt ${overview.totalProducts} Produkte in ${overview.categories.length} Kategorien:\n\n`;
    
    overview.categories.forEach((cat, index) => {
      response += `${index + 1}. **${cat.name}** (${cat.count} Produkte)\n`;
    });
    
    response += `\nWovon möchtest du mehr wissen? Einfach eine der Kategorien nennen!`;
  }
  
  return response;
}

/**
 * Erkennt spezifische Track-System Anfragen für Follow-up
 */
export function extractSpecificTrackSystemRequest(message: string): string | null {
  const msg = message.toLowerCase();
  
  if (msg.includes('1 phase') || msg.includes('einphasen')) {
    return '1 circuit track system luminaires';
  }
  if (msg.includes('3 phase') || msg.includes('dreiphasen')) {
    return '3 circuit track system luminaires';
  }
  
  return null;
} 