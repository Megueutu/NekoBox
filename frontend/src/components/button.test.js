import { describe, it, expect } from 'vitest'
import { Button } from './button.js'

describe('Button - default', () => {
  it('retorna um elemento <button>', () => {
    const el = Button('Clique')
    expect(el.tagName).toBe('BUTTON')
  })

  it('label está correto', () => {
    const el = Button('Clique')
    expect(el.querySelector('[data-label]').textContent).toBe('Clique')
  })

  it('lança TypeError sem label', () => {
    expect(() => Button()).toThrow(TypeError)
  })
})

describe('Button - wicon', () => {
  it('contém um <img> do ícone', () => {
    const el = Button('Clique', 'wicon', 'arrow')
    expect(el.querySelector('img')).not.toBeNull()
    expect(el.querySelector('img').src).toContain('arrow.svg')
  })

  it('lança TypeError sem icon', () => {
    expect(() => Button('Clique', 'wicon')).toThrow(TypeError)
  })
})

describe('Button - auth', () => {
  it('contém um <img> com src do google', () => {
    const el = Button('Google', 'auth', null, 'google')
    const img = el.querySelector('[data-auth]')
    expect(img).not.toBeNull()
    expect(img.src).toContain('google.svg')
  })

  it('alt da img é o nome do provider', () => {
    const el = Button('Google', 'auth', null, 'google')
    expect(el.querySelector('[data-auth]').alt).toBe('google')
  })

  it('lança TypeError sem social', () => {
    expect(() => Button('Google', 'auth')).toThrow(TypeError)
  })

  it('lança TypeError com social inválido', () => {
    expect(() => Button('Google', 'auth', null, 'twitter')).toThrow(TypeError)
  })
})

describe('Button - variante inválida', () => {
  it('lança TypeError com variante inválida', () => {
    expect(() => Button('Clique', 'inexistente')).toThrow(TypeError)
  })
})