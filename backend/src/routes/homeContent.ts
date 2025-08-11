import { Router, Request, Response } from 'express';
import { HomeContentService } from '../services/homeContentService';
import { optionalAuth } from '../middleware/authMiddleware';

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
 */
router.get('/highlights', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('✨ Loading home screen highlights...');
    const highlights = await homeContentService.getActiveHighlights();
    
    console.log(`✅ Loaded ${highlights.length} active highlights`);
    res.json({
      success: true,
      message: 'Highlights erfolgreich geladen',
      data: {
        highlights,
        count: highlights.length
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
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('🏠 Loading all home screen content...');
    const [events, highlights] = await Promise.all([
      homeContentService.getActiveEvents(),
      homeContentService.getActiveHighlights()
    ]);
    
    console.log(`✅ Loaded ${events.length} events and ${highlights.length} highlights`);
    res.json({
      success: true,
      message: 'Home Content erfolgreich geladen',
      data: {
        events,
        highlights,
        totalEvents: events.length,
        totalHighlights: highlights.length
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

export { router as homeContentRouter };