'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TransactionMonitor from '@/components/TransactionMonitor';
import UetrTracker from '@/components/UetrTracker';
import ApiGatewayConsole from '@/components/ApiGatewayConsole';
import TransactionDetailDrawer from '@/components/TransactionDetailDrawer';
import TransferSimulatorModal from '@/components/TransferSimulatorModal';
import ComplianceModal from '@/components/ComplianceModal';
import { INITIAL_TRANSACTIONS } from '@/lib/swift-data';
import { SWIFTTransaction } from '@/types/swift';
import { ShieldCheck, Activity, Globe, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [transactions, setTransactions] = useState<SWIFTTransaction[]>(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'monitor' | 'tracker' | 'api' | 'simulate'>('monitor');
  const [selectedTransaction, setSelectedTransaction] = useState<SWIFTTransaction | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [complianceTransaction, setComplianceTransaction] = useState<SWIFTTransaction | null>(null);
  const [trackerUetr, setTrackerUetr] = useState<string>('094b8680-01f9-4d33-b5a1-0e3b8431643c');
  const [isLivePolling, setIsLivePolling] = useState(true);

  // Real-time simulated live polling effect: advances in-flight transactions realistically
  useEffect(() => {
    if (!isLivePolling) return;

    const interval = setInterval(() => {
      setTransactions((prev) =>
        prev.map((tx) => {
          // If in flight, advance its progress
          if (tx.status === 'INFL') {
            const hasPendingHop = tx.hops.some((h) => h.status === 'IN_PROGRESS' || h.status === 'PENDING');
            if (hasPendingHop) {
              const updatedHops = [...tx.hops];
              const inProgressIdx = updatedHops.findIndex((h) => h.status === 'IN_PROGRESS');
              if (inProgressIdx !== -1) {
                updatedHops[inProgressIdx] = {
                  ...updatedHops[inProgressIdx],
                  status: 'COMPLETED',
                  processedAt: new Date().toISOString()
                };

                // Check next hop
                if (inProgressIdx + 1 < updatedHops.length) {
                  updatedHops[inProgressIdx + 1] = {
                    ...updatedHops[inProgressIdx + 1],
                    status: 'IN_PROGRESS',
                    receivedAt: new Date().toISOString()
                  };
                } else {
                  // All hops complete!
                  return {
                    ...tx,
                    hops: updatedHops,
                    status: 'ACCC',
                    statusDescription: 'Dana Telah Masuk ke Rekening Penerima (Settled / Credited)',
                    completedAt: new Date().toISOString(),
                    slaDuration: '16m 20s'
                  };
                }
              }
              return { ...tx, hops: updatedHops };
            }
          }
          return tx;
        })
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [isLivePolling]);

  // Handle transfer created
  const handleTransferCreated = (newTx: SWIFTTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setTrackerUetr(newTx.uetr);
    setActiveTab('tracker');
  };

  // Navigate to tracker tab from table row
  const handleNavigateToTracker = (uetr: string) => {
    setTrackerUetr(uetr);
    setActiveTab('tracker');
  };

  // Manual refresh
  const handleManualRefresh = () => {
    setTransactions([...transactions]);
  };

  // Compliance Modal Handlers
  const handleOpenCompliance = (tx: SWIFTTransaction) => {
    setComplianceTransaction(tx);
    setIsComplianceModalOpen(true);
  };

  const handleUpdateTransaction = (updatedTx: SWIFTTransaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.uetr === updatedTx.uetr ? updatedTx : t))
    );
    if (selectedTransaction?.uetr === updatedTx.uetr) {
      setSelectedTransaction(updatedTx);
    }
    if (complianceTransaction?.uetr === updatedTx.uetr) {
      setComplianceTransaction(updatedTx);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLivePolling={isLivePolling}
        setIsLivePolling={setIsLivePolling}
        onRefresh={handleManualRefresh}
        onOpenSimulate={() => setIsSimulateModalOpen(true)}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'monitor' && (
          <TransactionMonitor
            transactions={transactions}
            onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            onNavigateToTracker={handleNavigateToTracker}
            onOpenCompliance={handleOpenCompliance}
          />
        )}

        {activeTab === 'tracker' && (
          <UetrTracker
            initialUetr={trackerUetr}
            onOpenCompliance={handleOpenCompliance}
          />
        )}

        {activeTab === 'api' && <ApiGatewayConsole />}

        {activeTab === 'simulate' && (
          <div className="space-y-6">
            {/* List of recent transactions created */}
            <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-sm font-semibold text-white">Transaksi Terdaftar dalam Sesi Ini</div>
              <div className="divide-y divide-slate-800">
                {transactions.slice(0, 4).map((t) => (
                  <div
                    key={t.uetr}
                    onClick={() => handleNavigateToTracker(t.uetr)}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-850 px-2 rounded cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {t.sender.accountName} → {t.receiver.accountName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        UETR: {t.uetr} · Ref: {t.senderReference}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-white">
                        {t.currency} {t.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-blue-400 font-mono">
                        {t.status} ({t.statusDescription.slice(0, 25)}...)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onNavigateToTracker={handleNavigateToTracker}
        onOpenCompliance={handleOpenCompliance}
      />

      <TransferSimulatorModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onTransferCreated={handleTransferCreated}
      />

      <ComplianceModal
        isOpen={isComplianceModalOpen}
        transaction={complianceTransaction || selectedTransaction || transactions[0] || null}
        onClose={() => setIsComplianceModalOpen(false)}
        onUpdateTransaction={handleUpdateTransaction}
      />
    </div>
  );
}
