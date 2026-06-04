import apiClient from './apiClient';

export interface AiMetadata {
    domainClassification?: string;
    riskTierSuggestion?: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestedLicenseType?: 'RESEARCH' | 'COMMERCIAL' | 'MEDIA';
    summary?: string;
    sensitiveContentFlag?: boolean;
    keywords?: string[];
}

export interface Asset {
    id: string;
    type: 'BIO' | 'SONIC';
    title: string;
    description: string;
    communityName: string;
    recordeeName: string;
    riskTier?: string;
    mediaUrl?: string;       // Synthesized on backend: /api/files/{mediaFileId}
    mediaFileId?: string;    // Raw GridFS ObjectId (also present)
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewComment?: string | null;
    createdBy?: { name: string; email: string };
    metadata?: Record<string, any>;
    transcript?: string;
    createdAt: string;
    updatedAt: string;
    aiMetadata?: AiMetadata;
    aiProcessed?: boolean;
}


export interface CreateAssetPayload {
    type: 'BIO' | 'SONIC';
    title: string;
    description: string;
    recordeeName: string;
    communityName: string;
    riskTier?: string;
    transcript?: string;
    metadata?: Record<string, unknown>;
}

// Community: submit a new asset
export const submitAsset = async (data: CreateAssetPayload): Promise<Asset> => {
    const resp = await apiClient.post<Asset>('/assets', data);
    return resp.data;
};

// Community: get own assets (all statuses)
export const getMyAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/mine');
    return resp.data;
};

// Reviewer: get pending assets
export const getPendingAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/pending');
    return resp.data;
};

export interface PaginatedAssets {
    assets: Asset[];
    total: number;
    page: number;
    hasMore: boolean;
}

// Marketplace / General: get approved-only assets (paginated)
export const getPublicAssets = async (page = 1, limit = 12): Promise<PaginatedAssets> => {
    const resp = await apiClient.get<PaginatedAssets>('/assets/public', { params: { page, limit } });
    return resp.data;
};

export const getReviewedAssets = async (): Promise<Asset[]> => {
    const resp = await apiClient.get<Asset[]>('/assets/reviewed');
    return resp.data;
};

// Reviewer: approve an asset
export const approveAsset = async (id: string): Promise<Asset> => {
    const resp = await apiClient.patch<Asset>(`/assets/${id}/approve`);
    return resp.data;
};

// Reviewer: reject an asset (comment required)
export const rejectAsset = async (id: string, reviewComment: string): Promise<Asset> => {
    const resp = await apiClient.patch<Asset>(`/assets/${id}/reject`, { reviewComment });
    return resp.data;
};

// Play SONIC asset
export const getSonicPlayUrl = async (assetId: string): Promise<string> => {
    const resp = await apiClient.get<{ assetId: string, previewUrl: string }>(`/sonic/${assetId}/play`);
    return resp.data.previewUrl;
};
