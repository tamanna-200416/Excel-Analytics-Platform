// utils/parseExcelToText.js
import axios from "axios";
import * as XLSX from "xlsx";
import stream from "stream";
import { promisify } from "util";

export const parseExcelToText = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const workbook = XLSX.read(response.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let text = "";
    rows.forEach((row) => {
      text += row.join(" | ") + "\n";
    });

    return text.slice(0, 3000); // limit input
  } catch (err) {
    console.error("❌ Excel parsing error:", err.message);
    throw new Error("Excel parsing failed");
  }
};
