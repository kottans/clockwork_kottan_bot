function trimLeadingTrailingSymbols(text: string): string {
  return text
    .replace(/\s*?(-|–|—)\s*?$/, '')
    .replace(/(^,)|(,$)/g, '')
    .trim();
}

export function getTextsBeforeDones(text: string): string[] {
  const textsBeforeDone = text.split('#done');
  textsBeforeDone.pop();

  const cleanTextsBeforeDone = textsBeforeDone.map(trimLeadingTrailingSymbols);
  const cleanNonEmptyTexts = cleanTextsBeforeDone.filter(Boolean);

  return cleanNonEmptyTexts;
}
