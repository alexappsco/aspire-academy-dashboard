export function json_verify(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function formatAMPM(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${hours}:${paddedMinutes} ${ampm}`;
}

export function trimSnackBarText(text = ''): string {
  const maxLength = 52;
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

export function nameTructed(name: string, tructedLength: number): string {
  if (!name || name.length <= tructedLength) return name;
  const cutoff = tructedLength === 15 ? 12 : tructedLength;
  return `${name.slice(0, cutoff)}...`;
}
