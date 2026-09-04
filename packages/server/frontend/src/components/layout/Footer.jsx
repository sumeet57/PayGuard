import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi'
import { RiSecurePaymentLine } from 'react-icons/ri'

const footerLinks = {
  Platform: [
    { to: '/products', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/research', label: 'Research' },
    { to: '/about', label: 'About' },
  ],
  Legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms & Conditions' },
    { to: '/refund', label: 'Refund & Cancellation' },
    { to: '/contact', label: 'Contact' },
    { to: '/shipping', label: 'Shipping' },
    { to: '/about', label: 'About' },
  ],
}

const socials = [
  { icon: FiGithub, href: 'https://github.com/sumeet57', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com/in/sumeet-umbalkar', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:hello@labgineer.com', label: 'Email' },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 border-t border-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" onClick={scrollToTop} className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tight font-display" style={{ color: 'var(--color-text)' }}>
                lab<span style={{ color: 'var(--color-highlight)' }}>gineer</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Engineering projects, IoT builds & research — built by a maker, for makers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg border border-surface hover:border-highlight transition-all hover:-translate-y-0.5 text-muted hover:text-accent"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={scrollToTop}
                      className="text-sm text-muted hover:text-accent link-underline transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-surface flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted font-mono">
            © {new Date().getFullYear()} labgineer.com — All rights reserved
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Payments secured by</span>
            <img src="./payment-gateway-icon.png" alt="Cashfree Logo" className="h-4" />
            <span className="font-mono">Cashfree</span>
          </div>
        </div>
      </div>
    </footer>
  )
}