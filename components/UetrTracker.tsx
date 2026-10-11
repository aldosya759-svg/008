'use client';

import React, { useState, useEffect } from 'react';
import { SWIFTTransaction } from '@/types/swift';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  Printer,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  Phone,
  MapPin,
  FileCheck,
  UploadCloud
} from 'lucide-react';

interface UetrTrackerProps {
  initialUetr?: string;
  onOpenCompliance?: (tx: SWIFTTransaction) => void;
}

export default function UetrTracker({
  initialUetr,
  onOpenCompliance
}: UetrTrackerProps) {
  const [inputUetr, setInputUetr] = useState(initialUetr || '094b8680-01f9-4d33-b5a1-0e3b8431643c');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<SWIFTTransaction | null>(null);
  const [copiedUetr, setCopiedUetr] = useState(false);
  const [copiedAck, setCopiedAck] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'timeline' | 'ack_slip' | 'pacs008'>('timeline');

  const handleSearch = async (targetUetr?: string) => {
    const q = (targetUetr || inputUetr).trim();
    if (!q) {
      setError('Masukkan UETR (36 karakter UUID) atau Referensi Transaksi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/swift/track?uetr=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Transaksi tidak ditemukan pada jaringan SWIFT gpi.');
        setTransaction(null);
      } else {
        setTransaction(data.data);
      }
    } catch {
      setError('Terjadi kendala koneksi ke gerbang API SWIFT gpi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchTrackerData() {
      const q = initialUetr || '094b8680-01f9-4d33-b5a1-0e3b8431643c';
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/swift/track?uetr=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.success) {
            setError(data.error || 'Transaksi tidak ditemukan pada jaringan SWIFT gpi.');
            setTransaction(null);
          } else {
            setTransaction(data.data);
          }
        }
      } catch {
        if (!ignore) {
          setError('Terjadi kendala koneksi ke gerbang API SWIFT gpi.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTrackerData();
    return () => {
      ignore = true;
    };
  }, [initialUetr]);

  const copyToClipboard = (text: string, isAck = false) => {
    navigator.clipboard.writeText(text);
    if (isAck) {
      setCopiedAck(true);
      setTimeout(() => setCopiedAck(false), 2000);
    } else {
      setCopiedUetr(true);
      setTimeout(() => setCopiedUetr(false), 2000);
    }
  };

  const handlePrintAdvice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Pengecekan Dana SWIFT gpi (Real-time UETR Tracker)
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Standar Universal End-to-End Tracking (UETR)</span>
            <span aria-hidden="true">·</span>
            <span>Audit Transmisi Asli SWIFT ACK / MT103</span>
            <span aria-hidden="true">·</span>
            <span>Konfirmasi Penerimaan AFT Antar-Bank</span>
          </div>
        </div>

        {transaction && (
          <button
            onClick={handlePrintAdvice}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak SWIFT gpi Advice / Slip
          </button>
        )}
      </div>

      {/* Input Search Console */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Nomor UETR (Unique End-to-End Transaction Reference), Sender Ref, atau Transaction Code:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputUetr}
              onChange={(e) => setInputUetr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: 094b8680-01f9-4d33-b5a1-0e3b8431643c atau CITT94785212068"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Mengecek Jaringan...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lacak Status Dana
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Pencarian Tidak Berhasil</div>
            <div className="text-xs text-rose-300/90 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Loaded Transaction Details */}
      {transaction && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              transaction.status === 'ACCC'
                ? 'bg-emerald-950/30 border-emerald-800/80'
                : transaction.status === 'HOLD'
                ? 'bg-amber-950/30 border-amber-800/80'
                : transaction.status === 'RJCT'
                ? 'bg-rose-950/30 border-rose-800/80'
                : 'bg-sky-950/30 border-sky-800/80'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 shrink-0">
                {transaction.status === 'ACCC' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                {transaction.status === 'HOLD' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                {transaction.status === 'RJCT' && <XCircle className="w-6 h-6 text-rose-400" />}
                {transaction.status === 'INFL' && <Clock className="w-6 h-6 text-sky-400 animate-spin" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">
                    {transaction.statusDescription}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Status: {transaction.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                  <span>Waktu Kirim: {new Date(transaction.initiatedAt).toLocaleString('id-ID')}</span>
                  <span aria-hidden="true">·</span>
                  <span>Waktu Selesai (ACK): {transaction.completedAt ? new Date(transaction.completedAt).toLocaleString('id-ID') : 'In Flight'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Durasi Eksekusi: {transaction.slaDuration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance HOLD Banner & Document Upload Trigger */}
          {transaction.status === 'HOLD' && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-600/70 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <span>Diperlukan Kelengkapan Dokumen Kepatuhan (Sanksi & AML)</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      SLA: 14 Hari Kerja
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Transaksi ditahan sementara oleh gerbang koresponden untuk audit Enhanced Due Diligence (EDD).
                    Silakan unggah dokumen pendukung (Perjanjian Dagang, Faktur Komersial, Surat Asal Usul Dana) untuk proses validasi & approval dalam 14 hari kerja.
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenCompliance?.(transaction)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shrink-0 shadow-md whitespace-nowrap"
              >
                <UploadCloud className="w-4 h-4 text-slate-950" />
                Upload Dokumen & Approval (14 Hari)
              </button>
            </div>
          )}

          {/* Core Transfer Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
            {/* Sender */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Rekening Pengirim (Ordering Customer)
              </div>
              <div className="text-sm font-semibold text-white">
                {transaction.sender.accountName}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {transaction.sender.bankName}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                BIC: {transaction.sender.bic} · Rek: {transaction.sender.accountNumber}
              </div>
              {transaction.sortCodeAba && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Bank Code: {transaction.bankCode || '021000089'} · ABA/Routing: {transaction.sortCodeAba}
                </div>
              )}
              {transaction.senderAddress && (
                <div className="text-[11px] text-slate-400 flex items-start gap-1 pt-1 border-t border-slate-800/80">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{transaction.senderAddress}</span>
                </div>
              )}
            </div>

            {/* Center: Financial Breakdown */}
            <div className="space-y-1.5 text-center border-y md:border-y-0 md:border-x border-slate-800 py-3 md:py-0 md:px-4 flex flex-col justify-center">
              <div className="text-xs font-semibold text-slate-400">
                Nominal Pokok Transfer
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Deductions: {transaction.currency} {transaction.totalDeductions.toFixed(2)}</span>
                <span>·</span>
                <span>Bearer: {transaction.chargeBearer}</span>
              </div>
              <div className="text-xs text-emerald-400 font-mono font-medium">
                Dana Netto Penerima: {transaction.settlementCurrency} {transaction.settlementAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {transaction.gatewayResponseRef && (
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                  Gateway Ref: {transaction.gatewayResponseRef}
                </div>
              )}
            </div>

            {/* Receiver */}
            <div className="space-y-1.5 md:text-right">
              <div className="text-xs font-semibold text-slate-400 flex items-center md:justify-end gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Rekening Penerima (Beneficiary Customer)
              </div>
              <div className="text-sm font-semibold text-white">
                {transaction.receiver.accountName}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {transaction.receiver.bankName}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                BIC: {transaction.receiver.bic} · Rek: {transaction.receiver.accountNumber}
              </div>
              {transaction.bankTelephone && (
                <div className="text-[11px] text-slate-400 font-mono flex items-center md:justify-end gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Tel: {transaction.bankTelephone}</span>
                </div>
              )}
              {transaction.receiverAddress && (
                <div className="text-[11px] text-slate-400 flex items-start md:justify-end gap-1 pt-1 border-t border-slate-800/80">
                  <span className="leading-tight">{transaction.receiverAddress}</span>
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* UETR & Identification Details */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">UETR Identitas Tunggal:</span>
                <span className="font-mono text-blue-400 font-bold select-all">{transaction.uetr}</span>
                <button
                  onClick={() => copyToClipboard(transaction.uetr)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Salin UETR"
                >
                  {copiedUetr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span>Tipe: {transaction.messageType}</span>
                <span>·</span>
                <span>Ref (Field 20): {transaction.senderReference}</span>
                {transaction.transactionCode && (
                  <>
                    <span>·</span>
                    <span>TxCode (Field 21): {transaction.transactionCode}</span>
                  </>
                )}
              </div>
            </div>

            {/* Remittance message & Field 72 */}
            <div className="pt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-medium shrink-0">Field 70 (Remittance):</span>
                <span className="text-slate-200 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800/80 flex-1">
                  {transaction.remittanceInfo}
                </span>
              </div>
              {transaction.field72 && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Field 72 (Bank Instruction):</span>
                  <span className="text-emerald-400/90 font-mono text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80 flex-1 leading-relaxed">
                    {transaction.field72}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Switcher: Timeline vs Raw SWIFT ACK Slip vs ISO 20022 */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Audit Jalur Koresponden SWIFT gpi
            </button>

            {transaction.rawSwiftAck && (
              <button
                onClick={() => setActiveViewMode('ack_slip')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                  activeViewMode === 'ack_slip'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Salinan Transmisi SWIFT ACK Asli (MT103 Slip)
              </button>
            )}

            <button
              onClick={() => setActiveViewMode('pacs008')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'pacs008'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Dokumen ISO 20022 XML
            </button>
          </div>

          {/* View 1: Timeline Hop Progression */}
          {activeViewMode === 'timeline' && (
            <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Rincian Verifikasi Node Jaringan Antar-Bank
                </h2>
                <div className="text-xs text-slate-400">
                  {transaction.hops.length} Lembaga Keuangan Terlibat
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {transaction.hops.map((hop, index) => {
                  const isCompleted = hop.status === 'COMPLETED';
                  const isHeld = hop.status === 'HELD';
                  const isRejected = hop.status === 'REJECTED';
                  const isInProgress = hop.status === 'IN_PROGRESS';

                  return (
                    <div key={hop.id} className="relative group">
                      {/* Hop bullet indicator */}
                      <div
                        className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-950 ${
                          isCompleted
                            ? 'border-emerald-500 text-emerald-400'
                            : isHeld
                            ? 'border-amber-500 text-amber-400 animate-pulse'
                            : isRejected
                            ? 'border-rose-500 text-rose-400'
                            : isInProgress
                            ? 'border-sky-500 text-sky-400'
                            : 'border-slate-700 text-slate-600'
                        }`}
                      >
                        {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        {isHeld && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        {isRejected && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                        {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              Hop #{index + 1}: {hop.bankName}
                            </span>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {hop.bic}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {hop.city}, {hop.country}
                          </div>
                        </div>

                        {/* Role & timestamps */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span>Peran: <strong className="text-slate-300 font-normal">{hop.role}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Diterima: <span className="font-mono text-slate-300">{hop.receivedAt ? new Date(hop.receivedAt).toLocaleTimeString('id-ID') : 'Pending'}</span></span>
                          {hop.processedAt && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Diproses: <span className="font-mono text-slate-300">{new Date(hop.processedAt).toLocaleTimeString('id-ID')}</span></span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-300">
                            Potongan Fee: {hop.feeCurrency} {hop.deductedFee.toFixed(2)}
                          </span>
                        </div>

                        {/* Reason code description */}
                        {hop.statusReasonDesc && (
                          <div className="mt-2.5 p-2 rounded bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2">
                            <span className="font-mono font-semibold text-blue-400">
                              [{hop.statusReasonCode || 'INFO'}]
                            </span>
                            <span className="text-slate-300">{hop.statusReasonDesc}</span>
                          </div>
                        )}

                        {/* Notes if held/rejected */}
                        {hop.notes && (
                          <div className="mt-2 p-2 rounded bg-amber-950/30 border border-amber-800/60 text-xs text-amber-300">
                            <strong>Catatan Status:</strong> {hop.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View 2: Raw SWIFT ACK Official Slip */}
          {activeViewMode === 'ack_slip' && transaction.rawSwiftAck && (
            <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    Format Cetak SWIFT ACK-945587 (Network Confirmed & Delivered)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(transaction.rawSwiftAck || '', true)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors flex items-center gap-1"
                  >
                    {copiedAck ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Salin Teks ACK
                  </button>
                  <button
                    onClick={handlePrintAdvice}
                    className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Lembar ACK
                  </button>
                </div>
              </div>

              <div className="bg-black/90 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed max-h-[500px] selection:bg-emerald-900 selection:text-white">
                <pre className="whitespace-pre">{transaction.rawSwiftAck}</pre>
              </div>
            </div>
          )}

          {/* View 3: ISO 20022 XML */}
          {activeViewMode === 'pacs008' && (
            <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">
                    Dokumen ISO 20022 pacs.008.001.10
                  </span>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[450px]">
                <pre className="whitespace-pre">{transaction.rawXml}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
