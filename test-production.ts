import { chromium } from "playwright";

async function test() {
  console.log("Testing production deployment...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 本番URLを開く
    console.log("Opening production URL...");
    await page.goto("https://web-hantakus-projects.vercel.app", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // 2. 現在のURL確認
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // 3. スクリーンショット
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-production.png",
      fullPage: true,
    });
    console.log("Screenshot saved");

    if (currentUrl.includes("/auth/login")) {
      console.log("✓ Redirected to login page (auth middleware working)");

      // Googleログインボタン確認
      const googleBtn = await page.locator("text=Googleでログイン").count();
      console.log(
        `✓ Google login button: ${googleBtn > 0 ? "Found" : "Not found"}`,
      );

      // Googleログインをクリック
      if (googleBtn > 0) {
        console.log("Clicking Google login button...");
        await page.click("text=Googleでログイン");
        await page.waitForTimeout(3000);

        const newUrl = page.url();
        console.log(`After click URL: ${newUrl}`);

        if (
          newUrl.includes("accounts.google.com") ||
          newUrl.includes("supabase")
        ) {
          console.log("✓ Google OAuth redirect working!");
        }

        await page.screenshot({
          path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-oauth.png",
          fullPage: true,
        });
        console.log("OAuth screenshot saved");
      }
    } else {
      console.log("Not redirected to login - checking for sidebar...");
      const sidebar = await page.locator("aside").count();
      console.log(`Sidebar: ${sidebar > 0 ? "Found" : "Not found"}`);
    }

    console.log("\n✓ Test completed!");
  } catch (error) {
    console.error("Test error:", error);
    await page.screenshot({
      path: "/Users/hantaku/Downloads/BuzzTeacher/web/test-error.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

test();
