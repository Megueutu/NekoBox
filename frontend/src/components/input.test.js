import { describe, it, expect } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('retorna um elemento <div>', () => {
    const el = Input('search', 'Digite algo...')
    expect(el.tagName).toBe('DIV')
  })

  it('contém um <input> com placeholder correto', () => {
    const el = Input('search', 'Digite algo...')
    const input = el.querySelector('[data-input]')
    expect(input.placeholder).toBe('Digite algo...')
  })

  it('contém um <img> do ícone', () => {
    const el = Input('search', 'Digite algo...')
    const img = el.querySelector('img')
    expect(img).not.toBeNull()
    expect(img.src).toContain('search.svg')
  })

  it('lança TypeError sem icon', () => {
    expect(() => Input()).toThrow(TypeError)
  })

  it('lança TypeError sem placeholder', () => {
    expect(() => Input('search')).toThrow(TypeError)
  })
})