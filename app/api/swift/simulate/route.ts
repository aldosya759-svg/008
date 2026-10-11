import { NextRequest, NextResponse } from 'next/server';
import { SWIFTTransaction, IntermediaryHop } from '@/types/swift';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      senderName,
      senderBic,
      receiverName,
      receiverBic,
      receiverIban,
      chargeBearer,
      remittanceInfo,
      routingMode
    } = body;

    const uetr = crypto.randomUUID();
    const senderRef = `TRF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const endToEndId = `E2E-${Math.floor(100000 + Math.random() * 900000)}`;

    const numAmount = parseFloat(amount) || 100000;
    const deductions = chargeBearer === 'OUR' ? 0 : 35;
    const settlementAmt = Math.max(0, numAmount - deductions);

    const now = new Date().toISOString();

    const hops: IntermediaryHop[] = [
      {
        id: 'hop-1',
        bic: senderBic || 'BMRIIDJA',
        bankName: getBankNameByBic(senderBic || 'BMRIIDJA'),
        city: 'Jakarta',
        country: 'Indonesia',
        countryCode: 'ID',
        role: 'Ordering',
        status: 'COMPLETED',
        receivedAt: now,
        processedAt: now,
        deductedFee: chargeBearer === 'OUR' ? 0 : 15,
        feeCurrency: currency || 'USD',
        statusReasonCode: 'G000',
        statusReasonDesc: 'Payment initiated & dispatched to SWIFT Network'
      },
      {
        id: 'hop-2',
        bic: routingMode === 'direct' ? (receiverBic || 'CHASUS33') : 'SCBLSG22',
        bankName: routingMode === 'direct' ? getBankNameByBic(receiverBic || 'CHASUS33') : 'Standard Chartered Bank Singapore (Clearing Hub)',
        city: routingMode === 'direct' ? 'New York' : 'Singapore',
        country: routingMode === 'direct' ? 'United States' : 'Singapore',
        countryCode: routingMode === 'direct' ? 'US' : 'SG',
        role: routingMode === 'direct' ? 'Beneficiary' : 'Correspondent',
        status: 'IN_PROGRESS',
        receivedAt: now,
        deductedFee: chargeBearer === 'OUR' ? 0 : 20,
        feeCurrency: currency || 'USD',
        statusReasonCode: 'G002',
        statusReasonDesc: 'Validating clearing liquidity & gpi Tracker registration'
      }
    ];

    if (routingMode !== 'direct') {
      hops.push({
        id: 'hop-3',
        bic: receiverBic || 'CHASUS33',
        bankName: getBankNameByBic(receiverBic || 'CHASUS33'),
        city: 'Destination Center',
        country: 'Beneficiary Country',
        countryCode: 'US',
        role: 'Beneficiary',
        status: 'PENDING',
        receivedAt: 'Pending',
        deductedFee: 0,
        feeCurrency: currency || 'USD',
        statusReasonCode: 'PEND',
        statusReasonDesc: 'Awaiting incoming settlement batch'
      });
    }

    const newTx: SWIFTTransaction = {
      uetr,
      senderReference: senderRef,
      endToEndId,
      amount: numAmount,
      currency: currency || 'USD',
      settlementAmount: settlementAmt,
      settlementCurrency: currency || 'USD',
      exchangeRate: 1.0,
      chargeBearer: chargeBearer || 'SHA',
      totalDeductions: deductions,
      status: 'INFL',
      statusDescription: 'Dalam Transit Bank Koresponden (In Flight)',
      sender: {
        bankName: getBankNameByBic(senderBic || 'BMRIIDJA'),
        bic: senderBic || 'BMRIIDJA',
        country: 'Indonesia',
        countryCode: 'ID',
        accountName: senderName || 'PT Korporat Indonesia Tbk',
        accountNumber: '109-00-881920-1'
      },
      receiver: {
        bankName: getBankNameByBic(receiverBic || 'CHASUS33'),
        bic: receiverBic || 'CHASUS33',
        country: 'Global Destination',
        countryCode: 'US',
        accountName: receiverName || 'International Partner Corp',
        accountNumber: receiverIban || 'US89CHAS1029384756',
        iban: receiverIban || 'US89CHAS1029384756'
      },
      hops,
      messageType: 'pacs.008.001.10',
      rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${senderRef}</MsgId>
      <CreDtTm>${now}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${endToEndId}</EndToEndId>
        <UETR>${uetr}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${currency || 'USD'}">${numAmount.toFixed(2)}</IntrBkSttlmAmt>
      <ChrgBr>${chargeBearer || 'SHA'}</ChrgBr>
      <Dbtr><Nm>${senderName || 'PT Korporat Indonesia Tbk'}</Nm></Dbtr>
      <Cdtr><Nm>${receiverName || 'International Partner Corp'}</Nm></Cdtr>
      <RmtInf><Ustrd>${remittanceInfo || 'Trade settlement'}</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
      initiatedAt: now,
      estimatedSettlement: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      slaDuration: 'Baru diinisiasi (< 1m)',
      slaBreached: false,
      complianceStatus: 'PASSED',
      riskScore: 'LOW',
      purposeCode: 'COMM',
      remittanceInfo: remittanceInfo || 'Trade invoice settlement'
    };

    return NextResponse.json({
      success: true,
      message: 'Transfer SWIFT gpi pacs.008 berhasil diinisiasi ke gerbang SWIFT.',
      transaction: newTx
    });
  } catch (error) {
    console.error('Simulate error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses inisiasi transfer.' },
      { status: 500 }
    );
  }
}

function getBankNameByBic(bic: string): string {
  const map: Record<string, string> = {
    BMRIIDJA: 'PT Bank Mandiri (Persero) Tbk',
    CENAIDJA: 'PT Bank Central Asia Tbk',
    BRINIDJA: 'PT Bank Rakyat Indonesia Tbk',
    BNINIDJA: 'PT Bank Negara Indonesia Tbk',
    CHASUS33: 'JPMorgan Chase Bank, N.A.',
    CITIUS33: 'Citibank N.A. New York',
    DEUTDEDB: 'Deutsche Bank AG Frankfurt',
    DBSSSGSG: 'DBS Bank Ltd Singapore',
    HSBCGB2L: 'HSBC Bank PLC London',
    BARCGB22: 'Barclays Bank UK PLC',
    SCBLSG22: 'Standard Chartered Bank Singapore'
  };
  return map[bic] || `${bic} Financial Institution`;
}
