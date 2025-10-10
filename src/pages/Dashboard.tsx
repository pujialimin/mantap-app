import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import CustomSelect from '../components/CustomSelect';

import { PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';

const LOCATIONS = ['ON A/C', 'BUSH4', 'WS1', 'CGK'];
const DOC_TYPES = ['JC', 'MDR', 'PDS', 'SOA'];
const PLNTWKCNTR = ['CGK', 'GAH1', 'GAH2', 'GAH3', 'GAH4', 'WSSR', 'WSST'];

type Row = {
  id: string;
  [key: string]: any;
};

const DOC_STATUS_OPTIONS = [
  '🔴NEED RO',
  '🔴WAIT.REMOVE',
  '🔴WAIT.BDP',
  '🟢COMPLETED',
  '🟢DONE BY SOA',
  '🟡RO DONE',
  '🟡EVALUATED',
  '🟡CONTACT OEM',
  '🟡HOLD',
  '🟡RESTAMP',
  '🟡REVISION',
  '🔘REPLACE',
  '🔘NOT TBR',
  '🔘COVER BY',
  '🔘TJK ITEM',
  '🔘CANCEL',
  '🔘ROBBING',
];

// Array status doc_status
const docStatusList = [
  '🔴NEED RO',
  '🔴WAIT.REMOVE',
  '🔴WAIT.BDP',
  '🟢COMPLETED',
  '🟢DONE BY SOA',
  '🟡RO DONE',
  '🟡EVALUATED',
  '🟡CONTACT OEM',
  '🟡HOLD',
  '🟡RESTAMP',
  '🟡REVISION',
  '🔘REPLACE',
  '🔘NOT TBR',
  '🔘COVER BY',
  '🔘TJK ITEM',
  '🔘CANCEL',
  '🔘ROBBING',
];
// Warna berbeda untuk setiap status (sesuai emoji)
const docStatusColors = [
  '#ef4444', // 🔴
  '#dc2626',
  '#22c55e', // 🟢
  '#16a34a',
  '#facc15', // 🟡
  '#eab308',
  '#fbbf24',
  '#fde047',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#3b82f6', // 🔘
  '#2563eb',
  '#60a5fa',
  '#93c5fd',
  '#6366f1',
  '#818cf8',
];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[0px]',
  description: 'min-w-[350px]',
  order: 'min-w-[0px]',
  location: 'min-w-[00px]',
  doc_type: 'min-w-[00px]',
  plntwkcntr: 'min-w-[0px]',
  date_in: 'min-w-[0px]',
  doc_status: 'min-w-[100px]',

  priority: 'min-w-[00px]',
  status_pe: 'min-w-[0px]',
  cek_sm4: 'min-w-[0px]',
  cek_cs4: 'min-w-[0px]',
  cek_sm1: 'min-w-[0px]',
  cek_cs1: 'min-w-[0px]',
  cek_mw: 'min-w-[0px]',
  nd: 'min-w-[0px]',
  tjo: 'min-w-[0px]',
  other: 'min-w-[0px]',
  status_job: 'min-w-[00px]',
  remark: 'min-w-[200px]',
  sp: 'min-w-[120px]',
  loc_doc: 'min-w-[0px]',
  date_out: 'min-w-[0px]',
};

const COLUMN_ORDER: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },

  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  { key: 'plntwkcntr', label: 'Plnt' },
  { key: 'doc_type', label: 'Doc' },
  { key: 'location', label: 'Location' },
  { key: 'date_in', label: 'Date In' },
  { key: 'doc_status', label: 'Doc Status' },

  { key: 'status_job', label: 'Status Job' },
  { key: 'priority', label: 'Priority' },
  { key: 'remark', label: 'Remark' },
  { key: 'status_sm1', label: 'W301' },

  { key: 'status_cs1', label: 'W302' },
  { key: 'status_mw', label: 'W303' },
  { key: 'status_sm4', label: 'W304' },
  { key: 'status_cs4', label: 'W305' },
  { key: 'nd', label: 'NDT' },
  { key: 'tjo', label: 'TJO' },
  { key: 'other', label: 'TV/TC' },
  { key: 'sp', label: 'SP' },
  { key: 'loc_doc', label: 'Loc Doc/Part' },
  { key: 'date_out', label: 'Date Out' },
];

type ToggleProps = {
  value: boolean; // true jika ON (diklik ke kanan)
  onClick: () => void;
  color: string; // 'gray', 'red', 'yellow', 'green'
};

const ToggleSwitch: React.FC<ToggleProps> = ({ value, onClick, color }) => {
  const bgClass = value
    ? color === 'green'
      ? 'bg-green-500'
      : color === 'yellow'
      ? 'bg-yellow-400'
      : color === 'red'
      ? 'bg-red-500'
      : color === 'blue'
      ? 'bg-blue-500'
      : 'bg-gray-300'
    : 'bg-gray-300'; // ❗ OFF = selalu abu-abu

  return (
    <div
      onClick={onClick}
      className={`w-8 h-4 flex items-center rounded-full cursor-pointer p-0.5 transition-colors mx-auto ${bgClass}`}
    >
      <div
        className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
          value ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

// Daftar kolom yang pakai badge warna
const STATUS_COLUMNS = [
  'status_job',
  'status_sm1',
  'status_cs1',
  'status_mw',
  'status_sm4',
  'status_cs4',
  'nd',
  'tjo',
  'other',
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

const FILTERED_PLNTWKCNTR = [
  'CGK',
  'GAH1',
  'GAH2',
  'GAH3',
  'GAH4',
  'WSSR',
  'WSST',
];

const sortOptions = [
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
  { value: 'location', label: 'Location' },
  { value: 'doc_type', label: 'Doc Type' },
  { value: 'date_in', label: 'Date In' },
  { value: 'doc_status', label: 'Doc Status' },
  { value: 'plntwkcntr', label: 'Plntwkcntr' },
];

type OrderFilter = {
  value: string;
  valid: boolean;
};

export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');
  const [filterStatusJob, setFilterStatusJob] = useState('');
  const [filterBase, setFilterBase] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [filterW, setFilterW] = useState('');

  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  // filter ac reg
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filterOrders, setFilterOrders] = useState<string[]>([]);
  const [orderInput, setOrderInput] = useState('');
  const [orderSuggestions, setOrderSuggestions] = useState<string[]>([]);
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);

  useEffect(() => {
    if (orderInput.trim() === '') {
      setOrderSuggestions([]);
      return;
    }

    const uniqueOrders = Array.from(new Set(rows.map((r) => String(r.order))));

    const filtered = uniqueOrders.filter((ord) =>
      ord.toLowerCase().includes(orderInput.toLowerCase())
    );

    setOrderSuggestions(filtered.slice(0, 10)); // batasi max 10
  }, [orderInput, rows]);

  const handleAddOrder = (order: string) => {
    const normalized = String(order).trim();
    if (normalized === '') return;

    const alreadyExist = filterOrders.some((o) => o.value === normalized);
    if (alreadyExist) return;

    // ✅ cek valid atau tidak
    const isValid = rows.some((r) => String(r.order) === normalized);

    setFilterOrders((prev) => [...prev, { value: normalized, valid: isValid }]);
    setOrderInput('');
    setShowOrderSuggestions(false);
  };

  const handleRemoveOrder = (order: string) => {
    setFilterOrders(filterOrders.filter((o) => o.value !== order));
  };

  // Ambil unique A/C Reg dari rows
  const uniqueAcRegs = [
    ...new Set(rows.map((r) => r.ac_reg).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  // Filter opsi berdasarkan input
  const filteredOptions = uniqueAcRegs.filter((reg) =>
    reg.toLowerCase().includes(filterAcReg.toLowerCase())
  );
  //////

  const confirmAction = (action: () => void) => {
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const handleAction = async (action: 'copy' | 'save') => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    switch (action) {
      case 'copy':
        const selectedData = rows
          .filter((row) => selectedRows.includes(row.id))
          .map((row) => [
            row.ac_reg,
            row.order,
            row.description,
            row.doc_status,
            row.status_job,
            row.remark,
            row.loc_doc,
          ])
          .map((fields) => fields.join('\t'))
          .join('\n');

        navigator.clipboard
          .writeText(selectedData)
          .then(() => setNotification('✅ Data copied to clipboard!'))
          .catch(() => setNotification('❌ Failed to copy to clipboard.'));
        break;

      case 'save':
        const selectedForExport = rows
          .filter((row) => selectedRows.includes(row.id))
          .map((row, index) => ({
            No: index + 1,
            'A/C Reg': row.ac_reg,
            Order: row.order,
            Description: row.description,
            'Doc Status': row.doc_status,
            'Status Job': row.status_job,
            Remark: row.remark,
            SP: row.sp,
            'Loc Doc/Part': row.loc_doc,
          }));

        if (selectedForExport.length === 0) {
          setNotification('❗ No data to export.');
          break;
        }

        const worksheet = XLSX.utils.json_to_sheet(selectedForExport);
        const workbook = XLSX.utils.book_new();
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        const sheetName = `Dashboard MNTP ${formattedDate}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `Dashboard_MNTP_${formattedDate}.xlsx`);
        setNotification('✅ Data exported as Excel file!');
        break;
    }

    setShowMenu(false);
    setSelectedRows([]);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleActionWithConfirmation = (action: 'copy' | 'save') => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    const confirmMessages: Record<typeof action, string> = {
      copy: 'Are you sure you want to copy the selected rows?',
      save: 'Are you sure you want to export the selected rows?',
    };

    setPendingAction(() => () => handleAction(action));
    setConfirmMessage(confirmMessages[action]); // ← inject message
    setShowConfirmModal(true); // show modal
    setShowMenu(false); // close dropdown
  };

  useEffect(() => {
    if (notification) {
      const handleClickOutside = () => {
        setNotification(null);
      };

      // Tambahkan listener saat notifikasi muncul
      window.addEventListener('mousedown', handleClickOutside);

      // Bersihkan listener saat notifikasi hilang
      return () => {
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [notification]);

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let allRows: any[] = [];
      let from = 0;
      const limit = 1000;
      let moreData = true;

      while (moreData) {
        const { data, error } = await supabase
          .from('mdr_tracking')
          .select('*')
          .eq('archived', false)
          .order('date_in', { ascending: false })
          .range(from, from + limit - 1); // ambil per 1000

        if (error) {
          console.error('Error fetching data:', error);
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

      setRows(allRows);

      // 🔽 Tambahan: filter hanya priority "High"
      const highPriority = allRows
        .filter((row) => row.priority === 'High')
        .sort(
          (a, b) =>
            new Date(b.date_in).getTime() - new Date(a.date_in).getTime()
        );

      setPriorityData(highPriority);
    };

    fetchData();
  }, []);

  const filteredRows = rows
    .filter((row) => {
      if (showOnlyChecked && !selectedRows.includes(row.id)) return false;

      // khusus filter order multiple
      const matchesOrder =
        filterOrders.length === 0 ||
        filterOrders.some((o) => o.value === String(row.order));

      const matchesSearch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesAcReg = filterAcReg === '' || row.ac_reg === filterAcReg;
      const matchesPriority =
        filterPriority === 'All' ? true : row.priority === filterPriority;
      const matchesDocStatus =
        filterDocStatus === '' || row.doc_status === filterDocStatus;
      const matchesStatusJob =
        filterStatusJob === '' || row.status_job === filterStatusJob;
      const matchesPlntwkcntr = FILTERED_PLNTWKCNTR.includes(
        (row.plntwkcntr || '').toUpperCase()
      );

      // ✅ tambahan filter untuk W301–W305
      const matchesW =
        filterW === ''
          ? true
          : filterW === 'W301'
          ? !!row.cek_sm1
          : filterW === 'W302'
          ? !!row.cek_cs1
          : filterW === 'W303'
          ? !!row.cek_mw
          : filterW === 'W304'
          ? !!row.cek_sm4
          : filterW === 'W305'
          ? !!row.cek_cs4
          : true;

      // ✅ Tambahan filter Base
      const matchesBase =
        filterBase === ''
          ? true
          : filterBase === 'Workshop 1'
          ? ['CGK', 'GAH1', 'GAH2', 'GAH3', 'WSST'].includes(
              (row.plntwkcntr || '').toUpperCase()
            )
          : filterBase === 'Hangar 4'
          ? ['GAH4', 'WSSR'].includes((row.plntwkcntr || '').toUpperCase())
          : true;

      return (
        matchesOrder &&
        matchesSearch &&
        matchesAcReg &&
        matchesDocStatus &&
        matchesStatusJob &&
        matchesPlntwkcntr &&
        matchesW &&
        matchesBase &&
        matchesPriority
      );
    })

    .sort((a, b) => {
      if (!sortKey) return 0;

      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';

      if (sortKey.includes('date')) {
        return sortDirection === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }

      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        return sortDirection === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  // helper kecil (opsional) untuk memastikan cek_sm1 benar-benar terdeteksi
  const isChecked = (v: any) => {
    // sesuaikan kalau cek_sm1 bisa jadi '1'/'0' atau 'Y'/'N'
    return (
      v === true ||
      v === 1 ||
      v === '1' ||
      String(v).toLowerCase() === 'true' ||
      !!v
    );
  };

  // helper untuk normalisasi status
  const getStatus = (s: any) =>
    String(s ?? '')
      .trim()
      .toUpperCase();

  //w301
  // Hitung donut berdasarkan filteredRows, tetapi hanya untuk baris yang cek_sm1 truthy
  const openCountSm1 = filteredRows.filter(
    (r) => isChecked(r.cek_sm1) && getStatus(r.status_sm1) === 'OPEN'
  ).length;

  const progressCountSm1 = filteredRows.filter(
    (r) => isChecked(r.cek_sm1) && getStatus(r.status_sm1) === 'PROGRESS'
  ).length;

  const closedCountSm1 = filteredRows.filter(
    (r) => isChecked(r.cek_sm1) && getStatus(r.status_sm1) === 'CLOSED'
  ).length;

  // Total yang punya nilai cek_sm1 (sesuai definisi isChecked)
  const totalWithCekSm1 = filteredRows.filter((r) =>
    isChecked(r.cek_sm1)
  ).length;

  // undefined = baris dengan cek_sm1 true tetapi status_sm1 bukan OPEN/PROGRESS/CLOSED
  const undefinedCountSm1 = Math.max(
    0,
    totalWithCekSm1 - (openCountSm1 + progressCountSm1 + closedCountSm1)
  );

  // Data untuk donut chart — pakai warna yang sama seperti yang benar sebelumnya
  const chartDataSm1 = [
    { name: 'OPEN', value: openCountSm1, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: progressCountSm1, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: closedCountSm1, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: undefinedCountSm1, color: '#9ca3af' }, // abu
  ];

  // Persentase closed (1 desimal)
  const closedPercentageSm1 =
    totalWithCekSm1 > 0
      ? ((closedCountSm1 / totalWithCekSm1) * 100).toFixed(1)
      : '0';

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // hitung data status_sm1 donut chart
  const statusSm1Counts = rows.reduce(
    (acc, row) => {
      if (row.cek_sm1) {
        if (row.status_sm1 === 'OPEN') acc.OPEN++;
        else if (row.status_sm1 === 'PROGRESS') acc.PROGRESS++;
        else if (row.status_sm1 === 'CLOSED') acc.CLOSED++;
        else acc.UNDEFINED++;
      }
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0, UNDEFINED: 0 }
  );

  const totalSm1 =
    statusSm1Counts.OPEN +
    statusSm1Counts.PROGRESS +
    statusSm1Counts.CLOSED +
    statusSm1Counts.UNDEFINED;

  const percentClosedSm1 = (
    (statusSm1Counts.CLOSED / (totalSm1 || 1)) *
    100
  ).toFixed(0);
  ///////

  // chart w302
  // Hitung donut berdasarkan filteredRows, tetapi hanya untuk baris yang Cs1 truthy
  const openCountCs1 = filteredRows.filter(
    (r) => isChecked(r.cek_cs1) && getStatus(r.status_cs1) === 'OPEN'
  ).length;

  const progressCountCs1 = filteredRows.filter(
    (r) => isChecked(r.cek_cs1) && getStatus(r.status_cs1) === 'PROGRESS'
  ).length;

  const closedCountCs1 = filteredRows.filter(
    (r) => isChecked(r.cek_cs1) && getStatus(r.status_cs1) === 'CLOSED'
  ).length;

  // Total yang punya nilai cek_Cs1 (sesuai definisi isChecked)
  const totalWithCekCs1 = filteredRows.filter((r) =>
    isChecked(r.cek_cs1)
  ).length;

  // undefined = baris dengan cek_Cs1 true tetapi status_Cs1 bukan OPEN/PROGRESS/CLOSED
  const undefinedCountCs1 = Math.max(
    0,
    totalWithCekCs1 - (openCountCs1 + progressCountCs1 + closedCountCs1)
  );

  // Data untuk donut chart — pakai warna yang sama seperti yang benar sebelumnya
  const chartDataCs1 = [
    { name: 'OPEN', value: openCountCs1, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: progressCountCs1, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: closedCountCs1, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: undefinedCountCs1, color: '#9ca3af' }, // abu
  ];

  // Persentase closed (1 desimal)
  const closedPercentageCs1 =
    totalWithCekCs1 > 0
      ? ((closedCountCs1 / totalWithCekCs1) * 100).toFixed(1)
      : '0';

  // hitung data status_Cs1 donut chart
  const statusCs1Counts = rows.reduce(
    (acc, row) => {
      if (row.cek_cs1) {
        if (row.status_cs1 === 'OPEN') acc.OPEN++;
        else if (row.status_cs1 === 'PROGRESS') acc.PROGRESS++;
        else if (row.status_cs1 === 'CLOSED') acc.CLOSED++;
        else acc.UNDEFINED++;
      }
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0, UNDEFINED: 0 }
  );

  const totalCs1 =
    statusCs1Counts.OPEN +
    statusCs1Counts.PROGRESS +
    statusCs1Counts.CLOSED +
    statusCs1Counts.UNDEFINED;

  const percentClosedCs1 = (
    (statusCs1Counts.CLOSED / (totalCs1 || 1)) *
    100
  ).toFixed(0);
  ////////

  // chart w303
  // Hitung donut berdasarkan filteredRows, tetapi hanya untuk baris yang Mw truthy
  const openCountMw = filteredRows.filter(
    (r) => isChecked(r.cek_mw) && getStatus(r.status_mw) === 'OPEN'
  ).length;

  const progressCountMw = filteredRows.filter(
    (r) => isChecked(r.cek_mw) && getStatus(r.status_mw) === 'PROGRESS'
  ).length;

  const closedCountMw = filteredRows.filter(
    (r) => isChecked(r.cek_mw) && getStatus(r.status_mw) === 'CLOSED'
  ).length;

  // Total yang punya nilai cek_Mw (sesuai definisi isChecked)
  const totalWithCekMw = filteredRows.filter((r) => isChecked(r.cek_mw)).length;

  // undefined = baris dengan cek_Mw true tetapi status_Mw bukan OPEN/PROGRESS/CLOSED
  const undefinedCountMw = Math.max(
    0,
    totalWithCekMw - (openCountMw + progressCountMw + closedCountMw)
  );

  // Data untuk donut chart — pakai warna yang sama seperti yang benar sebelumnya
  const chartDataMw = [
    { name: 'OPEN', value: openCountMw, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: progressCountMw, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: closedCountMw, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: undefinedCountMw, color: '#9ca3af' }, // abu
  ];

  // Persentase closed (1 desimal)
  const closedPercentageMw =
    totalWithCekMw > 0
      ? ((closedCountMw / totalWithCekMw) * 100).toFixed(1)
      : '0';

  // hitung data status donut chart
  const statusMwCounts = rows.reduce(
    (acc, row) => {
      if (row.cek_mw) {
        if (row.status_mw === 'OPEN') acc.OPEN++;
        else if (row.status_mw === 'PROGRESS') acc.PROGRESS++;
        else if (row.status_mw === 'CLOSED') acc.CLOSED++;
        else acc.UNDEFINED++;
      }
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0, UNDEFINED: 0 }
  );

  const totalMw =
    statusMwCounts.OPEN +
    statusMwCounts.PROGRESS +
    statusMwCounts.CLOSED +
    statusMwCounts.UNDEFINED;

  const percentClosedMw = (
    (statusMwCounts.CLOSED / (totalMw || 1)) *
    100
  ).toFixed(0);
  ////////

  //w304
  // Hitung donut berdasarkan filteredRows, tetapi hanya untuk baris yang cek_sm4 truthy
  const openCountSm4 = filteredRows.filter(
    (r) => isChecked(r.cek_sm4) && getStatus(r.status_sm4) === 'OPEN'
  ).length;

  const progressCountSm4 = filteredRows.filter(
    (r) => isChecked(r.cek_sm4) && getStatus(r.status_sm4) === 'PROGRESS'
  ).length;

  const closedCountSm4 = filteredRows.filter(
    (r) => isChecked(r.cek_sm4) && getStatus(r.status_sm4) === 'CLOSED'
  ).length;

  // Total yang punya nilai cek_sm4 (sesuai definisi isChecked)
  const totalWithCekSm4 = filteredRows.filter((r) =>
    isChecked(r.cek_sm4)
  ).length;

  // undefined = baris dengan cek_sm4 true tetapi status_sm4 bukan OPEN/PROGRESS/CLOSED
  const undefinedCountSm4 = Math.max(
    0,
    totalWithCekSm4 - (openCountSm4 + progressCountSm4 + closedCountSm4)
  );

  // Data untuk donut chart — pakai warna yang sama seperti yang benar sebelumnya
  const chartDataSm4 = [
    { name: 'OPEN', value: openCountSm4, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: progressCountSm4, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: closedCountSm4, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: undefinedCountSm4, color: '#9ca3af' }, // abu
  ];

  // Persentase closed (1 desimal)
  const closedPercentageSm4 =
    totalWithCekSm4 > 0
      ? ((closedCountSm4 / totalWithCekSm4) * 100).toFixed(1)
      : '0';

  // hitung data status_sm4 donut chart
  const statusSm4Counts = rows.reduce(
    (acc, row) => {
      if (row.cek_sm4) {
        if (row.status_sm4 === 'OPEN') acc.OPEN++;
        else if (row.status_sm4 === 'PROGRESS') acc.PROGRESS++;
        else if (row.status_sm4 === 'CLOSED') acc.CLOSED++;
        else acc.UNDEFINED++;
      }
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0, UNDEFINED: 0 }
  );

  const totalSm4 =
    statusSm4Counts.OPEN +
    statusSm4Counts.PROGRESS +
    statusSm4Counts.CLOSED +
    statusSm4Counts.UNDEFINED;

  const percentClosedSm4 = (
    (statusSm4Counts.CLOSED / (totalSm4 || 1)) *
    100
  ).toFixed(0);
  ///////

  // chart w305
  // Hitung donut berdasarkan filteredRows, tetapi hanya untuk baris yang Cs4 truthy
  const openCountCs4 = filteredRows.filter(
    (r) => isChecked(r.cek_cs4) && getStatus(r.status_cs4) === 'OPEN'
  ).length;

  const progressCountCs4 = filteredRows.filter(
    (r) => isChecked(r.cek_cs4) && getStatus(r.status_cs4) === 'PROGRESS'
  ).length;

  const closedCountCs4 = filteredRows.filter(
    (r) => isChecked(r.cek_cs4) && getStatus(r.status_cs4) === 'CLOSED'
  ).length;

  // Total yang punya nilai cek_Cs4 (sesuai definisi isChecked)
  const totalWithCekCs4 = filteredRows.filter((r) =>
    isChecked(r.cek_cs4)
  ).length;

  // undefined = baris dengan cek_Cs4 true tetapi status_Cs4 bukan OPEN/PROGRESS/CLOSED
  const undefinedCountCs4 = Math.max(
    0,
    totalWithCekCs4 - (openCountCs4 + progressCountCs4 + closedCountCs4)
  );

  // Data untuk donut chart — pakai warna yang sama seperti yang benar sebelumnya
  const chartDataCs4 = [
    { name: 'OPEN', value: openCountCs4, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: progressCountCs4, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: closedCountCs4, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: undefinedCountCs4, color: '#9ca3af' }, // abu
  ];

  // Persentase closed (1 desimal)
  const closedPercentageCs4 =
    totalWithCekCs4 > 0
      ? ((closedCountCs4 / totalWithCekCs4) * 100).toFixed(1)
      : '0';

  // hitung data status_Cs4 donut chart
  const statusCs4Counts = rows.reduce(
    (acc, row) => {
      if (row.cek_cs4) {
        if (row.status_cs4 === 'OPEN') acc.OPEN++;
        else if (row.status_cs4 === 'PROGRESS') acc.PROGRESS++;
        else if (row.status_cs4 === 'CLOSED') acc.CLOSED++;
        else acc.UNDEFINED++;
      }
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0, UNDEFINED: 0 }
  );

  const totalCs4 =
    statusCs4Counts.OPEN +
    statusCs4Counts.PROGRESS +
    statusCs4Counts.CLOSED +
    statusCs4Counts.UNDEFINED;

  const percentClosedCs4 = (
    (statusCs4Counts.CLOSED / (totalCs4 || 1)) *
    100
  ).toFixed(0);
  ////////

  // Hitung jumlah masing-masing doc_status dari filteredRows
  const docStatusCounts = docStatusList.map((status) => ({
    name: status,
    value: filteredRows.filter((r) => r.doc_status === status).length,
    color: docStatusColors[docStatusList.indexOf(status)] || '#9ca3af',
  }));

  // Total dari filteredRows
  const totalDocStatus = docStatusCounts.reduce(
    (acc, item) => acc + item.value,
    0
  );

  ///////////////

  const chartData = [
    { name: 'OPEN', value: statusSm1Counts.OPEN, color: '#ef4444' }, // merah
    { name: 'PROGRESS', value: statusSm1Counts.PROGRESS, color: '#facc15' }, // kuning
    { name: 'CLOSED', value: statusSm1Counts.CLOSED, color: '#22c55e' }, // hijau
    { name: 'UNDEFINED', value: statusSm1Counts.UNDEFINED, color: '#9ca3af' }, // abu
  ];

  // kotak status job
  const statusCounts = filteredRows.reduce(
    (acc, row) => {
      if (row.status_job === 'OPEN') acc.OPEN++;
      if (row.status_job === 'PROGRESS') acc.PROGRESS++;
      if (row.status_job === 'CLOSED') acc.CLOSED++;
      return acc;
    },
    { OPEN: 0, PROGRESS: 0, CLOSED: 0 }
  );
  //

  return (
    <div className="bg-gray-100 w-full h-full">
      <div className="bg-white px-3 pt-3 pb-6 max-h-[280vh] overflow-hidden w-full rounded-lg">
        {/* 📊 Status Summary dan Donut Chart */}
        <div className="flex flex-col md:flex-row gap-4 w-full items-start mb-3">
          {/* 🔹 Kiri: Dua box sejajar (Status + Priority) */}
          <div className="flex flex-col md:flex-row gap-3 flex-wrap w-full md:w-auto max-w-[820px]">
            {/* STATUS DOCUMENT */}
            <div className="flex flex-col border rounded-[10px] shadow min-w-[230px] max-w-[350px] h-[187px]">
              {/* Header */}
              <div className="flex justify-between items-center w-full px-4 bg-[#7864bc] rounded-t-[10px]">
                <h3 className="text-white py-0 font-bold">STATUS DOCUMENT</h3>
                <span className="text-sm font-bold text-white">
                  {(
                    (docStatusCounts
                      .filter(
                        (d) => d.name.includes('🟢') || d.name.includes('🟘')
                      )
                      .reduce((acc, d) => acc + d.value, 0) /
                      (totalDocStatus || 1)) *
                    100
                  ).toFixed(0)}
                  %
                </span>
              </div>

              {/* List */}
              <ul className="w-full max-h-full overflow-y-auto text-xs divide-y divide-gray-200">
                {docStatusCounts.map((entry, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center px-2 py-1"
                  >
                    <span>{entry.name}</span>
                    <span className="font-semibold text-gray-700">
                      {entry.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRIORITY BOX */}
            <div className="flex flex-col border rounded-[10px] shadow min-w-[250px] max-w-[350px] h-[187px]">
              <div className="flex justify-between items-center w-full px-4 bg-red-500 rounded-t-[10px]">
                <h3 className="text-white py-0 font-bold">HIGH PRIORITY</h3>
                <span className="text-sm font-bold text-white">
                  {
                    filteredRows.filter(
                      (r) => r.priority === 'High' && r.archived === false
                    ).length
                  }{' '}
                  ORDER
                </span>
              </div>

              <ul className="w-full max-h-full overflow-y-auto text-xs divide-y divide-gray-200">
                {filteredRows
                  .filter((r) => r.priority === 'High' && r.archived === false)
                  .sort(
                    // urutkan agar yang terbaru ada di BAWAH
                    (a, b) =>
                      new Date(a.date_in).getTime() -
                      new Date(b.date_in).getTime()
                  )
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col px-2 py-1 text-gray-800"
                    >
                      {/* AC REG + ORDER + STATUS JOB */}
                      <span className="font-bold text-blue-500 flex flex-wrap items-center gap-1">
                        {item.ac_reg} • {item.order}
                        {item.status_job && (
                          <>
                            <span className="text-gray-500">→</span>
                            <span
                              className={`font-bold ${
                                item.status_job === 'OPEN'
                                  ? 'text-red-500'
                                  : item.status_job === 'PROGRESS'
                                  ? 'text-yellow-500'
                                  : item.status_job === 'CLOSED'
                                  ? 'text-green-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {item.status_job}
                            </span>
                          </>
                        )}
                      </span>

                      {/* DESCRIPTION */}
                      <span className="text-[11px] whitespace-pre-line">
                        {item.description}
                      </span>

                      {/* REMARK (ITALIC) */}
                      {item.remark && (
                        <span className="text-[11px] italic text-gray-500">
                          {item.remark}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* 🔹 Kanan: Kotak + PieChart W301-W305 */}
          <div className="flex flex-col flex-1 gap-3 ">
            {/* Baris 1: Kotak Status */}
            <div className="flex flex-wrap gap-3 ">
              {/* PERCENTAGE */}
              <div className="border rounded-[10px] overflow-hidden text-center w-[125px] h-14 shadow flex-1  min-w-fit max-w-[200px]">
                <div className="bg-blue-500 text-white py-0 font-bold">
                  PERCENT
                </div>
                <div className="bg-white text-blue-500 text-lg font-bold py-0 text-center">
                  {(
                    (statusCounts.CLOSED /
                      (statusCounts.OPEN +
                        statusCounts.PROGRESS +
                        statusCounts.CLOSED || 1)) *
                    100
                  ).toFixed(0)}
                  %
                </div>
              </div>

              {/* OPEN */}
              <div className="border rounded-[10px] overflow-hidden text-center w-[125px] h-14 shadow flex-1  min-w-fit max-w-[200px]">
                <div className="bg-red-500 text-white py-0 font-bold">OPEN</div>
                <div className="bg-white text-red-500 text-lg font-bold py-0 text-center">
                  {statusCounts.OPEN}
                </div>
              </div>

              {/* PROGRESS */}
              <div className="border rounded-[10px] overflow-hidden text-center w-[125px] h-14 shadow flex-1  min-w-fit max-w-[200px]">
                <div className="bg-yellow-500 text-white py-0 font-bold">
                  PROGRESS
                </div>
                <div className="bg-white text-yellow-500 text-lg font-bold py-0 text-center">
                  {statusCounts.PROGRESS}
                </div>
              </div>

              {/* CLOSED */}
              <div className="border rounded-[10px] overflow-hidden text-center w-[125px] h-15 shadow flex-1 min-w-fit  max-w-[200px]">
                <div className="bg-green-500 text-white py-0 font-bold">
                  CLOSED
                </div>
                <div className="bg-white text-green-500 text-lg font-bold py-0 text-center">
                  {statusCounts.CLOSED}
                </div>
              </div>

              {/* TOTAL */}
              <div className="border rounded-[10px] overflow-hidden text-center w-[125px] h-14 shadow flex-1 min-w-fit max-w-[200px]">
                <div className="bg-[#e36b45] text-white py-0 font-bold">
                  TOTAL
                </div>
                <div className="bg-white text-gray-700 text-lg font-bold py-0 text-center">
                  {statusCounts.OPEN +
                    statusCounts.PROGRESS +
                    statusCounts.CLOSED}
                </div>
              </div>
            </div>

            {/* Baris 2: Chart Status W301-W305 */}
            <div className="flex flex-wrap gap-3">
              {/* Status W301 */}
              <div className="flex flex-col items-center border py-2 px-2 rounded-[10px] w-[125px] shadow flex-1 min-w-fit max-w-[200px]">
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  SHEETMETAL WS1
                </h3>
                <PieChart width={94} height={80}>
                  <Pie
                    data={chartDataSm1}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                  >
                    {chartDataSm1.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      value={`${closedPercentageSm1}%`}
                      position="center"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fill: '#374151',
                      }}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name}`,
                    ]}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </div>

              <div className="flex flex-col items-center border py-2 px-2 rounded-[10px] w-[125px] shadow flex-1 min-w-fit max-w-[200px]">
                {/* chart Status W302 */}
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  COMPOSITE WS1
                </h3>

                <PieChart width={90} height={80}>
                  <Pie
                    data={chartDataCs1}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                  >
                    {chartDataCs1.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    {/* Label di tengah donut */}
                    <Label
                      value={`${closedPercentageCs1}%`}
                      position="center"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fill: '#374151', // abu tua
                      }}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name}`,
                    ]}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </div>

              <div className="flex flex-col items-center border py-2 px-2 rounded-[10px] w-[125px] shadow flex-1 min-w-fit max-w-[200px]">
                {/* chart Status W303 */}
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  MACHINING WS1
                </h3>

                <PieChart width={90} height={80}>
                  <Pie
                    data={chartDataMw}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                  >
                    {chartDataCs1.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    {/* Label di tengah donut */}
                    <Label
                      value={`${closedPercentageMw}%`}
                      position="center"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fill: '#374151', // abu tua
                      }}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name}`,
                    ]}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </div>

              <div className="flex flex-col items-center border py-2 px-2 rounded-[10px] w-[125px] shadow flex-1 min-w-fit max-w-[200px]">
                {/* chart Status W304 */}
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  SHEETMETAL H4
                </h3>

                <PieChart width={90} height={80}>
                  <Pie
                    data={chartDataSm4}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                  >
                    {chartDataSm4.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    {/* Label di tengah donut */}
                    <Label
                      value={`${closedPercentageSm4}%`}
                      position="center"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fill: '#374151', // abu tua
                      }}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name}`,
                    ]}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </div>

              <div className="flex flex-col items-center border py-2 px-2 rounded-[10px] w-[125px] shadow flex-1 min-w-fit max-w-[200px]">
                {/* chart Status W305 */}
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  COMPOSITE H4
                </h3>

                <PieChart width={90} height={80}>
                  <Pie
                    data={chartDataCs4}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                  >
                    {chartDataCs4.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    {/* Label di tengah donut */}
                    <Label
                      value={`${closedPercentageCs4}%`}
                      position="center"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fill: '#374151', // abu tua
                      }}
                    />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name}`,
                    ]}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-start gap-2">
          {/* Kotak input + chips */}
          <div className="flex flex-wrap gap-1 border rounded px-1 py-1 relative flex-1">
            {filterOrders.map((order) => (
              <span
                key={order.value}
                className={`flex items-center px-2 py-1 rounded-full text-xs ${
                  order.valid
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.value}
                <button
                  onClick={() => handleRemoveOrder(order.value)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            ))}

            <input
              type="text"
              value={orderInput}
              onChange={(e) => {
                setOrderInput(e.target.value);
                setShowOrderSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && orderInput.trim() !== '') {
                  handleAddOrder(orderInput.trim());
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text');
                const items = pasted
                  .split(/\s|,|\n/)
                  .map((s) => s.trim())
                  .filter((s) => s !== '');
                items.forEach((item) => handleAddOrder(item));
              }}
              placeholder="Type or paste order no..."
              className="rounded flex-1 text-[11px] outline-none px-1 w-full hover:bg-gray-50"
            />

            {showOrderSuggestions && orderSuggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 w-full border rounded bg-white shadow max-h-40 overflow-y-auto text-xs z-20">
                {orderSuggestions.map((sug) => (
                  <li
                    key={sug}
                    onClick={() => handleAddOrder(sug)}
                    className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                  >
                    {sug}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-1 items-center ">
          <div className="flex items-center ml-0">
            <span className="text-xs font-medium"></span>
            <label className="relative inline-flex items-center cursor-pointer select-none w-11 h-5">
              <input
                type="checkbox"
                checked={showCheckboxColumn}
                onChange={() => setShowCheckboxColumn(!showCheckboxColumn)}
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

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1 text-[11px] w-full hover:bg-gray-50 shadow-sm flex-1"
          />

          <div className="relative w-[120px] ">
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
              className="border rounded px-2 py-1 text-[11px] w-full hover:bg-gray-50 shadow-sm flex-1"
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

          <button
            onClick={() => setShowOnlyChecked((prev) => !prev)}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-1.5 py-1 bg-white text-[11px] font-normal  hover:bg-gray-50 "
          >
            {showOnlyChecked ? 'Checked Row' : 'All Row'}
          </button>

          <div className="flex items-center gap-1 ">
            {/* Dropdown Menu */}
            <div className="relative inline-block text-left ml-0 w-[65px]">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-1.5 py-1 bg-white text-[11px] font-normal hover:bg-gray-50"
              >
                Actions
              </button>

              {showMenu && (
                <div className="absolute z-50 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-0 text-[11px]">
                    <button
                      onClick={() => handleAction('copy')}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation('save')}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                    >
                      💾 Export
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <CustomSelect
            value={filterBase}
            onChange={(e) => setFilterBase(e.target.value)}
            options={[
              { label: 'All Base', value: '' },
              { label: 'Workshop 1', value: 'Workshop 1' },
              { label: 'Hangar 4', value: 'Hangar 4' },
            ]}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow w-[100px]"
          />

          <CustomSelect
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            options={[
              { label: 'All Priority', value: 'All' },
              { label: 'Med', value: 'Med' },
              { label: 'High', value: 'High' },
            ]}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow w-[100px]"
          />

          <CustomSelect
            value={filterDocStatus}
            onChange={(e) => setFilterDocStatus(e.target.value)}
            options={[
              { label: 'All Doc Status', value: '' },
              ...DOC_STATUS_OPTIONS.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            className="border rounded px-1 py-1 text-[11px]  font-normal hover:bg-gray-50 shadow w-[120px]"
          />

          <CustomSelect
            value={filterW}
            onChange={(e) => setFilterW(e.target.value)}
            options={[
              { label: 'All Wrkctr', value: '' },
              { label: 'W301', value: 'W301' },
              { label: 'W302', value: 'W302' },
              { label: 'W303', value: 'W303' },
              { label: 'W304', value: 'W304' },
              { label: 'W305', value: 'W305' },
            ]}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow w-[100px]"
          />

          <CustomSelect
            value={filterStatusJob}
            onChange={(e) => setFilterStatusJob(e.target.value)}
            options={[
              { label: 'All Status Job', value: '' },
              { label: 'OPEN', value: 'OPEN' },
              { label: 'PROGRESS', value: 'PROGRESS' },
              { label: 'CLOSED', value: 'CLOSED' },
            ]}
            className="border rounded px-1 py-1 text-[11px]   font-normal hover:bg-gray-50 shadow w-[100px]"
          />

          {/* Sort By */}
          <CustomSelect
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            options={[
              { label: 'Sort by...', value: '' },
              ...sortOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
            ]}
            className="border rounded px-1 py-1 text-[11px]   font-normal hover:bg-gray-50 shadow w-[80px]"
          />

          {/* Sort Direction */}
          <CustomSelect
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            options={[
              { label: 'A-Z', value: 'asc' },
              { label: 'Z-A', value: 'desc' },
            ]}
            className="border rounded px-1 py-1 text-[11px]  font-normal  hover:bg-gray-50 shadow w-[80px]"
          />
        </div>

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-auto max-h-[50vh] border border-gray-300 rounded shadow-inner">
          <table className="w-full whitespace-nowrap table-auto text-[11px] leading-tight">
            <thead className="sticky top-0 z-10 bg-white shadow">
              <tr className="bg-[#00919f] text-white text-xs font-semibold text-center">
                {/* ✅ Tampilkan checkbox hanya jika showCheckboxColumn true */}
                {showCheckboxColumn && (
                  <th className="border px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === filteredRows.length &&
                        filteredRows.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredRows.map((r) => r.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                    />
                  </th>
                )}

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
                  {showCheckboxColumn && (
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                      />
                    </td>
                  )}

                  {COLUMN_ORDER.map(({ key }) => (
                    <td
                      key={key}
                      className={`border px-1 py-1 ${columnWidths[key] || ''} ${
                        key === 'description' || key === 'doc_status'
                          ? 'text-left  break-words whitespace-normal'
                          : 'text-center'
                      }`}
                    >
                      {[
                        'status_job',
                        'status_sm1',
                        'status_cs1',
                        'status_mw',
                        'status_sm4',
                        'status_cs4',
                        'nd',
                        'tjo',
                        'other',
                      ].includes(key) ? (
                        <span
                          className={`font-semibold px-1 py-0.5 rounded
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
                          {row[key] || ''}
                        </span>
                      ) : key === 'no' ? (
                        (currentPage - 1) * rowsPerPage + rowIndex + 1
                      ) : key === 'date_in' || key === 'date_out' ? (
                        <span>
                          {row[key]
                            ? new Date(row[key]).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                      ) : key === 'priority' ? (
                        <span
                          className={`font-normal px-1 py-0.5 rounded
        ${
          row[key] === 'High'
            ? 'bg-red-500 text-white'
            : row[key] === 'Med'
            ? 'bg-yellow-500 text-white'
            : ''
        }`}
                        >
                          {row[key] || ''}
                        </span>
                      ) : (
                        String(row[key] ?? '')
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

          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
                <p className="mb-4">{confirmMessage}</p>{' '}
                {/* ← tampilkan pesan dinamis */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowConfirmModal(false);
                      if (pendingAction) {
                        await pendingAction(); // jalankan aksi
                        setPendingAction(null);
                        setSelectedRows([]); // kosongkan ceklis
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
