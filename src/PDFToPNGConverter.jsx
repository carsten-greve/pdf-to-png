import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Upload, FileText } from 'lucide-react';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up the worker for react-pdf (required)
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function PDFToPNGConverter() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const pageRefs = useRef([]);
  const [useBg, setUseBg] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff'); // Hex for RGB
  const [bgAlpha, setBgAlpha] = useState(1); // 0 to 1 for Alpha
  const [exportScale, setExportScale] = useState(1.0);
  const [pageDimensions, setPageDimensions] = useState({}); // Stores { index: { w, h } }
  
  const handlePageLoad = (page, index) => {
    // Capture base dimensions at scale 1.0
    setPageDimensions(prev => ({
      ...prev,
      [index]: { width: page.originalWidth, height: page.originalHeight }
    }));
  };

  // Convert 0-1 alpha to 00-FF hex
  const alphaHex = Math.round(bgAlpha * 255).toString(16).padStart(2, '0');
  const hexColorWithAlpha = `${bgColor}${alphaHex}`;

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
  const saveAsPNG = async (index, scale) => {
    if (!file) return;
  
    try {
      // Load the document specifically for rendering
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      // Get the specific page
      const page = await pdf.getPage(index + 1);
      
      // Set a high scale (e.g., 3.0 or 4.0 for high res)
      const viewport = page.getViewport({ scale });
  
      // Create an off-screen canvas
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      // Render the page to the off-screen canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        ...(useBg && { background: isTransparent ? 'rgba(0,0,0,0)' : hexColorWithAlpha }),
      };
      
      await page.render(renderContext).promise;
  
      // Download the result
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `page-${index + 1}.png`;
      link.click();
      URL.revokeObjectURL(link.href); // Clean up memory
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="w-full mx-auto">
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

        {/* PDF default background color */}
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useBg} onChange={(e) => setUseBg(e.target.checked)} />
            Change PDF default background color
          </label>
        
          <label className={`flex items-center gap-2 ${!useBg && 'opacity-50'}`}>
            <input 
              type="checkbox" 
              disabled={!useBg} 
              checked={isTransparent} 
              onChange={(e) => setIsTransparent(e.target.checked)} 
            />
            Make transparent
          </label>
        
          <div className={`flex items-center gap-4 ${(!useBg || isTransparent) && 'opacity-50'}`}>
            <span>Background Color:</span>
            <input 
              type="color" 
              disabled={!useBg || isTransparent} 
              value={bgColor} 
              onChange={(e) => setBgColor(e.target.value)} 
            />
            <input 
              type="range" min="0" max="1" step="0.1" 
              disabled={!useBg || isTransparent} 
              value={bgAlpha} 
              onChange={(e) => setBgAlpha(parseFloat(e.target.value))} 
            />
          </div>
        </div>

        {/* Global Scale Control */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow">
          <label className="font-semibold text-gray-700">Export Scale:</label>
          <input 
            type="number" 
            min="0.1" 
            step="0.1" 
            value={exportScale} 
            onChange={(e) => setExportScale(parseFloat(e.target.value) || 1.0)}
            className="border rounded px-2 py-1 w-20"
          />
          <span className="text-sm text-gray-500">(1.0 = 100% resolution)</span>
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
                className="flex flex-wrap gap-8 justify-center items-start"
              >
                {Array.from(new Array(numPages), (el, index) => {
                  const base = pageDimensions[index];
                  return (
                    <div key={`page_${index + 1}`} className="relative group border border-gray-200 rounded-lg overflow-hidden   shadow-sm">
                      {/* Dimension Info Lines */}
                      <div className="mb-3 space-y-1 border-l-2 border-blue-500 pl-3 tracking-wider">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Base Resolution:</span>
                          <span>{base ? `${Math.round(base.width)} × ${Math.round(base.height)} px` : 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-700">
                          <span>Export Resolution:</span>
                          <span className="text-blue-600">
                            {base ? `${Math.round(base.width * exportScale)} × ${Math.round(base.height * exportScale)} px` : '...'}
                          </span>
                        </div>
                      </div>

                      <div ref={el => pageRefs.current[index] = el}>
                        <Page 
                          pageNumber={index + 1}
                          onLoadSuccess={(page) => handlePageLoad(page, index)}
                          renderTextLayer={false} 
                          renderAnnotationLayer={false}
                          width={300}
                          {...(useBg && {
                            canvasBackground: isTransparent ? 'rgba(255, 255, 255, 0.8)' : hexColorWithAlpha
                          })}
                        />
                      </div>
                      
                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex   items-center justify-center">
                        <button
                          onClick={() => saveAsPNG(index, exportScale)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2   shadow-lg"
                        >
                          <Download size={18} />
                          Save Page {index + 1} as PNG
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFToPNGConverter;
