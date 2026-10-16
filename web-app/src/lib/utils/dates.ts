/**
 * Format a date-like value as dd/MM/YYYY.
 */
export function formatDate(
	value: string | Date | null | undefined,
	fallback = '—'
): string {
	if (value === null || value === undefined || value === '') return fallback;

	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return fallback;

	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();

	return `${day}/${month}/${year}`;
}

export function formatLongDate(date: string | Date) {
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format a date-time as dd/MM/YYYY HH:mm.
 */
export function formatDateTime(
	value: string | Date | null | undefined,
	fallback = '—'
): string {
	if (value === null || value === undefined || value === '') return fallback;

	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return fallback;

	const date = formatDate(d, fallback);
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');

	return `${date} at ${hours}:${minutes}`;
}

/**
 * Today's date as YYYY-MM-DD (for <input type="date"> values, API filters, etc.)
 * Note: not user-facing — always ISO, never dd/MM/YYYY.
 */
export function todayISO(): string {
	const d = new Date();
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	return `${d.getFullYear()}-${month}-${day}`;
}
