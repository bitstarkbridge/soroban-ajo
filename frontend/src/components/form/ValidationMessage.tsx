export function ValidationMessage({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-1 text-sm text-red-500 animate-[fadeIn_0.3s_ease]">{message}</p>
}
