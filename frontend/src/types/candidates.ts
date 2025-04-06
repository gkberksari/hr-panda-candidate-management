export interface Candidate {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    status: 'Active' | 'Interview' | 'Rejected' | 'Offer' | string;
    education: string;
    city: string;
    expectedSalary: number;
    joinDate: string;
    score: number;
  }
  
  export interface ApiResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
  }
  
  export interface FetchCandidatesParams {
    page: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: string | null;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }

  export interface CandidateFilters {
    status?: string;
    city?: string;
    education?: string;
    minSalary?: number;
    maxSalary?: number;
    minScore?: number;
    maxScore?: number;
    joinDateStart?: string;
    joinDateEnd?: string;
  }