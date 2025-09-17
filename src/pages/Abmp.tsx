import { useEffect, useState } from 'react';

export default function Abmp() {
  const [pdfId, setPdfId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR87GYwPPCTGhIYZy-7p5SkOYqTaGpBUbbkvZTDRUMqDBOZvnhra6l4_N3O1PwKr2EL2qD9ReOb5Jac/pub?output=csv';

  // Load ID dari localStorage saat halaman dibuka
  useEffect(() => {
    const savedId = localStorage.getItem('abmpPdfId');
    if (savedId) {
      setPdfId(savedId);
    }
  }, []);

  // Update dari Google Sheet CSV
  const handleUpdate = async () => {
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.split('\n').map((r) => r.split(','));
      const lastRow = rows[rows.length - 1];
      if (lastRow && lastRow[2]) {
        const newId = lastRow[2].trim();
        setPdfId(newId);
        localStorage.setItem('abmpPdfId', newId);
        setMessage('✅ ABMP updated!');
        setTimeout(() => setMessage(''), 3000); // hilang otomatis setelah 3 detik
      } else {
        setMessage('⚠️ Tidak menemukan PDF ID di baris terakhir.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Gagal mengambil data dari Google Sheet.');
    }
  };

  const googleFormUrl = 'https://forms.gle/3KxHarsbBNLpeNE29';
  const pdfUrl = pdfId
    ? `https://drive.google.com/file/d/${pdfId}/preview`
    : null;

  return (
    <div className="p-1 space-y-2">
      {/* Baris tombol Upload + Update + Notifikasi */}
      <div className="flex items-center gap-2">
        {/* Tombol Upload */}
        <a
          href={googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
        >
          Upload ABMP
        </a>

        {/* Tombol Update */}
        <button
          onClick={handleUpdate}
          className="px-3 py-1 text-sm font-semibold bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 shadow"
        >
          Update
        </button>

        {/* Notifikasi (sejajar di kanan tombol) */}
        {message && (
          <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded border border-green-300 shadow-sm">
            {message}
          </span>
        )}
      </div>

      {/* Viewer PDF */}
      {pdfUrl && (
        <div className="w-full h-[80vh] rounded-lg shadow border">
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            allow="autoplay"
            title="ABMP PDF"
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
