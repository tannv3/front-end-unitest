import { describe, it, expect, beforeEach } from 'vitest'

describe('main.ts template', () => {
  let counterButton: HTMLButtonElement

  beforeEach(async () => {
    const div = document.createElement('div')
    div.id = 'app'
    document.body.appendChild(div)

    await import('./main')

    counterButton = document.querySelector<HTMLButtonElement>('#counter')!
  })

  it('renders the Vite + TypeScript template', () => {
    expect(counterButton).toBeTruthy()
    expect(counterButton.innerHTML).toBe('count is 0')
  })

  it('increments counter when clicking the button', () => {
    counterButton.click()
    expect(counterButton.innerHTML).toBe('count is 1')

    counterButton.click()
    expect(counterButton.innerHTML).toBe('count is 2')
  })
})
