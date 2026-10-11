'use client';

import React, { useState } from 'react';
import { SWIFTTransaction } from '@/types/swift';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  FileCode,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  FileText,
  UploadCloud
} from 'lucide-react';

interface TransactionDetailDrawerProps {
  transaction: SWIFTTransaction | null;
  onClose: () => void;
  onNavigateToTracker: (uetr: string) => void;
  onOpenCompliance?: (tx: SWIFTTransaction) => void;
}

export default function TransactionDetailDrawer({
  transaction,
  onClose,
  onNavigateToTracker,
  onOpenCompliance
}: TransactionDetailDrawerProps) {
  const [copiedUetr, setCopiedUetr] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);
  const [copiedAck, setCopiedAck] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'ack' | 'xml' | 'charges' | 'compliance'>('timeline');

  if (!transaction) return null;

  const copyToClipboard = (text: string, type: 'xml' | 'uetr' | 'ack' = 'uetr') => {
    navigator.clipboard.writeText(text);
    if (type === 'xml') {
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2000);
    } else if (type === 'ack') {
      setCopiedAck(true);
      setTimeout(() => setCopiedAck(false), 2000);
    } else {
      setCopiedUetr(true);
      setTimeout(() => setCopiedUetr(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="text-xs font-semibold text-blue-400 font-mono">
              SWIFT gpi AUDIT SHEET
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{transaction.senderReference}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  transaction.status === 'ACCC'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                    : transaction.status === 'HOLD'
                    ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                    : transaction.status === 'RJCT'
                    ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                    : 'bg-sky-950/60 border-sky-800 text-sky-400'
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {transaction.status === 'HOLD' && (
              <button
                onClick={() => onOpenCompliance?.(transaction)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Buka panel upload dokumen kepatuhan dan validasi 14 hari"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                Upload Dokumen (14 Hari)
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Jalur Routing Koresponden
          </button>
          {transaction.rawSwiftAck && (
            <button
              onClick={() => setActiveTab('ack')}
              className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ack'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Lembar SWIFT ACK (MT103)
            </button>
          )}
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Dokumen Kepatuhan & SLA 14 Hari
            {transaction.status === 'HOLD' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'xml'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pesan ISO 20022 XML
          </button>
          <button
            onClick={() => setActiveTab('charges')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'charges'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Biaya & Transparansi
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* UETR Key Value Banner */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>UETR (Universal Unique Identifier):</span>
              <button
                onClick={() => copyToClipboard(transaction.uetr)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
              >
                {copiedUetr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Salin UETR
              </button>
            </div>
            <div className="font-mono text-sm text-slate-200 font-bold break-all select-all">
              {transaction.uetr}
            </div>
          </div>

          {/* Amount & Parties */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500">Pihak Pengirim:</span>
              <div className="font-semibold text-white truncate">{transaction.sender.accountName}</div>
              <div className="text-slate-400 font-mono text-[11px]">
                {transaction.sender.bic} ({transaction.sender.bankName})
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-slate-500">Pihak Penerima:</span>
              <div className="font-semibold text-white truncate">{transaction.receiver.accountName}</div>
              <div className="text-slate-400 font-mono text-[11px]">
                {transaction.receiver.bic} ({transaction.receiver.bankName})
              </div>
            </div>
          </div>

          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-300">
                Riwayat Jaringan & Status Terkini:
              </div>
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {transaction.hops.map((hop, i) => (
                  <div key={hop.id} className="relative">
                    <div
                      className={`absolute -left-5 top-1.5 w-4 h-4 rounded-full border flex items-center justify-center bg-slate-950 ${
                        hop.status === 'COMPLETED'
                          ? 'border-emerald-500'
                          : hop.status === 'HELD'
                          ? 'border-amber-500'
                          : hop.status === 'REJECTED'
                          ? 'border-rose-500'
                          : 'border-sky-500'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>Hop #{i + 1}: {hop.bankName}</span>
                        <span className="font-mono text-[11px] text-slate-400">{hop.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="font-mono text-slate-300">{hop.bic}</span>
                        <span>·</span>
                        <span>{hop.role}</span>
                        <span>·</span>
                        <span>Fee: {hop.feeCurrency} {hop.deductedFee.toFixed(2)}</span>
                      </div>
                      {hop.statusReasonDesc && (
                        <div className="mt-1 text-[11px] text-blue-400 bg-slate-900 p-1.5 rounded">
                          [{hop.statusReasonCode}] {hop.statusReasonDesc}
                        </div>
                      )}
                      {hop.notes && (
                        <div className="mt-1 text-[11px] text-amber-300 bg-amber-950/30 p-1.5 rounded border border-amber-900/50">
                          {hop.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Raw SWIFT ACK */}
          {activeTab === 'ack' && transaction.rawSwiftAck && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Salinan Resmi Transmisi SWIFT ACK (Customer&apos;s Copy):
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.rawSwiftAck || '', 'ack')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedAck ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Salin Teks ACK
                </button>
              </div>
              <pre className="p-3.5 bg-black/90 rounded border border-slate-800 font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed selection:bg-emerald-900 selection:text-white">
                {transaction.rawSwiftAck}
              </pre>
            </div>
          )}

          {/* Tab 3: XML */}
          {activeTab === 'xml' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Dokumen ISO 20022 pacs.008.001.10:
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.rawXml, 'xml')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Salin XML
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[360px]">
                {transaction.rawXml}
              </pre>
            </div>
          )}

          {/* Tab 3: Charges */}
          {activeTab === 'charges' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-white">Transparansi Biaya SWIFT gpi (OUR / SHA / BEN)</div>
                <div className="text-slate-400">
                  Kode Pembebanan Biaya: <strong className="text-slate-200">{transaction.chargeBearer}</strong> (
                  {transaction.chargeBearer === 'OUR'
                    ? 'Seluruh biaya ditanggung pengirim'
                    : transaction.chargeBearer === 'SHA'
                    ? 'Biaya dibagi antara pengirim & penerima'
                    : 'Seluruh biaya dipotong dari dana penerima'}
                  )
                </div>
                <div className="pt-2 border-t border-slate-800 space-y-1 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Nominal Awal:</span>
                    <span>{transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Total Potongan Koresponden:</span>
                    <span>-{transaction.currency} {transaction.totalDeductions.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span>Dana Masuk Rekening (Settled):</span>
                    <span>{transaction.settlementCurrency} {transaction.settlementAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Compliance & 14 Days SLA */}
          {activeTab === 'compliance' && (
            <div className="space-y-4 text-xs">
              {/* Compliance Header Banner */}
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Enhanced Due Diligence & Verifikasi Sanksi
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    SLA: 14 Hari Kerja
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Kasus Tiket: <strong className="text-white font-mono">{transaction.complianceCase?.caseNumber || 'EDD-2025-WOORI-094B'}</strong>
                  <br />
                  Petugas: <span className="text-slate-200">{transaction.complianceCase?.assignedOfficer || 'Divisi AML Bank Woori Saudara'}</span>
                  <br />
                  Progres: <strong className="text-amber-300">Hari ke-{transaction.complianceCase?.currentWorkingDay || 3} dari 14 Hari Kerja</strong> (Target Putusan: {new Date(transaction.complianceCase?.targetResolutionDate || '2025-10-20').toLocaleDateString('id-ID')})
                </div>

                <button
                  onClick={() => onOpenCompliance?.(transaction)}
                  className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  Buka Pengunggahan Dokumen & Otorisasi Persetujuan (14 Hari)
                </button>
              </div>

              {/* Uploaded Documents List */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Berkas Dokumen Pendukung ({transaction.complianceCase?.documents.length || 0})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Standar FATF & BI</span>
                </div>

                {transaction.complianceCase?.documents && transaction.complianceCase.documents.length > 0 ? (
                  <div className="divide-y divide-slate-800/80">
                    {transaction.complianceCase.documents.map((doc) => (
                      <div key={doc.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-slate-200 truncate">{doc.name}</div>
                            <div className="text-[10px] text-slate-500">{doc.categoryLabel}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                              : 'bg-amber-950/60 border-amber-800 text-amber-400'
                          }`}
                        >
                          {doc.status === 'VERIFIED' ? 'Valid' : 'Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-4">Belum ada dokumen yang diunggah.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              onNavigateToTracker(transaction.uetr);
              onClose();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka di Halaman Pelacak UETR
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
