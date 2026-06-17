function formatTime(value?: string) {
  if (!value) return '';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(value?: string) {
  if (!value) return 'No messages yet';

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return formatTime(value);
}

export function getPatientFromConversation(
  patientId: { _id: string; name: string; mobile: string } | string,
) {
  if (typeof patientId === 'string') {
    return { name: 'Unknown patient', mobile: patientId };
  }

  return patientId;
}

export { formatTime, formatRelative };
