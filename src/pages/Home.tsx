import { useState } from "react";

/* =========================
   Notification Banner
========================= */
function NotificationBanner() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="relative mb-6 rounded-lg border border-black-300 bg-red-500 p-4 shadow w-full max-w-3xl">
      {/* Close Button */}
      <button
        onClick={() => setShow(false)}
        className="absolute right-2 top-2 text-gray-500 hover:text-red-500 text-lg font-bold"
        aria-label="Close notification"
      >
        ×
      </button>

      <p className="text-sm text-gray-800 font-medium">
        <strong>PERHATIAN:</strong> Aplikasi ini sekarang hanya bisa digunakan
        oleh <span className="font-semibold">TJK BUSH4</span>.
        <br />
        Untuk tim <span className="font-semibold">MACHINING/TCR WS1</span>, silahkan
        klik link di bawah.
      </p>

      <a
        href="https://mntp-tcr.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-sm font-semibold text-white hover:underline"
      >
        👉 Buka Aplikasi mntp.tcr-vercel.app
      </a>
    </div>
  );
}

/* =========================
   Home Page
========================= */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20 px-4">
      <NotificationBanner />

      <img
        src="/hijau.png"
        alt="App Logo"
        className="w-[900px] h-40 mb-20"
      />
    </div>
  );
}
