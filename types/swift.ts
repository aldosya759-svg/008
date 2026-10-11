export type SWIFTStatusCode = 'ACCC' | 'ACSP' | 'INFL' | 'RJCT' | 'HOLD';

export interface IntermediaryHop {
  id: string;
  bic: string;
  bankName: string;
  city: string;
  country: string;
  countryCode: string;
  role: 'Ordering' | 'Correspondent' | 'Clearing System' | 'Beneficiary';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED' | 'HELD';
  receivedAt: string;
  processedAt?: string;
  deductedFee: number;
  feeCurrency: string;
  statusReasonCode?: string; // e.g. G000, G001, G002, G003, G004, MS03, LE01
  statusReasonDesc?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface SWIFTTransaction {
  uetr: string; // Unique End-to-End Transaction Reference (UUID)
  senderReference: string; // e.g. REF-20261001-BM01
  endToEndId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'SGD' | 'IDR' | 'GBP' | 'JPY' | 'AUD';
  settlementAmount: number;
  settlementCurrency: string;
  exchangeRate: number;
  chargeBearer: 'OUR' | 'SHA' | 'BEN';
  totalDeductions: number;
  status: SWIFTStatusCode;
  statusDescription: string;
  sender: {
    bankName: string;
    bic: string;
    country: string;
    countryCode: string;
    accountName: string;
    accountNumber: string;
  };
  receiver: {
    bankName: string;
    bic: string;
    country: string;
    countryCode: string;
    accountName: string;
    accountNumber: string;
    iban?: string;
  };
  hops: IntermediaryHop[];
  messageType: 'pacs.008.001.10' | 'pacs.002.001.12' | 'MT103';
  rawXml: string;
  initiatedAt: string;
  completedAt?: string;
  estimatedSettlement: string;
  slaDuration: string;
  slaBreached: boolean;
  complianceStatus: 'PASSED' | 'FLAGGED_PEP' | 'SANCTION_CLEAR' | 'UNDER_REVIEW';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  purposeCode: string;
  remittanceInfo: string;
  rawSwiftAck?: string;
  gatewayResponseRef?: string;
  messageOutputRef?: string;
  transactionCode?: string;
  bankCode?: string;
  sortCodeAba?: string;
  bankTelephone?: string;
  mobilePhone?: string;
  field72?: string;
  senderAddress?: string;
  receiverAddress?: string;
  complianceCase?: ComplianceCase;
}

export type ComplianceDocCategory =
  | 'CONTRACT'
  | 'INVOICE'
  | 'SOURCE_OF_FUNDS'
  | 'LEGALITY'
  | 'SANCTIONS_DECLARATION'
  | 'OTHER';

export interface ComplianceDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  category: ComplianceDocCategory;
  categoryLabel: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'REQUIRES_REVISION';
  fileType: string;
  notes?: string;
}

export type ComplianceWorkflowStage =
  | 'DOC_SUBMISSION'
  | 'INITIAL_SCREENING'
  | 'ENHANCED_DUE_DILIGENCE'
  | 'COMMITTEE_REVIEW'
  | 'FINAL_APPROVAL';

export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes: string;
}

export interface ComplianceCase {
  caseNumber: string;
  ticketId: string;
  assignedOfficer: string;
  initiatedDate: string;
  targetWorkingDays: number;
  currentWorkingDay: number;
  targetResolutionDate: string;
  stage: ComplianceWorkflowStage;
  approvalStatus: 'PENDING_DOCUMENTS' | 'UNDER_EVALUATION' | 'APPROVED' | 'REJECTED';
  documents: ComplianceDocument[];
  auditLogs: ComplianceAuditLog[];
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  keyPrefix: string;
  secret: string;
  createdAt: string;
  lastUsedAt: string;
  environment: 'sandbox' | 'production';
  status: 'active' | 'revoked';
  rateLimit: number;
  permissions: string[];
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  uetr: string;
  event: string;
  statusCode: number;
  payload: Record<string, unknown>;
  signature: string;
  delivered: boolean;
}
