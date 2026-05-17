export type Category = 'convert' | 'organize' | 'edit' | 'security' | 'optimize'

export interface Tool {
  id: string
  name: string
  description: string
  icon: string        // lucide-react icon (kebab-case)
  category: Category
  hot?: boolean
  featured?: boolean  // spans 2 columns in bento grid
}

export const tools: Tool[] = [
  // ── Convert ──────────────────────────────────────────────────────────────────
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert any PDF into an editable DOCX, preserving layout and formatting.',
    icon: 'file-text',
    category: 'convert',
    hot: true,
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables and structured data from PDFs straight into spreadsheets.',
    icon: 'table',
    category: 'convert',
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Turn PDF slides into fully editable PPTX presentations instantly.',
    icon: 'presentation',
    category: 'convert',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Export every PDF page as a high-res JPG image at your chosen quality.',
    icon: 'image',
    category: 'convert',
    hot: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Transform Word documents into pixel-perfect PDFs in seconds.',
    icon: 'file-output',
    category: 'convert',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Bundle one or more images into a single polished PDF document.',
    icon: 'images',
    category: 'convert',
  },

  // ── Organize ─────────────────────────────────────────────────────────────────
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one document in any order you choose.',
    icon: 'git-merge',
    category: 'organize',
    hot: true,
    featured: true,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Divide a PDF into individual pages or custom page ranges.',
    icon: 'scissors',
    category: 'organize',
    hot: true,
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate one or all pages to the correct orientation effortlessly.',
    icon: 'rotate-cw',
    category: 'organize',
  },
  {
    id: 'delete-pages',
    name: 'Delete Pages',
    description: 'Remove any unwanted pages from a PDF without rebuilding the file.',
    icon: 'trash-2',
    category: 'organize',
  },
  {
    id: 'reorder-pages',
    name: 'Reorder Pages',
    description: 'Drag and drop pages into the perfect order with a visual manager.',
    icon: 'layers',
    category: 'organize',
  },

  // ── Edit ─────────────────────────────────────────────────────────────────────
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    description: 'Add text, shapes, and annotations directly on your PDF pages.',
    icon: 'pencil',
    category: 'edit',
    hot: true,
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    description: 'Stamp text or image watermarks across every page of your PDF.',
    icon: 'stamp',
    category: 'edit',
  },
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    description: 'Insert page numbers in any position and custom style.',
    icon: 'hash',
    category: 'edit',
  },

  // ── Security ─────────────────────────────────────────────────────────────────
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Encrypt and password-protect your PDF to keep it secure.',
    icon: 'lock',
    category: 'security',
    hot: true,
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password protection when you have the right credentials.',
    icon: 'lock-open',
    category: 'security',
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Draw, type, or upload a signature and apply it to any document.',
    icon: 'pen-line',
    category: 'security',
    featured: true,
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    description: 'Permanently black out sensitive text and images from a PDF.',
    icon: 'eye-off',
    category: 'security',
  },

  // ── Optimize ─────────────────────────────────────────────────────────────────
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Shrink PDF size without visible quality loss for faster sharing.',
    icon: 'archive',
    category: 'optimize',
    hot: true,
    featured: true,
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDFs and recover content automatically.',
    icon: 'wrench',
    category: 'optimize',
  },
]

export const categories = [
  { id: 'all',      label: 'All'      },
  { id: 'convert',  label: 'Convert'  },
  { id: 'organize', label: 'Organize' },
  { id: 'edit',     label: 'Edit'     },
  { id: 'security', label: 'Security' },
  { id: 'optimize', label: 'Optimize' },
] as const

export type CategoryId = (typeof categories)[number]['id']
