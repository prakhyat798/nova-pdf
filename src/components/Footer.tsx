export function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-divider bg-canvas py-10 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-ink-muted leading-relaxed">
          <span className="font-medium text-ink">NovaPDF</span>
          {' '}— All processing happens in your browser.{' '}
          <br className="sm:hidden" />
          Your files never leave your device.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
          {['Privacy', 'Terms', 'GitHub', 'About'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-sage hover:text-ink transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        {/* Thin divider dot row */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-clay inline-block opacity-60"
            />
          ))}
        </div>
      </div>
    </footer>
  )
}
