import { Linking, Alert } from 'react-native';
import { HomeHighlight } from '../types/homeContent';

export interface NavigationHandler {
  navigate: (screen: string, params?: any) => void;
}

/**
 * Handle highlight action based on action_type (simplified version without file downloads)
 */
export const handleHighlightAction = async (
  highlight: HomeHighlight,
  navigation: NavigationHandler
): Promise<void> => {
  try {
    const actionType = highlight.action_type || 'none';
    const actionParams = highlight.action_params || {};

    switch (actionType) {
      case 'product':
        await handleProductNavigation(highlight, navigation);
        break;
        
      case 'external_link':
        await handleExternalLink(actionParams.url);
        break;
        
      case 'internal_link':
        await handleInternalNavigation(actionParams, navigation);
        break;
        
      case 'download':
        await handleSimpleDownload(actionParams.url);
        break;
        
      case 'none':
      default:
        // No action - just display the highlight
        console.log('No action configured for highlight:', highlight.title);
        break;
    }
  } catch (error) {
    console.error('Error handling highlight action:', error);
    Alert.alert(
      'Fehler',
      'Die Aktion konnte nicht ausgeführt werden. Bitte versuchen Sie es später erneut.'
    );
  }
};

/**
 * Handle product navigation (legacy product_id or new action_params)
 */
const handleProductNavigation = async (
  highlight: HomeHighlight,
  navigation: NavigationHandler
): Promise<void> => {
  const { action_params, product_id, product } = highlight;
  
  // Priority: action_params.item_number > action_params.product_id > legacy product_id > product object
  if (action_params?.item_number) {
    navigation.navigate('ProductDetail', { itemNumber: action_params.item_number });
  } else if (action_params?.product_id) {
    navigation.navigate('ProductDetail', { productId: action_params.product_id });
  } else if (product_id) {
    navigation.navigate('ProductDetail', { productId: product_id });
  } else if (product?.itemNumberVysn || product?.item_number_vysn) {
    const itemNumber = product.itemNumberVysn || product.item_number_vysn;
    navigation.navigate('ProductDetail', { itemNumber });
  } else {
    throw new Error('No product reference found in highlight');
  }
};

/**
 * Handle external link opening
 */
const handleExternalLink = async (url?: string): Promise<void> => {
  if (!url) {
    throw new Error('No URL provided for external link');
  }
  
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    throw new Error(`Cannot open URL: ${url}`);
  }
};

/**
 * Handle internal app navigation
 */
const handleInternalNavigation = async (
  actionParams: any,
  navigation: NavigationHandler
): Promise<void> => {
  const { screen, params } = actionParams;
  
  if (!screen) {
    throw new Error('No screen specified for internal navigation');
  }
  
  navigation.navigate(screen, params);
};

/**
 * Handle simple download (just open URL in browser)
 */
const handleSimpleDownload = async (url?: string): Promise<void> => {
  if (!url) {
    throw new Error('No URL provided for download');
  }
  
  Alert.alert(
    'Download', 
    'Datei wird im Browser geöffnet.',
    [
      { text: 'Abbrechen', style: 'cancel' },
      { 
        text: 'Öffnen', 
        onPress: async () => {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Fehler', 'URL kann nicht geöffnet werden.');
          }
        }
      }
    ]
  );
};

/**
 * Get appropriate icon for highlight based on action_type and badge_type
 */
export const getHighlightIcon = (highlight: HomeHighlight): string => {
  if (highlight.action_type) {
    switch (highlight.action_type) {
      case 'product':
        return '📦';
      case 'external_link':
        return '🔗';
      case 'internal_link':
        return '📱';
      case 'download':
        return '⬇️';
      default:
        return '✨';
    }
  }
  
  // Fallback to badge_type
  switch (highlight.badge_type) {
    case 'new_release':
      return '🎉';
    case 'new_product':
      return '⭐';
    case 'catalog':
      return '📚';
    case 'event':
      return '📅';
    case 'featured':
    default:
      return '✨';
  }
};
