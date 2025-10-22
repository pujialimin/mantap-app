// src/pages/W304.tsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import W304PDF from '../components/W304PDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { pdf } from '@react-pdf/renderer';

function DownloadPDFButton({
  pdfItems,
  crewOut,
  shiftOut,
  supervisorOut,
  managerOut,
  timeOut,
  crewIn,
  shiftIn,
  supervisorIn,
  managerIn,
  timeIn,
  formattedDate,
  shift,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    setShowConfirm(false);

    const doc = (
      <W304PDF
        data={{
          date: formattedDate,
          acReg: 'N/A',
          crewOut: crewOut || '-',
          shiftOut: shiftOut || '-',
          supervisorOut: supervisorOut || '-',
          managerOut: managerOut || '-',
          timeOut: timeOut || '-',
          crewIn: crewIn || '-',
          shiftIn: shiftIn || '-',
          supervisorIn: supervisorIn || '-',
          managerIn: managerIn || '-',
          timeIn: timeIn || '-',
          inspection: 'N/A',
          woNumber: 'N/A',
          hangarIn: 'N/A',
          hangarOut: 'N/A (Estimation/Actual)',
          items: pdfItems,
        }}
      />
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `E-HOB MANTAP W304 ${formattedDate} ${shift}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-[#d54336] hover:bg-[#aa0e00] text-white text-[11px] px-2 py-1 rounded shadow"
      >
        Download PDF
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl text-center space-y-4">
            <h2 className="text-lg font-semibold">Konfirmasi</h2>
            <p>Please ensure that all data has been entered accurately.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Ok, Gass!
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const supervisorList = [
  '532886 / NUR ARI WINTOLO',
  '580125 / NASHRUL FALACH',
  '580485 / ALIF YOGA A',
  '580503 / TEGAR GILANG P',
  '580506 / FARIS WALIYULLOH',
  '581000 / FENDI HANANTO',
  '581837 / ADITYA EKA N',
  '581841 / AHMAD IQBAL',
  '582367 / FAYDLIR RAHMAN',
  '582369 / GILANG SULTON A',
  '583322 / DANDYNO DUARTE',
  '583327 / WAWAN SUGIYANTO',
  '583328 / KHAIRUL HASBI P',
];

const crewOptions = [
  'CREW A',
  'CREW B',
  'CREW MINI',
  'CREW A (OVT)',
  'CREW B (OVT)',
];
const shiftOptions = ['MORNING SHIFT', 'AFTERNOON SHIFT', 'NIGHT SHIFT'];
const timeOptions = [
  '06.00 AM',
  '08.00 AM',
  '02.00 PM',
  '03.00 PM',
  '10.00 PM',
];
const managerOptions = [
  '580126 / SLAMET KUSWANDI',
];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[0px]',
  order: 'min-w-[0px]',
  description: 'min-w-[300px]',
  location: 'min-w-[00px]',
  doc_type: 'min-w-[0px]',
  date_in: 'min-w-[0px]',
  doc_status: 'min-w-[100px]',
  status_sm4: 'min-w-[90px]',
  remark_sm4: 'min-w-[250px]',
  handle_by_sm4: 'min-w-[90px]',
  date_closed_sm4: 'min-w-[00px]',
  report_sm4: 'min-w-[0px]',
};

const COLUMN_ORDER = [
  { key: 'no', label: 'No' },
  { key: 'report_sm4', label: 'Report' },
  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  
  { key: 'doc_type', label: 'Doc' },
  { key: 'location', label: 'Location' },
  { key: 'doc_status', label: 'Doc Status' },
  
  { key: 'remark', label: 'Remark PE' },
  { key: 'priority', label: 'Priority' },
  { key: 'status_sm4', label: 'Status' },
  { key: 'remark_sm4', label: 'Remark' },
  { key: 'handle_by_sm4', label: 'Handle by' },
  { key: 'date_closed_sm4', label: 'Date Closed' },
];

const formatDateToDDMMMYYYY = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const sortOptions = [
  { value: 'report_sm4', label: 'Report' },
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
  { value: 'location', label: 'Location' },
  { value: 'doc_type', label: 'Doc Type' },
  { value: 'date_in', label: 'Date In' },
  { value: 'doc_status', label: 'Doc Status' },
  { value: 'status_sm4', label: 'Status' },
];

export default function W304() {
  const [rows, setRows] = useState<any[]>([]);
  const [supervisorOut, setSupervisorOut] = useState('');
  const [managerOut, setManagerOut] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [crewOut, setCrewOut] = useState('');
  const [shiftOut, setShiftOut] = useState('');
  const [crewIn, setCrewIn] = useState('');
  const [shiftIn, setShiftIn] = useState('');
  const [supervisorIn, setSupervisorIn] = useState('');
  const [managerIn, setManagerIn] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [filterReportOnly, setFilterReportOnly] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterAcReg, setFilterAcReg] = useState('');

  const [filterPriority, setFilterPriority] = useState('All');
  const [priorityData, setPriorityData] = useState<any[]>([]);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<() => void>(
    () => () => {}
  );

  const pdfLinkRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

// filter ac reg
const [showSuggestions, setShowSuggestions] = useState(false);

// Ambil unique A/C Reg dari rows
const uniqueAcRegs = [
  ...new Set(rows.map((r) => r.ac_reg).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

// Filter opsi berdasarkan input
const filteredOptions = uniqueAcRegs.filter((reg) =>
  reg.toLowerCase().includes(filterAcReg.toLowerCase())
);
//////

const filteredRows = rows.filter((row) => {
  const status = row.status_cs4 || '';

  const matchesAcReg = row.ac_reg
    ?.toLowerCase()
    .includes(filterAcReg.toLowerCase());

  const matchesStatus =
    filterStatus === 'All Status'
      ? true
      : filterStatus === 'NO STATUS'
      ? status === ''
      : status === filterStatus;

  const searchLower = searchTerm.toLowerCase();
  const matchesSearch =
    row.ac_reg?.toLowerCase().includes(searchLower) ||
    row.order?.toString().toLowerCase().includes(searchLower) || // ✅ fix disini
    row.description?.toLowerCase().includes(searchLower) ||
    row.location?.toLowerCase().includes(searchLower);

  return matchesAcReg && matchesStatus && matchesSearch;
});


  const sortedFilteredRows = [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey] || '';
    const bValue = b[sortKey] || '';

    // Angka dibandingkan sebagai angka, string sebagai string
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

   // copy: hilang saat user klik di luar
   useEffect(() => {
    if (notification) {
      const handleClickOutside = () => {
        setNotification(null);
      };
      window.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [notification]);

 {/* useeffect page/filter */}
 useEffect(() => {
  const fetchData = async () => {
    let allRows: any[] = [];
    let from = 0;
    const limit = 1000;
    let moreData = true;

    while (moreData) {
      const { data, error } = await supabase
        .from("mdr_tracking")
        .select("*")
        .eq("archived", false)
        .order("date_in", { ascending: false })
        .range(from, from + limit - 1); // ambil per 1000

      if (error) {
        console.error("Error fetching data:", error);
        break;
      }

      if (data && data.length > 0) {
        allRows = [...allRows, ...data];
        from += limit;
        if (data.length < limit) {
          moreData = false; // sudah habis
        }
      } else {
        moreData = false;
      }
    }

    // filter sesuai logika w304
    const filtered = allRows.filter((r) => r.cek_sm4 === "red");
    const filteredReport = filterReportOnly
      ? filtered.filter(
          (r) =>
            r.report_sm4 === true ||
            r.report_sm4 === "1" ||
            r.report_sm4 === "checked"
        )
      : filtered;

    setRows(filteredReport);
    setFilteredData(filteredReport);
  };

  fetchData();
}, [filterReportOnly]);


  console.log('filteredRows:', filteredRows);

  const pdfItems = filteredData.map((item, index) => ({
    no: index + 1,
    reference: item.order,
    acReg: item.ac_reg || '',
    description: item.description || '',
    remark: item.remark_sm4 || '',
    status: item.status_sm4?.toUpperCase() || '',
  }));

  const handleUpdate = async (id: string, key: string, value: any) => {
    const updates: Record<string, any> = { [key]: value };

    if (key === 'status_sm4' && value === 'CLOSED') {
      updates['date_closed_sm4'] = formatDateToDDMMMYYYY(new Date());
    }

    const { error } = await supabase
      .from('mdr_tracking')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error('Update error:', error);
    } else {
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
      );
    }
  };

  const generateWhatsAppMessage = ({
    shiftType,
    totalOrder,
    totalOpen,
    totalProgress,
    totalClosed,
    orders,
    supervisor,
    crew,
  }: {
    shiftType: string;
    totalOrder: number;
    totalOpen: number;
    totalProgress: number;
    totalClosed: number;
    orders: {
      ac_reg: string;
      order: string;
      description: string;
      status: string;
      remark: string;
    }[];
    supervisor: string;
    crew: string;
  }) => {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const header = `*DAILY WORKLOAD REPORT*\n*SHEETMETAL WORKSHOP-1*\nTBR-4 | ${shiftType}\n${today}`;
    const summary = `\n\n*TOTAL : ${totalOrder} ORDER*\n${totalOpen} OPEN | ${totalProgress} PROGRESS | ${totalClosed} CLOSED`;

    const detail = orders
      .map(
        (o, i) =>
          `\n\n${i + 1}. ${o.ac_reg}\n${o.order}\n${o.description}\n${
            o.status
          }\n${o.remark}`
      )
      .join('');

    const closing = `\n\n*BEST REGARDS*\n${supervisor}\n${crew}`;

    return `${header}${summary}${detail}${closing}`;
  };

  const formattedDate = formatDateToDDMMMYYYY(new Date()); // hasil: 26 Jul 2025
  const shift = shiftOut || '-';

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-gray-100 h-full w-full">
      <div className="bg-white px-3 pt-2 pb-6 max-h-[100vh] overflow-y-auto w-full rounded-lg">
        <div className="mb-2 flex flex-wrap gap-1 items-center">
          {/* Semua datalist */}
          <datalist id="supervisorList">
            {supervisorList.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <datalist id="crewOptions">
            {crewOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <datalist id="shiftOptions">
            {shiftOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <datalist id="timeOptions">
            {timeOptions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <datalist id="managerOptions">
            {managerOptions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          {/* 🔍 Filter + Sort + WhatsApp Row */}
          <div className="flex flex-wrap items-center gap-1 text-xs mt-1 mb-1">
            {/* Toggle Check Report */}
            <div className="flex items-center ml-0">
              <span className="text-xs font-medium"></span>
              <label className="relative inline-flex items-center cursor-pointer select-none w-11 h-5">
                <input
                  type="checkbox"
                  checked={filterReportOnly}
                  onChange={() => setFilterReportOnly(!filterReportOnly)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-[24px]" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                ON
              </span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-100 peer-checked:opacity-0 transition-opacity duration-200">
                OFF
                </span>
              </label>
            </div>

            {/* Kiri: Filter + Sort */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {/* 🔎 Search */}
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-1 py-1 text-[12px] hover:bg-gray-50 shadow"
              />

              {/* ✈️ Filter A/C REG */}
       
<div className="relative w-[90px]">
            <input
              type="text"
              value={filterAcReg}
              onChange={(e) => {
                setFilterAcReg(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay untuk biar sempat klik
              placeholder="Filter A/C Reg"
              className="border rounded px-1 py-1 text-[11px] w-full shadow"
            />

            {showSuggestions && (
              <ul className="absolute z-50 bg-white border w-full max-h-40 overflow-y-auto text-[11px] shadow-md rounded">
                <li
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => setFilterAcReg('')}
                >
                  All A/C Reg
                </li>
                {filteredOptions.length === 0 && (
                  <li className="px-2 py-1 text-gray-400">No match</li>
                )}
                {filteredOptions.map((reg) => (
                  <li
                    key={reg}
                    className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => {
                      setFilterAcReg(reg);
                      setShowSuggestions(false);
                    }}
                  >
                    {reg}
                  </li>
                ))}
              </ul>
            )}
          </div>

              {/* 🔧 Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
              >
                <option value="All Status">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="PROGRESS">PROGRESS</option>
                <option value="CLOSED">CLOSED</option>
                <option value="NO STATUS">NO STATUS</option>
              </select>

              {/* 🧭 Sort Dropdown */}
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
              >
                <option value="">Sort by...</option>
                {sortOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={sortDirection}
                onChange={(e) =>
                  setSortDirection(e.target.value as 'asc' | 'desc')
                }
                className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
              >
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>

            {/* Tombol Copy */}
            <button
              onClick={() => {
                const clean = (val: any) =>
                  (val || '')
                    .toString()
                    .replace(/\r?\n|\r/g, ' ') // hapus newline
                    .replace(/\t/g, ' ') // hapus tab
                    .trim();

                const selectedData = rows
                  .filter(
                    (row) =>
                      row.report_sm4 === true ||
                      row.report_sm4 === '1' ||
                      row.report_sm4 === 'checked'
                  )
                  .map((row) => [
                    clean(row.doc_type),
                    clean(row.ac_reg),
                    clean(row.order),
                    clean(row.description),
                    clean(row.handle_by_sm4),
                    clean(row.status_sm4),
                    clean(row.remark_sm4),
                  ])
                  .map((fields) => fields.join('\t'))
                  .join('\n');

                if (!selectedData) {
                  setNotification('❗ No rows selected.');
                  return;
                }

                navigator.clipboard
                  .writeText(selectedData)
                  .then(() => setNotification('✅ Data copied to clipboard!'))
                  .catch(() =>
                    setNotification('❌ Failed to copy to clipboard.')
                  );
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-2 py-1 rounded shadow"
            >
              Copy
            </button>

            {/* Kanan: Tombol WhatsApp */}
            <button
              onClick={() => {
                const filtered = rows.filter(
                  (r) =>
                    r.report_sm4 === true ||
                    r.report_sm4 === '1' ||
                    r.report_sm4 === 'checked'
                );

                if (filtered.length === 0) {
                  alert('Tidak ada data yang dicentang untuk dikirim.');
                  return;
                }

                const totalOrder = filtered.length;
                const totalOpen = filtered.filter(
                  (r) => r.status_sm4 === 'OPEN'
                ).length;
                const totalProgress = filtered.filter(
                  (r) => r.status_sm4 === 'PROGRESS'
                ).length;
                const totalClosed = filtered.filter(
                  (r) => r.status_sm4 === 'CLOSED'
                ).length;

                const message = generateWhatsAppMessage({
                  shiftType: shiftOut,
                  totalOrder,
                  totalOpen,
                  totalProgress,
                  totalClosed,
                  orders: filtered.map((r) => ({
                    ac_reg: r.ac_reg || '',
                    order: r.order || '',
                    description: r.description || '',
                    status: r.status_sm4 || '',
                    remark: r.remark_sm4 || '',
                  })),
                  supervisor: supervisorOut,
                  crew: crewOut,
                });

                const encoded = encodeURIComponent(message);
                const url = `https://api.whatsapp.com/send?text=${encoded}`;

                window.open(url, '_blank');
              }}
              className="bg-green-500 hover:bg-green-600 text-white text-[11px] px-2 py-1 rounded shadow"
            >
              Send WhatsApp
            </button>

            {/* Tombol PDF */}
            <DownloadPDFButton
              pdfItems={pdfItems}
              crewOut={crewOut}
              shiftOut={shiftOut}
              supervisorOut={supervisorOut}
              managerOut={managerOut}
              timeOut={timeOut}
              crewIn={crewIn}
              shiftIn={shiftIn}
              supervisorIn={supervisorIn}
              managerIn={managerIn}
              timeIn={timeIn}
              formattedDate={formatDateToDDMMMYYYY(new Date())}
              shift={shift}
            />
          </div>
          {/* ✅ MODIFIKASI DIMULAI: Bungkus semua form dengan kondisi */}
          {filterReportOnly && (
            <>
              {/* OUT Baris */}
              <div className="flex items-center gap-1 mb-1">
                <div className="w-[48px] font-semibold text-[11px]">
                  Shift Out
                </div>
                <div className="flex gap-[4px] text-[11px]">
                  <input
                    type="text"
                    list="supervisorList"
                    placeholder="Supervisor Out"
                    value={supervisorOut}
                    onChange={(e) => setSupervisorOut(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[200px]"
                  />
                  <input
                    type="text"
                    list="crewOptions"
                    placeholder="Crew Out"
                    value={crewOut}
                    onChange={(e) => setCrewOut(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[100px]"
                  />

                  <input
                    type="text"
                    list="shiftOptions"
                    placeholder="Shift Out"
                    value={shiftOut}
                    onChange={(e) => setShiftOut(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[120px]"
                  />
                  <input
                    type="text"
                    list="timeOptions"
                    placeholder="Time Out"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[80px]"
                  />
                  <input
                    type="text"
                    list="managerOptions"
                    placeholder="Manager Out"
                    value={managerOut}
                    onChange={(e) => setManagerOut(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[180px]"
                  />
                </div>
              </div>

              {/* IN Baris */}
              <div className="flex items-center gap-1 mb-1">
                <div className="w-[48px] font-semibold text-[11px]">
                  Shift In
                </div>
                <div className="flex gap-[4px] text-[11px]">
                  <input
                    type="text"
                    list="supervisorList"
                    placeholder="Supervisor In"
                    value={supervisorIn}
                    onChange={(e) => setSupervisorIn(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[200px]"
                  />
                  <input
                    type="text"
                    list="crewOptions"
                    placeholder="Crew In"
                    value={crewIn}
                    onChange={(e) => setCrewIn(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[100px]"
                  />
                  <input
                    type="text"
                    list="shiftOptions"
                    placeholder="Shift In"
                    value={shiftIn}
                    onChange={(e) => setShiftIn(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[120px]"
                  />
                  <input
                    type="text"
                    list="timeOptions"
                    placeholder="Time In"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[80px]"
                  />
                  <input
                    type="text"
                    list="managerOptions"
                    placeholder="Manager In"
                    value={managerIn}
                    onChange={(e) => setManagerIn(e.target.value)}
                    className="border px-1 py-0.5 rounded w-[180px]"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-y-auto max-h-[65vh] border border-gray-300 rounded shadow-inner w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap table-auto text-[11px] leading-tight">
            <thead className="sticky top-0 z-10 bg-white shadow">
              <tr className="bg-gradient-to-t from-[#00838F] to-[#00838F] text-white text-xs font-semibold text-center">
                {COLUMN_ORDER.map((col) => (
                  <th key={col.key} className="border px-1 py-1 text-center">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {COLUMN_ORDER.map(({ key }) => (
                    <td
                      key={key}
                      className={`border px-1 py-1 ${columnWidths[key] || ''} ${
                        key === 'description' || key === 'doc_status'
                          ? 'text-left break-words whitespace-normal'
                          : 'text-center'
                      }`}
                    >
                      {key === 'no' ? (
                        (currentPage - 1) * rowsPerPage + rowIndex + 1
                      ) : key === 'date_in' || key === 'date_closed_sm4' ? (
                        row[key] ? (
                          new Date(row[key]).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          ''
                        )
                      ) : key === 'report_sm4' ? (
                        <input
                          type="checkbox"
                          checked={
                            row[key] === true ||
                            row[key] === '1' ||
                            row[key] === 'checked'
                          }
                          onChange={(e) =>
                            handleUpdate(
                              row.id,
                              key,
                              e.target.checked ? 'checked' : ''
                            )
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      ) : key === 'status_sm4' ? (
                        <select
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className={`border rounded px-1 py-0.5 text-xs w-full
                ${
                  row[key] === 'OPEN'
                  ? 'bg-red-500 text-white'
                  : row[key] === 'PROGRESS'
                  ? 'bg-yellow-500 text-white'
                  : row[key] === 'CLOSED'
                  ? 'bg-green-500 text-white'
                    : ''
                }`}
                        >
                          <option value=""></option>
                          <option value="OPEN">OPEN</option>
                          <option value="PROGRESS">PROGRESS</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      ) : key === 'remark_sm4' || key === 'handle_by_sm4' ? (
                        <input
                          type="text"
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className="border px-1 py-0.5 rounded w-full text-xs"
                        />
                      ) : (
                        row[key] ?? ''
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {notification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white px-6 py-4 rounded shadow-lg text-center text-gray-800 text-sm">
                {notification}
              </div>
            </div>
          )}
        </div>
           {/* tombol page */}
           <div className="flex justify-start mt-2 text-[11px] items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-0.5 rounded border bg-white text-black hover:bg-gray-50 shadow"
          >
            ◁ Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-0.5 rounded border bg-white text-black hover:bg-gray-50 shadow"
          >
            Next ▷
          </button>
        </div>
      </div>
    </div>
  );
}
