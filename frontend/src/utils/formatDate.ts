export function formatDate(dateStr: string): string {
    if (!/^\d{8}$/.test(dateStr)) {
      return "unknown";
    }
  
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
  
    return `${year}/${month}/${day}`;
  }
  