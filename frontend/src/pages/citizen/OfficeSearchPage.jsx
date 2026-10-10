import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { officeService } from '../../services/officeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card3D from '../../components/common/3D/Card3D';
import {
  Building2,
  Search,
  MapPin,
  Clock,
  Ticket,
  Filter,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';

const OfficeSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadOffices();
  }, [searchParams]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const query = {};
      const q = searchParams.get('search');
      const c = searchParams.get('city');
      if (q) query.search = q;
      if (c) query.city = c;

      const res = await officeService.getOffices(query);
      if (res.success) {
        setOffices(res.offices || []);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (cityFilter.trim()) params.city = cityFilter.trim();
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1a2a5e] bg-[#1a2a5e]/10 px-2.5 py-0.5 rounded-full border border-[#1a2a5e]/20">
          Official Government Directory
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1a2a5e] font-heading mt-2">
          Find Government Offices &amp; Live Queue Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Search civic service centers, transport offices, and municipal corporations by name, location, or PIN.
        </p>
      </div>

      {/* Filter / Search Box */}
      <form onSubmit={handleSearchSubmit} className="gov-card p-4 sm:p-5 border border-[#1a2a5e]/15 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#1a2a5e] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search office name, address, or service (e.g. RTO, Revenue)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-[#1a2a5e] placeholder:text-slate-400 focus:border-[#1a2a5e] focus:ring-2 focus:ring-[#1a2a5e]/10 focus:outline-none transition shadow-inner font-medium"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-[#1a2a5e] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City or PIN code (e.g. Rajkot, 360001)..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-[#1a2a5e] placeholder:text-slate-400 focus:border-[#1a2a5e] focus:ring-2 focus:ring-[#1a2a5e]/10 focus:outline-none transition shadow-inner font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#0f1a3a] hover:to-[#1a2a5e] text-white font-bold text-xs transition shadow-lg shadow-[#1a2a5e]/20 cursor-pointer flex items-center justify-center gap-1.5 btn-3d border border-[#c8a227]/40"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Offices</span>
            </button>
          </div>
        </div>
      </form>

      {/* Offices Results Grid */}
      {loading ? (
        <LoadingSpinner text="Searching government offices database..." size="lg" />
      ) : offices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office) => (
            <Card3D key={office._id} maxTilt={7}>
              <div className="gov-card p-6 flex flex-col justify-between h-full border border-[#1a2a5e]/15 hover:border-[#c8a227]/60 shadow-md">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#1a2a5e]/10 text-[#1a2a5e] border border-[#1a2a5e]/20 uppercase">
                      {office.code}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Open ({office.openingTime} - {office.closingTime})</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#1a2a5e] leading-snug">
                    {office.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#c8a227] shrink-0 mt-0.5" />
                    <span>
                      {office.address}, {office.city}, {office.state} - {office.pinCode}
                    </span>
                  </p>

                  {/* Queue Metrics Pill */}
                  <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block font-bold uppercase">Counters</span>
                      <strong className="text-[#1a2a5e] font-mono font-extrabold">{office.activeCounters || 1} Active</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block font-bold uppercase">Waiting</span>
                      <strong className="text-amber-700 font-mono font-extrabold">{office.waitingTokensCount || 0} Citizens</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block font-bold uppercase">Est. Wait</span>
                      <strong className="text-blue-900 font-mono font-extrabold">~{office.estimatedWaitMinutes || 10} Mins</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2">
                  <Link
                    to={`/citizen/book?officeId=${office._id}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1a2a5e] to-[#243470] hover:from-[#0f1a3a] hover:to-[#1a2a5e] text-white font-bold text-xs transition text-center shadow-md shadow-[#1a2a5e]/20 btn-3d border border-[#c8a227]/40"
                  >
                    Get Virtual Token
                  </Link>
                  <Link
                    to={`/offices/${office._id}`}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-[#1a2a5e] font-bold text-xs transition text-center shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      ) : (
        <Card3D maxTilt={4}>
          <div className="gov-card p-12 text-center border border-slate-300">
            <Building2 className="w-12 h-12 text-[#1a2a5e]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1a2a5e] font-heading">No Government Offices Found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 mb-4 font-medium">
              No offices matched your search query. Try clearing filters or searching for "Rajkot" or "RTO".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCityFilter('');
                loadOffices();
              }}
              className="px-5 py-2 rounded-xl bg-[#1a2a5e] text-white font-bold text-xs hover:bg-[#243470] transition cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        </Card3D>
      )}
    </div>
  );
};

export default OfficeSearchPage;
