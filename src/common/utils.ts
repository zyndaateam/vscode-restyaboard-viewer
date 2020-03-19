export function prependToLabel(label: string, prefix?: string): string {
  if (!prefix) {
    return label;
  }
  return `${prefix}-${label}`;
}
