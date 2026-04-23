import { Sale, api } from './api';
import { formatCurrency } from './utils';

export async function printReceipt(sale: Sale) {
  const settings = await api.getSettings();
  
  // We use window.open to pop out of the iframe environment
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (!printWindow) {
    alert("Pop-up blocked! Please click 'Open in new tab' in AI Studio, or allow pop-ups for this site.");
    return;
  }

  const itemsHtml = sale.items.map(item => `
    <div class="flex justify-between">
      <span>${item.quantity}x ${item.name}</span>
      <span>${formatCurrency(item.subtotal)}</span>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt L_${sale.id?.toString().padStart(4, '0')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
          body {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: black;
            background: white;
            margin: 0;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
          }
          .text-center { text-align: center; }
          .font-black { font-weight: 900; }
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }
          .text-lg { font-size: 18px; }
          .text-sm { font-size: 14px; }
          .text-xs { font-size: 10px; }
          .mb-4 { margin-bottom: 16px; }
          .pb-4 { padding-bottom: 16px; }
          .pt-4 { padding-top: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-8 { margin-top: 32px; }
          .border-b { border-bottom: 1px dashed black; }
          .border-t-solid { border-top: 1px solid black; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .space-y-1 > * + * { margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="text-center border-b pb-4 mb-4">
          ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="max-width: 100px; margin-bottom: 8px;" />` : ''}
          <h1 class="text-lg font-black uppercase" style="margin:0;">${settings.name}</h1>
          <p class="text-xs uppercase" style="margin:4px 0 0;">${settings.address}</p>
          <p class="text-xs uppercase" style="margin:4px 0 0;">Tel: ${settings.contact}</p>
          <div class="mt-4 text-xs uppercase">
            Date: ${new Date(sale.timestamp).toLocaleString()}<br/>
            Receipt No: L_${sale.id?.toString().padStart(4, '0')}
          </div>
        </div>

        <div class="space-y-1 mb-4">
          ${itemsHtml}
        </div>

        <div class="border-b pb-4 mb-4 space-y-1">
          <div class="flex justify-between">
            <span class="font-bold">SUBTOTAL:</span>
            <span>${formatCurrency(sale.totalAmount / 1.12)}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-bold">VAT (12%):</span>
            <span>${formatCurrency(sale.totalAmount - (sale.totalAmount / 1.12))}</span>
          </div>
          <div class="flex justify-between text-sm font-black border-t-solid mt-2 pt-4">
            <span>TOTAL:</span>
            <span>${formatCurrency(sale.totalAmount)}</span>
          </div>
        </div>

        <div class="mt-4 space-y-1 text-xs">
          <div class="flex justify-between uppercase">
            <span>Payment Type:</span>
            <span>${sale.paymentMethod}</span>
          </div>
          ${sale.paymentMethod === 'cash' ? `
            <div class="flex justify-between uppercase">
              <span>Cash Tendered:</span>
              <span>${formatCurrency(sale.cashReceived || 0)}</span>
            </div>
            <div class="flex justify-between uppercase font-bold">
              <span>Change:</span>
              <span>${formatCurrency(sale.change || 0)}</span>
            </div>
          ` : ''}
        </div>

        <div class="text-center mt-8 text-xs pb-8">
          <p class="font-bold uppercase mb-2">${settings.footerMessage || 'Thank you for your business!'}</p>
          <p class="uppercase">Please keep this receipt for returns</p>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              // window.close(); // let user close it manually if they want
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
