export const formatDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (noteDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (noteDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatFileDate = (date: Date): string => {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
};