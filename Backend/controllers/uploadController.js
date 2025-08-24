import XLSX from 'xlsx';
import File from '../models/File.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUploader.js';

export const uploadExcel = async (req, res) => {
  try {
    const { originalname, buffer, size } = req.file;

    // ✅ Parse Excel file buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames?.[0] || 'Sheet1';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty Excel file',
      });
    }

    const parsedData = XLSX.utils.sheet_to_json(worksheet);

    // ✅ Upload original file to Cloudinary
    const cloudinaryResult = await uploadBufferToCloudinary(buffer, originalname);

    // ✅ Save metadata + parsed content to MongoDB
    const newFile = new File({
      filename: originalname,
      url: cloudinaryResult.secure_url,
      size,
      user: req.user.id,
      sheetName,
      totalRows: parsedData.length,
      savedCount: parsedData.length,
      fileData: parsedData,
      parsedData: parsedData, // optional preview subset
      fileType: 'excel',
      chartCount: 0, // 🟢 add this if tracking charts
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        id: newFile._id,
        filename: originalname,
        fileSize: size,
        totalRows: parsedData.length,
        sheetName,
        fileUrl: cloudinaryResult.secure_url,
      },
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while uploading',
    });
  }
};
