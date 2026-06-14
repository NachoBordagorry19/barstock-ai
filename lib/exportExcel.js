// Exporta datos a un archivo que Excel abre nativamente.
// Generamos un .xls con tabla HTML (sin dependencias externas).

export function exportToExcel(filename, headers, rows) {
  const headerHtml = headers.map((h) => `<th style="background:#d4a017;color:#0a0c12;padding:6px;border:1px solid #999;text-align:left">${h}</th>`).join("");
  const bodyHtml = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:6px;border:1px solid #ccc">${c == null ? "" : c}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8" /></head>
<body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
