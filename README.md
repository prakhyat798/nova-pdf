# Nova PDF 📑✨

A high-performance, browser-based document processor and PDF utility engine built with React, Vite, and TailwindCSS.

![Nova PDF](https://img.shields.io/badge/platform-Web-blue) ![React](https://img.shields.io/badge/React-18-blue) ![License](https://img.shields.io/badge/license-MIT-purple)

---

## 🚀 Overview

**Nova PDF** is an all-in-one local document management application. It brings the power of desktop PDF editors and document converters straight to your browser—running entirely client-side without uploading your sensitive data to the cloud.

Featuring a beautiful, interactive UI powered by Framer Motion and Three.js, Nova PDF makes document handling feel like the future.

---

## ✨ Key Features

- **PDF Manipulation**: Merge, split, and edit PDFs directly in your browser using `pdf-lib` and `pdfjs-dist`.
- **Universal Format Support**: 
  - 📝 **Word**: Parse and convert `.docx` via `mammoth`.
  - 📊 **Excel**: Read and manipulate `.xlsx` files.
  - 🖥️ **PowerPoint**: Generate and manage `.pptx`.
- **Image to PDF**: Compress and convert images seamlessly.
- **100% Local Processing**: No servers, no telemetry. Your files never leave your machine.
- **Immersive UI**: Hardware-accelerated 3D elements and buttery smooth animations.

---

## 💻 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite |
| **Styling & UI** | TailwindCSS, Framer Motion, Lucide React |
| **3D Rendering** | Three.js, React Three Fiber/Drei |
| **Document Engine** | pdf-lib, jspdf, pdfjs-dist, mammoth, xlsx |

---

## 🛠️ Installation & Setup

Want to run Nova PDF locally? It's incredibly easy:

### 1. Clone the Repository
```bash
git clone https://github.com/prakhyat798/nova-pdf.git
cd nova-pdf
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Boot the Engine
```bash
npm run dev
```
Open the provided `localhost` link in your browser to access the application!

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/prakhyat798/nova-pdf/issues).

## 📄 License
This project is [MIT](./LICENSE) licensed.
