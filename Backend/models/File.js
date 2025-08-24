// models/File.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // Original filename
  url: { type: String, default: '' },         // Cloudinary or storage URL
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Additional fields to replace ExcelFile.js
  fileData: { type: Object, required: false }, // Parsed Excel JSON
  sheetName: { type: String, default: 'Sheet1' },
  totalRows: { type: Number, default: 0 },
  savedCount: { type: Number, default: 0 },
  fileType: { type: String, default: 'excel' },
  chartCount: { type: Number, default: 0 },
  
  parsedData: { type: [Object], default: [] },
});

const File = mongoose.model('File', fileSchema);
export default File;
