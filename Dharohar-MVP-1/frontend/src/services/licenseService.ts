import apiClient from './apiClient';

export type LicenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUIRED';

export interface License {
    id: string;
    assetId: { id: string; title: string; type: string; communityName: string } | string;
    applicantId: { id: string; name: string; email: string } | string;
    licenseType: 'RESEARCH' | 'COMMERCIAL' | 'MEDIA' | 'BIO_KNOWLEDGE';
    purpose: string;
    documentation?: string;
    fee?: number;
    status: LicenseStatus;
    adminComment?: string | null;
    agreementText?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApplyLicensePayload {
    assetId: string;
    licenseType: 'RESEARCH' | 'COMMERCIAL' | 'MEDIA' | 'BIO_KNOWLEDGE';
    purpose: string;
    documentation?: string;
    documentationFileId?: string;
    fee?: number;
    // Common applicant identity fields
    fullName?: string;
    email?: string;
    phone?: string;
    organizationName?: string;
    gstNumber?: string;
    intendedUse?: string;
    // Bio-knowledge specific
    bioKnowledgeDetails?: string;
    // Allow additional license-type specific fields
    [key: string]: unknown;
}

export interface ResubmitPayload {
    purpose?: string;
    documentation?: string;
    fee?: number;
}

// General: apply for a license on an approved asset
export const applyForLicense = async (data: ApplyLicensePayload): Promise<License> => {
    const resp = await apiClient.post<License>('/licenses/apply', data);
    return resp.data;
};

// General: view own license applications
export const getMyLicenses = async (): Promise<License[]> => {
    const resp = await apiClient.get<License[]>('/licenses/mine');
    return resp.data;
};

// General: resubmit after MODIFICATION_REQUIRED
export const resubmitLicense = async (id: string, data: ResubmitPayload): Promise<License> => {
    const resp = await apiClient.patch<License>(`/licenses/${id}/resubmit`, data);
    return resp.data;
};

// Community: see which licenses have been granted for their assets
export const getLicensesForAsset = async (assetId: string): Promise<License[]> => {
    const resp = await apiClient.get<License[]>(`/licenses/for-asset/${assetId}`);
    return resp.data;
};

// Admin: view all pending applications
export const getPendingLicenses = async (): Promise<License[]> => {
    const resp = await apiClient.get<License[]>('/licenses/pending');
    return resp.data;
};

// Admin: view all license applications
export const getAllLicenses = async (): Promise<License[]> => {
    const resp = await apiClient.get<License[]>('/licenses/all');
    return resp.data;
};

// Admin: approve
export const approveLicense = async (id: string): Promise<License> => {
    const resp = await apiClient.patch<License>(`/licenses/${id}/approve`);
    return resp.data;
};

// Admin: reject (comment required)
export const rejectLicense = async (id: string, adminComment: string): Promise<License> => {
    const resp = await apiClient.patch<License>(`/licenses/${id}/reject`, { adminComment });
    return resp.data;
};

// Admin: request modification (comment required)
export const requestModification = async (id: string, adminComment: string): Promise<License> => {
    const resp = await apiClient.patch<License>(`/licenses/${id}/request-modification`, { adminComment });
    return resp.data;
};
