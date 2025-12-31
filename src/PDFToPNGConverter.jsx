import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Upload, FileText } from 'lucide-react';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up the worker for react-pdf (required)
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com{pdfjs.version}/build/pdf.worker.min.mjs`;
// pdfjs.GlobalWorkerOptions.workerSrc = 
//   new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function PDFToPNGConverter() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const pageRefs = useRef([]);

  // Handle file selection/drop
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // Save specific page as PNG
  const saveAsPNG = async (index) => {
    const canvas = pageRefs.current[index]?.querySelector('canvas');
    if (!canvas) return;

    const imageUrl = canvas.toDataURL("image/png"); // Convert canvas to data URL
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `page-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">PDF to PNG Converter</h1>

        {/* Drop Box */}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-8
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {file ? `Selected: ${file.name}` : "Drag & drop a PDF here, or click to select"}
          </p>
        </div>

        {/* PDF Preview & Actions */}
        {file && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" />
                <span className="font-semibold text-gray-700">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500">{numPages || '...'} Pages</p>
            </div>

            <div className="grid gap-8 justify-center">
              <Document
                file={file}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="flex flex-col gap-8"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="relative group border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div ref={el => pageRefs.current[index] = el}>
                      <Page 
                        pageNumber={index + 1} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                        width={600}
                      />
                    </div>
                    
                    {/* Hover Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => saveAsPNG(index)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
                      >
                        <Download size={18} />
                        Save Page {index + 1} as PNG
                      </button>
                    </div>
                  </div>
                ))}
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFToPNGConverter;
