import { Linking, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { HomeHighlight } from '../types/homeContent';

export interface NavigationHandler {
  navigate: (screen: string, params?: any) => void;
}

/**
 * Handle highlight action based on action_type
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
        await handleDownload(actionParams.url, actionParams.filename);
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
    // Navigate to Products Tab first, then to ProductDetail
    navigation.navigate('Products', { 
      screen: 'ProductsList',
      initial: false
    });
    // Small delay to ensure Products tab is loaded, then navigate to detail
    setTimeout(() => {
      navigation.navigate('Products', { 
        screen: 'ProductDetail', 
        params: { id: action_params.item_number } 
      });
    }, 100);
  } else if (action_params?.product_id) {
    navigation.navigate('Products', { 
      screen: 'ProductsList',
      initial: false
    });
    setTimeout(() => {
      navigation.navigate('Products', { 
        screen: 'ProductDetail', 
        params: { id: action_params.product_id.toString() } 
      });
    }, 100);
  } else if (product_id) {
    navigation.navigate('Products', { 
      screen: 'ProductsList',
      initial: false
    });
    setTimeout(() => {
      navigation.navigate('Products', { 
        screen: 'ProductDetail', 
        params: { id: product_id.toString() } 
      });
    }, 100);
  } else if (product?.itemNumberVysn || product?.item_number_vysn) {
    const itemNumber = product.itemNumberVysn || product.item_number_vysn;
    navigation.navigate('Products', { 
      screen: 'ProductsList',
      initial: false
    });
    setTimeout(() => {
      navigation.navigate('Products', { 
        screen: 'ProductDetail', 
        params: { id: itemNumber } 
      });
    }, 100);
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
 * Handle file download and sharing
 */
const handleDownload = async (url?: string, filename?: string): Promise<void> => {
  if (!url) {
    throw new Error('No URL provided for download');
  }
  
  try {
    // Generate filename if not provided
    const downloadFilename = filename || url.split('/').pop() || 'download';
    const fileUri = FileSystem.documentDirectory + downloadFilename;
    
    // Download the file
    Alert.alert('Download', 'Datei wird heruntergeladen...');
    
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    
    if (downloadResult.status !== 200) {
      throw new Error('Download failed with status: ' + downloadResult.status);
    }
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: getMimeType(downloadFilename),
        dialogTitle: 'Datei teilen'
      });
    } else {
      Alert.alert(
        'Download abgeschlossen',
        `Datei wurde heruntergeladen: ${downloadFilename}`
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Download fehlgeschlagen');
  }
};

/**
 * Get MIME type based on file extension
 */
const getMimeType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
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
