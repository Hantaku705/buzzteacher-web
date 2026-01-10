import { chromium } from "playwright";

async function test() {
  console.log("🚀 Starting E2E test...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. ページを開く
    console.log("📄 Opening page...");
    await page.goto("https://web-hantakus-projects.vercel.app", {
      waitUntil: "networkidle",
    });

    // 2. タイトル確認
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);

    // 3. 審査セレクターの存在確認
    const selector = await page.locator("select").first();
    const selectorExists = await selector.isVisible();
    console.log(`✅ Creator selector visible: ${selectorExists}`);

    // 4. セレクターの選択肢を取得
    const options = await page.locator("select option").allTextContents();
    console.log(`✅ Creator options: ${options.join(", ")}`);

    // 5. 入力欄の存在確認
    const textarea = await page.locator("textarea");
    const textareaExists = await textarea.isVisible();
    console.log(`✅ Input textarea visible: ${textareaExists}`);

    // 6. テストメッセージを送信
    console.log("📝 Sending test message...");
    await textarea.fill("こんにちは");
    await page.keyboard.press("Enter");

    // 7. 応答を待つ（最大30秒）
    console.log("⏳ Waiting for response...");

    // ローディング表示が消えるまで待つ
    await page.waitForTimeout(3000);

    // BTからの応答を確認
    const messages = await page.locator(".bg-\\[\\#444654\\]").all();
    console.log(`✅ Assistant messages count: ${messages.length}`);

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const content = await lastMessage.textContent();

      if (content && content.includes("エラー")) {
        console.log(`❌ Error in response: ${content?.substring(0, 100)}...`);
      } else if (content && content.length > 10) {
        console.log(`✅ Got response: ${content?.substring(0, 100)}...`);
      } else {
        console.log(`⚠️ Response might be loading or empty`);

        // もう少し待つ
        await page.waitForTimeout(10000);
        const newContent = await lastMessage.textContent();
        console.log(`📄 After waiting: ${newContent?.substring(0, 200)}...`);
      }
    }

    // スクリーンショットを保存
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-screenshot.png",
      fullPage: true,
    });
    console.log("📸 Screenshot saved to test-screenshot.png");

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-error.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

test();
