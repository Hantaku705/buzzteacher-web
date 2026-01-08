import { test, expect } from '@playwright/test'

test.describe('BuzzTeacher Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the chat interface', async ({ page }) => {
    // Check header
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header h1')).toContainText('BuzzTeacher')

    // Check input area exists
    const input = page.locator('textarea')
    await expect(input).toBeVisible()

    // Check send button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show empty state initially', async ({ page }) => {
    // Check for welcome message
    await expect(page.getByText('動画URLを送信すると')).toBeVisible()
  })

  test('should send a message and receive response', async ({ page }) => {
    test.setTimeout(90000)

    // Type a simple question
    const input = page.locator('textarea')
    await input.fill('バズる動画の作り方を教えて')

    // Click send button
    await page.locator('button[type="submit"]').click()

    // Wait for user message to appear
    await expect(page.getByText('バズる動画の作り方を教えて')).toBeVisible()

    // Wait for AI response (assistant message has different bg color)
    const assistantMessage = page.locator('[class*="bg-[#444654]"]').first()
    await expect(assistantMessage).toBeVisible({ timeout: 60000 })

    // Check that response contains some content (not just loading indicator)
    await expect(assistantMessage.locator('.flex-1')).not.toBeEmpty({ timeout: 60000 })
  })

  test('should handle TikTok URL input', async ({ page }) => {
    test.setTimeout(180000) // 3 minutes for video analysis

    const tiktokUrl = 'https://www.tiktok.com/@4610_hotel/video/7401449837133161761'

    // Type TikTok URL
    const input = page.locator('textarea')
    await input.fill(tiktokUrl)

    // Click send
    await page.locator('button[type="submit"]').click()

    // Wait for user message
    await expect(page.getByText(tiktokUrl)).toBeVisible()

    // Wait for response with analysis (longer timeout for video analysis)
    const assistantMessage = page.locator('[class*="bg-[#444654]"]').first()
    await expect(assistantMessage).toBeVisible({ timeout: 120000 })
  })

  test('should disable send button while loading', async ({ page }) => {
    test.setTimeout(90000)

    const input = page.locator('textarea')
    await input.fill('テスト')

    // Click send
    const sendButton = page.locator('button[type="submit"]')
    await sendButton.click()

    // Button should be disabled while loading
    await expect(sendButton).toBeDisabled()

    // Wait for response to complete
    const assistantMessage = page.locator('[class*="bg-[#444654]"]').first()
    await expect(assistantMessage).toBeVisible({ timeout: 60000 })

    // Button should be enabled again
    await expect(sendButton).toBeEnabled()
  })

  test('should support multiple messages in conversation', async ({ page }) => {
    test.setTimeout(180000)

    const input = page.locator('textarea')

    // Send first message
    await input.fill('こんにちは')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText('こんにちは')).toBeVisible()

    // Wait for first response
    await expect(page.locator('[class*="bg-[#444654]"]').first()).toBeVisible({ timeout: 60000 })

    // Wait for button to be enabled again
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 10000 })

    // Send second message
    await input.fill('フックとは何ですか？')
    await page.locator('button[type="submit"]').click()

    // Both messages should be visible
    await expect(page.getByText('こんにちは')).toBeVisible()
    await expect(page.getByText('フックとは何ですか？')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should work on mobile viewport', async ({ page }) => {
    await page.goto('/')

    // Check input is visible
    const input = page.locator('textarea')
    await expect(input).toBeVisible()

    // Type and send message
    await input.fill('モバイルテスト')
    await page.locator('button[type="submit"]').click()

    // Message should appear
    await expect(page.getByText('モバイルテスト')).toBeVisible()
  })
})

test.describe('Keyboard Navigation', () => {
  test('should submit on Enter key (without Shift)', async ({ page }) => {
    await page.goto('/')

    const input = page.locator('textarea')
    await input.fill('Enterで送信テスト')
    await input.press('Enter')

    // Message should be sent
    await expect(page.getByText('Enterで送信テスト')).toBeVisible()
  })

  test('should allow newline with Shift+Enter', async ({ page }) => {
    await page.goto('/')

    const input = page.locator('textarea')
    await input.fill('1行目')
    await input.press('Shift+Enter')
    await input.type('2行目')

    // Input should contain both lines
    const value = await input.inputValue()
    expect(value).toContain('1行目')
    expect(value).toContain('2行目')
  })
})
