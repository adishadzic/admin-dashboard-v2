import { UITest } from "@/types/test";

function formatMinutes(total: number): string {
    if (total <= 0) return "—";
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
  
  export function estimateDuration(test: UITest): string {
    const qs = test.questions;
  
    if (!qs || qs.length === 0) {
      return test.duration && test.duration.trim() !== "" ? test.duration : "—";
    }
  
    let minutes = 0;
    for (const q of qs) {
      switch (q.type) {
        case "mcq":
          minutes += 2;
          break;
        case "truefalse":
          minutes += 1;
          break;
        case "short":
          minutes += 3;
          break;
        default:
          minutes += 2;
      }
    }
    return formatMinutes(minutes);
  }
  