import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t mt-auto" style={{
      background: 'rgba(10, 14, 26, 0.9)',
      borderColor: 'rgba(139, 92, 246, 0.1)',
    }}>
      <div className="page-wrapper py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">NxtWave <span className="gradient-text">AI Workshop</span></span>
            </div>
            <p className="text-sm max-w-md" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
              Empowering the next generation of engineers to build their first AI project.
              A free, beginner-friendly workshop for aspiring engineers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#e2e8f0' }}>Quick Links</h4>
            <div className="space-y-3">
              <a href="/#what-youll-build" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>What You'll Build</a>
              <a href="/#how-it-works" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>How It Works</a>
              <a href="/#faq" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>FAQ</a>
              <Link to="/signup" className="block text-sm transition-colors" style={{ color: '#a78bfa' }}>Register Now</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#e2e8f0' }}>Legal</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>Privacy Policy</a>
              <a href="#" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>Terms of Service</a>
              <a href="#" className="block text-sm transition-colors" style={{ color: '#94a3b8' }}>Contact</a>
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(139, 92, 246, 0.1)' }}>
          <p className="text-xs flex items-center gap-2" style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} NxtWave. Built with <Heart className="w-3 h-3 text-rose-400" /> for aspiring engineers.
          </p>
          <p className="text-xs" style={{ color: '#64748b' }}>
            Growth Intern Challenge — AI Workshop Campaign
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
