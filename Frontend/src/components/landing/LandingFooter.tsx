import { MessageCircle } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="text-violet-400" size={22} />
              <span className="font-bold text-white">BTBIZ PVT LTD</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              AI-powered business automation and WhatsApp chatbot solutions for enterprises.
            </p>
            <p className="mt-4 text-xs font-medium text-violet-400">
              Powered by BTBIZ AI Solutions
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li>
                <a href="https://btbiz.in" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="https://btbiz.in" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="https://btbiz.in" className="hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="https://btbiz.in" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Products</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li>Pharmacy AI Assistant</li>
              <li>WhatsApp Chatbots</li>
              <li>UCaaS Applications</li>
              <li>AI Automation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li>Gurugram, India</li>
              <li>+91 98108 87227</li>
              <li>basantt@btbiz.in</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-zinc-600 sm:flex-row">
          <p>© 2025 BTBIZ PVT LTD. All rights reserved.</p>
          <a href="#" className="hover:text-zinc-400">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
