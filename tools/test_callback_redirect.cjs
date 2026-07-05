const puppeteer = require("puppeteer-core");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const BASE_URL = "http://localhost:8888";
const EDGE_EXECUTABLE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const queryParams = new URLSearchParams({
  capacity: "200 L",
  model: "Premium",
  location: "Casablanca",
  distance: "25",
  distanceBand: "0-50",
  installation: "toiture",
  standardPrice: "9490",
  payNowPrice: "8790",
  discount: "700",
  paymentMode: "payNow",
  fullName: "Test Client",
  phone: "0611223344",
  email: "test@example.com",
});

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_EXECUTABLE,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("https://api.web3forms.com/submit")) {
        if (request.method() === "OPTIONS") {
          request.respond({
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Accept, Content-Type",
            },
          });
          return;
        }
        request.respond({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ success: true }),
        });
        return;
      }
      request.continue();
    });

    const callbackUrl = `${BASE_URL}/rappel-avant-paiement.html?${queryParams.toString()}`;
    console.log("Opening callback form:", callbackUrl);
    await page.goto(callbackUrl, { waitUntil: "networkidle0" });

    await page.waitForSelector("#payment-information-form", { visible: true, timeout: 10000 });

    // Ensure visible fields are filled (hydration may already do this from query params).
    await page.type("#information-full-name", "Test Client", { delay: 10 });
    await page.type("#information-phone", "0611223344", { delay: 10 });

    console.log("Submitting callback form...");
    await Promise.all([
      page.click("#payment-information-form [type='submit']"),
      page.waitForFunction(() => {
        const modal = document.querySelector("#payment-success-modal");
        return modal && !modal.hidden;
      }, { timeout: 10000 }),
    ]);

    console.log("Success modal is open; closing it...");
    await page.click(".payment-success-modal__close");

    let finalHref = page.url();
    const start = Date.now();
    while (finalHref.includes("rappel-avant-paiement.html") && Date.now() - start < 15000) {
      await page.evaluate(() => new Promise((resolve) => window.setTimeout(resolve, 250)));
      finalHref = page.url();
    }

    const finalUrl = new URL(finalHref);
    const expectedPathname = "/paiement-virement-installation.html";

    if (finalUrl.pathname !== expectedPathname) {
      throw new Error(`Redirected to unexpected path: ${finalUrl.pathname}`);
    }

    const actualParams = Array.from(finalUrl.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
    const expectedParams = Array.from(queryParams.entries()).sort(([a], [b]) => a.localeCompare(b));

    if (JSON.stringify(actualParams) !== JSON.stringify(expectedParams)) {
      throw new Error(
        `Query params mismatch.\nExpected: ${JSON.stringify(expectedParams)}\nActual:   ${JSON.stringify(actualParams)}`,
      );
    }

    console.log("PASS: closing the success modal redirects to paiement-virement-installation.html with the same params.");
  } catch (error) {
    console.error("TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    process.exit();
  }
})();
