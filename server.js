const express = require('express');
const puppeteer = require('puppeteer');

const server = express();

server.get('/', async (request, response) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Emular um dispositivo móvel para aumentar a compatibilidade
    await page.emulate(puppeteer.devices['iPhone X']);

    await page.goto('https://dailyremote.com/remote-jobs?search=Product%20Manager&page=1&location=worldwide#main');

    // Esperar até que haja uma alteração na URL ou até que o seletor '.job-item' seja carregado
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.waitForSelector('.profile-information', { timeout: 10000 }),
    ]);

    // Pegar os dados
    const pageContent = await page.evaluate(() => {
      const items = document.querySelectorAll('.profile-information');
      const subtitles = [];
      items.forEach(item => {
        subtitles.push(item.innerHTML);
      });

      return {
        subtitles: subtitles,
      };
    });

    console.log('pageContent:', pageContent);

    await browser.close();
    response.send(pageContent);
  } catch (error) {
    console.error('Erro ao carregar a página:', error);
    response.status(500).send({ error: 'Erro ao carregar a página' });
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Servidor subiu com sucesso! Acesse em http://localhost:${port}`);
});
