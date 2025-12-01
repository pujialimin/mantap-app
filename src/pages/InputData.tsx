
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useState, useEffect, useRef } from 'react';

const LOCATIONS = ['ON A/C', 'BUSH4', 'WS1'];
const DOC_TYPES = ['JC', 'MDR', 'PDS', 'SOA'];
const DOC_STATUS_OPTIONS = [
  '🔴NEED RO',
  '🟢COMPLETED',
  '🟡RO DONE',
  '🔘CANCEL',
];

const getStatusPE = (doc_status: string): string => {
  const progressStatus = [
    
    '🟡EVALUATED',
    
    '🟡CONTACT OEM',
    '🟡HOLD',
    '🟡RESTAMP',
    '🟡REVISION',
  ];
  const closedStatus = [
    '🟢COMPLETED',
    '🟢DONE BY SOA',
    '🔘REPLACE',
    '🔘NOT TBR',
    '🔘COVER BY',
    '🔘TJK ITEM',
    '🔘CANCEL',
    '🔘ROBBING',
  ];

  if (['🟡RO DONE', '🔴NEED RO', '🔴WAIT.REMOVE', '🔴WAIT.BDP'].includes(doc_status)) return 'OPEN';
  if (progressStatus.includes(doc_status)) return 'PROGRESS';
  if (closedStatus.includes(doc_status)) return 'CLOSED';
  return '';
};

const getStatusJob = (row: any): string => {
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
    .filter((v) => v !== '' && v !== 'GRAY');

  if (values.includes('OPEN')) return 'OPEN';
  if (values.includes('PROGRESS')) return 'PROGRESS';
  if (values.includes('CLOSED')) return 'CLOSED';
  return '';
};
const emptyRow = {
  ac_reg: '',
  order: null as number | null, // biar sesuai integer
  description: '',
  plntwkcntr: '',
  doc_type: '',
  location: '',
  doc_status: '',
  status_pe: '',
};

const FIELD_ORDER = [
   'ac_reg',
  'order',
  'description',
  'plntwkcntr',
  'doc_type',
  'location',
  'doc_status',
];

export default function InputData() {
  const [forms, setForms] = useState([{ ...emptyRow }]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<HTMLInputElement[][]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [openDocType, setOpenDocType] = useState(false);
const [openPlntwkcntr, setOpenPlntwkcntr] = useState(false);
const [openDocStatus, setOpenDocStatus] = useState(false);
const [rows, setRows] = useState<Row[]>([]);
const [openLocation, setOpenLocation] = useState(false);




  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index: number
  ) => {
    const { name, value } = e.target;

    setForms((prevForms) =>
      prevForms.map((row, i) => {
        if (i !== index) return row;
        const updatedRow = { ...row, [name]: value };
        if (name === 'doc_status') {
          updatedRow.status_pe = getStatusPE(value);
        }
        return updatedRow;
      })
    );
  };

  const addFiveRows = () => {
    const newRows = Array.from({ length: 5 }, () => ({ ...emptyRow }));
    setForms((prev) => [...prev, ...newRows]);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
  
    const requiredKeys = ['ac_reg', 'order', 'description', 'plntwkcntr', 'doc_type', 'doc_status'];
  
    // 🔎 Validasi
    for (let i = 0; i < forms.length; i++) {
      const row = forms[i];
  
      // Cek apakah ada field yang terisi
      const isAnyFilled = requiredKeys.some((key) => {
        if (key === 'order') return row.order !== null; // khusus order (integer)
        return (row[key] || '').trim() !== '';
      });
  
      // Cek apakah ada field yang kosong
      const isAnyMissing = requiredKeys.some((key) => {
        if (key === 'order') return row.order === null; // khusus order (integer)
        return (row[key] || '').trim() === '';
      });
  
      if (isAnyFilled && isAnyMissing) {
        setMessage(`❌ Baris ${i + 1} belum lengkap. Semua field wajib diisi jika salah satunya diisi.`);
        setLoading(false);
        return;
      }
    }
  
    const dataToInsert = forms
      .filter((row) =>
        requiredKeys.every((key) => {
          if (key === 'order') return row.order !== null;
          return (row[key] || '').trim() !== '';
        })
      )
      .map((row) => ({ ...row, status_job: getStatusJob(row) }));
  
    if (dataToInsert.length === 0) {
      setMessage('❌ Tidak ada data yang valid untuk disimpan.');
      setLoading(false);
      return;
    }
  
    // ✅ Cek order duplikat di database (sekarang integer)
 // ambil semua order dari data yang diinput
const orderList = dataToInsert
.map((row) => Number(row.order))
.filter((val) => !isNaN(val));

console.log("orderList:", orderList);

let existingOrders: any[] = [];
let checkError = null;

if (orderList.length > 0) {
const { data, error } = await supabase
  .from("mdr_tracking")
  .select('"order"')              // ✅ quote karena reserved keyword
  .in('"order"', orderList);      // ✅ quote juga di filter

existingOrders = data || [];
checkError = error;
}

if (checkError) {
console.error("Gagal memeriksa order duplikat:", checkError);
return;
}

console.log("Existing orders:", existingOrders);
  
    const existingOrderSet = new Set(existingOrders.map((item) => item.order));
    const finalDataToInsert = dataToInsert.filter((row) => !existingOrderSet.has(row.order));
    const duplicatedData = dataToInsert.filter((row) => existingOrderSet.has(row.order));
  
    if (finalDataToInsert.length === 0) {
      setMessage('❌ Semua order sudah ada di database. Tidak ada yang disimpan.');
      setLoading(false);
      return;
    }
  
    const { error: insertError } = await supabase.from('mdr_tracking').insert(finalDataToInsert);
  
    if (insertError) {
      console.error('Insert error:', insertError);
      setMessage('❌ Gagal menyimpan data.');
    } else {
      setMessage(
        `✅ ${finalDataToInsert.length} data berhasil disimpan.${
          duplicatedData.length > 0 ? ` ${duplicatedData.length} order duplikat tidak disimpan.` : ''
        }`
      );
  
      const newForms = duplicatedData.length > 0 ? duplicatedData : [{ ...emptyRow }];
      setForms(newForms);
    }
  
    setLoading(false);
  };
  
  
  
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') || '';
      const lines = text.trim().split('\n');
  
      // Hanya tangani jika lebih dari 1 baris
      if (lines.length <= 1) return;
  
      const rows = lines.map((line) => line.split('\t'));
  
      const newForms = rows.map((cells) => ({
        ac_reg: cells[0] || '',
        order: cells[1] ? Number(cells[1]) : null, // ✅ convert ke number/null
        description: cells[2] || '',
        plntwkcntr: cells[3] || '',
        doc_type: cells[4] || '',
        location: cells[5] || '',
        doc_status: cells[6] || '',
        status_pe: getStatusPE(cells[6] || ''),
      }));
  
      setForms(newForms); // ✅ langsung tampilkan hasil paste
  
      e.preventDefault();
    };
  
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);
  
  const handlePasteCell = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number,
    colName: string
  ) => {
    e.preventDefault();
  
    const clipboard = e.clipboardData.getData('text/plain');
    const rows = clipboard
      .trim()
      .split('\n')
      .map((line) => line.split('\t'));
  
    const newData = [...forms];
  
    rows.forEach((cols, rowOffset) => {
      const targetIndex = rowIndex + rowOffset;
      if (targetIndex >= newData.length) return; // Lewat dari batas data
  
      const startIndex = FIELD_ORDER.indexOf(colName);
      if (startIndex === -1) return;
  
      cols.forEach((value, colOffset) => {
        const fieldName = FIELD_ORDER[startIndex + colOffset];
        if (fieldName && newData[targetIndex]) {
          if (fieldName === 'order') {
            newData[targetIndex][fieldName] = value ? Number(value) : null; // ✅ convert ke number/null
          } else {
            newData[targetIndex][fieldName] = value;
          }
  
          if (fieldName === 'doc_status') {
            newData[targetIndex]['status_pe'] = getStatusPE(value);
          }
        }
      });
    });
  
    setForms(newData);
  };
  
  const applyToAll = (column: keyof Row, value: string) => {
    setForms((prevForms) =>
      prevForms.map((row) => {
        const isOrderFilled = row.order !== null; // ✅ cek integer/null
        if (!isOrderFilled) return row;
  
        const updatedRow: Row = { ...row, [column]: value };
  
        // Jika mengubah doc_status, update status_pe juga
        if (column === 'doc_status') {
          updatedRow.status_pe = getStatusPE(value);
        }
  
        return updatedRow;
      })
    );
  
    setMessage(`✅ Kolom ${column.toUpperCase()} berhasil diisi untuk baris yang memiliki ORDER.`);
  };
  
  
  


  return (
    <div className="bg-gray-100 min-h-full w-full">
      <form>
      <div className="bg-white px-3 pt-3 pb-6 max-h-auto overflow-visible w-full rounded-lg">


      <div className="flex  items-center w-full ml-auto gap-1">  
      <span className="text-xs font-medium">Auto Fill:</span>
            {/* Tombol Menu Dropdown */}
            <div className="flex gap-1 items-center">

            {/* PLNTWKCNTR */}
           <div className="relative inline-block text-left">
        <button
        onClick={() => {
          setOpenPlntwkcntr(!openPlntwkcntr);
          setOpenDocType(false);
          setOpenDocStatus(false);
        }}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-0.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        PlntWkCntr
      </button>
      {openPlntwkcntr && (
        <div className="absolute z-10 bg-white border mt-1 rounded shadow">
          {['CGK', 'GAH1', 'GAH2', 'GAH3', 'GAH4', 'WSSR', 'WSST'].map((item) => (
            <button
              key={item}
              onClick={() => {
                applyToAll('plntwkcntr', item);
                setOpenPlntwkcntr(false);
              }}
              className="block w-full text-left px-4 py-1 hover:bg-gray-100 text-xs"
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>

{/* DOC TYPE */}
<div className="relative inline-block text-left">
          <button
          onClick={() => {
          setOpenDocType(!openDocType);
          setOpenPlntwkcntr(false);
          setOpenDocStatus(false);
           }}
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-0.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
           >
           Doc Type
           </button>
           {openDocType && (
           <div className="absolute z-10 bg-white border mt-1 rounded shadow">
           {DOC_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                applyToAll('doc_type', type);
                setOpenDocType(false);
              }}
              className="block w-full text-left px-4 py-1 hover:bg-gray-100 text-xs"
              type="button"
            >
              {type}
            </button>
           ))}
           </div>
           )}
            </div>


    {/* LOCATION */}
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          setOpenLocation(!openLocation);
          setOpenPlntwkcntr(false);
          setOpenDocType(false);
          setOpenDocStatus(false);
        }}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-0.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Location
      </button>
      {openLocation && (
        <div className="absolute z-10 bg-white border mt-1 rounded shadow">
          {['ON A/C', 'BUSH4', 'WS1'].map((loc) => (
            <button
              key={loc}
              onClick={() => {
                applyToAll('location', loc);
                setOpenLocation(false);
              }}
              className="block w-full text-left px-4 py-1 hover:bg-gray-100 text-xs"
              type="button"
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
    
    {/* DOC STATUS */}
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          setOpenDocStatus(!openDocStatus);
          setOpenDocType(false);
          setOpenPlntwkcntr(false);
        }}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-0.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Doc Status
      </button>
      {openDocStatus && (
        <div className="absolute z-10 bg-white border mt-1 rounded shadow max-h-48 overflow-y-auto">
          {DOC_STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => {
                applyToAll('doc_status', status);
                setOpenDocStatus(false);
              }}
              className="block w-full text-left px-4 py-1 hover:bg-gray-100 text-xs"
              type="button"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>


  
  </div>
  </div>

        <div className="overflow-auto mt-2">
          <table className="min-w-full border border-gray-300 text-[11px] rounded-lg max-h-[100vh]overflow-hidden shadow">
            <thead className="bg-gradient-to-t from-[#00838F] to-[#00838F] text-white text-xs text-center">
              <tr>
                
                <th className="border px-2 py-2">A/C Reg</th>
                <th className="border px-2 py-2">Order</th>
                <th className="border px-2 py-2">Description</th>
                <th className="border px-2 py-2">PlntWkCntr</th>
                <th className="border px-2 py-2">Doc Type</th>
                <th className="border px-2 py-2">Location</th>
                <th className="border px-2 py-2">Doc Status</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((row, index) => (
                <tr key={index} className="bg-white text-center">
                  
                  {/* A/C Reg */}
                  <td className="border px-2 py-1 min-w-[90px]">
                    <input
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][0] = el; // 1 = kolom ac_reg
                      }}
                      type="text"
                      name="ac_reg"
                      value={row.ac_reg}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'ac_reg')}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
{/* Order */}
<td className="border px-2 py-1 min-w-[110px]">
  <input
    ref={(el) => {
      if (!inputRefs.current[index]) inputRefs.current[index] = [];
      inputRefs.current[index][1] = el;
    }}
    type="number" // ✅ lebih aman pakai number
    name="order"
    value={row.order !== null ? row.order : ''} // ✅ tampilkan '' kalau null
    onChange={(e) => {
      const val = e.target.value.trim();
      const num = val === '' ? null : Number(val);
      handleChange({ target: { name: 'order', value: num } } as any, index); // ✅ kirim number/null ke state
    }}
    onPaste={(e) => handlePasteCell(e, index, 'order')}
    className="border rounded px-2 py-1 w-full"
  />
</td>


                  {/* Description */}
                  <td className="border px-2 py-1 min-w-[400px]">
                    <textarea
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][2] = el;
                      }}
                      name="description"
                      value={row.description}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'description')}
                      rows={2}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>

         {/* PLNTWKCNTR */}
         <td className="border px-2 py-1 min-w-[100px]">
                    <select
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][3] = el;
                      }}
                      name="plntwkcntr"
                      value={row.plntwkcntr}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'plntwkcntr')}
                      className="border rounded px-2 py-1 w-full"
                      required
                    >
                      <option value="" disabled>
                        -- Pilih --
                      </option>
                      {[
                        'CGK',
                        'GAH1',
                        'GAH2',
                        'GAH3',
                        'GAH4',
                        'WSSR',
                        'WSST',
                      ].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>


                  
                  {/* Doc Type */}
                  <td className="border px-2 py-1 min-w-[90px]">
                    <select
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][4] = el;
                      }}
                      name="doc_type"
                      value={row.doc_type}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'doc_type')}
                      className="border rounded px-2 py-1 w-full"
                      required
                    >
                      <option value="" disabled>
                        -- Pilih --
                      </option>
                      {DOC_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Location */}
                  <td className="border px-2 py-1 min-w-[100px]">
                    <select
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][5] = el;
                      }}
                      name="location"
                      value={row.location}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'location')}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value=""> </option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </td>


                  {/* Doc Status */}
                  <td className="border px-2 py-1 min-w-[150px]">
                    <select
                      ref={(el) => {
                        if (!inputRefs.current[index])
                          inputRefs.current[index] = [];
                        inputRefs.current[index][6] = el;
                      }}
                      name="doc_status"
                      value={row.doc_status}
                      onChange={(e) => handleChange(e, index)}
                      onPaste={(e) => handlePasteCell(e, index, 'doc_status')}
                      className="border rounded px-2 py-1 w-full"
                      required
                    >
                      <option value="" disabled>
                        -- Pilih Status --
                      </option>
                      {DOC_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end items-center w-full mt-2 gap-2">
          <button
            type="button"
            onClick={addFiveRows}
            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
          >
            + Add 5 Rows
          </button>

    {/* Tombol Input */}
    <button
  type="button" // <-- penting: ganti dari "submit" ke "button"
  onClick={handleSubmit} // <-- panggil manual
  disabled={loading}
  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
>
  {loading ? 'Loading...' : 'Input Data'}
</button>
</div>
        </div>


  </div>
        
      </form>

      {message && <div className="mt-3 text-sm">{message}</div>}
    </div>
    
  );
  
}
