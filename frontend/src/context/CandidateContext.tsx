import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Candidate, ApiResponse, FetchCandidatesParams, CandidateFilters } from '../types/candidates';
import { fetchCandidates } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface CandidateContextType {
  candidates: Candidate[];
  loading: boolean;
  error: Error | null;
  page: number;
  hasMore: boolean;
  searchTerm: string;
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
  filters: CandidateFilters;
  totalCandidates: number;
  setPage: (page: number) => void;
  loadMore: () => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (field: string | null) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setFilters: (filters: CandidateFilters) => void;
  resetFilters: () => void;
  refreshCandidates: () => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const useCandidateContext = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidateContext must be used within a CandidateProvider');
  }
  return context;
};

interface CandidateProviderProps {
  children: ReactNode;
}

export const CandidateProvider: React.FC<CandidateProviderProps> = ({ children }) => {
  // Ana veriler
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // Sayfalama
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filtreleme ve sıralama
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<CandidateFilters>({});

  // Debounced değerler
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // GraphQL için filtreler
  const prepareGraphQLFilters = useCallback(() => {
    const graphqlFilters: Record<string, any> = {};
    
    if (debouncedFilters.status && debouncedFilters.status.length > 0) {
      graphqlFilters.status = { in: debouncedFilters.status };
    }
    
    if (debouncedFilters.city && debouncedFilters.city.length > 0) {
      graphqlFilters.city = { in: debouncedFilters.city };
    }
    
    if (debouncedFilters.education && debouncedFilters.education.length > 0) {
      graphqlFilters.education = { in: debouncedFilters.education };
    }
    
    if (debouncedFilters.minSalary || debouncedFilters.maxSalary) {
      graphqlFilters.expectedSalary = {};
      if (debouncedFilters.minSalary) {
        graphqlFilters.expectedSalary.gte = debouncedFilters.minSalary;
      }
      if (debouncedFilters.maxSalary) {
        graphqlFilters.expectedSalary.lte = debouncedFilters.maxSalary;
      }
    }
    
    if (debouncedFilters.minScore || debouncedFilters.maxScore) {
      graphqlFilters.score = {};
      if (debouncedFilters.minScore) {
        graphqlFilters.score.gte = debouncedFilters.minScore;
      }
      if (debouncedFilters.maxScore) {
        graphqlFilters.score.lte = debouncedFilters.maxScore;
      }
    }
    
    if (debouncedFilters.joinDateStart || debouncedFilters.joinDateEnd) {
      graphqlFilters.joinDate = {};
      if (debouncedFilters.joinDateStart) {
        graphqlFilters.joinDate.gte = debouncedFilters.joinDateStart;
      }
      if (debouncedFilters.joinDateEnd) {
        graphqlFilters.joinDate.lte = debouncedFilters.joinDateEnd;
      }
    }
    
    return Object.keys(graphqlFilters).length > 0 ? graphqlFilters : undefined;
  }, [debouncedFilters]);

  // Adayları getirme fonksiyonu
  const fetchData = useCallback(async (newPage: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: FetchCandidatesParams = {
        page: newPage,
        pageSize: 20,
        searchTerm: debouncedSearchTerm,
        sortBy,
        sortDirection,
        filters: prepareGraphQLFilters(),
      };
      
      const response = await fetchCandidates(params);
      
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(newPage * response.pageSize < response.total);
        if (append) {
          setCandidates(prev => [...prev, ...response.data]);
        } else {
          setCandidates(response.data);
        }
        setTotalCandidates(response.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch candidates'));
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortDirection, prepareGraphQLFilters]);

  // Filtreleme, arama veya sıralama değiştiğinde
  useEffect(() => {
    setCandidates([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, false);
  }, [debouncedSearchTerm, sortBy, sortDirection, debouncedFilters, fetchData]);

  // Daha fazla yükleme fonksiyonu
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1, true);
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore, page, fetchData]);

  // Filtreleri sıfırlama
  const resetFilters = useCallback(() => {
    setFilters({});
    setSortBy(null);
    setSortDirection('asc');
    setSearchTerm('');
  }, []);

  // Verileri yenileme
  const refreshCandidates = useCallback(() => {
    setCandidates([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, false);
  }, [fetchData]);

  const value: CandidateContextType = {
    candidates,
    loading,
    error,
    page,
    hasMore,
    searchTerm,
    sortBy,
    sortDirection,
    filters,
    totalCandidates,
    setPage,
    loadMore,
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setFilters,
    resetFilters,
    refreshCandidates,
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};