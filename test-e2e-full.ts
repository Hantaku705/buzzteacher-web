import { chromium } from "playwright";

async function test() {
  console.log("🚀 Starting full E2E test...");

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

    // 3. 審査セレクターで「ど素人ホテル」を選択
    console.log("🎯 Selecting creator: ど素人ホテル");
    await page.selectOption("select", "doshirouto");
    await page.waitForTimeout(500);

    // 4. TikTok動画URLを送信
    const tiktokUrl =
      "https://www.tiktok.com/@mote_cosme/video/7586615913298840852";
    console.log(`📝 Sending TikTok URL: ${tiktokUrl}`);

    const textarea = await page.locator("textarea");
    await textarea.fill(tiktokUrl);
    await page.keyboard.press("Enter");

    // 5. ローディング表示を確認
    console.log("⏳ Waiting for response (up to 60s)...");

    // 応答を待つ（最大60秒）
    let responseReceived = false;
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000);

      const messages = await page.locator(".bg-\\[\\#444654\\]").all();
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const content = (await lastMessage.textContent()) || "";

        // ローディング中かチェック
        if (content.includes("分析中")) {
          process.stdout.write(".");
          continue;
        }

        // エラーチェック
        if (content.includes("エラー")) {
          console.log(`\n❌ Error: ${content.substring(0, 200)}`);
          break;
        }

        // 応答があるかチェック
        if (content.length > 50 && !content.includes("分析中")) {
          console.log(`\n✅ Got response (${content.length} chars)`);
          console.log(`📄 Preview: ${content.substring(0, 300)}...`);
          responseReceived = true;
          break;
        }
      }
    }

    if (!responseReceived) {
      console.log("\n⚠️ Timeout or no response received");
    }

    // スクリーンショットを保存
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-full-screenshot.png",
      fullPage: true,
    });
    console.log("📸 Screenshot saved");

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
