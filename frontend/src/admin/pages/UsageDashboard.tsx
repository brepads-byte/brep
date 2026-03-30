import { useEffect, useState } from "react";
import { 
  HardDrive, Cloud, AlertCircle, RefreshCw, Clock, 
  Activity, Database, Calendar, Layers, Zap, Image as ImageIcon, ShieldAlert
} from "lucide-react";
import apiClient from '../../services/apiClient';
import { useAuth } from "../../hooks/useAuth";

const UsageDashboard = () => {
  const { admin: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      const cachedData = localStorage.getItem("system_stats_cache");
      if (cachedData) {
        setStats(JSON.parse(cachedData));
      } else {
        fetchStats();
      }
    }
  }, [isSuperAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admins/usage-stats");
      if (res) {
        localStorage.setItem("system_stats_cache", JSON.stringify(res));
        setStats(res);
      }
    } catch (err) {
      console.error("Infrastructure sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="p-6 bg-red-50 text-red-500 rounded-full mb-6 shadow-sm border border-red-100">
          <ShieldAlert size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Privileged Access Only</h2>
        <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
          Infrastructure telemetry is restricted to the <span className="font-bold text-slate-800 underline decoration-red-200 underline-offset-4">Super Admin</span> role.
        </p>
        <button onClick={() => window.history.back()} className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm">Go Back</button>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
        <RefreshCw size={32} className="animate-spin text-sky-500" />
        <p className="animate-pulse font-medium">Initial Infrastructure Sync...</p>
      </div>
    );
  }

  const mongo = stats?.mongodb;
  const cloud = stats?.cloudinary;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Health</h1>
          <p className="text-slate-500 text-sm font-medium">Project Telemetry • Cloud Infrastructure</p>
        </div>
        <button onClick={fetchStats} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="font-bold">{loading ? "Syncing..." : "Refresh Logs"}</span>
        </button>
      </div>

      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-900">
        <AlertCircle size={20} className="shrink-0 text-amber-500" />
        <div className="text-[11px] leading-tight opacity-80">
          <p className="text-sm font-bold">Refresh with care.</p>
          Cloudinary & Atlas Admin APIs limit requests to 500/hr.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MONGODB CARD */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><HardDrive size={28} /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{mongo?.tier}</span>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-bold justify-end">
                <Clock size={10} />
                <span>Last Sync: {mongo?.lastUpdated ? new Date(mongo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Database Payload</h2>
          <div className="flex justify-between items-end mt-8 mb-2">
            <p className="text-4xl font-mono font-black text-slate-900">{mongo?.dataSizeMB} <span className="text-sm text-slate-400 font-sans tracking-normal">MB</span></p>
            <p className="text-xs font-bold text-slate-400 font-mono tracking-tighter">Quota: {mongo?.limitMB} MB</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(parseFloat(mongo?.dataSizeMB || 0) / 512) * 100}%` }} />
          </div>
        </div>

        {/* CLOUDINARY CARD */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl"><Cloud size={28} /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">{cloud?.plan} Tier</span>
              <p className="text-[9px] text-slate-400 font-bold mt-2 italic">Audit: {cloud?.lastUpdated || 'N/A'}</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Managed Credits</h2>
          <div className="flex justify-between items-end mt-4 mb-2">
            <p className="text-4xl font-mono font-black text-slate-900">{cloud?.credits?.usage} <span className="text-sm text-slate-400 font-sans tracking-normal">Used</span></p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Pool: {cloud?.credits?.limit}</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
             <div className="bg-sky-500 h-full transition-all duration-1000" style={{ width: `${((cloud?.credits?.usage || 0) / (cloud?.credits?.limit || 25)) * 100}%` }} />
          </div>
          
          {/* Detailed Usage Grid - Updated to 3 columns to include Transformations */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 border-t border-slate-50 pt-6">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Storage ({cloud?.storage?.usedMB} MB)</span>
              <p className="text-[10px] text-sky-600 font-bold italic font-mono tracking-tighter">Cost: {cloud?.storage?.creditsUsed} Cr</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Bandwidth ({cloud?.bandwidth?.usedMB} MB)</span>
              <p className="text-[10px] text-sky-600 font-bold italic font-mono tracking-tighter">Cost: {cloud?.bandwidth?.creditsUsed} Cr</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Transforms ({cloud?.transformations?.count})</span>
              <p className="text-[10px] text-sky-600 font-bold italic font-mono tracking-tighter">Cost: {cloud?.transformations?.creditsUsed} Cr</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between min-h-[120px]">
          <Activity size={20} className="text-emerald-400 mb-4" />
          <div>
            <p className="text-2xl font-mono font-black leading-none mb-1">{mongo?.activeConnections || 0}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Connections</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <Database size={20} className="text-slate-400 mb-4" />
          <p className="text-2xl font-black text-slate-800 leading-none mb-1">{mongo?.documentCount || 0}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Documents</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <ImageIcon size={20} className="text-sky-400 mb-4" />
          <p className="text-2xl font-black text-slate-800 leading-none mb-1">{cloud?.resources || 0}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Media Assets</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <Zap size={22} className="text-amber-400 fill-amber-400/20" />
            <span className="text-sm font-black text-slate-900 tracking-tight">
              {cloud?.rateLimit?.remaining} <span className="text-slate-400 font-bold">/ 500</span>
            </span>
          </div>
          <p className="text-[11px] font-extrabold text-slate-500 mt-1">
            Resets: <span className="text-sm text-amber-600 ml-1">{cloud?.rateLimit?.resetAt} IST</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;