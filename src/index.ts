import puppeteer from "puppeteer";
import fs from "fs";

async function writeDataToFile(): Promise<void> {
  const urlsArray = await getCompaniesData(urls);

  fs.writeFile("companies_data.json", JSON.stringify(urlsArray), "utf-8", (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
}

async function getCompaniesData(urls: string[]): Promise<companiesData[]> {
  const browser = await puppeteer.launch({ headless: "new" });
  const websiteWithReact: companiesData[] = [];

  for (const url of urls) {
    const page = await browser.newPage();
    await page.goto(url);

    const isReactOrNext = await page.evaluate(() => {
      if (
        !!window.React ||
        !!document.querySelector("[data-reactroot], [data-reactid]")
      )
        return true;

      if (!!document.querySelector("script[id=__NEXT_DATA__]")) return true;

      return false;
    });

    console.log(`${url} is built with React or NextJS: ${isReactOrNext}`);
    websiteWithReact.push({ url, isReactOrNext });

    await page.close();
  }
  await browser.close();
  return websiteWithReact;
}

const urls = [
  "https://www.2caresaude.com.br/",
  "https://react.dev/blog/2023/03/16/introducing-react-dev",
];

interface companiesData {
  url: string;
  isReactOrNext: boolean;
}

try {
  writeDataToFile();
} catch (error) {
  console.log(error);
}
