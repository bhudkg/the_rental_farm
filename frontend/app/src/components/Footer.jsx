import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">The Rental Farm</h3>
            <p className="text-sm leading-relaxed">
              Rent beautiful trees for your home, office, or event. Sustainable, affordable, and hassle-free.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/trees" className="hover:text-white transition-colors">Browse Trees</Link>
              <Link to="/orders" className="hover:text-white transition-colors">My Orders</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">How It Works</h4>
            <div className="flex flex-col gap-2 text-sm">
              <span>1. Choose a tree</span>
              <span>2. Pick your dates</span>
              <span>3. We deliver &amp; set up</span>
              <span>4. Return when done</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} The Rental Farm. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
