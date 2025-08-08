import { Router, Request, Response } from 'express';
import { ScanTrackingService } from '../services/scanTrackingService';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';

const router = Router();
const scanTrackingService = new ScanTrackingService();

/**
 * POST /api/scan-tracking
 * Neuen Scan-Event erstellen
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      scannedCode,
      scanType = 'barcode',
      scanSource = 'native_app',
      deviceInfo,
      latitude,
      longitude,
      locationAccuracy,
      sessionId,
      actionTaken
    } = req.body;

    if (!scannedCode) {
      return res.status(400).json({
        success: false,
        message: 'scannedCode ist erforderlich',
        error: 'scannedCode ist erforderlich'
      });
    }

    const scanData = {
      scannedCode,
      scanType,
      scanSource,
      deviceInfo,
      latitude,
      longitude,
      locationAccuracy,
      sessionId,
      actionTaken
    };

    const scanRecord = await scanTrackingService.createScanRecord(scanData);

    if (!scanRecord) {
      throw new Error('Scan-Record ist undefined');
    }

    res.status(201).json({
      success: true,
      message: 'Scan erfolgreich gespeichert',
      data: {
        scanId: scanRecord.id,
        scanRecord: scanRecord
      }
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Scans:', error);
    res.status(500).json({
      success: false,
      message: 'Scan konnte nicht gespeichert werden',
      error: 'Scan konnte nicht gespeichert werden'
    });
  }
});

/**
 * GET /api/scan-tracking/all
 * Alle Scans abrufen (benötigt Admin-Rechte)
 */
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Prüfen ob Benutzer Admin ist
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Admin-Rechte erforderlich'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    const scans = await scanTrackingService.getAllScans(
      parseInt(limit as string), 
      parseInt(offset as string)
    );

    res.json({
      scans,
      count: scans.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen aller Scans:', error);
    res.status(500).json({
      error: 'Scans konnten nicht abgerufen werden'
    });
  }
});

/**
 * GET /api/scan-tracking/session/:sessionId
 * Scans einer Session abrufen (für anonyme Benutzer)
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const scans = await scanTrackingService.getSessionScans(
      sessionId,
      parseInt(limit as string), 
      parseInt(offset as string)
    );

    res.json({
      scans,
      count: scans.length,
      sessionId
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Session-Scans:', error);
    res.status(500).json({
      error: 'Session-Scans konnten nicht abgerufen werden'
    });
  }
});

/**
 * GET /api/scan-tracking/stats
 * Allgemeine Scan-Statistiken (erfordert Admin-Rechte)
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Prüfen ob Benutzer Admin ist
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Admin-Rechte erforderlich'
      });
    }

    const { period = '7d' } = req.query;
    const stats = await scanTrackingService.getScanStatistics(period as string);

    res.json(stats);
  } catch (error) {
    console.error('Fehler beim Abrufen der Scan-Statistiken:', error);
    res.status(500).json({
      error: 'Statistiken konnten nicht abgerufen werden'
    });
  }
});

/**
 * GET /api/scan-tracking/popular-codes
 * Meist gescannte Codes
 */
router.get('/popular-codes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Admin-Rechte erforderlich'
      });
    }

    const { limit = 20 } = req.query;
    const popularCodes = await scanTrackingService.getPopularCodes(parseInt(limit as string));

    res.json({
      popularCodes,
      count: popularCodes.length
    });
  } catch (error) {
    console.error('Fehler beim Abrufen populärer Codes:', error);
    res.status(500).json({
      error: 'Populäre Codes konnten nicht abgerufen werden'
    });
  }
});

/**
 * PUT /api/scan-tracking/:scanId
 * Scan-Record aktualisieren (z.B. actionTaken hinzufügen)
 */
router.put('/:scanId', async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;
    const { actionTaken, productFound, searchResultsCount } = req.body;

    const updateData: any = {};
    
    if (actionTaken !== undefined) updateData.actionTaken = actionTaken;
    if (productFound !== undefined) updateData.productFound = productFound;
    if (searchResultsCount !== undefined) updateData.searchResultsCount = searchResultsCount;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Keine Update-Daten bereitgestellt'
      });
    }

    const updated = await scanTrackingService.updateScanRecord(scanId, updateData);

    if (!updated) {
      return res.status(404).json({
        error: 'Scan-Record nicht gefunden'
      });
    }

    res.json({
      success: true,
      message: 'Scan-Record erfolgreich aktualisiert'
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Scan-Records:', error);
    res.status(500).json({
      error: 'Scan-Record konnte nicht aktualisiert werden'
    });
  }
});

export { router as scanTrackingRouter };