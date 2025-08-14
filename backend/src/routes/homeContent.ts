import { Router, Request, Response } from 'express';
import { HomeContentService } from '../services/homeContentService';
import { optionalAuth, authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();
const homeContentService = new HomeContentService();

/**
 * GET /api/home-content/events
 * Get active events for home screen
 */
router.get('/events', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('📅 Loading home screen events...');
    const events = await homeContentService.getActiveEvents();
    
    console.log(`✅ Loaded ${events.length} active events`);
    res.json({
      success: true,
      message: 'Events erfolgreich geladen',
      data: {
        events,
        count: events.length
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Laden der Events:', error);
    res.status(500).json({
      success: false,
      message: 'Events konnten nicht geladen werden',
      error: 'Events konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/home-content/highlights
 * Get active highlights for home screen
 * Query params: ?lang=de|en (defaults to 'de')
 */
router.get('/highlights', optionalAuth, async (req: Request, res: Response) => {
  try {
    const language = (req.query.lang as string) || 'de';
    console.log(`✨ Loading home screen highlights for language: ${language}...`);
    
    const highlights = await homeContentService.getActiveHighlights(language);
    
    console.log(`✅ Loaded ${highlights.length} active highlights for ${language}`);
    res.json({
      success: true,
      message: 'Highlights erfolgreich geladen',
      data: {
        highlights,
        count: highlights.length,
        language
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Laden der Highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Highlights konnten nicht geladen werden',
      error: 'Highlights konnten nicht geladen werden'
    });
  }
});

/**
 * GET /api/home-content
 * Get all home screen content (events + highlights)
 * Query params: ?lang=de|en (defaults to 'de')
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const language = (req.query.lang as string) || 'de';
    console.log(`🏠 Loading all home screen content for language: ${language}...`);
    
    const [events, highlights] = await Promise.all([
      homeContentService.getActiveEvents(),
      homeContentService.getActiveHighlights(language)
    ]);
    
    console.log(`✅ Loaded ${events.length} events and ${highlights.length} highlights for ${language}`);
    res.json({
      success: true,
      message: 'Home Content erfolgreich geladen',
      data: {
        events,
        highlights,
        totalEvents: events.length,
        totalHighlights: highlights.length,
        language
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Laden des Home Contents:', error);
    res.status(500).json({
      success: false,
      message: 'Home Content konnte nicht geladen werden',
      error: 'Home Content konnte nicht geladen werden'
    });
  }
});

// ====== ADMIN ROUTES ======
// All admin routes for home content management

/**
 * GET /api/home-content/admin/highlights
 * Get all highlights (including inactive) for admin management
 */
router.get('/admin/highlights', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔧 Admin: Loading all highlights for management...');
    
    const highlights = await homeContentService.getAllHighlights();
    
    console.log(`✅ Admin: Loaded ${highlights.length} highlights (including inactive)`);
    res.json({
      success: true,
      message: 'All highlights loaded for admin',
      data: highlights
    });
  } catch (error) {
    console.error('❌ Admin error loading highlights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load highlights for admin',
      message: 'Database error occurred'
    });
  }
});

/**
 * POST /api/home-content/admin/highlights
 * Create new highlight
 */
router.post('/admin/highlights', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔧 Admin: Creating new highlight...');
    
    const highlightData = req.body;
    const highlight = await homeContentService.createHighlight(highlightData);
    
    console.log(`✅ Admin: Created highlight with ID: ${highlight.id}`);
    res.status(201).json({
      success: true,
      message: 'Highlight created successfully',
      data: highlight
    });
  } catch (error) {
    console.error('❌ Admin error creating highlight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create highlight',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/home-content/admin/highlights/:id
 * Update existing highlight
 */
router.put('/admin/highlights/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`🔧 Admin: Updating highlight ${id}...`);
    
    const highlight = await homeContentService.updateHighlight(id, updateData);
    
    console.log(`✅ Admin: Updated highlight ${id}`);
    res.json({
      success: true,
      message: 'Highlight updated successfully',
      data: highlight
    });
  } catch (error) {
    console.error(`❌ Admin error updating highlight:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update highlight',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/home-content/admin/highlights/:id
 * Delete highlight
 */
router.delete('/admin/highlights/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`🔧 Admin: Deleting highlight ${id}...`);
    
    await homeContentService.deleteHighlight(id);
    
    console.log(`✅ Admin: Deleted highlight ${id}`);
    res.json({
      success: true,
      message: 'Highlight deleted successfully'
    });
  } catch (error) {
    console.error(`❌ Admin error deleting highlight:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete highlight',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/home-content/admin/highlights/:id/toggle
 * Toggle highlight active status
 */
router.put('/admin/highlights/:id/toggle', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`🔧 Admin: Toggling highlight ${id} status...`);
    
    const highlight = await homeContentService.toggleHighlightStatus(id);
    
    console.log(`✅ Admin: Toggled highlight ${id} to ${highlight.is_active ? 'active' : 'inactive'}`);
    res.json({
      success: true,
      message: `Highlight ${highlight.is_active ? 'activated' : 'deactivated'} successfully`,
      data: highlight
    });
  } catch (error) {
    console.error(`❌ Admin error toggling highlight:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle highlight status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/home-content/admin/highlights/reorder
 * Update sort order for multiple highlights
 */
router.put('/admin/highlights/reorder', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { highlights } = req.body; // Array of {id, sort_order}
    
    console.log(`🔧 Admin: Reordering ${highlights.length} highlights...`);
    
    await homeContentService.reorderHighlights(highlights);
    
    console.log(`✅ Admin: Reordered highlights successfully`);
    res.json({
      success: true,
      message: 'Highlights reordered successfully'
    });
  } catch (error) {
    console.error(`❌ Admin error reordering highlights:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder highlights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as homeContentRouter };