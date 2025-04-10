export function formatDate(dateStr: string): string {
    if (!/^\d{8}$/.test(dateStr)) {
      throw new Error("Invalid date format. Expected 'YYYYMMDD'");
    }
  
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
  
    return `${year}/${month}/${day}`;
  }
  