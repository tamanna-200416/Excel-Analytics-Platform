import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file); // This will have the uploaded file info
  res.json({ message: 'File uploaded' });
});
