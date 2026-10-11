'use client';

import React, { useState, useRef } from 'react';
import {
  SWIFTTransaction,
  ComplianceDocument,
  ComplianceDocCategory,
  ComplianceWorkflowStage
} from '@/types/swift';
import {
  X,
  UploadCloud,
  FileText,
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Trash2,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Info,
  Download,
  Plus
} from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  transaction: SWIFTTransaction | null;
  onClose: () => void;
  onUpdateTransaction: (updated: SWIFTTransaction) => void;
}

const CATEGORY_OPTIONS: { id: ComplianceDocCategory; label: string; desc: string }[] = [
  { id: 'CONTRACT', label: 'Kontrak Komersial / MoU', desc: 'Perjanjian dagang internasional atau kontrak kerja sama' },
  { id: 'INVOICE', label: 'Faktur Komersial & Shipping', desc: 'Invoice, bill of lading, atau manifes pengiriman' },
  { id: 'SOURCE_OF_FUNDS', label: 'Surat Asal Usul Dana (SoF)', desc: 'Deklarasi dana bersih non-criminal origin' },
  { id: 'LEGALITY', label: 'Legalitas Badan Usaha', desc: 'NIB, NPWP, Akta Pendirian, atau dokumen AHU' },
  { id: 'SANCTIONS_DECLARATION', label: 'Formulir Kepatuhan Sanksi & AML', desc: 'Kuisioner kepatuhan FATF/OFAC' },
  { id: 'OTHER', label: 'Dokumen Pendukung Lainnya', desc: 'Surat kuasa, bukti pembayaran pajak, dll' }
];

const WORKFLOW_STAGES: {
  stage: ComplianceWorkflowStage;
  title: string;
  dayRange: string;
  desc: string;
}[] = [
  {
    stage: 'DOC_SUBMISSION',
    title: 'Pengunggahan Dokumen',
    dayRange: 'Hari 1',
    desc: 'Pemberian instruksi dan pengunggahan seluruh berkas kelengkapan transaksi oleh nasabah/bank pengirim.'
  },
  {
    stage: 'INITIAL_SCREENING',
    title: 'Pemeriksaan Awal & AML',
    dayRange: 'Hari 2 - 4',
    desc: 'Verifikasi keaslian dokumen, pencocokan data PEP, daftar cekal OFAC/PBB/PPATK, dan profil risiko.'
  },
  {
    stage: 'ENHANCED_DUE_DILIGENCE',
    title: 'Uji Tuntas Mendalam (EDD)',
    dayRange: 'Hari 5 - 9',
    desc: 'Audit mendalam rantai pasok dan asal usul dana bersama bank koresponden perantara (Citibank N.A.).'
  },
  {
    stage: 'COMMITTEE_REVIEW',
    title: 'Review Komite Kepatuhan Senior',
    dayRange: 'Hari 10 - 13',
    desc: 'Pemeriksaan legal clearance dan persetujuan komite kepatuhan terpadu Bank Woori Saudara.'
  },
  {
    stage: 'FINAL_APPROVAL',
    title: 'Keputusan Final & Rilis Dana',
    dayRange: 'Hari 14',
    desc: 'Penerbitan notifikasi status pacs.002 ACCC, pelepasan penahanan, dan pengkreditan dana penuh.'
  }
];

export default function ComplianceModal({
  isOpen,
  transaction,
  onClose,
  onUpdateTransaction
}: ComplianceModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ComplianceDocCategory>('CONTRACT');
  const [docNotes, setDocNotes] = useState('');
  const [officerNote, setOfficerNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'sla_timeline' | 'approval_actions'>('documents');
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !transaction) return null;

  const compCase = transaction.complianceCase || {
    caseNumber: 'EDD-2025-WOORI-094B',
    ticketId: 'TCK-AML-94821',
    assignedOfficer: 'Farhan Ardiansyah, CAMS (Divisi AML & Kepatuhan Bank Woori Saudara)',
    initiatedDate: transaction.initiatedAt || new Date().toISOString(),
    targetWorkingDays: 14,
    currentWorkingDay: 3,
    targetResolutionDate: '2025-10-20T17:00:00Z',
    stage: 'INITIAL_SCREENING' as ComplianceWorkflowStage,
    approvalStatus: 'UNDER_EVALUATION' as const,
    documents: [],
    auditLogs: []
  };

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: ComplianceDocument[] = Array.from(files).map((file, i) => {
      const catObj = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
      return {
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        size: file.size || Math.floor(Math.random() * 2000000) + 500000,
        uploadedAt: new Date().toISOString(),
        category: selectedCategory,
        categoryLabel: catObj ? catObj.label : 'Dokumen Pendukung',
        status: 'UNDER_REVIEW',
        fileType: file.type || 'application/pdf',
        notes: docNotes || 'Diunggah untuk melengkapi investigasi penahanan kepatuhan.'
      };
    });

    const updatedDocuments = [...(compCase.documents || []), ...newDocs];
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Divisi Kepatuhan / Nasabah',
      action: `Unggah Dokumen (${newDocs.length} berkas)`,
      notes: `Berkas baru ditambahkan pada kategori ${selectedCategory}. Total berkas tersimpan: ${updatedDocuments.length}.`
    };

    const updatedTx: SWIFTTransaction = {
      ...transaction,
      complianceCase: {
        ...compCase,
        documents: updatedDocuments,
        auditLogs: [newLog, ...(compCase.auditLogs || [])]
      }
    };

    onUpdateTransaction(updatedTx);
    setDocNotes('');
    showNotification(`Berhasil mengunggah ${newDocs.length} dokumen kelengkapan kepatuhan!`);
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocuments = compCase.documents.filter((d) => d.id !== docId);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Divisi Kepatuhan',
      action: 'Penghapusan Berkas',
      notes: `Dokumen dengan ID ${docId} telah dihapus dari berkas investigasi.`
    };

    const updatedTx: SWIFTTransaction = {
      ...transaction,
      complianceCase: {
        ...compCase,
        documents: updatedDocuments,
        auditLogs: [newLog, ...(compCase.auditLogs || [])]
      }
    };

    onUpdateTransaction(updatedTx);
    showNotification('Dokumen berhasil dihapus dari berkas perkara.', 'info');
  };

  const handleUpdateWorkingDay = (day: number, stage: ComplianceWorkflowStage) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Farhan Ardiansyah, CAMS',
      action: `Progres Hari Kerja (${day} / 14 Hari Kerja)`,
      notes: `Tahap investigasi dimajukan ke: ${stage}.`
    };

    const updatedTx: SWIFTTransaction = {
      ...transaction,
      complianceCase: {
        ...compCase,
        currentWorkingDay: day,
        stage,
        auditLogs: [newLog, ...(compCase.auditLogs || [])]
      }
    };

    onUpdateTransaction(updatedTx);
    showNotification(`Progres validasi diperbarui ke Hari ke-${day} dari 14 Hari Kerja!`);
  };

  const handleApproveTransaction = () => {
    // Release funds: change status to ACCC
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Komite Kepatuhan & AML Senior',
      action: 'PERSETUJUAN DIBERIKAN (APPROVAL SELESAI)',
      notes: officerNote || 'Seluruh dokumen uji tuntas (EDD) telah diverifikasi sah. Dana $49,000,000.50 USD dinyatakan bersih dan dilepaskan dari penahanan.'
    };

    const updatedHops = transaction.hops.map((hop) => {
      if (hop.id === 'hop-citi-3' || hop.role === 'Beneficiary') {
        return {
          ...hop,
          status: 'COMPLETED' as const,
          processedAt: new Date().toISOString(),
          statusReasonCode: 'ACCC',
          statusReasonDesc: '100% DELIVERED / CONFIRMED & RECEIVED (Sanctions Cleared)',
          notes: 'Verifikasi dokumen kepatuhan selesai 100%. Dana telah dikreditkan penuh ke rekening nasabah.'
        };
      }
      return hop;
    });

    const updatedTx: SWIFTTransaction = {
      ...transaction,
      status: 'ACCC',
      statusDescription: 'Dana Telah Divalidasi & Masuk ke Rekening Penerima (100% Delivered & Confirmed)',
      hops: updatedHops,
      complianceStatus: 'SANCTION_CLEAR',
      completedAt: new Date().toISOString(),
      complianceCase: {
        ...compCase,
        stage: 'FINAL_APPROVAL',
        approvalStatus: 'APPROVED',
        currentWorkingDay: 14,
        auditLogs: [newLog, ...(compCase.auditLogs || [])]
      }
    };

    onUpdateTransaction(updatedTx);
    setOfficerNote('');
    showNotification('Transaksi Berhasil Disetujui! Status dialihkan menjadi ACCC (Delivered & Confirmed).');
  };

  const handleRevertToHold = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Divisi Kepatuhan',
      action: 'Simulasi Kembalikan Status HOLD',
      notes: 'Status dikembalikan ke penahanan kepatuhan untuk pengujian alur verifikasi 14 hari kerja.'
    };

    const updatedHops = transaction.hops.map((hop) => {
      if (hop.id === 'hop-citi-3' || hop.role === 'Beneficiary') {
        return {
          ...hop,
          status: 'HELD' as const,
          processedAt: undefined,
          statusReasonCode: 'G003',
          statusReasonDesc: 'Payment held under compliance/sanctions screening (OFAC / Sanctions Check)'
        };
      }
      return hop;
    });

    const updatedTx: SWIFTTransaction = {
      ...transaction,
      status: 'HOLD',
      statusDescription: 'Tertahan Pemeriksaan Kepatuhan & Sanksi (HOLD / Sanctions Screening)',
      hops: updatedHops,
      complianceStatus: 'UNDER_REVIEW',
      complianceCase: {
        ...compCase,
        approvalStatus: 'UNDER_EVALUATION',
        currentWorkingDay: 3,
        stage: 'INITIAL_SCREENING',
        auditLogs: [newLog, ...(compCase.auditLogs || [])]
      }
    };

    onUpdateTransaction(updatedTx);
    showNotification('Status transaksi dikembalikan ke HOLD.', 'info');
  };

  const daysLeft = Math.max(0, compCase.targetWorkingDays - compCase.currentWorkingDay);
  const progressPercent = Math.min(100, Math.round((compCase.currentWorkingDay / compCase.targetWorkingDays) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  Manajemen Kepatuhan Transaksi Tertahan (HOLD)
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    transaction.status === 'HOLD'
                      ? 'bg-amber-950/70 border-amber-700/80 text-amber-300'
                      : 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300'
                  }`}
                >
                  {transaction.status === 'HOLD' ? 'HOLD / Sanctions' : 'ACCC / Released'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                <span>Tiket: {compCase.caseNumber}</span>
                <span aria-hidden="true">·</span>
                <span>UETR: {transaction.uetr.slice(0, 8)}...{transaction.uetr.slice(-6)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-sans font-medium">SLA: 14 Hari Kerja</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Pengirim:</span>
            <span className="font-semibold text-slate-200">{transaction.sender.accountName}</span>
            <div className="text-slate-400 text-[11px] font-mono">{transaction.sender.bankName}</div>
          </div>
          <div className="sm:text-center">
            <span className="text-slate-500 block">Nominal Ditahan:</span>
            <span className="font-bold text-sm text-white font-mono">
              {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="text-amber-400 text-[11px]">Enhanced Due Diligence (Threshold &gt; $10M)</div>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-500 block">Penerima Manfaat:</span>
            <span className="font-semibold text-slate-200">{transaction.receiver.accountName}</span>
            <div className="text-slate-400 text-[11px] font-mono">{transaction.receiver.bankName}</div>
          </div>
        </div>

        {/* Toast Notification */}
        {notificationMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-blue-950/80 text-blue-300 border-b border-blue-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 gap-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Upload Dokumen Kelengkapan ({compCase.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('sla_timeline')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sla_timeline'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Proses Validasi 14 Hari Kerja ({compCase.currentWorkingDay}/14 Hari)
          </button>
          <button
            onClick={() => setActiveTab('approval_actions')}
            className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'approval_actions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Otorisasi Persetujuan & Log Audit
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: UPLOAD DOKUMEN */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              {/* Info banner */}
              <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Persyaratan Regulasi Bank Indonesia & SWIFT gpi:</strong> Transaksi dana masuk senilai $49,000,000.50 USD memerlukan dokumen kepatuhan untuk membebaskan penahanan (HOLD). Dokumen akan diperiksa oleh Divisi Kepatuhan dalam batas waktu maksimal <strong>14 hari kerja</strong>.
                </div>
              </div>

              {/* Upload Drop Zone & Controls */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-white">Unggah Dokumen Baru:</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Kategori Dokumen:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as ComplianceDocCategory)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.desc}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Catatan Keterangan Dokumen (Opsional):</label>
                    <input
                      type="text"
                      placeholder="Contoh: Salinan kontrak final yang telah dinotarisasi..."
                      value={docNotes}
                      onChange={(e) => setDocNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Drag and drop box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-950/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-200">
                    Klik di sini atau seret & jatuhkan berkas dokumen kepatuhan
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Mendukung PDF, DOCX, PNG, JPG (Maks. 25 MB per dokumen)
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    Berkas Dokumen yang Telah Diunggah ({compCase.documents.length})
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Semua dokumen dienkripsi standar perbankan SHA-256
                  </span>
                </div>

                {compCase.documents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-lg border border-slate-800 text-slate-500 text-xs">
                    Belum ada dokumen yang diunggah. Silakan unggah dokumen persyaratan di atas.
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden divide-y divide-slate-800/80">
                    {compCase.documents.map((doc) => (
                      <div key={doc.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{doc.name}</div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                                {doc.categoryLabel}
                              </span>
                              <span>·</span>
                              <span>{(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>·</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            {doc.notes && (
                              <div className="text-[11px] text-slate-500 mt-1 italic">
                                &quot;{doc.notes}&quot;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                              doc.status === 'VERIFIED'
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                                : doc.status === 'UNDER_REVIEW'
                                ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                                : 'bg-rose-950/60 border-rose-800 text-rose-400'
                            }`}
                          >
                            {doc.status === 'VERIFIED'
                              ? 'Terverifikasi'
                              : doc.status === 'UNDER_REVIEW'
                              ? 'Dalam Review'
                              : 'Perlu Revisi'}
                          </span>

                          <button
                            onClick={() => showNotification(`Mengunduh berkas ${doc.name}...`, 'info')}
                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            title="Unduh Salinan Dokumen"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROSES VALIDASI & SLA 14 HARI KERJA */}
          {activeTab === 'sla_timeline' && (
            <div className="space-y-5">
              {/* 14 Working Days Header Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">STATUS SLA EVALUASI KEPATUHAN:</div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Hari ke-{compCase.currentWorkingDay} dari 14 Hari Kerja</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-mono">
                        {daysLeft > 0 ? `Sisa ${daysLeft} Hari Kerja` : 'SLA Tercapai'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Estimasi Tanggal Putusan:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {new Date(compCase.targetResolutionDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar of 14 Working Days */}
                <div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                    <span>Hari 1 (Registrasi)</span>
                    <span>Hari 7 (Tengah Evaluasi)</span>
                    <span>Hari 14 (Keputusan Final)</span>
                  </div>
                </div>

                {/* Day selector fast-forward simulator */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-400">Simulasi Percepat Hari Kerja:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateWorkingDay(1, 'DOC_SUBMISSION')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        compCase.currentWorkingDay === 1
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hari 1
                    </button>
                    <button
                      onClick={() => handleUpdateWorkingDay(3, 'INITIAL_SCREENING')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        compCase.currentWorkingDay === 3
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hari 3
                    </button>
                    <button
                      onClick={() => handleUpdateWorkingDay(7, 'ENHANCED_DUE_DILIGENCE')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        compCase.currentWorkingDay === 7
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hari 7
                    </button>
                    <button
                      onClick={() => handleUpdateWorkingDay(11, 'COMMITTEE_REVIEW')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        compCase.currentWorkingDay === 11
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hari 11
                    </button>
                    <button
                      onClick={() => handleUpdateWorkingDay(14, 'FINAL_APPROVAL')}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        compCase.currentWorkingDay === 14
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hari 14 (Final)
                    </button>
                  </div>
                </div>
              </div>

              {/* 5-Step Workflow Cards */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white">
                  Tahapan Alur Validasi Kepatuhan (Standar FATF & Bank Indonesia):
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {WORKFLOW_STAGES.map((ws, idx) => {
                    const isPassed =
                      (idx === 0 && compCase.currentWorkingDay > 1) ||
                      (idx === 1 && compCase.currentWorkingDay > 4) ||
                      (idx === 2 && compCase.currentWorkingDay > 9) ||
                      (idx === 3 && compCase.currentWorkingDay > 13) ||
                      compCase.approvalStatus === 'APPROVED';

                    const isCurrent = compCase.stage === ws.stage && compCase.approvalStatus !== 'APPROVED';

                    return (
                      <div
                        key={ws.stage}
                        className={`p-3.5 rounded-lg border text-xs transition-colors ${
                          isCurrent
                            ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/30'
                            : isPassed
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                            : 'bg-slate-950/30 border-slate-850 text-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {isPassed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isCurrent ? (
                                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                  {idx + 1}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{ws.title}</span>
                                <span className="font-mono text-[11px] text-slate-400">({ws.dayRange})</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
                                    Sedang Berlangsung
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{ws.desc}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const dayToSet = idx === 0 ? 1 : idx === 1 ? 3 : idx === 2 ? 7 : idx === 3 ? 11 : 14;
                              handleUpdateWorkingDay(dayToSet, ws.stage);
                            }}
                            className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 shrink-0 transition-colors"
                          >
                            Set Tahap Ini
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OTORISASI PERSETUJUAN (APPROVAL) & AUDIT LOG */}
          {activeTab === 'approval_actions' && (
            <div className="space-y-5">
              {/* Officer Decision Box */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Panel Keputusan Otorisasi Petugas Kepatuhan:
                </div>

                <div className="text-xs text-slate-400">
                  Analis Kepatuhan Bertanggung Jawab:{' '}
                  <strong className="text-slate-200">{compCase.assignedOfficer}</strong>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Memo Resmi / Catatan Persetujuan (Compliance Officer Memo):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan justifikasi kepatuhan, nomor referensi regulasi Bank Indonesia, dan rekomendasi rilis dana..."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleApproveTransaction}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui & Rilis Dana (Approval ACCC)
                  </button>

                  {transaction.status === 'ACCC' && (
                    <button
                      onClick={handleRevertToHold}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium border border-amber-800/80 transition-colors"
                    >
                      Simulasi Kembalikan ke HOLD
                    </button>
                  )}
                </div>
              </div>

              {/* Compliance Audit Trail */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Riwayat Audit Jejak Kepatuhan (Compliance Audit Trail):
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                  {compCase.auditLogs.map((log) => (
                    <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-400 font-medium">Oleh: {log.actor}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{log.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Kasus: <strong>{compCase.caseNumber}</strong></span>
            <span>·</span>
            <span>Dokumen: <strong>{compCase.documents.length} berkas</strong></span>
            <span>·</span>
            <span className="text-amber-400">SLA: <strong>{compCase.currentWorkingDay}/14 Hari Kerja</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
