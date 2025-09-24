'use client';

import React, { useEffect } from "react";
import Barcode from "react-barcode";

interface Product {
  id: string;
  productId: string; // This is the barcode value
  name: string;
}

interface Props {
  product: Product;
}

export default function SingleProductBarcodePage({ product }: Props) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <div
        className="print-page border border-dashed border-gray-300 flex flex-col items-center justify-center text-center mx-auto"
        style={{
          height: "1in",
          width: "1.5in",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            textAlign: "center",
            lineHeight: "1",
            marginBottom: "2px",
          }}
        >
          مـــخــزن    </div> <div
          style={{
            fontSize: "11px",
            textAlign: "center",
            lineHeight: "1",
            marginBottom: "2px",
          }}
        >
          قسم المركبات - الحملة 
       </div>
        <div
          style={{
            transform: "scale(0.9)",
            transformOrigin: "top center",
          }}
        >
          <Barcode
            value={product.productId || ""}
            height={28}
            width={1.2}
            fontSize={8}
            displayValue={false}
            margin={0}
          />
        </div>
        <div
          style={{
            fontSize: "12px",
            marginTop: "2px",
            lineHeight: "1.5",
          }}
        >
          {product.name}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* إخفاء كل شيء خارج الباركود */
          body * {
            visibility: hidden;
          }

          .print-page, .print-page * {
            visibility: visible;
          }

          .print-page {
            page-break-after: always;
            width: 1.5in;
            height: 1in;
            overflow: hidden;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
            position: absolute;
            top: 0;
            left: 0;
          }

          @page {
            size: 1.5in 1in;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
