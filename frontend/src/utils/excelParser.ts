/**
 * A utility module for parsing Excel files (.xls, .xlsx)
 */

import * as XLSX from 'xlsx';

interface ParsedExcelData {
  headers: string[];
  data: Record<string, any>[];
  sheetNames: string[];
  rowCount: number;
  columnCount: number;
}

/**
 * Parses an Excel file and returns the data as a structured object
 * @param file - The Excel file to parse
 * @param sheetIndex - The index of the sheet to parse (default: 0)
 * @returns A promise that resolves to the parsed Excel data
 */
export const parseExcelFile = async (
  file: File,
  sheetIndex: number = 0
): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
          reject(new Error('No sheets found in the Excel file'));
          return;
        }
        
        if (sheetIndex >= sheetNames.length) {
          reject(new Error(`Sheet index ${sheetIndex} is out of bounds`));
          return;
        }
        
        const selectedSheet = workbook.Sheets[sheetNames[sheetIndex]];
        
        // Convert sheet to JSON with header option
        const jsonData = XLSX.utils.sheet_to_json(selectedSheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve({
            headers: [],
            data: [],
            sheetNames,
            rowCount: 0,
            columnCount: 0
          });
          return;
        }
        
        // Extract headers from the first row
        const headers = jsonData[0] as string[];
        
        // Extract data (skip first row)
        const rows = jsonData.slice(1);
        
        // Convert rows to objects with header keys
        const formattedData = rows.map((row: any) => {
          const obj: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            // Handle empty header names
            const key = header || `Column${index + 1}`;
            obj[key] = row[index];
          });
          
          return obj;
        });
        
        resolve({
          headers,
          data: formattedData,
          sheetNames,
          rowCount: formattedData.length,
          columnCount: headers.length
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Gets a list of all sheet names in an Excel file
 * @param file - The Excel file
 * @returns A promise that resolves to an array of sheet names
 */
export const getExcelSheetNames = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validates if a file is a valid Excel file
 * @param file - The file to validate
 * @returns A boolean indicating if the file is a valid Excel file
 */
export const isValidExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  return validTypes.includes(file.type);
};

export default {
  parseExcelFile,
  getExcelSheetNames,
  isValidExcelFile
};