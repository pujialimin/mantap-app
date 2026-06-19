// src/pages/Login.tsx
import { useEffect, useState } from "react";

export default function Login() {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = "https://mntp-gmf.netlify.app";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/back.png')" }}
    >
      <div
        className="
          w-[380px]
          rounded-2xl
          border border-white/20
          bg-slate-900/75
          backdrop-blur-md
          shadow-2xl
          shadow-cyan-500/30
          p-8
          text-white
          text-center
        "
      >

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="
              w-20 h-20
              rounded-full
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              flex
              items-center
              justify-center
              shadow-lg
              shadow-cyan-500/50
              animate-pulse
            "
          >
            <span className="text-4xl">
              ✓
            </span>
          </div>
        </div>


        <h1 className="text-2xl font-bold tracking-wide mb-3">
          MNTP System Updated
        </h1>


        <div
          className="
            text-xs
            uppercase
            tracking-widest
            text-cyan-300
            mb-5
          "
        >
          Migration Completed
        </div>


        <p className="text-sm text-white/80 leading-relaxed mb-6">
          The previous MNTP platform has been moved to a new system address.
          <br /><br />
          Please continue using the latest version through the new link below.
        </p>


        <a
          href="https://mntp-gmf.netlify.app"
          className="
            block
            py-3
            rounded-lg
            bg-gradient-to-r
            from-cyan-500
            to-blue-500
            hover:scale-105
            transition
            duration-300
            font-semibold
            shadow-lg
            shadow-cyan-500/40
          "
        >
          Access New MNTP
        </a>


        <div className="mt-6">

          <div className="flex justify-center gap-1 mb-3">
            {[1,2,3].map((item)=>(
              <span
                key={item}
                className="
                  w-2
                  h-2
                  bg-cyan-400
                  rounded-full
                  animate-bounce
                "
                style={{
                  animationDelay:`${item * 150}ms`
                }}
              />
            ))}
          </div>


          <p className="text-xs text-white/60">
            Redirecting automatically in{" "}
            <span className="text-cyan-300 font-bold">
              {countdown}
            </span>{" "}
            seconds
          </p>

        </div>


        <div
          className="
            mt-6
            pt-4
            border-t
            border-white/10
            text-[11px]
            text-white/40
          "
        >
          MNTP Platform Migration Notice
        </div>

      </div>
    </div>
  );
}