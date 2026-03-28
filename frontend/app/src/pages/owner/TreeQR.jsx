import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchTree } from '../../services/api';

export default function TreeQR() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchTree(id)
      .then(setTree)
      .finally(() => setLoading(false));
  }, [id]);

  const treeUrl = `${window.location.origin}/trees/${id}`;

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>QR Code - ${tree?.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { text-align: center; padding: 40px; border: 2px dashed #d1d5db; border-radius: 16px; }
            .card h2 { font-size: 24px; margin: 16px 0 4px; }
            .card p { color: #6b7280; font-size: 14px; margin: 0 0 20px; }
            .card .scan { font-size: 12px; color: #9ca3af; margin-top: 16px; }
            svg { display: block; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Tree not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/owner/trees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to my trees
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code</h1>
      <p className="text-gray-500 mb-8">Print this and attach it to your tree. Renters can scan to view details and book.</p>

      {/* QR Card */}
      <div ref={printRef} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
        <QRCodeSVG
          value={treeUrl}
          size={220}
          level="H"
          includeMargin
          className="mx-auto"
        />
        <h2 className="text-xl font-bold text-gray-900 mt-4">{tree.name}</h2>
        <p className="text-sm text-gray-500 capitalize">
          {tree.type}{tree.variety ? ` — ${tree.variety}` : ''} &middot; {tree.size}
        </p>
        {(tree.city || tree.state) && (
          <p className="text-xs text-gray-400 mt-1">
            {[tree.location, tree.city, tree.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
            ₹{tree.price_per_season != null ? Number(tree.price_per_season).toLocaleString('en-IN') : '—'}/season
          </span>
        </div>
        {tree.min_quantity > 1 && (
          <p className="text-xs text-blue-600 font-medium mt-2">Min {tree.min_quantity} trees guaranteed</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Scan to rent this tree on The Rental Farm
        </p>
      </div>

      {/* URL display */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Tree Link</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            readOnly
            value={treeUrl}
            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(treeUrl)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print QR Code
        </button>
        <Link
          to={`/trees/${id}`}
          className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          View Listing
        </Link>
      </div>
    </div>
  );
}
