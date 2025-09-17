import { useEffect, useState } from 'react';

export default function Abmp() {
  const [pdfId, setPdfId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR87GYwPPCTGhIYZy-7p5SkOYqTaGpBUbbkvZTDRUMqDBOZvnhra6l4_N3O1PwKr2EL2qD9ReOb5Jac/pub?output=csv';

  // Format tanggal ke dd-MMM-yyyy
  const formatDate = (raw: string) => {
    // Kalau angka serial Google Sheets
    if (!isNaN(Number(raw))) {
      const serial = Number(raw);
      const baseDate = new Date(1899, 11, 30);
      baseDate.setDate(baseDate.getDate() + serial);
      return baseDate
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '-');
    }

    // Kalau string biasa
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace(/ /g, '-');
  };

  // Update dari Google Sheet CSV
  const handleUpdate = async () => {
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.split('\n').map((r) => r.split(','));
      const lastRow = rows[rows.length - 1];

      if (lastRow && lastRow[2] && lastRow[3]) {
        const dateCol = lastRow[2].trim(); // kolom C = tanggal
        const pdfCol = lastRow[3].trim(); // kolom D = PDF ID

        setPdfId(pdfCol);
        localStorage.setItem('abmpPdfId', pdfCol);

        setLastUpdate(formatDate(dateCol));

        setMessage('✅ ABMP updated!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('⚠️ Data tidak lengkap di baris terakhir.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Gagal mengambil data dari Google Sheet.');
    }
  };

  // Ambil data langsung saat buka halaman
  useEffect(() => {
    handleUpdate();
  }, []);

  const googleFormUrl = 'https://forms.gle/3KxHarsbBNLpeNE29';
  const pdfUrl = pdfId
    ? `https://drive.google.com/file/d/${pdfId}/preview`
    : null;

  return (
    <div className="p-1 space-y-2">
      {/* Baris tombol Upload + Update + Info */}
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

{/* Last Update */}
{lastUpdate && (
          <span className="text-sm text-gray-700">
            Last Update: <strong>{lastUpdate}</strong>
          </span>
        )}

        {/* Notifikasi */}
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
