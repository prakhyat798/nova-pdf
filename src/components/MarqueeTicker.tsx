/** Infinite horizontal marquee strip — sits between the hero and bento grid */

const ITEMS = [
  { text: 'Merge PDF',           cat: 'organize' },
  { text: 'Compress',            cat: 'optimize' },
  { text: 'PDF to Word',         cat: 'convert'  },
  { text: 'Sign & Protect',      cat: 'security' },
  { text: 'Split Pages',         cat: 'organize' },
  { text: 'Add Watermark',       cat: 'edit'     },
  { text: 'JPG to PDF',          cat: 'convert'  },
  { text: 'Redact',              cat: 'security' },
  { text: 'Rotate & Reorder',    cat: 'organize' },
  { text: 'Compress PDF',        cat: 'optimize' },
  { text: 'PDF to Excel',        cat: 'convert'  },
  { text: 'Edit PDF',            cat: 'edit'     },
]

// Dot separator between items
function Dot() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-1.5 h-1.5 rounded-full bg-lime opacity-70 mx-5 align-middle"
    />
  )
}

// One track — duplicate for seamless loop
function Track({ reverse = false }: { reverse?: boolean }) {
  const content = (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span className="text-[#E8E4DD]/80 text-sm font-medium tracking-wide whitespace-nowrap">
            {item.text}
          </span>
          <Dot />
        </span>
      ))}
    </>
  )

  return (
    <div
      className="flex items-center"
      style={{
        animation: `marquee${reverse ? '-reverse' : ''} 28s linear infinite`,
        willChange: 'transform',
      }}
    >
      {/* Duplicate track for seamless loop */}
      {content}
      {content}
    </div>
  )
}

export function MarqueeTicker() {
  return (
    <>
      {/* Inject keyframes once */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div
        id="marquee-ticker"
        aria-hidden="true"
        className="overflow-hidden bg-forest py-3 border-y border-white/5"
      >
        {/* Two offset rows for depth */}
        <div className="flex">
          <Track />
        </div>
      </div>
    </>
  )
}
