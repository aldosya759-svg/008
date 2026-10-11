'use client';

import React, { useState } from 'react';
import { SWIFTTransaction } from '@/types/swift';
import { POPULAR_BANKS } from '@/lib/swift-data';
import { X, Send, Building2, Check, ArrowRight, Loader2 } from 'lucide-react';

interface TransferSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated: (newTx: SWIFTTransaction) => void;
}

export default function TransferSimulatorModal({
  isOpen,
  onClose,
  onTransferCreated
}: TransferSimulatorModalProps) {
  const [senderName, setSenderName] = useState('PT Pertamina International Shipping');
  const [senderBic, setSenderBic] = useState('BMRIIDJA');
  const [receiverName, setReceiverName] = useState('Siemens Energy Global GmbH');
  const [receiverBic, setReceiverBic] = useState('DEUTDEDB');
  const [receiverIban, setReceiverIban] = useState('DE89370400440532013000');
  const [amount, setAmount] = useState('350000');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'SGD' | 'GBP'>('EUR');
  const [chargeBearer, setChargeBearer] = useState<'OUR' | 'SHA' | 'BEN'>('SHA');
  const [routingMode, setRoutingMode] = useState<'direct' | 'multihop'>('multihop');
  const [remittanceInfo, setRemittanceInfo] = useState('Gas turbine spare components delivery #INV-DE-2026-991');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/swift/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderBic,
          receiverName,
          receiverBic,
          receiverIban,
          amount: parseFloat(amount) || 100000,
          currency,
          chargeBearer,
          routingMode,
          remittanceInfo
        })
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        onTransferCreated(data.transaction);
        onClose();
      }
    } catch (err) {
      console.error('Failed to initiate transfer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Inisiasi Transfer Baru SWIFT gpi (ISO 20022 pacs.008)
              </div>
              <div className="text-xs text-slate-400">
                Penerbitan UETR Otomatis & Alokasi Jaringan Koresponden
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Nominal Transfer Pokok:</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Valuta (Currency):</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          {/* Sender Institution */}
          <div className="space-y-2 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Institusi Pengirim (Ordering Customer):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Nama Rekening Pengirim:</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Bank Pengirim (BIC):</label>
                <select
                  value={senderBic}
                  onChange={(e) => setSenderBic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="BMRIIDJA">BMRIIDJA - Bank Mandiri Jakarta</option>
                  <option value="CENAIDJA">CENAIDJA - BCA Jakarta</option>
                  <option value="BRINIDJA">BRINIDJA - BRI Jakarta</option>
                  <option value="BNINIDJA">BNINIDJA - BNI Jakarta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receiver Institution */}
          <div className="space-y-2 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Institusi Penerima (Creditor Beneficiary):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Nama Penerima:</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Bank Tujuan (BIC):</label>
                <select
                  value={receiverBic}
                  onChange={(e) => setReceiverBic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="DEUTDEDB">DEUTDEDB - Deutsche Bank Frankfurt</option>
                  <option value="CHASUS33">CHASUS33 - JPMorgan Chase New York</option>
                  <option value="CITIUS33">CITIUS33 - Citibank N.A. New York</option>
                  <option value="DBSSSGSG">DBSSSGSG - DBS Bank Singapore</option>
                  <option value="HSBCGB2L">HSBCGB2L - HSBC London</option>
                  <option value="BARCGB22">BARCGB22 - Barclays Bank UK</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400">Nomor Rekening / IBAN Tujuan:</label>
                <input
                  type="text"
                  required
                  value={receiverIban}
                  onChange={(e) => setReceiverIban(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Charges & Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Beban Biaya (Charge Bearer):</label>
              <select
                value={chargeBearer}
                onChange={(e) => setChargeBearer(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="SHA">SHA - Shared (Biaya Dibagi)</option>
                <option value="OUR">OUR - All Charges by Sender (Ditanggung Pengirim)</option>
                <option value="BEN">BEN - All Charges by Beneficiary (Dipotong Penerima)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Pola Routing Jaringan:</label>
              <select
                value={routingMode}
                onChange={(e) => setRoutingMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="multihop">Multi-Hop Intermediary (Standar Koresponden)</option>
                <option value="direct">Direct RMA Connection (Bilateral Langsung)</option>
              </select>
            </div>
          </div>

          {/* Remittance Information */}
          <div className="space-y-1 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-slate-300 font-semibold">Informasi Remittance (RmtInf / Purpose):</label>
            <input
              type="text"
              value={remittanceInfo}
              onChange={(e) => setRemittanceInfo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim ke Gerbang SWIFT...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Inisiasi Transfer pacs.008
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
