export function trimDashSymbols(text: string): string {
  return text.replace(/\s?(-|–|—)\s?$/, '').trim();
}
