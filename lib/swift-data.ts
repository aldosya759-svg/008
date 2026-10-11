import { SWIFTTransaction } from '@/types/swift';

export const INITIAL_TRANSACTIONS: SWIFTTransaction[] = [
  {
    uetr: '094b8680-01f9-4d33-b5a1-0e3b8431643c',
    senderReference: 'CITT94785212068',
    transactionCode: 'CITT120368978542',
    endToEndId: 'E2E-CITI-WOORI-20250930',
    amount: 49000000.50,
    currency: 'USD',
    settlementAmount: 49000000.00,
    settlementCurrency: 'USD',
    exchangeRate: 1.0,
    chargeBearer: 'BEN',
    totalDeductions: 0.50,
    status: 'HOLD',
    statusDescription: 'Tertahan Pemeriksaan Kepatuhan & Sanksi (HOLD / Sanctions Screening)',
    gatewayResponseRef: '10073CITIBD33XXX64587MMNY6',
    messageOutputRef: '302952105930JVMRIDJAXXX74858XAN3',
    bankCode: '021000089',
    sortCodeAba: '254070116',
    bankTelephone: '021-3985099',
    mobilePhone: '081212148887-089622888888',
    senderAddress: '1010 POS 22201, N GLEBE ROAD, ARLINGTON, VIRGINIA, USA',
    receiverAddress: 'KANTOR PUSAT. TREASURY TOWER LT. 26 & 27 SCBD, JL. JEND.SUDIRMAN NO. 52-53, JAKARTA',
    field72: 'PLEASE ADVICE THE BENEFICIARY OF THIS SWIFT TRANSFER IT IS VALID FOR PAYMENT UPON IDENTIFICATION ON THE DAY OF RECEIPT. THIS IRREVOCABLE SWIFT T/T CASH TRANSFER CAN BE RELIED UPON FOR FULL CASH. FUNDS ARE GOOD, CLEAN, AND CLEAR FUNDS OF NON-CRIMINAL ORIGIN',
    sender: {
      bankName: 'CITIBANK N.A.',
      bic: 'CITIUS33XXX',
      country: 'United States',
      countryCode: 'US',
      accountName: 'ARMOSH WILLIAMS PLLC',
      accountNumber: '009251027188'
    },
    receiver: {
      bankName: 'BANK WOORI SAUDARA',
      bic: 'HVBKIDJAXXX',
      country: 'Indonesia',
      countryCode: 'ID',
      accountName: 'PT MULIA GLOBAL FINANCE',
      accountNumber: '20091379265',
      iban: 'ID29HVBK20091379265'
    },
    hops: [
      {
        id: 'hop-citi-1',
        bic: 'CITIUS33XXX',
        bankName: 'CITIBANK N.A. (Arlington, Virginia)',
        city: 'Arlington',
        country: 'United States',
        countryCode: 'US',
        role: 'Ordering',
        status: 'COMPLETED',
        receivedAt: '2025-09-30T10:07:33Z',
        processedAt: '2025-09-30T10:07:33Z',
        deductedFee: 0.00,
        feeCurrency: 'USD',
        statusReasonCode: 'G000',
        statusReasonDesc: 'Original Sent to SWIFT Network (ACK-945587-2025-30)',
        lat: 38.8816,
        lng: -77.1100
      },
      {
        id: 'hop-citi-2',
        bic: 'CITIUS33',
        bankName: 'CITIBANK N.A. New York / SWIFT Gateway',
        city: 'New York',
        country: 'United States',
        countryCode: 'US',
        role: 'Correspondent',
        status: 'COMPLETED',
        receivedAt: '2025-09-30T10:07:33Z',
        processedAt: '2025-09-30T10:35:10Z',
        deductedFee: 0.50,
        feeCurrency: 'USD',
        statusReasonCode: 'G002',
        statusReasonDesc: 'Gateway Response: 10073CITIBD33XXX64587MMNY6',
        lat: 40.7128,
        lng: -74.0060
      },
      {
        id: 'hop-citi-3',
        bic: 'HVBKIDJAXXX',
        bankName: 'BANK WOORI SAUDARA (Treasury Tower SCBD Jakarta)',
        city: 'Jakarta',
        country: 'Indonesia',
        countryCode: 'ID',
        role: 'Beneficiary',
        status: 'HELD',
        receivedAt: '2025-09-30T10:59:01Z',
        deductedFee: 0.00,
        feeCurrency: 'USD',
        statusReasonCode: 'G003',
        statusReasonDesc: 'Payment held under compliance/sanctions screening (OFAC / Sanctions Check)',
        notes: 'Transaksi tertahan sementara untuk verifikasi dokumen kepatuhan (Enhanced Due Diligence). Menunggu konfirmasi kepatuhan.',
        lat: -6.2255,
        lng: 106.8080
      }
    ],
    messageType: 'MT103',
    rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>CITT94785212068</MsgId>
      <CreDtTm>2025-09-30T10:07:33Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-CITI-WOORI-20250930</EndToEndId>
        <UETR>094b8680-01f9-4d33-b5a1-0e3b8431643c</UETR>
        <TxId>CITT120368978542</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">49000000.00</IntrBkSttlmAmt>
      <ChrgBr>BEN</ChrgBr>
      <Dbtr>
        <Nm>ARMOSH WILLIAMS PLLC</Nm>
        <PstlAdr><AdrLine>1010 POS 22201, N GLEBE ROAD, ARLINGTON, VIRGINIA, USA</AdrLine></PstlAdr>
      </Dbtr>
      <DbtrAcct><Id><Othr><Id>009251027188</Id></Othr></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>CITIUS33XXX</BICFI><Nm>CITIBANK N.A.</Nm></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>HVBKIDJAXXX</BICFI><Nm>BANK WOORI SAUDARA</Nm></FinInstnId></CdtrAgt>
      <Cdtr>
        <Nm>PT MULIA GLOBAL FINANCE</Nm>
        <PstlAdr><AdrLine>KANTOR PUSAT. TREASURY TOWER LT. 26 &amp; 27 SCBD, JL. JEND.SUDIRMAN NO. 52-53</AdrLine></PstlAdr>
      </Cdtr>
      <CdtrAcct><Id><Othr><Id>20091379265</Id></Othr></Id></CdtrAcct>
      <RmtInf><Ustrd>INVESTMENT IN COMMODITY TRADING AND ENERGY INFRASTRUCTURE DEVELOPMENT</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
    rawSwiftAck: `citibank

INTERNATIONAL SWIFT ACK-945587-2025-30
IDENTIFIER: - 1 MESSAGE PRINTED++30 SEPTEMBER 2025 10:07:33
NOTIFICATION TRANSMISSION NETWORK: SWIFT
SESSION HOLDER : CITIUS33XXX
DELIVERY STATUS : NETWORK ACK
PRIORITY DELIVERY : URGENT
TYPE : 103-T/T CASH TRANSFER CUSTOMER'S COPY

NOTIFICATION (TRANSMISSION OF ORIGINAL SENT TO SWIFT (ACK)
NETWORK DELIVERY STATUS : NETWORK ACK
PRIORITY/DELIVERY : URGENT
GATEWAY RESPONSE REFERENCE: : 10073CITIBD33XXX64587MMNY6
MESSAGE OUTPUT REFERENCE: 302952105930JVMRIDJAXXX74858XAN3
TRANSACTION CODE : CITT12036897854P
UETR : 094b8680-01f9-4d33-b5a1-0e3b8431643c
------------------------------MESSAGE DETAILS-----------------------------------
SENDER
BANK NAME : CITIBANK N.A.
BANK ADDRESS : 1010 POS 22201, N GLEBE ROAD, ARLINGTON, VIRGINIA, USA
ACCOUNT NAME : ARMOSH WILLIAMS PLLC
ACCOUNT NUMBER : 009251027188 INTERNATIONAL
BANK CODE : 021000089
SORT CODE ABA NO : 254070116
SWIFT CODE : CITIUS33XXX

RECEIVER
BANK NAME : BANK WOORI SOUDARA
BANK ADDRESS : KANTOR PUSAT. TREASURY TOWER LT. 26 & 27 SCBD, JL. JEND.SUDIRMAN NO. 52-53
ACCOUNT NAME : PT MULIA GLOBAL FINANCE
ACCOUNT NUMBER (USD) : 20091379265
BANK CODE :
SWIFT CODE : HVBKIDJAXXX
BANK TELEPHONE : 021-3985099
MOBILE FONE : 081212148887-089622888888
AMOUNT : $49,000,000.50
--------------------------------MESSAGE TEXT----------------------------------
20: SENDER'S REFERENCE
CITT94785212068
21: TRANSACTION CODE
CITT120368978542
23B: BANK OPERATION CODE
CRED
32A: VALUE DATE/CURRENCY/INTERBANK SETTLED AMOUNT
DATE : 30 September 2025
CURRENCY : USD (DOLLARS)
AMOUNT : $49,000,000.00
33B: CURRENCY/INSTRUCTED AMOUNT
CURRENCY : USD (DOLLARS)
AMOUNT : $49,000,000.00
50K: ORDERING CUSTOMER-NAME & ADDRESS
009251027188
ARMOSH WILLIAMS PLLC
57D: Account with Institution - FI BIC
HVBKIDJAXXX
BANK WOORI SOUDARA
KANTOR PUSAT. TREASURY TOWER LT. 26 & 27 SCBD, JL. JEND.SUDIRMAN NO. 52-53
59: Beneficiary Customer-Name & Address
20091379265
PT MULIA GLOBAL FINANCE
70: REMITTANCE INFORMATION:
INVESTMENT IN COMMODITY TRADING AND ENERGY INFRASTRUCTURE DEVELOPMENT
71A: DETAILS OF CHARGES:
BEN
71F: SENDER'S CHARGES:
OURS
71A: DETAILS OF CHARGES:
BEN
72: PLEASE ADVICE THE BENEFICIARY OF THIS SWIFT TRANSFER IT IS VALID FOR PAYMENT UPON IDENTIFICATION
ON THE DAY OF RECEIPT. THIS IRREVOCABLE SWIFT T/T CASH TRANSFER CAN BE RELIED UPON FOR FULL
CASH. FUNDS ARE GOOD, CLEAN, AND CLEAR FUNDS OF NON-CRIMINAL ORIGIN
--------------------------------MESSAGE TRAILER--------------------------------
(CHK : CIT12054878E)
PKI SIGNATURE : MAC-EQUIVALENT
TRACKING CODE : CIT1524785

--------------------------------INTERVENTIONS---------------------------------
CATEGORY : NETWORK REPORT
CREATION TIME : 30/09/2025 10:07:33
APPLICATION : SWIFT INTERFACE
OPERATOR : SYSTEM
TEXT VALIDATION : VALID
TEXT VALUE DATE: 30/09/2025
END OF MESSAGE


citibank

++DATE: 30/09/2025 - 10:59:01 ++GMT+++REPRINT FROM LOCAL SWIFT ACK++9635201547-765+++ ANSWER
BACK AND ACKNOWLEDGMENT MESSAGE AUTOMATED FILE TRANSFER (AFT)
ACKNOWLEDGMENT OF THE FILE PROCESSING - FILE APPLICATION GENERATED
REPORT ACKNOWLEDGMENT & AUTHENTICATION ACK DELIVERY
FTA/FTI CONFIRMATION STATEMENT PASS/FAIL STATUS
0050 CNT,--------------------------------------VALID
0060 NTT-DTM,----------------------------------VALID
0070 RFF,--------------------------------------VALID
0080 DTM,--------------------------------------VALID
0090 MAD-CTA-COM-------------------------------VALID
0100 AAD,--------------------------------------VALID
0110 CTA,--------------------------------------VALID
0120 COM,--------------------------------------VALID
0130 ERC-FTX-SG4,------------------------------VALID
0140 ERC,--------------------------------------VALID
0150 QTY,--------------------------------------VALID
0160 RFF-FTX,----------------------------------VALID
0170 REF,--------------------------------------VALID
0180 FTX,--------------------------------------VALID
0190 DTM,--------------------------------------VALID
----------{XMT DELIVERY REPORT}----------
MESSAGE TYPE : 103-T/T CASH TRANSFER
PRIORITY : URGENT
STATUS : 100% DELIVERED
SIZE : 0205
COPIES : 2
LICENSE : MPL
PKI SIGNATURE : MAC-EQUIVALENT
RECEIVED : HVBKIDJAXXX
INPUT OUTPUT ACK MAG DUP AUTH
TIME : 10:59 GMT
DATE : 30/09/2025
**********CONFIRMED & RECEIVED**********
(+) END OF TRANSMISSION`,
    initiatedAt: '2025-09-30T10:07:33Z',
    completedAt: '2025-09-30T10:59:01Z',
    estimatedSettlement: '2025-09-30T11:00:00Z',
    slaDuration: '51m 28s',
    slaBreached: false,
    complianceStatus: 'PASSED',
    riskScore: 'LOW',
    purposeCode: 'COMM',
    remittanceInfo: 'INVESTMENT IN COMMODITY TRADING AND ENERGY INFRASTRUCTURE DEVELOPMENT',
    complianceCase: {
      caseNumber: 'EDD-2025-WOORI-094B',
      ticketId: 'TCK-AML-94821',
      assignedOfficer: 'Farhan Ardiansyah, CAMS (Divisi AML & Kepatuhan Bank Woori Saudara)',
      initiatedDate: '2025-09-30T10:07:33Z',
      targetWorkingDays: 14,
      currentWorkingDay: 3,
      targetResolutionDate: '2025-10-20T17:00:00Z',
      stage: 'INITIAL_SCREENING',
      approvalStatus: 'UNDER_EVALUATION',
      documents: [
        {
          id: 'doc-1',
          name: 'Commercial_Sales_Agreement_Ref_CITT9478.pdf',
          size: 4820000,
          uploadedAt: '2025-09-30T11:20:00Z',
          category: 'CONTRACT',
          categoryLabel: 'Perjanjian Komersial / Kontrak Dagang',
          status: 'VERIFIED',
          fileType: 'application/pdf',
          notes: 'Telah diverifikasi stempel basah & tanda tangan notaris internasional.'
        },
        {
          id: 'doc-2',
          name: 'Declaration_Clean_Funds_Non_Criminal_SoF.pdf',
          size: 1250000,
          uploadedAt: '2025-09-30T11:35:00Z',
          category: 'SOURCE_OF_FUNDS',
          categoryLabel: 'Surat Pernyataan Asal Usul Dana Bersih',
          status: 'VERIFIED',
          fileType: 'application/pdf',
          notes: 'Konfirmasi non-criminal origin sesuai Field 72 MT103 Citibank.'
        },
        {
          id: 'doc-3',
          name: 'Commercial_Invoice_INV-2025-WOORI-904.pdf',
          size: 2180000,
          uploadedAt: '2025-10-01T08:15:00Z',
          category: 'INVOICE',
          categoryLabel: 'Faktur Komersial & Tagihan',
          status: 'UNDER_REVIEW',
          fileType: 'application/pdf',
          notes: 'Sedang dicocokkan dengan manifes pengiriman infrastruktur energi.'
        },
        {
          id: 'doc-4',
          name: 'NIB_NPWP_PT_Mulia_Global_Finance.pdf',
          size: 890000,
          uploadedAt: '2025-09-30T11:40:00Z',
          category: 'LEGALITY',
          categoryLabel: 'Legalitas Badan Usaha Penerima',
          status: 'VERIFIED',
          fileType: 'application/pdf',
          notes: 'Status AHU Kemenkumham & Ditjen Pajak aktif.'
        }
      ],
      auditLogs: [
        {
          id: 'log-1',
          timestamp: '2025-09-30T10:07:33Z',
          actor: 'Sistem SWIFT gpi Gateway',
          action: 'Pemeriksaan Kepatuhan Otomatis (HOLD)',
          notes: 'Nilai transfer melampaui ambang batas $10,000,000 USD. Kasus diarahkan ke alur Enhanced Due Diligence (EDD) dengan SLA 14 hari kerja.'
        },
        {
          id: 'log-2',
          timestamp: '2025-09-30T11:45:00Z',
          actor: 'Portal Nasabah PT Mulia Global Finance',
          action: 'Unggah Berkas Persyaratan',
          notes: 'Nasabah mengunggah Kontrak Dagang, Surat Asal Usul Dana, dan Dokumen Legalitas NIB.'
        },
        {
          id: 'log-3',
          timestamp: '2025-10-01T09:00:00Z',
          actor: 'Farhan Ardiansyah, CAMS',
          action: 'Pemeriksaan Tahap Awal (Hari ke-3 / 14 Hari Kerja)',
          notes: '3 dokumen diverifikasi valid. Menunggu konfirmasi verifikasi faktur komersial sebelum diserahkan ke Komite Kepatuhan.'
        }
      ]
    }
  }
];

export const POPULAR_BANKS = [
  { bic: 'HVBKIDJAXXX', name: 'Bank Woori Saudara Indonesia Tbk', country: 'Indonesia', city: 'Jakarta' },
  { bic: 'CITIUS33XXX', name: 'Citibank N.A. (Arlington / USA)', country: 'United States', city: 'Arlington' },
  { bic: 'BMRIIDJA', name: 'PT Bank Mandiri (Persero) Tbk', country: 'Indonesia', city: 'Jakarta' },
  { bic: 'CENAIDJA', name: 'PT Bank Central Asia Tbk (BCA)', country: 'Indonesia', city: 'Jakarta' },
  { bic: 'BRINIDJA', name: 'PT Bank Rakyat Indonesia Tbk (BRI)', country: 'Indonesia', city: 'Jakarta' },
  { bic: 'BNINIDJA', name: 'PT Bank Negara Indonesia Tbk (BNI)', country: 'Indonesia', city: 'Jakarta' },
  { bic: 'CHASUS33', name: 'JPMorgan Chase Bank N.A.', country: 'United States', city: 'New York' },
  { bic: 'CITIUS33', name: 'Citibank N.A. New York', country: 'United States', city: 'New York' },
  { bic: 'DEUTDEDB', name: 'Deutsche Bank AG', country: 'Germany', city: 'Frankfurt' },
  { bic: 'DBSSSGSG', name: 'DBS Bank Ltd', country: 'Singapore', city: 'Singapore' },
  { bic: 'HSBCGB2L', name: 'HSBC Bank PLC', country: 'United Kingdom', city: 'London' },
  { bic: 'BARCGB22', name: 'Barclays Bank UK PLC', country: 'United Kingdom', city: 'London' },
  { bic: 'SCBLSG22', name: 'Standard Chartered Bank', country: 'Singapore', city: 'Singapore' }
];
