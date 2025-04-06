import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Check, ChevronDown, ChevronUp, MoreHorizontal, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Candidate } from '../../types/candidates';
import { fetchCandidates } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

// Sütun tipi tanımı
interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const CandidateTable: React.FC = () => {
  // State tanımlamaları
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Kolon görünürlük yönetimi
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Candidate', visible: true, sortable: true },
    { id: 'status', label: 'Status', visible: true, sortable: true },
    { id: 'education', label: 'Education', visible: true, sortable: true },
    { id: 'city', label: 'City', visible: true, sortable: true },
    { id: 'salary', label: 'Expected Salary', visible: true, sortable: true },
    { id: 'joinDate', label: 'Join Date', visible: true, sortable: true },
    { id: 'score', label: 'Score', visible: true, sortable: true },
    { id: 'actions', label: 'Actions', visible: true, sortable: false },
  ]);

  // IntersectionObserver ile sonsuz kaydırma
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // API'den adayları getirme
  const loadCandidates = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const result = await fetchCandidates({
        page,
        searchTerm: debouncedSearchTerm,
        sortBy,
        sortDirection,
      });
      
      if (result.data.length === 0) {
        setHasMore(false);
      } else {
        setCandidates(prev => page === 1 ? result.data : [...prev, ...result.data]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, sortBy, sortDirection, hasMore, loading]);

  // Arama, sıralama veya filtre değiştiğinde
  useEffect(() => {
    setCandidates([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedSearchTerm, sortBy, sortDirection]);

  // Sayfa yüklendiğinde veya sayfa, arama terimi, sıralama değiştiğinde verileri yükle
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // InView değiştiğinde (kullanıcı sayfanın sonuna geldiğinde)
  useEffect(() => {
    if (inView && hasMore) {
      loadCandidates();
    }
  }, [inView, loadCandidates, hasMore]);

  // Sıralama fonksiyonu
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  // Kolon görünürlüğünü değiştirme
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Adayın durum bilgisine göre badge rengi belirleme
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Arama ve Filtre Bölümü */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search candidates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Kolon Görünürlük Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {columns.map((column) => (
              <DropdownMenuItem key={column.id} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${column.id}`}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                />
                <label
                  htmlFor={`col-${column.id}`}
                  className="flex-grow cursor-pointer"
                >
                  {column.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tablo */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) =>
                column.visible && (
                  <th
                    key={column.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.sortable ? (
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                        {sortBy === column.id ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => (
                <tr 
                  key={candidate.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* İsim ve Profil Sütunu */}
                  {columns.find(col => col.id === 'name')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                          <AvatarFallback>
                            {candidate.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {/* Durum Sütunu */}
                  {columns.find(col => col.id === 'status')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge 
                        className={`${getStatusBadgeColor(candidate.status)} font-medium`}
                      >
                        {candidate.status}
                      </Badge>
                    </td>
                  )}
                  
                  {/* Eğitim Sütunu */}
                  {columns.find(col => col.id === 'education')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {candidate.education}
                    </td>
                  )}
                  
                  {/* Şehir Sütunu */}
                  {columns.find(col => col.id === 'city')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {candidate.city}
                    </td>
                  )}
                  
                  {/* Maaş Beklentisi Sütunu */}
                  {columns.find(col => col.id === 'salary')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {candidate.expectedSalary ? `₺${candidate.expectedSalary.toLocaleString()}` : 'Not specified'}
                    </td>
                  )}
                  
                  {/* Katılım Tarihi Sütunu */}
                  {columns.find(col => col.id === 'joinDate')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(candidate.joinDate).toLocaleDateString('tr-TR')}
                    </td>
                  )}
                  
                  {/* Skor Sütunu */}
                  {columns.find(col => col.id === 'score')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${candidate.score >= 80 ? 'bg-green-100 text-green-800' : 
                            candidate.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}
                        `}>
                          {candidate.score}%
                        </span>
                      </div>
                    </td>
                  )}
                  
                  {/* İşlemler Sütunu */}
                  {columns.find(col => col.id === 'actions')?.visible && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">İşlemler</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            ) : loading && page === 1 ? (
              <tr>
                <td 
                  colSpan={columns.filter(col => col.visible).length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading candidates...
                </td>
              </tr>
            ) : (
              <tr>
                <td 
                  colSpan={columns.filter(col => col.visible).length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sonsuz Kaydırma Referansı */}
      {hasMore && (
        <div ref={ref} className="w-full py-4 flex justify-center">
          {loading && page > 1 && (
            <div className="text-center text-gray-500">Loading more...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateTable;