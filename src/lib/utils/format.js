export function formatDate(date) {
	if (!date) return '';

	return new Date(date).toLocaleDateString('en-US', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric'
	});
}

export function formatTime(time) {
	if (!time) return '';

	return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit'
	});
}
