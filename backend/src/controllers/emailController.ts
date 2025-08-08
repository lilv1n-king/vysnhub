import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { ProjectService } from '../services/projectService';
import { ProductService } from '../services/productService';
import { OrderService } from '../services/orderService';
import { CreateOrderData, CreateOrderItemData } from '../models/Order';

const projectService = new ProjectService();
const productService = new ProductService();
const orderService = new OrderService();

export class EmailController {
  /**
   * POST /api/email/order
   * Sendet eine Bestell-E-Mail basierend auf einem Projekt
   */
  sendOrderEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, customerInfo, orderNotes, isReorder = false, reorderItems = [] } = req.body;

      // Validierung
      if (!projectId || !customerInfo?.name || !customerInfo?.email) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'projectId, customerInfo.name and customerInfo.email are required'
        });
        return;
      }

      console.log(`📧 Processing ${isReorder ? 'reorder' : 'order'} email for project: ${projectId}`);

      // Prüfen ob Projekt bereits bestellt wurde (nur bei Erstbestellungen)
      if (!isReorder) {
        const isAlreadyOrdered = await orderService.isProjectAlreadyOrdered(projectId, req.accessToken!);
        if (isAlreadyOrdered) {
          res.status(400).json({
            success: false,
            error: 'Project already ordered',
            message: 'This project has already been ordered. Use reorder functionality for additional items.'
          });
          return;
        }
      }

      // Projekt laden
      const project = await projectService.getProjectById(projectId, req.user!.id, req.accessToken!);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
          message: `Project with ID ${projectId} not found`
        });
        return;
      }

      // Produkte extrahieren - bei Reorder nur die angegebenen Items, sonst alle
      const products = isReorder && reorderItems.length > 0
        ? await this.extractReorderProducts(reorderItems, project)
        : await this.extractProductsFromProject(project);
      
      if (products.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No products found',
          message: isReorder ? 'No reorder items specified' : 'Project contains no products to order'
        });
        return;
      }

      // Gesamtsumme berechnen
      const orderTotal = products.reduce((total, product) => total + product.totalPrice, 0);

      // 1. Bestellung in Datenbank speichern
      console.log('💾 Saving order to database...');
      
      const orderData: CreateOrderData = {
        user_id: req.user!.id,
        project_id: projectId,
        order_status: 'pending',
        order_type: isReorder ? 'reorder' : 'standard',
        subtotal: orderTotal,
        total_amount: orderTotal,
        customer_notes: orderNotes || `${isReorder ? 'Nachbestellung' : 'Bestellung'} über VYSN Hub App\nProjekt: ${project.project_name}`,
        internal_notes: `${isReorder ? 'Automatische Nachbestellung' : 'Automatische Bestellung'} via Email-Service\nKunde: ${customerInfo.name} (${customerInfo.email})`
      };

      // Nur Produkte mit gültiger productId für die Datenbank verwenden
      const validProducts = products.filter(product => product.productId && product.productId > 0);
      const invalidProducts = products.filter(product => !product.productId || product.productId <= 0);
      
      if (invalidProducts.length > 0) {
        console.warn('⚠️ Skipping products without valid product_id:', 
          invalidProducts.map(p => p.itemNumber).join(', '));
      }
      
      if (validProducts.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid products found',
          message: `No products with valid product IDs found. Invalid products: ${invalidProducts.map(p => p.itemNumber).join(', ')}`
        });
        return;
      }

      const orderItemsData: CreateOrderItemData[] = validProducts.map(product => ({
        product_id: product.productId,
        quantity: product.quantity,
        unit_price: product.unitPrice,
        line_total: product.totalPrice,
        product_name: product.name,
        product_sku: product.itemNumber
      }));

      const { order, items } = await orderService.createOrder(orderData, orderItemsData, req.accessToken!);
      console.log(`✅ Order saved with ID: ${order.id} (${order.order_number})`);

      // 2. E-Mail-Daten zusammenstellen (mit Order-Nummer)
      const orderEmailData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerCompany: customerInfo.company,
        project,
        products,
        orderTotal,
        orderNotes: orderNotes || undefined,
        orderNumber: order.order_number,
        orderId: order.id
      };

      // 3. E-Mail senden
      const emailSent = await emailService.sendOrderEmail(orderEmailData);

      if (emailSent) {
        console.log(`✅ Order email sent successfully for project: ${project.project_name}`);
        res.status(200).json({
          success: true,
          message: 'Order created and email sent successfully',
          data: {
            orderId: order.id,
            orderNumber: order.order_number,
            projectName: project.project_name,
            productCount: products.length,
            orderTotal,
            recipient: process.env.ORDER_RECIPIENT_EMAIL || 'levin.normann98@gmail.com'
          }
        });
      } else {
        // Bei Email-Fehler: Order Status auf 'cancelled' setzen aber nicht löschen
        await orderService.updateOrderStatus(order.id, 'cancelled', req.accessToken!, 'Email sending failed');
        
        res.status(500).json({
          success: false,
          error: 'Email sending failed',
          message: 'Order was saved but email could not be sent',
          data: {
            orderId: order.id,
            orderNumber: order.order_number
          }
        });
      }

    } catch (error) {
      console.error('❌ Order email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to send order email'
      });
    }
  };

  /**
   * POST /api/email/test
   * Sendet eine Test-E-Mail
   */
  sendTestEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🧪 Sending test email...');
      
      const emailSent = await emailService.sendTestEmail();

      if (emailSent) {
        res.status(200).json({
          success: true,
          message: 'Test email sent successfully',
          data: {
            recipient: process.env.ORDER_RECIPIENT_EMAIL || 'levin.normann98@gmail.com'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Email sending failed',
          message: 'Failed to send test email'
        });
      }

    } catch (error) {
      console.error('❌ Test email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to send test email'
      });
    }
  };

  /**
   * Extrahiert Produkte aus Projekt-Notizen und lädt Produktdaten
   */
  private async extractProductsFromProject(project: any): Promise<Array<{
    itemNumber: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId?: number;
  }>> {
    const products: Array<{
      itemNumber: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productId?: number;
    }> = [];
    
    if (!project.project_notes) {
      return products;
    }

    const lines = project.project_notes.split('\n');
    
    for (const line of lines) {
      // Pattern: "5x LED Strip V104100T2W (V104100T2W)"
      const match = line.match(/•?\s*(\d+)x\s+(.+?)\s+\(([^)]+)\)/);
      if (match) {
        const [, quantityStr, productName, itemNumber] = match;
        const quantity = parseInt(quantityStr);
        
        try {
          // Produktdaten vom Service laden
          const productData = await productService.getProductByItemNumber(itemNumber.trim());
          
          if (productData) {
            const unitPrice = productData.gross_price || 0;
            const customerDiscountPercentage = project.customer_discount || 0;
            const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
            const totalPrice = customerPrice * quantity;

            products.push({
              itemNumber: itemNumber.trim(),
              name: productName.trim(),
              quantity,
              unitPrice: customerPrice,
              totalPrice,
              productId: productData.id
            });
          } else {
            console.warn(`⚠️ Product not found: ${itemNumber}`);
            // Fallback: Produkt ohne Preise hinzufügen
            products.push({
              itemNumber: itemNumber.trim(),
              name: productName.trim(),
              quantity,
              unitPrice: 0,
              totalPrice: 0
            });
          }
        } catch (error) {
          console.error(`❌ Error loading product ${itemNumber}:`, error);
          // Fallback: Produkt ohne Preise hinzufügen
          products.push({
            itemNumber: itemNumber.trim(),
            name: productName.trim(),
            quantity,
            unitPrice: 0,
            totalPrice: 0
          });
        }
      }
    }

    return products;
  }

  /**
   * Extrahiert nur die spezifizierten Reorder-Produkte
   */
  private async extractReorderProducts(reorderItems: Array<{
    itemNumber: string;
    quantity: number;
    name?: string;
  }>, project: any): Promise<Array<{
    itemNumber: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId?: number;
  }>> {
    const products: Array<{
      itemNumber: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productId?: number;
    }> = [];

    for (const item of reorderItems) {
      try {
        // Produktdaten vom Service laden
        const productData = await productService.getProductByItemNumber(item.itemNumber.trim());
        
        if (productData) {
          const unitPrice = productData.gross_price || 0;
          const customerDiscountPercentage = project.customer_discount || 0;
          const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
          const totalPrice = customerPrice * item.quantity;

          products.push({
            itemNumber: item.itemNumber.trim(),
            name: item.name || productData.vysn_name || `Product ${item.itemNumber}`,
            quantity: item.quantity,
            unitPrice: customerPrice,
            totalPrice,
            productId: productData.id
          });
        } else {
          console.warn(`⚠️ Reorder product not found: ${item.itemNumber}`);
          // Fallback: Produkt ohne Preise hinzufügen (wird später gefiltert)
          products.push({
            itemNumber: item.itemNumber.trim(),
            name: item.name || `Product ${item.itemNumber}`,
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
            productId: null // Explizit null für Filterung
          });
        }
      } catch (error) {
        console.error(`❌ Error loading reorder product ${item.itemNumber}:`, error);
        // Fallback: Produkt ohne Preise hinzufügen (wird später gefiltert)
        products.push({
          itemNumber: item.itemNumber.trim(),
          name: item.name || `Product ${item.itemNumber}`,
          quantity: item.quantity,
          unitPrice: 0,
          totalPrice: 0,
          productId: null // Explizit null für Filterung
        });
      }
    }

    return products;
  }

  /**
   * POST /api/email/cart-order
   * Sendet eine Bestell-E-Mail basierend auf einem Warenkorb
   */
  sendCartOrderEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerInfo, cartItems, orderNotes, totalAmount } = req.body;

      // Validierung
      if (!customerInfo?.name || !customerInfo?.email || !cartItems || cartItems.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'customerInfo (name, email) and cartItems are required'
        });
        return;
      }

      // Berechne Gesamtsumme falls nicht übergeben
      const calculatedTotal = cartItems.reduce((total: number, item: any) => total + item.totalPrice, 0);
      const orderTotal = totalAmount || calculatedTotal;

      // 1. Bestellung in Datenbank speichern
      console.log('💾 Saving cart order to database...');
      const orderData: CreateOrderData = {
        user_id: req.user!.id,
        order_status: 'pending',
        order_type: 'standard',
        subtotal: orderTotal,
        total_amount: orderTotal,
        customer_notes: orderNotes || `Warenkorb-Bestellung über VYSN Hub App\nAnzahl Artikel: ${cartItems.length}`,
        internal_notes: `Warenkorb-Bestellung via Email-Service\nKunde: ${customerInfo.name} (${customerInfo.email})`
      };

      const orderItemsData: CreateOrderItemData[] = cartItems.map((item: any) => ({
        product_id: item.productId || 0,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.totalPrice,
        product_name: item.productName,
        product_sku: item.itemNumber
      }));

      const { order, items } = await orderService.createOrder(orderData, orderItemsData, req.accessToken!);
      console.log(`✅ Cart order saved with ID: ${order.id} (${order.order_number})`);

      // 2. E-Mail-Daten zusammenstellen
      const orderEmailData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerCompany: customerInfo.company,
        orderNotes: orderNotes || '',
        project: {
          project_name: `Warenkorb-Bestellung ${order.order_number}`,
          project_description: 'Direkte Bestellung über Warenkorb',
          project_notes: `Warenkorb-Artikel:\n${cartItems.map((item: any) => 
            `- ${item.quantity}x ${item.productName} (${item.itemNumber})`
          ).join('\n')}`
        },
        products: cartItems.map((item: any) => ({
          name: item.productName,
          itemNumber: item.itemNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productId: item.productId
        })),
        orderTotal: orderTotal,
        orderNumber: order.order_number,
        orderId: order.id
      };

      // 3. E-Mail senden
      const emailSent = await emailService.sendOrderEmail(orderEmailData);

      if (emailSent) {
        res.json({
          success: true,
          message: 'Warenkorb-Bestellung erfolgreich versendet',
          orderNumber: order.order_number,
          orderId: order.id
        });
        console.log(`✅ Cart order email sent for order ${order.order_number}`);
      } else {
        await orderService.updateOrderStatus(order.id, 'cancelled', req.accessToken!, 'Email sending failed');
        res.status(500).json({
          success: false,
          error: 'E-Mail konnte nicht gesendet werden',
          message: 'Die Bestell-E-Mail konnte nicht versendet werden'
        });
      }
    } catch (error) {
      console.error('❌ Error sending cart order email:', error);
      res.status(500).json({
        success: false,
        error: 'Interner Server-Fehler',
        message: 'Die Warenkorb-Bestellung konnte nicht verarbeitet werden'
      });
    }
  };
}