import { Router, Request, Response } from 'express';
import { ProductService, ProductFilters } from '../services/productService';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';
import { validateProductSearch, validateIdParam, userRateLimit } from '../middleware/securityValidation';

const router = Router();
const productService = new ProductService();

// ⚠️ SICHERHEIT: Meta-Endpunkte können optional authentifiziert sein
router.use('/meta', optionalAuth); // Filter-Optionen können öffentlich sein

/**
 * GET /api/products
 * Alle Produkte abrufen (mit optionaler Paginierung)
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('📦 Loading all products...');
    const limit = parseInt(req.query.limit as string) || 1000; // Erhöht von 50 auf 1000
    const offset = parseInt(req.query.offset as string) || 0;
    
    const products = await productService.getAllProducts(limit, offset);
    
    console.log(`✅ Loaded ${products.length} products`);
    res.json({
      success: true,
      message: 'Produkte erfolgreich geladen',
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Laden aller Produkte:', error);
    res.status(500).json({
      success: false,
      message: 'Produkte konnten nicht geladen werden',
      error: 'Produkte konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/search
 * Einfache Produktsuche (ÖFFENTLICH - KEINE AUTH)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Suchbegriff (q) ist erforderlich',
        error: 'Suchbegriff (q) ist erforderlich'
      });
    }

    const searchLimit = limit ? parseInt(limit as string) : 100; // Mehr Ergebnisse standardmäßig
    const products = await productService.simpleSearch(q, searchLimit);

    res.json({
      success: true,
      message: 'Produktsuche erfolgreich',
      data: {
        products,
        count: products.length,
        searchTerm: q
      }
    });
  } catch (error) {
    console.error('Fehler bei der Produktsuche:', error);
    res.status(500).json({
      success: false,
      message: 'Produktsuche fehlgeschlagen',
      error: 'Produktsuche fehlgeschlagen'
    });
  }
});

/**
 * GET /api/products/:id
 * Einzelnes Produkt nach ID
 */
router.get('/:id', validateIdParam('id'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produkt nicht gefunden',
        message: 'Produkt nicht gefunden'
      });
    }

    res.json({
      success: true,
      message: 'Produkt erfolgreich geladen',
      data: { product }
    });
  } catch (error) {
    console.error('Fehler beim Laden des Produkts:', error);
    res.status(500).json({
      success: false,
      error: 'Produkt konnte nicht geladen werden',
      message: 'Produkt konnte nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/item/:itemNumber
 * Einzelnes Produkt nach Artikelnummer
 */
router.get('/item/:itemNumber', async (req: Request, res: Response) => {
  try {
    const { itemNumber } = req.params;
    console.log(`🔍 API: Looking for product with item number: ${itemNumber}`);
    const product = await productService.getProductByItemNumber(itemNumber);

    if (!product) {
      console.log(`❌ API: Product not found for item number: ${itemNumber}`);
      return res.status(404).json({
        success: false,
        error: 'Produkt mit dieser Artikelnummer nicht gefunden',
        message: 'Produkt mit dieser Artikelnummer nicht gefunden'
      });
    }

    console.log(`✅ API: Returning product: ${product.vysn_name}`);
    res.json({
      success: true,
      message: 'Produkt erfolgreich geladen',
      data: { product }
    });
  } catch (error) {
    console.error('Fehler beim Laden des Produkts:', error);
    res.status(500).json({
      success: false,
      error: 'Produkt konnte nicht geladen werden',
      message: 'Produkt konnte nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/barcode/:barcodeNumber
 * Einzelnes Produkt nach Barcode-Nummer
 */
router.get('/barcode/:barcodeNumber', async (req: Request, res: Response) => {
  try {
    const { barcodeNumber } = req.params;
    const product = await productService.getProductByBarcode(barcodeNumber);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt mit dieser Barcode-Nummer nicht gefunden',
        error: 'Produkt mit dieser Barcode-Nummer nicht gefunden'
      });
    }

    res.json({ 
      success: true,
      message: 'Produkt erfolgreich gefunden',
      data: { product }
    });
  } catch (error) {
    console.error('Fehler beim Laden des Produkts:', error);
    res.status(500).json({
      success: false,
      message: 'Produkt konnte nicht geladen werden',
      error: 'Produkt konnte nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/categories
 * Alle verfügbaren Kategorien 1
 */
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
    res.status(500).json({
      error: 'Kategorien konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/categories2
 * Alle verfügbaren Kategorien 2
 */
router.get('/meta/categories2', async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories2();
    res.json({ categories });
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien 2:', error);
    res.status(500).json({
      error: 'Kategorien 2 konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/groups
 * Alle verfügbaren Gruppennamen
 */
router.get('/meta/groups', async (req: Request, res: Response) => {
  try {
    const groups = await productService.getGroupNames();
    res.json({ groups });
  } catch (error) {
    console.error('Fehler beim Laden der Gruppennamen:', error);
    res.status(500).json({
      error: 'Gruppennamen konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/colors
 * Alle verfügbaren Gehäusefarben
 */
router.get('/meta/colors', async (req: Request, res: Response) => {
  try {
    const colors = await productService.getHousingColors();
    res.json({ colors });
  } catch (error) {
    console.error('Fehler beim Laden der Gehäusefarben:', error);
    res.status(500).json({
      error: 'Gehäusefarben konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/energy-classes
 * Alle verfügbaren Energieklassen
 */
router.get('/meta/energy-classes', async (req: Request, res: Response) => {
  try {
    const energyClasses = await productService.getEnergyClasses();
    res.json({ energyClasses });
  } catch (error) {
    console.error('Fehler beim Laden der Energieklassen:', error);
    res.status(500).json({
      error: 'Energieklassen konnten nicht geladen werden'
    });
  }
});

/**
 * POST /api/products/search/lighting
 * Erweiterte Suche für Beleuchtungsprodukte (ÖFFENTLICH - KEINE AUTH)
 */
router.post('/search/lighting', async (req: Request, res: Response) => {
  try {
    const criteria = req.body;
    const limit = criteria.limit || 20;
    
    const products = await productService.searchByLightingCriteria(criteria, limit);

    res.json({
      products,
      count: products.length,
      criteria: criteria
    });
  } catch (error) {
    console.error('Fehler bei der erweiterten Beleuchtungssuche:', error);
    res.status(500).json({
      error: 'Erweiterte Beleuchtungssuche fehlgeschlagen'
    });
  }
});

/**
 * GET /api/products/:id/similar
 * Ähnliche Produkte zu einem gegebenen Produkt
 */
router.get('/:id/similar', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 10;
    
    const referenceProduct = await productService.getProductById(id);
    if (!referenceProduct) {
      return res.status(404).json({
        error: 'Referenzprodukt nicht gefunden'
      });
    }

    const similarProducts = await productService.findSimilarProducts(referenceProduct, limit);

    res.json({
      referenceProduct,
      similarProducts,
      count: similarProducts.length
    });
  } catch (error) {
    console.error('Fehler bei der Suche ähnlicher Produkte:', error);
    res.status(500).json({
      error: 'Suche ähnlicher Produkte fehlgeschlagen'
    });
  }
});

/**
 * POST /api/products/search/filtered
 * Erweiterte Produktsuche mit Filtern (ÖFFENTLICH - KEINE AUTH)
 */
router.post('/search/filtered', async (req: Request, res: Response) => {
  try {
    const filters = req.body;
    const result = await productService.searchWithFilters(filters);

    res.json({
      success: true,
      data: {
        products: result.products,
        total: result.total,
        count: result.products.length,
        filters: filters
      }
    });
  } catch (error) {
    console.error('Fehler bei der gefilterten Produktsuche:', error);
    res.status(500).json({
      success: false,
      message: 'Gefilterte Produktsuche fehlgeschlagen',
      error: 'Gefilterte Produktsuche fehlgeschlagen'
    });
  }
});

/**
 * GET /api/products/meta/ip-protection
 * Alle verfügbaren IP-Schutzklassen
 */
router.get('/meta/ip-protection', async (req: Request, res: Response) => {
  try {
    const ipClasses = await productService.getIngressProtectionClasses();
    res.json({ ipClasses });
  } catch (error) {
    console.error('Fehler beim Laden der IP-Schutzklassen:', error);
    res.status(500).json({
      error: 'IP-Schutzklassen konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/materials
 * Alle verfügbaren Materialien
 */
router.get('/meta/materials', async (req: Request, res: Response) => {
  try {
    const materials = await productService.getMaterials();
    res.json({ materials });
  } catch (error) {
    console.error('Fehler beim Laden der Materialien:', error);
    res.status(500).json({
      error: 'Materialien konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/led-types
 * Alle verfügbaren LED-Typen
 */
router.get('/meta/led-types', async (req: Request, res: Response) => {
  try {
    const ledTypes = await productService.getLedTypes();
    res.json({ ledTypes });
  } catch (error) {
    console.error('Fehler beim Laden der LED-Typen:', error);
    res.status(500).json({
      error: 'LED-Typen konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/installation-types
 * Alle verfügbaren Installationsarten
 */
router.get('/meta/installation-types', async (req: Request, res: Response) => {
  try {
    const installationTypes = await productService.getInstallationTypes();
    res.json({ installationTypes });
  } catch (error) {
    console.error('Fehler beim Laden der Installationsarten:', error);
    res.status(500).json({
      error: 'Installationsarten konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/ranges
 * Preis-, Leistungs- und Lichtstrom-Bereiche
 */
router.get('/meta/ranges', async (req: Request, res: Response) => {
  try {
    const ranges = await productService.getProductRanges();
    res.json({ ranges });
  } catch (error) {
    console.error('Fehler beim Laden der Produktbereiche:', error);
    res.status(500).json({
      error: 'Produktbereiche konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/products/meta/all
 * Alle verfügbaren Filter-Optionen in einem Aufruf
 */
router.get('/meta/all', async (req: Request, res: Response) => {
  try {
    console.log('🎛️ Loading all filter options...');
    
    const [
      categories,
      categories2,
      groups,
      colors,
      energyClasses,
      ipClasses,
      materials,
      ledTypes,
      installationTypes,
      ranges
    ] = await Promise.all([
      productService.getCategories(),
      productService.getCategories2(),
      productService.getGroupNames(),
      productService.getHousingColors(),
      productService.getEnergyClasses(),
      productService.getIngressProtectionClasses(),
      productService.getMaterials(),
      productService.getLedTypes(),
      productService.getInstallationTypes(),
      productService.getProductRanges()
    ]);

    console.log('✅ Filter options loaded:', {
      categories: categories.length,
      categories2: categories2.length,
      groups: groups.length,
      colors: colors.length,
      energyClasses: energyClasses.length,
      ipClasses: ipClasses.length,
      materials: materials.length,
      ledTypes: ledTypes.length,
      installationTypes: installationTypes.length
    });

    const result = {
      success: true,
      data: {
        categories: {
          category1: categories,
          category2: categories2,
          groups: groups
        },
        technical: {
          ipClasses,
          materials,
          colors,
          energyClasses,
          ledTypes,
          installationTypes
        },
        ranges
      }
    };

    res.json(result);
  } catch (error) {
    console.error('❌ Fehler beim Laden aller Filter-Optionen:', error);
    res.status(500).json({
      success: false,
      error: 'Filter-Optionen konnten nicht geladen werden',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as productsRouter }; 