'use strict';

const puppeteer = require('puppeteer');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('service.proto');
const Docker = require('dockerode');

const jwalker = grpc.loadPackageDefinition(packageDefinition).jwalker;
const docker = new Docker({socketPath: '/var/run/docker.sock'});

const args = process.argv.slice(2);

if (args.length == 0) {
    console.error("server type identifier not passed")
} else if (args[0] == 'grpc') {

    const host = process.env.GRPC_HOST || '0.0.0.0';
    const port = process.env.GRPC_PORT || '8080';

    const server = new grpc.Server();
    server.addService(jwalker.Parser.service, { parse: parse });
    server.addService(jwalker.System.service, { restart: restart });

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

    async function restart(call, callback) {
        console.log("restart")
        var containerName = args[1]
        const containers = await docker.listContainers();
        const containerInfo = containers.find(container => container.Names && container.Names[0] === `/${containerName}`);

        if (!containerInfo) {
          console.error('Container not found');
          return;
        }

        const container = docker.getContainer(containerInfo.Id);
        container.restart();
        callback(null);
    }
} else {
    console.error("unknown server type identifier")
}

