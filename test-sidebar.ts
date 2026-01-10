import { chromium } from "playwright";

async function test() {
  console.log("Testing sidebar UI...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. ローカルでテスト
    console.log("Opening localhost:3000...");
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle",
      timeout: 10000,
    });

    // 2. タイトル確認
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // 3. スクリーンショット
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-sidebar.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-sidebar.png");

    // 4. サイドバーがあるか確認
    const sidebar = await page.locator("aside").count();
    console.log(`Sidebar found: ${sidebar > 0 ? "Yes" : "No"}`);

    // 5. 新しいチャットボタンがあるか
    const newChatBtn = await page.locator("text=新しいチャット").count();
    console.log(`"新しいチャット" button: ${newChatBtn > 0 ? "Yes" : "No"}`);

    // 6. ログインページにリダイレクトされたか確認
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes("/auth/login")) {
      console.log("Redirected to login page (auth working!)");

      // Googleログインボタンがあるか
      const googleBtn = await page.locator("text=Googleでログイン").count();
      console.log(`Google login button: ${googleBtn > 0 ? "Yes" : "No"}`);
    }

    console.log("\nTest completed!");
  } catch (error) {
    console.error("Test error:", error);
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-sidebar-error.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

test();
