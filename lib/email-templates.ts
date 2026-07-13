import type { Order, OrderStatus } from "@/types";
import { formatINR, shortId } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

const BRAND_ORANGE = "#FF9933";
const MAROON = "#7A1E1E";
const CREAM = "#FBF7F0";

function shell(title: string, body: string): string {
  return `
  <div style="margin:0;padding:24px;background:${CREAM};font-family:Inter,Arial,sans-serif;color:#2A0808;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EFE4D2;">
      <div style="background:${MAROON};padding:24px 28px;">
        <div style="color:#fff;font-size:22px;font-weight:700;letter-spacing:.5px;">BMP</div>
        <div style="color:${BRAND_ORANGE};font-size:12px;text-transform:uppercase;letter-spacing:2px;">${BRAND.fullName}</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:${MAROON};">${title}</h1>
        ${body}
      </div>
      <div style="padding:18px 28px;background:${CREAM};border-top:1px solid #EFE4D2;font-size:12px;color:#8A4708;">
        ${BRAND.tagline}<br/>
        ${BRAND.fullName} · ${BRAND.location}
      </div>
    </div>
  </div>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F6EFE3;">
          <strong>${i.name}</strong><br/>
          <span style="color:#8A4708;font-size:13px;">${i.size} · ${i.spice_level} × ${i.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #F6EFE3;text-align:right;white-space:nowrap;">
          ${formatINR(i.line_total)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 16px;">
      ${rows}
      <tr>
        <td style="padding:6px 0;color:#8A4708;">Subtotal</td>
        <td style="padding:6px 0;text-align:right;">${formatINR(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#8A4708;">Delivery</td>
        <td style="padding:6px 0;text-align:right;">${formatINR(order.delivery_charge)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;font-size:16px;">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;font-size:16px;">${formatINR(order.total_amount)}</td>
      </tr>
    </table>`;
}

export function orderConfirmationEmail(order: Order) {
  const body = `
    <p style="font-size:15px;line-height:1.6;">Hi ${order.customer_name.split(" ")[0]}, thank you for your order! We've received it and will start packing your freshly-ground masalas.</p>
    <p style="font-size:14px;color:#8A4708;">Order reference: <strong style="color:${MAROON};">#${shortId(order.id)}</strong></p>
    ${itemsTable(order)}
    <p style="font-size:14px;line-height:1.6;">
      <strong>Delivering to:</strong><br/>
      ${order.customer_name}<br/>
      ${order.address_line}, ${order.city}, ${order.state} — ${order.pincode}<br/>
      ${order.phone}
    </p>
    <p style="font-size:14px;line-height:1.6;color:#8A4708;">You can track your order status anytime from your account. We'll email you as it progresses.</p>
  `;
  return {
    subject: `Order confirmed — #${shortId(order.id)} · ${BRAND.name}`,
    html: shell("Thank you for your order! 🌶️", body),
  };
}

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  Pending: "We've received your order and it's awaiting processing.",
  Processing: "Good news — we're preparing and packing your masalas now.",
  Shipped: "Your order is on its way! It should reach you soon.",
  Delivered: "Your order has been delivered. We hope you love it! 🌶️",
  Cancelled: "Your order has been cancelled. If this is unexpected, please contact us.",
};

export function orderStatusEmail(order: Order) {
  const body = `
    <p style="font-size:15px;line-height:1.6;">Hi ${order.customer_name.split(" ")[0]}, there's an update on your order.</p>
    <div style="margin:16px 0;padding:16px;border-radius:12px;background:${CREAM};border:1px solid #EFE4D2;">
      <div style="font-size:13px;color:#8A4708;">Order #${shortId(order.id)}</div>
      <div style="font-size:20px;font-weight:700;color:${MAROON};margin-top:4px;">${order.status}</div>
      <div style="font-size:14px;margin-top:6px;">${STATUS_MESSAGE[order.status]}</div>
    </div>
    ${itemsTable(order)}
    <p style="font-size:13px;color:#8A4708;">Total: <strong>${formatINR(order.total_amount)}</strong></p>
  `;
  return {
    subject: `Order #${shortId(order.id)} is now ${order.status} · ${BRAND.name}`,
    html: shell(`Your order is ${order.status}`, body),
  };
}
