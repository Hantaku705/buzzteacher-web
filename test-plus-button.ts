import { chromium } from 'playwright'

async function test() {
  console.log('Testing + button UI...')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // 1. ページを開く
    console.log('Opening page...')
    await page.goto('https://web-hantakus-projects.vercel.app', { waitUntil: 'networkidle' })

    // 2. タイトル確認
    const title = await page.title()
    console.log(`Page title: ${title}`)

    // 3. ヘッダーにCreatorSelectorがないことを確認
    const headerSelector = await page.locator('header select').count()
    if (headerSelector === 0) {
      console.log('Header selector removed (as expected)')
    } else {
      console.log('ERROR: Header selector still exists!')
    }

    // 4. +ボタンを探す
    const plusButton = await page.locator('button').filter({ hasText: '' }).first()
    const buttons = await page.locator('button[type="button"]').all()
    console.log(`Found ${buttons.length} buttons`)

    // 5. SVGを持つボタン（+ボタン）をクリック
    const plusBtn = page.locator('button[title*="審査"]')
    const plusBtnCount = await plusBtn.count()
    console.log(`+ button found: ${plusBtnCount > 0 ? 'Yes' : 'No'}`)

    if (plusBtnCount > 0) {
      console.log('Clicking + button...')
      await plusBtn.click()
      await page.waitForTimeout(500)

      // 6. ポップアップメニューが表示されることを確認
      const menu = page.locator('text=審査する人を選択')
      const menuVisible = await menu.isVisible()
      console.log(`Menu visible: ${menuVisible ? 'Yes' : 'No'}`)

      // 7. Creator一覧を確認
      const creators = await page.locator('text=ど素人ホテル').count()
      console.log(`"ど素人ホテル" in menu: ${creators > 0 ? 'Yes' : 'No'}`)

      // 8. Creatorを選択
      console.log('Selecting "ど素人ホテル"...')
      await page.locator('text=ど素人ホテル').click()
      await page.waitForTimeout(500)

      // 9. 選択後、入力欄下に表示されるか確認
      const selectedText = await page.locator('text=「ど素人ホテル」の視点でアドバイスします').count()
      console.log(`Selection confirmed: ${selectedText > 0 ? 'Yes' : 'No'}`)

      // 10. +ボタンが緑色になっているか確認（classにemeraldが含まれるか）
      const btnClass = await plusBtn.getAttribute('class')
      console.log(`+ button has emerald color: ${btnClass?.includes('emerald') ? 'Yes' : 'No'}`)
    }

    // スクリーンショットを保存
    await page.screenshot({ path: '/Users/hantaku/Downloads/BuzzTeacher/web/test-plus-button.png', fullPage: true })
    console.log('Screenshot saved')

    console.log('\nTest completed!')

  } catch (error) {
    console.error('Test failed:', error)
    await page.screenshot({ path: '/Users/hantaku/Downloads/BuzzTeacher/web/test-plus-error.png', fullPage: true })
  } finally {
    await browser.close()
  }
}

test()
