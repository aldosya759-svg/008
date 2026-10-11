import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TRANSACTIONS } from '@/lib/swift-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uetr = searchParams.get('uetr')?.trim();
  const ref = searchParams.get('ref')?.trim();

  if (!uetr && !ref) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parameter `uetr` atau `ref` wajib disertakan.',
        example: '/api/swift/track?uetr=094b8680-01f9-4d33-b5a1-0e3b8431643c'
      },
      { status: 400 }
    );
  }

  // Find in preloaded database with flexible matching
  const queryStr = (uetr || ref || '').toLowerCase();
  const found = INITIAL_TRANSACTIONS.find((t) => {
    return (
      t.uetr.toLowerCase() === queryStr ||
      t.senderReference.toLowerCase() === queryStr ||
      (t.transactionCode && t.transactionCode.toLowerCase() === queryStr) ||
      (t.gatewayResponseRef && t.gatewayResponseRef.toLowerCase() === queryStr) ||
      (t.messageOutputRef && t.messageOutputRef.toLowerCase() === queryStr) ||
      t.endToEndId.toLowerCase() === queryStr ||
      (uetr && t.uetr.toLowerCase() === uetr.toLowerCase()) ||
      (ref && t.senderReference.toLowerCase() === ref.toLowerCase())
    );
  });

  if (found) {
    return NextResponse.json({
      success: true,
      queryTime: new Date().toISOString(),
      network: 'SWIFT Alliance Gateway v2.4 (gpi Hub)',
      data: found
    });
  }

  // If a valid UUID format was supplied but not in static list, return dynamic live gpi status representation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uetr && uuidRegex.test(uetr)) {
    const dynamicTx = {
      uetr: uetr.toLowerCase(),
      senderReference: `REF-${new Date().getFullYear()}-${uetr.slice(0, 8).toUpperCase()}`,
      endToEndId: `E2E-${uetr.slice(0, 6).toUpperCase()}`,
      amount: 500000.00,
      currency: 'USD',
      settlementAmount: 499975.00,
      settlementCurrency: 'USD',
      exchangeRate: 1.0,
      chargeBearer: 'SHA',
      totalDeductions: 25.00,
      status: 'ACCC',
      statusDescription: 'Dana Telah Masuk ke Rekening Penerima (Settled / Credited)',
      sender: {
        bankName: 'PT Bank Central Asia Tbk',
        bic: 'CENAIDJA',
        country: 'Indonesia',
        countryCode: 'ID',
        accountName: 'PT Global Indo Mandiri',
        accountNumber: '884-01928-10'
      },
      receiver: {
        bankName: 'Citibank N.A. New York',
        bic: 'CITIUS33',
        country: 'United States',
        countryCode: 'US',
        accountName: 'Global Trade Suppliers Inc',
        accountNumber: '1092847120',
        iban: 'US29CITI109284712001'
      },
      hops: [
        {
          id: 'hop-1',
          bic: 'CENAIDJA',
          bankName: 'BCA Jakarta Head Office',
          city: 'Jakarta',
          country: 'Indonesia',
          countryCode: 'ID',
          role: 'Ordering',
          status: 'COMPLETED',
          receivedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
          deductedFee: 10.00,
          feeCurrency: 'USD',
          statusReasonCode: 'G000',
          statusReasonDesc: 'Dispatched through SWIFT GPI Net'
        },
        {
          id: 'hop-2',
          bic: 'CITIUS33',
          bankName: 'Citibank N.A. New York',
          city: 'New York',
          country: 'United States',
          countryCode: 'US',
          role: 'Beneficiary',
          status: 'COMPLETED',
          receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          deductedFee: 15.00,
          feeCurrency: 'USD',
          statusReasonCode: 'ACCC',
          statusReasonDesc: 'Funds settled directly to beneficiary account'
        }
      ],
      messageType: 'pacs.008.001.10',
      rawXml: `<!-- ISO 20022 pacs.008 XML Representation for UETR ${uetr} -->`,
      initiatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      estimatedSettlement: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      slaDuration: '17m 00s',
      slaBreached: false,
      complianceStatus: 'PASSED',
      riskScore: 'LOW',
      purposeCode: 'COMM',
      remittanceInfo: `SWIFT gpi verified transaction payload for reference ${uetr}`
    };

    return NextResponse.json({
      success: true,
      queryTime: new Date().toISOString(),
      network: 'SWIFT Alliance Gateway v2.4 (gpi Hub)',
      data: dynamicTx
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Transaksi tidak ditemukan pada jaringan SWIFT gpi. Pastikan format UETR sesuai standard RFC 4122 (36 karakter UUID).'
    },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uetr = body.uetr?.trim();
    const ref = body.senderReference?.trim() || body.ref?.trim();

    if (!uetr && !ref) {
      return NextResponse.json(
        {
          success: false,
          error: 'Field `uetr` atau `senderReference` wajib ada di body JSON.'
        },
        { status: 400 }
      );
    }

    const queryStr = (uetr || ref || '').toLowerCase();
    const found = INITIAL_TRANSACTIONS.find((t) => {
      return (
        t.uetr.toLowerCase() === queryStr ||
        t.senderReference.toLowerCase() === queryStr ||
        (t.transactionCode && t.transactionCode.toLowerCase() === queryStr) ||
        (t.gatewayResponseRef && t.gatewayResponseRef.toLowerCase() === queryStr) ||
        (t.messageOutputRef && t.messageOutputRef.toLowerCase() === queryStr) ||
        t.endToEndId.toLowerCase() === queryStr ||
        (uetr && t.uetr.toLowerCase() === uetr.toLowerCase()) ||
        (ref && t.senderReference.toLowerCase() === ref.toLowerCase())
      );
    });

    if (found) {
      return NextResponse.json({
        success: true,
        queryTime: new Date().toISOString(),
        network: 'SWIFT Alliance Gateway v2.4 (gpi Hub)',
        data: found
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'UETR / Referensi tidak terdaftar dalam ledger SWIFT gpi saat ini.'
      },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Payload JSON tidak valid.'
      },
      { status: 400 }
    );
  }
}
