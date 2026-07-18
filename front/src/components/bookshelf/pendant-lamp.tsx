/** 책장 위에 대롱대롱 매달려 은은하게 비추는 펜던트 전등 (순수 CSS 장식) */
export function PendantLamp() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
    >
      <div className="animate-lamp-sway flex flex-col items-center">
        {/* 천장 고정부 */}
        <div className="h-2 w-6 rounded-b-sm bg-neutral-800" />
        {/* 전선 */}
        <div className="h-10 w-[3px] bg-neutral-800 sm:h-14" />
        {/* 전등갓 */}
        <div
          className="h-8 w-20 shadow-lg sm:h-9 sm:w-24"
          style={{
            clipPath: "polygon(32% 0, 68% 0, 100% 100%, 0 100%)",
            background:
              "linear-gradient(180deg, #14532d 0%, #166534 55%, #22754a 100%)",
          }}
        />
        {/* 전구 */}
        <div className="-mt-1.5 size-4 rounded-full bg-amber-100 shadow-[0_0_28px_14px_rgba(255,205,100,0.6)]" />
        {/* 빛 원뿔 */}
        <div
          className="-mt-2 h-56 w-72 sm:h-64 sm:w-80"
          style={{
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            background:
              "linear-gradient(180deg, rgba(255,214,120,0.5) 0%, rgba(255,214,120,0.18) 55%, rgba(255,214,120,0) 95%)",
          }}
        />
      </div>
    </div>
  );
}
