"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

const requiredFields = [
  { key: "Government_number", label: "رقم السيارة" },
  { key: "royal_number", label: "الرقم الملكي" },
  { key: "type", label: "نوع السيارة" },
  { key: "shape", label: "الشكل" },
  { key: "model", label: "الموديل" },
  { key: "receivingParty", label: "الجهة" },
];

function cleanCarNumber(value: string) {
  let v = value.replace(/\s/g, ""); // احذف المسافات
  v = v.replace(/\//g, "-");        // استبدل السلاش بشرطة
  if (!v.startsWith("ب")) v = "ب" + v; // أضف ب إذا لم تكن موجودة

  // إذا لم يوجد شرطة، ضعها بعد أول رقمين بعد "ب"
  if (!v.includes("-")) {
    // مثال: ب128553 => ب12-8553
    const match = v.match(/^ب(\d{2})(\d+)$/);
    if (match) {
      v = `ب${match[1]}-${match[2]}`;
    }
  }
  return v;
}

export default function ImportExcelTable() {
  const [fileName, setFileName] = useState<string>("");
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [rows, setRows] = useState<any[]>([]);
  const [saveResult, setSaveResult] = useState<any>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    setRawRows(raw as any[]);
    // extract headers from first row
    const headers = Object.keys(raw[0] || {});
    setExcelHeaders(headers);
    // reset mapping and rows
    setMapping({});
    setRows([]);
  };

  const handleMappingChange = (fieldKey: string, header: string) => {
    setMapping((prev) => ({ ...prev, [fieldKey]: header }));
  };

  const handleApplyMapping = () => {
    // map rawRows to required fields using mapping
    const cleaned = rawRows.map((row) => {
      const obj: any = {};
      requiredFields.forEach((field) => {
        let val = row[mapping[field.key]] || "";
        if (field.key === "Government_number") val = cleanCarNumber(String(val));
        obj[field.key] = val;
      });
      return obj;
    });
    setRows(cleaned);
  };

  const handleCellChange = (rowIdx: number, key: string, value: string) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIdx ? { ...row, [key]: value } : row
      )
    );
  };

  const handleSave = async () => {
    setSaveResult(null);
    try {
      const res = await fetch("/api/vehicles/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      const data = await res.json();
      setSaveResult(data);
      if (data.results && data.results.every((r: any) => r.success)) {
        alert("تم حفظ جميع السيارات بنجاح!");
      } else {
        alert("تم حفظ بعض السيارات. راجع النتائج بالأسفل.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-lg font-bold mb-4">استيراد بيانات السيارات من ملف إكسل</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        className="mb-4"
      />
      {fileName && <div className="mb-2">الملف: {fileName}</div>}
      {/* Step 1: Column mapping */}
      {excelHeaders.length > 0 && rows.length === 0 && (
        <div className="mb-4 border rounded p-3 bg-gray-50">
          <div className="mb-2 font-semibold">حدد الأعمدة المناسبة لكل حقل:</div>
          {requiredFields.map((field) => (
            <div key={field.key} className="mb-2 flex items-center gap-2">
              <span className="w-40 inline-block">{field.label}:</span>
              <select
                className="border rounded px-2 py-1"
                value={mapping[field.key] || ""}
                onChange={(e) => handleMappingChange(field.key, e.target.value)}
              >
                <option value="">-- اختر العمود --</option>
                {excelHeaders.map((header) => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
          ))}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
            onClick={handleApplyMapping}
            disabled={requiredFields.some((f) => !mapping[f.key])}
          >
            تطبيق الربط وعرض البيانات
          </button>
        </div>
      )}
      {/* Step 2: Data table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto border rounded-md mb-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {requiredFields.map((col) => (
                  <th key={col.key} className="border px-2 py-1 bg-gray-100">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {requiredFields.map((col) => (
                    <td key={col.key} className="border px-2 py-1">
                      <input
                        className="w-full bg-transparent outline-none"
                        value={row[col.key]}
                        onChange={(e) =>
                          handleCellChange(rowIdx, col.key, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > 0 && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSave}
        >
          حفظ البيانات
        </button>
      )}
      {saveResult && (
        <div className="mt-4 border rounded p-3 bg-gray-50">
          <div className="font-bold mb-2">نتائج الحفظ:</div>
          <ul className="list-disc pr-4">
            {saveResult.results?.map((r: any, i: number) => (
              <li key={i} className={r.success ? "text-green-700" : "text-red-700"}>
                {r.success
                  ? `✔️ تم حفظ السيارة رقم ${rows[r.index]?.Government_number}`
                  : `❌ السيارة رقم ${rows[r.index]?.Government_number}: ${r.error}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 