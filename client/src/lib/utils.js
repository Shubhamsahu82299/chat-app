export function formatMessageTime(date){
    return Date.now() - new Date(date) < 60000 ? 'Just now' : new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}