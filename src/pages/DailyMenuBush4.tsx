import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

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
  '🟢COMPLETED',
  '🟢DONE BY SOA',
  '🟡RO DONE',
  '🟡EVALUATED',
  '🟡WAIT.BDP',
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

const TEXT_INPUT_COLUMNS = ['remark', 'sp'];

const LOC_DOC_OPTIONS = [
  'TJO (DOC ONLY)',
  'TJO (DOC+PART)',
  'LINE (DOC ONLY)',
  'LINE (DOC+PART)',
  'NDT (DOC ONLY)',
  'TV/TC (DOC ONLY)',
];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[0px]',
  description: 'min-w-[350px]',
  order: 'min-w-[0px]',
  location: 'min-w-[00px]',
  doc_type: 'min-w-[00px]',
  plntwkcntr: 'min-w-[0px]',
  date_in: 'min-w-[0px]',
  doc_status: 'min-w-[30px]',
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

  { key: 'cek_sm1', label: 'W301' },

  { key: 'cek_cs1', label: 'W302' },
  { key: 'cek_mw', label: 'W303' },
  { key: 'cek_sm4', label: 'W304' },
  { key: 'cek_cs4', label: 'W305' },
  { key: 'nd', label: 'NDT' },
  { key: 'tjo', label: 'TJO' },
  { key: 'other', label: 'TV/TC' },
  { key: 'status_job', label: 'STATUS JOB' },
  { key: 'remark', label: 'Remark' },
  { key: 'sp', label: 'SP' },
  { key: 'loc_doc', label: 'Loc Doc/Part' },
  { key: 'date_out', label: 'Date Out' },
];

const STATUS_COLORS: Record<string, string> = {
  '': 'bg-gray-300',
  red: 'bg-red-500',
};

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

const STATUS_COLUMNS = [
  'status_sm4',
  'status_sm1',
  'status_cs4',
  'status_cs1',
  'status_mw',
  'nd',
  'tjo',
  'other',
];

const getStatusPE = (
  doc_status: string,
  status_sm1?: string,
  status_sm4?: string,
  status_cs1?: string,
  status_cs4?: string,
  status_mw?: string
): string => {
  const openStatuses = ['🔴NEED RO', '🔴WAIT.REMOVE'];
  const progressStatuses = [
    '🟡RO DONE',
    '🟡EVALUATED',
    '🟡WAIT.BDP',
    '🟡CONTACT OEM',
    '🟡HOLD',
    '🟡RESTAMP',
    '🟡REVISION',
  ];
  const closedStatuses = [
    '🟢COMPLETED',
    '🟢DONE BY SOA',
    '🔘TJK ITEM',
    '🔘NOT TBR',
    '🔘REPLACE',
    '🔘COVER BY',
    '🔘CANCEL',
    '🔘ROBBING',
  ];

  if (openStatuses.includes(doc_status)) return 'OPEN';

  if (progressStatuses.includes(doc_status)) {
    if (doc_status === '🟡RO DONE') {
      const statuses = [
        status_sm1,
        status_sm4,
        status_cs1,
        status_cs4,
        status_mw,
      ];
      const allEmpty = statuses.every((s) => !s || s.trim() === '');
      return allEmpty ? 'OPEN' : 'PROGRESS';
    }
    return 'PROGRESS';
  }

  if (closedStatuses.includes(doc_status)) return 'CLOSED';

  return '';
};

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

const getStatusJob = (row: Row): string => {
  const keysToCheck = [
    'status_pe',
    'status_sm4',
    'status_sm1',
    'status_cs4',
    'status_cs1',
    'status_mw',
    'nd',
    'tjo',
    'other',
    'cek_sm4',
    'cek_sm1',
    'cek_cs4',
    'cek_cs1',
    'cek_mw',
  ];

  const values = keysToCheck
    .map((key) => (row[key] || '').toUpperCase())
    .filter((v) => v !== '' && v !== 'GRAY'); // abaikan kosong dan abu-abu

  if (values.includes('OPEN')) return 'OPEN';
  if (values.includes('PROGRESS')) return 'PROGRESS';
  if (values.includes('CLOSED')) return 'CLOSED';
  return '';
};

const FILTERED_PLNTWKCNTR = ['GAH4', 'WSSR'];

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

export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');
  const [filterStatusJob, setFilterStatusJob] = useState('');

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

  const confirmAction = (action: () => void) => {
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const handleAction = async (
    action: 'copy' | 'save' | 'delete' | 'archived'
  ) => {
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

      case 'delete':
        const { error: deleteError } = await supabase
          .from('mdr_tracking')
          .delete()
          .in('id', selectedRows);

        if (deleteError) {
          console.error('❌ Failed to delete from Supabase:', deleteError);
          setNotification('❌ Failed to delete from database.');
        } else {
          setRows((prev) =>
            prev.filter((row) => !selectedRows.includes(row.id))
          );
          setNotification('✅ Rows successfully deleted.');
        }
        break;

      case 'archived':
        const { error: archivedError } = await supabase
          .from('mdr_tracking')
          .update({ archived: true })
          .in('id', selectedRows);

        if (archivedError) {
          console.error('❌ Failed to archived:', archivedError);
          setNotification('❌ Failed to archived data.');
        } else {
          // Remove from view after archive
          setRows((prev) =>
            prev.filter((row) => !selectedRows.includes(row.id))
          );
          setNotification('✅ Rows successfully archived!');
        }
        break;
    }

    setShowMenu(false);
    setSelectedRows([]);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleActionWithConfirmation = (
    action: 'copy' | 'save' | 'archived' | 'delete'
  ) => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    const confirmMessages: Record<typeof action, string> = {
      copy: 'Are you sure you want to copy the selected rows?',
      save: 'Are you sure you want to export the selected rows?',
      archived: 'Are you sure you want to archived the selected rows?',
      delete: 'Are you sure you want to permanently delete the selected rows?',
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
    };

    fetchData();
  }, []);

  const handleUpdate = async (
    id: string,
    keyOrBulk: string,
    value?: string | Record<string, any>
  ) => {
    const updates: Record<string, any> =
      keyOrBulk === 'bulk'
        ? (value as Record<string, any>)
        : { [keyOrBulk]: value };

    // 🔹 Auto isi date_out jika loc_doc berubah
    if (keyOrBulk === 'loc_doc') {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      updates['date_out'] = `${yyyy}-${mm}-${dd}`;
    }

    // 🔹 Auto isi date_closed jika status_xxx jadi CLOSED
    if (
      keyOrBulk !== 'bulk' &&
      keyOrBulk.startsWith('status_') &&
      value === 'CLOSED'
    ) {
      const suffix = keyOrBulk.replace('status_', '');
      updates[`date_closed_${suffix}`] = formatDateToDDMMMYYYY(new Date());
    }

    const currentRow = rows.find((r) => r.id === id);
    if (currentRow) {
      // gabungkan row lama + update baru → simulatedRow
      let simulatedRow = { ...currentRow, ...updates };

      // 🔹 Step 1: Recalculate status_pe kalau perlu
      const keys = Object.keys(updates);
      const affectsStatusPE = keys.some((k) =>
        [
          'doc_status',
          'status_sm1',
          'status_sm4',
          'status_cs1',
          'status_cs4',
          'status_mw',
          'cek_sm1',
          'cek_sm4',
          'cek_cs1',
          'cek_cs4',
          'cek_mw',
        ].includes(k)
      );

      if (affectsStatusPE) {
        updates['status_pe'] = getStatusPE(
          simulatedRow.doc_status,
          simulatedRow.status_sm1,
          simulatedRow.status_sm4,
          simulatedRow.status_cs1,
          simulatedRow.status_cs4,
          simulatedRow.status_mw
        );
        simulatedRow = { ...simulatedRow, status_pe: updates['status_pe'] };
      }

      // 🔹 Step 2: Recalculate status_job selalu jika status_pe berubah
      const affectsStatusJob =
        affectsStatusPE ||
        keys.some((k) =>
          [
            'status_sm1',
            'status_sm4',
            'status_cs1',
            'status_cs4',
            'status_mw',
            'nd',
            'tjo',
            'other',
            'cek_sm4',
            'cek_sm1',
            'cek_cs4',
            'cek_cs1',
            'cek_mw',
          ].includes(k)
        );

      if (affectsStatusJob) {
        updates['status_job'] = getStatusJob(simulatedRow);
      }
    }

    // 🔹 Update ke Supabase
    const { error } = await supabase
      .from('mdr_tracking')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    }
  };

  const filteredRows = rows
    .filter((row) => {
      if (showOnlyChecked && !selectedRows.includes(row.id)) return false;

      const matchesSearch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesAcReg = filterAcReg === '' || row.ac_reg === filterAcReg;
      const matchesDocStatus =
        filterDocStatus === '' || row.doc_status === filterDocStatus;
      const matchesStatusJob =
        filterStatusJob === '' || row.status_job === filterStatusJob;
      const matchesPlntwkcntr = FILTERED_PLNTWKCNTR.includes(
        (row.plntwkcntr || '').toUpperCase()
      );

      return (
        matchesSearch &&
        matchesAcReg &&
        matchesDocStatus &&
        matchesStatusJob &&
        matchesPlntwkcntr
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

  return (
    <div className="bg-gray-100 w-full h-full">
      <div className="bg-white px-3 pt-3 pb-6 max-h-[100vh] overflow-hidden w-full rounded-lg">
        <div className="mb-2 flex flex-wrap gap-1 items-center">
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
            className="border rounded px-1 py-1 text-[12px] hover:bg-gray-50 shadow-sm"
          />

          <button
            onClick={() => setShowOnlyChecked((prev) => !prev)}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-1.5 py-1 bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            {showOnlyChecked ? 'Checked Row' : 'All Row'}
          </button>

          <div className="flex items-center gap-1">
            {/* Dropdown Menu */}
            <div className="relative inline-block text-left ml-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-1.5 py-1 bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                ⋮ Actions
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
                    <button
                      onClick={() => handleActionWithConfirmation('archived')}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                    >
                      📦 Archived
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation('delete')}
                      className="block w-full text-left px-2 py-1 text-red-600 hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <select
            value={filterAcReg}
            onChange={(e) => setFilterAcReg(e.target.value)}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
          >
            {/* Opsi default selalu di atas */}
            <option value="">All A/C Reg</option>

            {/* Urutkan sisanya */}
            {[...new Set(rows.map((r) => r.ac_reg).filter(Boolean))]
              .sort((a, b) => a.localeCompare(b))
              .map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
          </select>

          <select
            value={filterDocStatus}
            onChange={(e) => setFilterDocStatus(e.target.value)}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
          >
            <option value="">All Doc Status</option>
            {DOC_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filterStatusJob}
            onChange={(e) => setFilterStatusJob(e.target.value)}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
          >
            <option value="">All Status Job</option>
            <option value="OPEN">OPEN</option>
            <option value="PROGRESS">PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
          >
            <option value="">Sort by...</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort Direction */}
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="border rounded px-1 py-1 text-[11px] hover:bg-gray-50 shadow"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-auto max-h-[70vh] border border-gray-300 rounded shadow-inner">
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
                        key === 'description'
                          ? 'text-left  break-words whitespace-normal'
                          : 'text-center'
                      }`}
                    >
                      {key === 'status_job' ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded
      ${
        row.status_job === 'OPEN'
          ? 'bg-red-500 text-white'
          : row.status_job === 'PROGRESS'
          ? 'bg-yellow-500 text-white'
          : row.status_job === 'CLOSED'
          ? 'bg-green-500 text-white'
          : ''
      }`}
                        >
                          {row.status_job || '-'}
                        </span>
                      ) : key === 'no' ? (
                        (currentPage - 1) * rowsPerPage + rowIndex + 1
                      ) : key === 'description' || key === 'ac_reg' ? (
                        editingCell?.id === row.id &&
                        editingCell?.field === key ? (
                          <input
                            type="text"
                            value={row[key] || ''}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, [key]: e.target.value }
                                    : r
                                )
                              )
                            }
                            onBlur={() => {
                              handleUpdate(row.id, key, row[key] || '');
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdate(row.id, key, row[key] || '');
                                setEditingCell(null);
                              }
                            }}
                            autoFocus
                            className="border px-0.5 py-0.5 rounded w-full text-[11px]]"
                          />
                        ) : (
                          <div
                            className="w-full text-left break-words whitespace-normal"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setEditingCell({ id: row.id, field: key });
                            }}
                            title="Klik kanan untuk edit"
                          >
                            {row[key]}
                          </div>
                        )
                      ) : key === 'date_in' ||
                        key.startsWith('date_closed_') ? (
                        <span>
                          {row[key]
                            ? new Date(row[key]).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
                      ) : key.startsWith('report_') ? (
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
                      ) : key.startsWith('cek_') ? (
                        (() => {
                          const statusKey = key.replace('cek_', 'status_');
                          const statusValueRaw = row[statusKey] || '';
                          const statusValue = statusValueRaw.toUpperCase();
                          const isOn = row[key] === 'red';
                          const next = isOn ? '' : 'red';

                          const color =
                            statusValue === ''
                              ? 'blue'
                              : isOn
                              ? statusValue === 'CLOSED'
                                ? 'green'
                                : statusValue === 'PROGRESS'
                                ? 'yellow'
                                : statusValue === 'OPEN'
                                ? 'red'
                                : 'gray'
                              : 'gray';

                          return (
                            <ToggleSwitch
                              value={isOn}
                              color={color}
                              onClick={() => {
                                const newValue = isOn ? '' : 'red';
                                handleUpdate(row.id, key, newValue);
                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, [key]: newValue }
                                      : r
                                  )
                                );
                              }}
                            />
                          );
                        })()
                      ) : key === 'location' ? (
                        <select
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className="border rounded px-0.5 py-0.5"
                        >
                          <option value=""></option>
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      ) : key === 'loc_doc' ? (
                        <select
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className="border rounded px-0.5 py-0.5 text-[11px]"
                        >
                          <option value=""></option>
                          {LOC_DOC_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : key === 'date_out' ? (
                        row[key] ? (
                          new Date(row[key]).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          ''
                        )
                      ) : STATUS_COLUMNS.includes(key) ? (
                        <select
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className={`border rounded px-0.5 py-0.5 w-[50px] text-[11px] text-left 
                          ${row[key] === 'OPEN' ? 'bg-red-500 text-white' : ''}
                          ${
                            row[key] === 'PROGRESS'
                              ? 'bg-yellow-500 text-white'
                              : ''
                          }
                          ${
                            row[key] === 'CLOSED'
                              ? 'bg-green-500 text-white'
                              : ''
                          }
                        `}
                        >
                          <option value=""></option>
                          <option value="OPEN">OPEN</option>
                          <option value="PROGRESS">PROGRESS</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      ) : TEXT_INPUT_COLUMNS.includes(key) ? (
                        <input
                          type="text"
                          maxLength={100}
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          className="border px-0.5 py-0.5 rounded w-full text-[11px]"
                        />
                      ) : key === 'doc_status' ? (
                        <select
                          value={row[key] || ''}
                          onChange={(e) => {
                            const newDocStatus = e.target.value;
                            const newStatusPE = getStatusPE(newDocStatus);

                            const currentRow = rows.find(
                              (r) => r.id === row.id
                            );
                            if (currentRow) {
                              const simulatedRow = {
                                ...currentRow,
                                [key]: newDocStatus,
                                status_pe: newStatusPE,
                              };
                              const newStatusJob = getStatusJob(simulatedRow);

                              const updates = {
                                [key]: newDocStatus,
                                status_pe: newStatusPE,
                                status_job: newStatusJob,
                              };

                              handleUpdate(row.id, 'bulk', updates);
                            }

                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      [key]: newDocStatus,
                                      status_pe: newStatusPE,
                                      status_job: getStatusJob({
                                        ...r,
                                        [key]: newDocStatus,
                                        status_pe: newStatusPE,
                                      }),
                                    }
                                  : r
                              )
                            );
                          }}
                          className="border rounded px-0.5 py-0.5 text-[11px]]"
                        >
                          <option value=""></option>
                          {!DOC_STATUS_OPTIONS.includes(row[key]) &&
                            row[key] && (
                              <option value={row[key]}>{row[key]}</option>
                            )}
                          {DOC_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
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
