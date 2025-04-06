/**
 * Para değerlerini biçimlendiren yardımcı fonksiyon
 */
export function formatCurrency(value: number | undefined, locale = 'tr-TR', currency = 'TRY'): string {
    if (value === undefined) return '';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  }
  
  /**
   * Tarihleri biçimlendiren yardımcı fonksiyon
   */
  export function formatDate(date: string | Date | undefined, locale = 'tr-TR'): string {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  /**
   * Metni kısaltan yardımcı fonksiyon
   */
  export function truncate(text: string | undefined, length = 50): string {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return `${text.substring(0, length)}...`;
  }