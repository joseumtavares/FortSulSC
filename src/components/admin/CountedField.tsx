'use client'

import { useState, type ChangeEvent } from 'react'
import { CharCounter } from './CharCounter'

const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'

type Props = {
  name: string
  label: string
  maxLength: number
  defaultValue?: string
  required?: boolean
  type?: 'text' | 'tel' | 'url' | 'textarea'
  rows?: number
}

/** Campo de texto com contador de caracteres embutido — mesmo padrão de `CharCounter`, reutilizável quando um formulário precisa de vários campos limitados sem repetir estado/handler por campo. */
export function CountedField({ name, label, maxLength, defaultValue = '', required, type = 'text', rows }: Props) {
  const [length, setLength] = useState(defaultValue.length)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setLength(event.target.value.length)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-brand-blue-950">{label}
        {type === 'textarea' ? (
          <textarea name={name} rows={rows ?? 3} maxLength={maxLength} defaultValue={defaultValue} onChange={handleChange} className={inputClass} />
        ) : (
          <input name={name} type={type} required={required} maxLength={maxLength} defaultValue={defaultValue} onChange={handleChange} className={inputClass} />
        )}
      </label>
      <CharCounter length={length} max={maxLength} />
    </div>
  )
}
