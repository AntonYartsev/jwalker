'use strict';

const puppeteer = require('puppeteer');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('service.proto');

const jwalker = grpc.loadPackageDefinition(packageDefinition).jwalker;

const args = process.argv.slice(2);

if (args.length == 0) {
    console.error("server type identifier not passed")
} else if (args[0] == 'grpc') {

    const host = process.env.GRPC_HOST || '0.0.0.0';
    const port = process.env.GRPC_PORT || '8080';

    const server = new grpc.Server();
    server.addService(jwalker.Parser.service, { parse: parse });
    server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });

    async function parse(call, callback) {
        try {
            var response = ""
            const browser = await puppeteer.launch({
                args: ['--no-sandbox'],
                headless: 'new',
            });
            const page = await browser.newPage();
            await page.goto(call.request.url);
            const data = await page.evaluate(() => document.querySelector('*').outerHTML);
            response = data;
            await browser.close();
            callback(null, { response: response });
        } catch (err) {
            callback(err);
        }
    }
} else {
    console.error("unknown server type identifier")
}

