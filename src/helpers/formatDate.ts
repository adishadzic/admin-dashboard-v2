export function formatDate(input: number | string | Date | undefined): string {
    if (!input) return "—";
  
    let d: Date;
    if (typeof input === "number") d = new Date(input);
    else if (typeof input === "string") d = new Date(input);
    else d = input;
  
    if (isNaN(d.getTime())) return "—";
  
    // Example: 12.09.2025.
    return d.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  