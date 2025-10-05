import React, { useState } from 'react';
import { CMEAnalysisData } from '../types';
import { getCMEAnalysis, CMEAnalysisFilters } from '../services/spaceWeatherService';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const formatDate = (date: Date) => date.toISOString().split('T')[0];
const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-lg text-sm max-w-xs">
        <p className="text-cyan-300 font-bold">{`Time: ${new Date(data.time21_5).toLocaleString()}`}</p>
        <p className="text-violet-200">{`Speed: ${data.speed} km/s`}</p>
        <p className="text-violet-200">{`Half Angle: ${data.halfAngle}°`}</p>
        <p className="text-violet-200">{`Latitude: ${data.latitude}°`}</p>
        {data.note && <p className="text-violet-300/80 italic mt-2 text-xs">Note: {data.note}</p>}
      </div>
    );
  }
  return null;
};

const CMEAnalysis: React.FC = () => {
    const [filters, setFilters] = useState<Omit<CMEAnalysisFilters, 'speed' | 'halfAngle'> & { speed: string | number; halfAngle: string | number }>({
        startDate: formatDate(oneMonthAgo),
        endDate: formatDate(today),
        mostAccurateOnly: true,
        speed: 500,
        halfAngle: 30,
        catalog: 'ALL'
    });
    const [cmeData, setCmeData] = useState<CMEAnalysisData[] | null>(null);
    const [fastestCME, setFastestCME] = useState<CMEAnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFilters(prev => ({ ...prev, [name]: checked }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setCmeData(null);
        setFastestCME(null);
        setHasSearched(true);
        try {
            const apiFilters: CMEAnalysisFilters = {
                ...filters,
                speed: Number(filters.speed) || 0,
                halfAngle: Number(filters.halfAngle) || 0,
                catalog: filters.catalog as 'ALL' | 'SWRC_CATALOG' | 'JANG_ET_AL_CATALOG',
            };
            const data = await getCMEAnalysis(apiFilters);
            setCmeData(data);

            if (data && data.length > 0) {
                const fastest = data.reduce((max, cme) => cme.speed > max.speed ? cme : max, data[0]);
                setFastestCME(fastest);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data. A solar flare might be interfering with our signal!');
        } finally {
            setIsLoading(false);
        }
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin"></div>
                </div>
            );
        }
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center text-red-300">
                    <span className="text-4xl mb-4">📡</span>
                    <h3 className="text-xl font-bold mb-2">Cosmic Interference!</h3>
                    <p className="max-w-sm">{error}</p>
                </div>
            )
        }
        if (!hasSearched) {
             return (
                 <div className="flex flex-col items-center justify-center h-full text-center text-violet-300">
                    <span className="text-4xl mb-4">🔭</span>
                    <h3 className="text-xl font-bold mb-2">Ready to Explore</h3>
                    <p>Adjust the filters and press Search to find CMEs.</p>
                </div>
            )
        }
        if (cmeData && cmeData.length > 0) {
            const staticCmeImageUrl = "/assets/solarflar1.jpg";
            return (
                <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full pb-4 h-1/2">
                        <div className="w-full h-full flex flex-col">
                            <h3 className="text-lg font-bold text-center text-violet-200 mb-2">Speed vs. Half Angle</h3>
                             <div className="w-full flex-grow">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                                        <XAxis
                                            type="number"
                                            dataKey="halfAngle"
                                            name="Half Angle"
                                            unit="°"
                                            stroke="#a78bfa"
                                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                                            label={{ value: 'Half Angle (°)', position: 'insideBottom', offset: -10, fill: '#a78bfa' }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="speed"
                                            name="Speed"
                                            unit="km/s"
                                            stroke="#a78bfa"
                                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                                            label={{ value: 'Speed (km/s)', angle: -90, position: 'insideLeft', offset: 0, fill: '#a78bfa' }}
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3', stroke: '#a78bfa' }}
                                            content={<CustomTooltip />}
                                        />
                                        <Scatter name="CMEs" data={cmeData} fill="#67e8f9" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="w-full h-full flex flex-col">
                            <h3 className="text-lg font-bold text-center text-violet-200 mb-2">Event Visualization</h3>
                            <div className="relative w-full flex-grow bg-gray-900/50 rounded-lg flex items-center justify-center border border-violet-700/50 overflow-hidden">
                                <img src={staticCmeImageUrl} alt="A dramatic image of a Coronal Mass Ejection" className="w-full h-full object-cover animate-fade-in-fast" />
                                {fastestCME && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex flex-col justify-end">
                                        <p className="absolute top-1/2 -translate-y-1/2 right-3 text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">{Math.round(fastestCME.speed)} km/s</p>
                                        <div className="text-white text-sm">
                                            <p><strong className="font-semibold">Half Angle:</strong> {fastestCME.halfAngle}°</p>
                                            <p><strong className="font-semibold">Longitude:</strong> {fastestCME.longitude}°</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Data List */}
                    <div className="h-1/2 space-y-4 overflow-y-auto pr-2 no-scrollbar">
                        {cmeData.map((cme, index) => (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-violet-700/50 animate-fade-in">
                               <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-cyan-300">Type: {cme.type} ({cme.catalog})</p>
                                        <p className="text-sm text-violet-300 font-mono">{new Date(cme.time21_5).toLocaleString()}</p>
                                    </div>
                                    <a href={cme.link} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 bg-sky-600 rounded-full hover:bg-sky-500 transition-colors flex-shrink-0">Details</a>
                               </div>
                               <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <p><strong className="text-violet-300">Speed:</strong> {cme.speed} km/s</p>
                                    <p><strong className="text-violet-300">Half Angle:</strong> {cme.halfAngle}°</p>
                                    <p><strong className="text-violet-300">Latitude:</strong> {cme.latitude}°</p>
                                    <p><strong className="text-violet-300">Longitude:</strong> {cme.longitude}°</p>
                               </div>
                               {cme.note && <p className="mt-3 text-xs text-gray-400 italic">Note: {cme.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        if (cmeData && cmeData.length === 0) {
             return (
                 <div className="flex flex-col items-center justify-center h-full text-center text-violet-300">
                    <span className="text-4xl mb-4">☀️</span>
                    <h3 className="text-xl font-bold text-green-300">All Quiet on the Sun</h3>
                    <p>No CMEs found matching your criteria. Try different parameters!</p>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-zoom-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Coronal Mass Ejection Analysis
                </h1>
                <p className="text-lg text-violet-200 max-w-3xl mx-auto mt-4">
                    Query NASA's database for specific CME events with detailed filters and view an interactive analysis.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Filters */}
                <div className="lg:col-span-1 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 h-fit">
                   <h2 className="text-2xl font-bold text-violet-200 mb-6">Filters</h2>
                   <form onSubmit={handleSearch} className="space-y-5">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-violet-300 mb-1">Start Date</label>
                            <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-gray-900/70 border border-violet-600 rounded-md px-3 py-2 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-violet-300 mb-1">End Date</label>
                            <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-gray-900/70 border border-violet-600 rounded-md px-3 py-2 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="speed" className="block text-sm font-medium text-violet-300 mb-1">Min. Speed (km/s)</label>
                            <input type="number" name="speed" id="speed" value={filters.speed} onChange={handleFilterChange} className="w-full bg-gray-900/70 border border-violet-600 rounded-md px-3 py-2 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="halfAngle" className="block text-sm font-medium text-violet-300 mb-1">Min. Half Angle</label>
                            <input type="number" name="halfAngle" id="halfAngle" value={filters.halfAngle} onChange={handleFilterChange} className="w-full bg-gray-900/70 border border-violet-600 rounded-md px-3 py-2 text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="catalog" className="block text-sm font-medium text-violet-300 mb-1">Catalog</label>
                            <select name="catalog" id="catalog" value={filters.catalog} onChange={handleFilterChange} className="w-full bg-gray-900/70 border border-violet-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="ALL">All</option>
                                <option value="SWRC_CATALOG">SWRC_CATALOG</option>
                                <option value="JANG_ET_AL_CATALOG">JANG_ET_AL_CATALOG</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                             <input type="checkbox" name="mostAccurateOnly" id="mostAccurateOnly" checked={filters.mostAccurateOnly} onChange={handleFilterChange} className="h-5 w-5 rounded bg-gray-900/70 border-violet-600 text-sky-500 focus:ring-sky-500"/>
                            <label htmlFor="mostAccurateOnly" className="text-sm font-medium text-violet-300">Most Accurate Only</label>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full px-8 py-3 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-600 hover:to-cyan-500 disabled:opacity-50">
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                   </form>
                </div>
                {/* Results */}
                <div className="lg:col-span-2 bg-black/40 rounded-2xl border border-violet-500/30 backdrop-blur-sm p-6 min-h-[500px] lg:h-[75vh]">
                    {renderResults()}
                </div>
            </div>
        </div>
    );
};
export default CMEAnalysis;