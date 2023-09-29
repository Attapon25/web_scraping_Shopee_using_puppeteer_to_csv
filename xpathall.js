const puppeteer = require('puppeteer');
const fs = require('fs');
const startUrl = 'https://shopee.co.th/search?keyword=%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B8%99%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%A3%E0%B8%A3%E0%B8%A0%E0%B9%8C&is_from_login=true';
const browserOptions = {
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
    ignoreDefaultArgs: ['--enable-automation'],
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
};

const main = async() => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const cookies = require('C:\\Users\\MYPC\\Desktop\\project\\scraping\\shopee.co.th.cookies.json');

    // Set the cookies in the Puppeteer page
    await page.setCookie(...cookies);
    await page.goto(startUrl);
    await page.waitForTimeout(3000);
    // cilck .col-xs-2-4
    await page.click('.sYzQJQ');
    await page.waitForTimeout(27000);

    const data = [];

    const numRows = 30;
    for (let i = 1; i <= numRows; i++) {
        const row = [];

        // Product name
        const productNameXPath = `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[1]`;
        const productNameElement = await page.$x(productNameXPath);
        if (productNameElement.length > 0) {
            const productName = await (await productNameElement[0].getProperty('textContent')).jsonValue();
            row.push(productName);
        } else {
            row.push('');
        }
        const fullPriceXPath = `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[2]/div[1]`;
        const startPriceXPath1 = `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[2]/div[2]`;
        const startPriceXPath2 = `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[2]/div[1]`;

        const fullPriceElement = await page.$x(fullPriceXPath);
        const startPriceElement1 = await page.$x(startPriceXPath1);
        const startPriceElement2 = await page.$x(startPriceXPath2);

        let fullPrice = '';
        let startPrice = '';
        let highPrice = '';

        if (fullPriceElement.length > 0) {

            const spanText = await (await fullPriceElement[0].getProperty('textContent')).jsonValue();
            const cleanedText = spanText.replace(/\s/g, '').replace(/,/g, '');
            fullPrice = cleanedText;

            const priceParts = cleanedText.split('-');
            if (priceParts.length > 1) {
                fullPrice = priceParts[0].trim(); // Get the text before "-"

            }
        }

        // get start price
        if (startPriceElement1.length > 0) {
            const spanText = await (await startPriceElement1[0].getProperty('textContent')).jsonValue();
            const cleanedText = spanText.replace(/\s/g, '').replace(/,/g, '');
            startPrice = cleanedText;

            const priceParts = cleanedText.split('-');
            if (priceParts.length > 1) {
                startPrice = priceParts[0].trim(); // Get the text before "-"
                highPrice = priceParts[1].trim(); // Get the text after "-"
            }
        } else if (startPriceElement2.length > 0) {
            const spanText = await (await startPriceElement2[0].getProperty('textContent')).jsonValue();
            const cleanedText = spanText.replace(/\s/g, '').replace(/,/g, '');
            startPrice = cleanedText;

            const priceParts = cleanedText.split('-');
            if (priceParts.length > 1) {
                startPrice = priceParts[0].trim(); // Get the text before "-"
                highPrice = priceParts[1].trim(); // Get the text after "-"
            }
        }

        if (fullPrice !== startPrice) {
            startPrice += ' On sale';
        }
        row.push(fullPrice);
        row.push(startPrice);
        row.push(highPrice);

        // Other attributes (Sold and Location)
        const attributeXPaths = [
            `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[3]/div[2]`, // Sold
            `/html/body/div[1]/div/div[2]/div/div/div[2]/div/div[2]/div[${i}]/a/div/div/div[2]/div[4]`, // Location
        ];

        for (let j = 0; j < attributeXPaths.length; j++) {
            const attributeXPath = attributeXPaths[j];
            const attributeElement = await page.$x(attributeXPath);
            if (attributeElement.length > 0) {
                const attributeValue = await (await attributeElement[0].getProperty('textContent')).jsonValue();
                row.push(attributeValue);
            } else {
                row.push('');
            }
        }

        data.push(row);
    }


    // Save the data to a CSV file
    const csvData = data.map(row => row.join(',')).join('\n');
    fs.writeFileSync('shopee_data_test_final.csv', '\uFEFF' + `Product,Full Price,Start Price,High Price,Sold,Location\n${csvData}`, 'utf-8');

    console.log('Data has been saved to shopee_data_test.csv');

    await browser.close();
};

main();