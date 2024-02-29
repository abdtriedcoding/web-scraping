// Scraping the news articles from my friends production level application.

const fs = require("fs");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scrapeNewsArticles() {
  try {
    console.log("Starting the scraping process...");

    const browser = await puppeteer.launch({ headless: "old" });
    const page = await browser.newPage();

    await page.goto("https://dnnews.in", { waitUntil: "domcontentloaded" });

    // Get the HTML content of the page
    const content = await page.content();

    // Load the HTML content into Cheerio
    const $ = cheerio.load(content);

    // Get all articles
    const articles = $("li[itemtype='https://schema.org/NewsArticle']");

    const scrapedData = [];

    articles.each((i, element) => {
      // Extract data from the article
      const title = $(element).find("h2[itemprop='headline'] span").text();
      const date = new Date(
        $(element).find("p[itemprop='datePublished']").attr("datetime")
      ).toLocaleDateString();
      const category = $(element)
        .find("p[class='text-sm text-[#808080]']")
        .text();
      const imageUrl = $(element).find("img[itemprop='image']").attr("src");

      // Push data to the array
      scrapedData.push({
        title,
        date,
        category,
        imageUrl,
      });
    });

    // Output the data as JSON
    const jsonData = JSON.stringify(scrapedData, null, 2);
    console.log(scrapedData);

    // Save JSON data to a file
    fs.writeFileSync("scrapedData.json", jsonData, "utf-8");

    await browser.close();

    console.log("Scraping done! Data saved in 'scrapedData.json'");
  } catch (error) {
    console.error("An error occurred while scraping job articles:", error);
  }
}

scrapeNewsArticles();
