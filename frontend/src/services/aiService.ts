import { CandidateFilters } from '../types/candidates';

interface AIResponse {
  filters: CandidateFilters;
}


export async function processNaturalLanguageQuery(query: string): Promise<CandidateFilters> {
  try {
    // Backend proxy'ye istek gönder
    const response = await fetch('http://localhost:5000/api/process-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.filters || data; // Yanıt formatına bağlı olarak
  } catch (error) {
    console.error('Error calling AI API via backend:', error);
    
    // AI API başarısız olursa, basit bir kural tabanlı yöntemle filtreleri çıkarma
    return extractFiltersFromText(query);
  }
}


function extractFiltersFromText(text: string): CandidateFilters {
  const filters: CandidateFilters = {};
  
  const lowerText = text.toLowerCase();
  
  // Durum
  if (lowerText.includes('active')) filters.status = 'Active';
  else if (lowerText.includes('interview')) filters.status = 'Interview';
  else if (lowerText.includes('rejected')) filters.status = 'Rejected';
  else if (lowerText.includes('offer')) filters.status = 'Offer';
  
  // Şehir
  const cityMatch = lowerText.match(/from\s+([a-z]+)/i);
  if (cityMatch && cityMatch[1]) {
    filters.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
  }
  
  // Maaş
  const salaryMatch = lowerText.match(/salary\s+(above|over|more than)\s+(\d+)/i);
  if (salaryMatch && salaryMatch[2]) {
    filters.minSalary = parseInt(salaryMatch[2], 10);
  }
  
  const salaryRangeMatch = lowerText.match(/salary\s+between\s+(\d+)\s+and\s+(\d+)/i);
  if (salaryRangeMatch && salaryRangeMatch[1] && salaryRangeMatch[2]) {
    filters.minSalary = parseInt(salaryRangeMatch[1], 10);
    filters.maxSalary = parseInt(salaryRangeMatch[2], 10);
  }
  
  // Skor
  const scoreMatch = lowerText.match(/score\s+(above|over|more than)\s+(\d+)/i);
  if (scoreMatch && scoreMatch[2]) {
    filters.minScore = parseInt(scoreMatch[2], 10);
  }
  
  // Son X ay içinde katılanlar
  const recentJoinMatch = lowerText.match(/joined\s+in\s+(the\s+)?(last|past)\s+(\d+)\s+months/i);
  if (recentJoinMatch && recentJoinMatch[3]) {
    const monthsAgo = parseInt(recentJoinMatch[3], 10);
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    filters.joinDateStart = date.toISOString();
  }
  
  return filters;
}