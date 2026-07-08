import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Order } from './entities/order.entity';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicePdfService {
  generate(order: Order, invoice: Invoice): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc
      .fontSize(20)
      .text('AtarLab', { continued: true })
      .fontSize(10)
      .text('  Luxury Attar & Perfume', { align: 'left' });
    doc.moveDown();
    doc.fontSize(14).text(`Invoice ${invoice.invoiceNumber}`);
    doc.fontSize(10).text(`Order: ${order.orderNumber}`);
    doc.text(`Issued: ${invoice.issuedAt.toDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);
    for (const item of order.items) {
      doc
        .fontSize(10)
        .text(
          `${item.productNameSnapshot} (${item.variantSnapshot})  x${item.quantity}  —  ₹${item.lineTotal}`,
        );
    }

    doc.moveDown();
    doc.fontSize(10).text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Discount: -₹${order.discountTotal}`);
    doc.text(`Shipping: ₹${order.shippingFee}`);
    doc.text(`Tax: ₹${order.taxTotal}`);
    doc
      .fontSize(12)
      .text(`Grand Total: ₹${order.grandTotal}`, { underline: true });

    doc.end();
    return doc;
  }
}
