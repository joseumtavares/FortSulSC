export function CharCounter({ length, max }: { length: number; max: number }) {
  const isAtLimit = length >= max
  return (
    <span className={`mt-1 block text-right text-xs ${isAtLimit ? 'text-red-700' : 'text-brand-muted'}`}>
      {length}/{max} caracteres
    </span>
  )
}
