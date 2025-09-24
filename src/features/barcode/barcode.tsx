'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  productId: string;
  name: string;
  barcode: string;
}

interface Purchase {
  items: Product[];
}

interface Props {
  purchase: Purchase;
}

const BarcodeContent = React.forwardRef<HTMLDivElement, { products: Product[] }>(
  ({ products }, ref) => (
    <div ref={ref}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className="barcode-print-page"
        >
          <div style={{ fontSize: "14px",padding: "0px", alignSelf: "center",paddingLeft: "1px", fontWeight: "bold", lineHeight: "1"}}>
            مـخــزن
          </div>
          <div style={{ fontSize: "11px",padding: "0px", alignSelf: "center",paddingLeft: "1px", fontWeight: "bold", lineHeight: "1" , marginBottom: "10px" }}>
           قـــســـم الــمــركــبــات - الــحــمــلــة 
          </div>
          <div style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
            <Barcode
              value={product.barcode || ""}
              height={20}
              width={1.2}
              fontSize={8}
              displayValue={false}
              margin={0}
              marginTop={4}
            />
          </div>
          <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "2px" , lineHeight: "1.5" , textAlign: "center" }}>
            {product.name}
          </div>
        </div>
      ))}

      {/* CSS للطباعة فقط */}
      <style jsx global>{`
  @media print {
    @page {
      size: 1.5in 1in;
      margin: 0;
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
    }


    .barcode-print-page {
      page-break-after: always;
      width: 1.5in;
      height: 1in;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }
  }
`}</style>

    </div>
  )
);

BarcodeContent.displayName = 'BarcodeContent';

export default function BarcodeList({ purchase }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <div className="p-4">
      {/* زر الطباعة */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">باركود المنتجات</h1>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> طباعة
        </Button>
      </div>

      {/* محتوى الطباعة (مرئي على الشاشة أيضًا) */}
      <BarcodeContent ref={componentRef} products={purchase.items} />
    </div>
  );
}
