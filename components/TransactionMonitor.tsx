'use client';

import React, { useState } from 'react';
import { SWIFTTransaction } from '@/types/swift';
import {
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  ExternalLink,
  Building2,
  ChevronRight,
  FileText
} from 'lucide-react';

interface TransactionMonitorProps {
  transactions: SWIFTTransaction[];
  onSelectTransaction: (tx: SWIFTTransaction) => void;
  onNavigateToTracker: (uetr: string) => void;
  onOpenCompliance?: (tx: SWIFTTransaction) => void;
}

export default function TransactionMonitor({
  transactions,
  onSelectTransaction,
  onNavigateToTracker,
  onOpenCompliance,
}: TransactionMonitorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.uetr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.senderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiver.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender.bic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiver.bic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || tx.status === statusFilter;

    const matchesCurrency =
      currencyFilter === 'ALL' || tx.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // KPI calculations
  const totalVolumeUSD = transactions.reduce((acc, curr) => {
    if (curr.currency === 'USD') return acc + curr.amount;
    if (curr.currency === 'EUR') return acc + curr.amount * 1.08;
    if (curr.currency === 'SGD') return acc + curr.amount * 0.76;
    if (curr.currency === 'GBP') return acc + curr.amount * 1.30;
    return acc + curr.amount;
  }, 0);

  const inFlightCount = transactions.filter((t) => t.status === 'INFL' || t.status === 'ACSP').length;
  const heldCount = transactions.filter((t) => t.status === 'HOLD').length;
  const settledCount = transactions.filter((t) => t.status === 'ACCC').length;
  const slaRate = Math.round((transactions.filter((t) => !t.slaBreached).length / transactions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Headline & Quick Context */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Transaksi Aktif</div>
            <div className="text-sm font-semibold font-mono tabular-nums text-white">
              {transactions.length} Instruksi Terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">
            Total Nilai Transaksi Terpantau
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            ${totalVolumeUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">USD Eq.</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium font-mono tabular-nums">{settledCount} Berhasil</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-400 font-medium font-mono tabular-nums">{inFlightCount} In Flight</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">
            Rata-rata Waktu Settlement gpi
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
            14m 14s
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Target SLA Bank Koresponden: &lt; 30 Menit
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">
            Tingkat Kepatuhan SLA Jaringan
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 tracking-tight">
            {slaRate}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Audit Transparansi Biaya: 100% Tercatat
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">
              Pemeriksaan Kepatuhan Tertahan (Hold)
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 tracking-tight">
              {heldCount}
              <span className="text-xs text-slate-400 font-sans font-normal ml-1.5">Kasus AML/Review</span>
            </div>
            <div className="text-xs text-amber-500/90 mt-1">
              SLA Validasi: 14 Hari Kerja (Enhanced Due Diligence)
            </div>
          </div>
          {heldCount > 0 && (
            <button
              onClick={() => {
                const heldTx = transactions.find((t) => t.status === 'HOLD');
                if (heldTx && onOpenCompliance) onOpenCompliance(heldTx);
              }}
              className="mt-3 w-full py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Kelola Dokumen & SLA 14 Hari
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan UETR, Sender Ref, Nama PT, atau Bank BIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800">
            {['ALL', 'ACCC', 'INFL', 'HOLD', 'RJCT'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'ACCC'
                  ? 'Settled'
                  : st === 'INFL'
                  ? 'In Flight'
                  : st === 'HOLD'
                  ? 'Hold'
                  : 'Ditolak'}
              </button>
            ))}
          </div>

          {/* Currency selector */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Valuta</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="SGD">SGD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* High-density Transaction Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-medium text-slate-400">
                <th className="py-3 px-4">UETR & Referensi</th>
                <th className="py-3 px-4">Pengirim & Bank</th>
                <th className="py-3 px-4">Penerima & Destinasi</th>
                <th className="py-3 px-4 text-right">Nominal Pokok</th>
                <th className="py-3 px-4 text-center">Status gpi</th>
                <th className="py-3 px-4 text-center">Hop / Jalur</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada transaksi SWIFT gpi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const completedHops = tx.hops.filter((h) => h.status === 'COMPLETED').length;
                  const totalHops = tx.hops.length;

                  return (
                    <tr
                      key={tx.uetr}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* UETR & Ref */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span>{tx.uetr.slice(0, 8)}...{tx.uetr.slice(-6)}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {tx.senderReference}
                        </div>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[200px]" title={tx.sender.accountName}>
                          {tx.sender.accountName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-slate-300">{tx.sender.bic}</span>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{tx.sender.bankName}</span>
                        </div>
                      </td>

                      {/* Receiver */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[200px]" title={tx.receiver.accountName}>
                          {tx.receiver.accountName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-slate-300">{tx.receiver.bic}</span>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{tx.receiver.bankName}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-100">
                          {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Fee: {tx.currency} {tx.totalDeductions.toFixed(2)} ({tx.chargeBearer})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-slate-700/60 bg-slate-950">
                          {tx.status === 'ACCC' && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">ACCC / Settled</span>
                            </>
                          )}
                          {tx.status === 'INFL' && (
                            <>
                              <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                              <span className="text-sky-400">INFL / Transit</span>
                            </>
                          )}
                          {tx.status === 'HOLD' && (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-400">HOLD / Sanctions</span>
                            </>
                          )}
                          {tx.status === 'RJCT' && (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span className="text-rose-400">RJCT / Ditolak</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Hop Progression */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono text-xs text-slate-300">
                          {completedHops}/{totalHops} Node
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full mx-auto mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              tx.status === 'RJCT'
                                ? 'bg-rose-500'
                                : tx.status === 'HOLD'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${(completedHops / totalHops) * 100}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {tx.status === 'HOLD' && (
                            <button
                              onClick={() => onOpenCompliance?.(tx)}
                              className="px-2.5 py-1 text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-700/80 rounded text-xs transition-colors flex items-center gap-1 font-medium whitespace-nowrap shadow-xs"
                              title="Unggah dokumen kelengkapan & proses validasi 14 hari kerja"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              Lengkapi Dokumen (14 Hari)
                            </button>
                          )}
                          <button
                            onClick={() => onNavigateToTracker(tx.uetr)}
                            className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded text-xs transition-colors flex items-center gap-1 border border-slate-700/60"
                            title="Lacak rincian jalur gpi"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Lacak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
