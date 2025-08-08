import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { Order } from '../models/Order';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * GET /api/orders
   * Lädt alle Bestellungen des Users
   */
  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      // Parse query parameters
      const { project_id, status } = req.query;
      const statusFilter = status ? (status as string).split(',') : undefined;
      
      const orders = await this.orderService.getUserOrders(
        req.user.id, 
        req.accessToken!, 
        project_id as string,
        statusFilter
      );

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders // orders ist bereits { orders: Order[] }
      });

    } catch (error) {
      console.error('Get user orders controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to load orders'
      });
    }
  };

  /**
   * GET /api/orders/:id
   * Lädt eine spezifische Bestellung mit Items
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Order ID is required'
        });
        return;
      }

      const order = await this.orderService.getOrderById(id, req.accessToken!);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });

    } catch (error) {
      console.error('Get order by ID controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to load order'
      });
    }
  };

  /**
   * PUT /api/orders/:id/status
   * Aktualisiert den Status einer Bestellung
   */
  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      if (!id || !status) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Order ID and status are required'
        });
        return;
      }

      // Validiere Status
      const validStatuses: Order['order_status'][] = [
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
      ];

      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }

      const updatedOrder = await this.orderService.updateOrderStatus(
        id,
        status,
        req.accessToken!,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
      });

    } catch (error) {
      console.error('Update order status controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to update order status'
      });
    }
  };
}