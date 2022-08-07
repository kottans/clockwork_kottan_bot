export function trimDashSymbols(text: string): string {
  return text.replace(/\s?(-|–|—)\s?$/, '').trim();
}

export function getTextsBeforeDones(text: string): string[] {
  const textsBeforeDone = text.split('#done');
  if (textsBeforeDone.length % 2 === 1) {
    textsBeforeDone.pop();
  }
  const cleanTextsBeforeDone = textsBeforeDone.map(trimDashSymbols);
  const cleanNonEmptyTexts = cleanTextsBeforeDone.filter(Boolean);

  return cleanNonEmptyTexts;
}
