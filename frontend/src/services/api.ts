import { GraphQLClient, gql } from 'graphql-request';
import { Candidate, ApiResponse, FetchCandidatesParams, CandidateFilters } from '../types/candidates';

// GraphQL API URL ve temel kimlik doğrulama bilgileri
const API_URL = 'https://staging-api.hrpanda.co/graphql';
const EMAIL = 'admin20@hireg.com';
const PASSWORD = '123123';

// GraphQL client'ı
let client: GraphQLClient | null = null;
let authToken: string | null = null;

interface AuthResponse {
  authenticate?: {
    token: string;
  };
  login?: {
    token: string;
  };
  signIn?: {
    token: string;
  };
}

interface CandidatesResponse {
  candidates: {
  
    items?: Candidate[];
    data?: Candidate[];
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
    };
    meta?: {
      total: number;
      page: number;
      pageSize: number;
    };
  };
}

interface CandidateResponse {
  candidate: Candidate;
}

// Kimlik doğrulama
async function authenticate(): Promise<string> {
  if (authToken) return authToken;

  try {
    const loginClient = new GraphQLClient(API_URL);
    
    // Farklı login mutation'larını dene
    const mutations = [
      // Mutation 1: authenticate
      gql`
        mutation Authenticate($email: String!, $password: String!) {
          authenticate(credentials: { email: $email, password: $password }) {
            token
          }
        }
      `,
      // Mutation 2: login
      gql`
        mutation Login($email: String!, $password: String!) {
          login(input: { email: $email, password: $password }) {
            token
          }
        }
      `,
      // Mutation 3: signIn
      gql`
        mutation SignIn($email: String!, $password: String!) {
          signIn(input: { email: $email, password: $password }) {
            token
          }
        }
      `,
      // Mutation 4: login with credentials param
      gql`
        mutation LoginCredentials($email: String!, $password: String!) {
          login(credentials: { email: $email, password: $password }) {
            token
          }
        }
      `,
    ];
    
    const variables = {
      email: EMAIL,
      password: PASSWORD
    };
    
    let response: AuthResponse | null = null;
    let lastError: any = null;
    
    // Tüm mutation'ları dene
    for (const mutation of mutations) {
      try {
        response = await loginClient.request<AuthResponse>(mutation, variables);
        console.log("Başarılı login mutation:", mutation);
        break; // Başarılı bir mutation bulundu, döngüden çık
      } catch (error) {
        console.log("Başarısız login mutation, diğerini deniyoruz...");
        lastError = error;
      }
    }
    
    if (!response) {
      console.error("Tüm login denemeleri başarısız:", lastError);
      throw lastError;
    }
    
    // Hangi response key'inin kullanıldığını bul
    authToken = response.authenticate?.token || response.login?.token || response.signIn?.token;
    
    if (!authToken) {
      throw new Error("Token bulunamadı!");
    }
    
    // Token ile yeni client oluştur
    client = new GraphQLClient(API_URL, {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    
    return authToken;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// GraphQL istemcisini almak için yardımcı fonksiyon
async function getClient(): Promise<GraphQLClient> {
  if (!client) {
    await authenticate();
  }
  return client!;
}

// Adayları getirme
export async function fetchCandidates(
  params: FetchCandidatesParams
): Promise<ApiResponse<Candidate>> {
  try {
    const { page, pageSize = 20, searchTerm, sortBy, sortDirection, filters } = params;
    
    const client = await getClient();
    
    const queries = [
      // Query 1: items ve pagination
      gql`
        query GetCandidates($page: Int!, $pageSize: Int!, $search: String, $sort: SortInput, $filters: CandidateFilterInput) {
          candidates(
            pagination: { page: $page, pageSize: $pageSize }
            search: $search
            sort: $sort
            filter: $filters
          ) {
            items {
              id
              name
              email
              avatarUrl
              status
              education
              city
              expectedSalary
              joinDate
              score
            }
            pagination {
              total
              page
              pageSize
            }
          }
        }
      `,
      // Query 2: data ve meta
      gql`
        query GetCandidates2($page: Int!, $pageSize: Int!, $search: String, $sortBy: String, $sortDirection: String, $filters: CandidateFiltersInput) {
          candidates(
            pagination: { page: $page, pageSize: $pageSize }
            search: $search
            sort: { field: $sortBy, direction: $sortDirection }
            filters: $filters
          ) {
            data {
              id
              name
              email
              avatarUrl
              status
              education
              city
              expectedSalary
              joinDate
              score
            }
            meta {
              total
              page
              pageSize
            }
          }
        }
      `
    ];
    
    // Farklı yapılar için variables hazırla
    const variablesList = [
      // Variables for query 1
      {
        page,
        pageSize,
        search: searchTerm || undefined,
        sort: sortBy ? { field: sortBy, direction: sortDirection } : undefined,
        filters: filters || undefined
      },
      // Variables for query 2
      {
        page,
        pageSize,
        search: searchTerm || undefined,
        sortBy: sortBy || undefined,
        sortDirection: sortDirection || undefined,
        filters: filters || undefined
      }
    ];
    
    // Tüm query'leri dene
    let response: CandidatesResponse | null = null;
    let lastError: any = null;
    
    for (let i = 0; i < queries.length; i++) {
      try {
        response = await client.request<CandidatesResponse>(queries[i], variablesList[i]);
        console.log("Başarılı candidates query:", i);
        break; // Başarılı bir query bulundu, döngüden çık
      } catch (error) {
        console.log(`Query ${i} başarısız, diğerini deniyoruz...`);
        lastError = error;
      }
    }
    
    if (!response) {
      console.error("Tüm candidate query denemeleri başarısız:", lastError);
      throw lastError;
    }
    
    // Response yapısını kontrol et ve uygun şekilde dönüştür
    const candidatesData = response.candidates.items || response.candidates.data || [];
    const pagination = response.candidates.pagination || response.candidates.meta;
    
    return {
      data: candidatesData,
      total: pagination?.total || candidatesData.length,
      page: pagination?.page || page,
      pageSize: pagination?.pageSize || pageSize
    };
  } catch (error) {
    console.error('API request error:', error);
    
    // Hata durumunda mock veri 
    return mockFetchCandidates(params);
  }
}

export async function fetchCandidateById(id: string): Promise<Candidate> {
  try {
    const client = await getClient();
    
    const query = gql`
      query GetCandidate($id: ID!) {
        candidate(id: $id) {
          id
          name
          email
          avatarUrl
          status
          education
          city
          expectedSalary
          joinDate
          score
        }
      }
    `;
    
    const variables = { id };
    
    const response = await client.request<CandidateResponse>(query, variables);
    return response.candidate;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Mock veri fonksiyonu 
function mockFetchCandidates(
  params: FetchCandidatesParams
): ApiResponse<Candidate> {
  const MOCK_CANDIDATES: Candidate[] = [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      status: "Active",
      education: "Computer Engineering",
      city: "Istanbul",
      expectedSalary: 45000,
      joinDate: "2023-01-15",
      score: 92
    },
    {
      id: "2",
      name: "Ayşe Kaya",
      email: "ayse@example.com",
      status: "Interview",
      education: "Software Engineering",
      city: "Ankara",
      expectedSalary: 38000,
      joinDate: "2023-02-20",
      score: 85
    },
  ];
  
  const { page, pageSize = 20, searchTerm, sortBy, sortDirection } = params;
  
  // Search term uygulanması
  let filteredData = [...MOCK_CANDIDATES];
  if (searchTerm) {
    filteredData = filteredData.filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sıralama uygulanması
  if (sortBy) {
    filteredData.sort((a, b) => {
      const aValue = a[sortBy as keyof Candidate];
      const bValue = b[sortBy as keyof Candidate];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  // Sayfalama
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    pageSize
  };
}