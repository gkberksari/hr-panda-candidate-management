import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCandidateContext } from '../../context/CandidateContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const FilterBar: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    totalCandidates,
    loading,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection
  } = useCandidateContext();
  
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);

  // Aktif filtrelerin sayısını hesapla
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  // Filtre değerlerini görsel metne dönüştürme
  const getFilterDisplayText = (key: string, value: any): string => {
    switch(key) {
      case 'status':
        return `Status: ${value}`;
      case 'city':
        return `City: ${value}`;
      case 'education':
        return `Education: ${value}`;
      case 'minSalary':
        return `Min Salary: ₺${Number(value).toLocaleString()}`;
      case 'maxSalary':
        return `Max Salary: ₺${Number(value).toLocaleString()}`;
      case 'minScore':
        return `Min Score: ${value}%`;
      case 'maxScore':
        return `Max Score: ${value}%`;
      case 'joinDateStart':
        return `Joined After: ${new Date(value).toLocaleDateString()}`;
      case 'joinDateEnd':
        return `Joined Before: ${new Date(value).toLocaleDateString()}`;
      default:
        return `${key}: ${value}`;
    }
  };

  // Tek bir filtreyi kaldırma
  const removeFilter = (key: string) => {
    setFilters({ ...filters, [key]: undefined });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            {loading ? 'Loading...' : `${totalCandidates} candidates`}
          </span>
          
          {sortBy && (
            <Badge variant="outline" className="ml-2 gap-1">
              Sorted by: {sortBy} ({sortDirection})
              <button 
                onClick={() => {
                  setSortBy(null);
                  setSortDirection('asc');
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Candidates</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={filters.status || ''} 
                      onValueChange={(value) => 
                        setFilters({ ...filters, status: value || undefined })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={filters.city || ''} 
                      onChange={(e) => 
                        setFilters({ ...filters, city: e.target.value || undefined })
                      }
                      placeholder="Any city"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input 
                      id="education" 
                      value={filters.education || ''} 
                      onChange={(e) => 
                        setFilters({ ...filters, education: e.target.value || undefined })
                      }
                      placeholder="Any education"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expected Salary</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Min"
                        type="number"
                        value={filters.minSalary || ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, minSalary: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                      <span>-</span>
                      <Input 
                        placeholder="Max"
                        type="number"
                        value={filters.maxSalary || ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, maxSalary: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Score</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Min"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.minScore || ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, minScore: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                      <span>-</span>
                      <Input 
                        placeholder="Max"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.maxScore || ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, maxScore: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="date"
                        value={filters.joinDateStart ? new Date(filters.joinDateStart).toISOString().split('T')[0] : ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, joinDateStart: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                        }
                      />
                      <span>-</span>
                      <Input 
                        type="date"
                        value={filters.joinDateEnd ? new Date(filters.joinDateEnd).toISOString().split('T')[0] : ''} 
                        onChange={(e) => 
                          setFilters({ ...filters, joinDateEnd: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetFilters}>
                  Reset All
                </Button>
                <Button onClick={() => setFilterDialogOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear all
            </Button>
          )}
        </div>
      </div>
      
      {/* Aktif filtreler */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === undefined || value === null || value === '') return null;
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {getFilterDisplayText(key, value)}
                <button 
                  onClick={() => removeFilter(key)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterBar;