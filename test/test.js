const path = require('path');
const fs = require('fs');

const test = require('ava');
const puppeteer = require('puppeteer');
const childProcess = require("child_process");

let devServerProcess = null;

function startServer() {
    // Ideally we would use webpack dev server's NodeJS API to start the server, but I couldn't
    // get HMR to work in that case. So we will settle for just spawning the server in a separate process.
    const command = "npx webpack-dev-server --mode development --port 3333";
    devServerProcess = childProcess.exec(command, {cwd: __dirname}, (error, stdout, stderr) => {
        if (error) {
            console.error(`failed to launch dev server process; error: ${error}`);
        }
    });
}

test.before(async () => {
    global.browser = await puppeteer.launch({
        headless: true,         // default is true; set to false when debugging failed tests
        slowMo: 50,             // introduce a little delay between each operation
        dumpio: false,          // default is false; set to true when debugging failed tests
        args: ['--no-sandbox']  // required for CI builds
    });
});

test.beforeEach(async t => {
    // TODO [kl] if we ever do multiple webpack tests, we will need to randomize the server listen port
    t.context.httpServer = startServer();
    t.context.serverUrl = 'http://127.0.0.1:3333';

    const page = await browser.newPage();

    // TODO [kl] get rid of the brittle sleep. find a better way
    // a one-second delay on my computer is fine, but CircleCI needs more than that.
    console.log("wait for the server to be ready");
    await page.waitFor(5000);
    console.log("done sleeping");

    page.on('pageerror', error => {
        console.log("BROWSER: uncaught exception: " + error);
    });
    page.on('requestfailed', request => {
        console.log("BROWSER: request failed: " + request.url());
    });
    page.on('response', response => {
        if (!response.ok())
            console.error("BROWSER: response: " + response.url() + " " + response.status());
    });
    t.context.page = page;
});

test.afterEach(async t => {
    await t.context.page.close();
});

test.afterEach.always(async t => {
    devServerProcess.kill()
});


test.after.always(async () => {
    if (typeof browser !== "undefined") {
        // normally browser will be defined, but it might not be if a `before` hook failed
        await browser.close();
    }
});


/*
    AVA tests are run concurrently in separate processes. This is good because
    each integration test is slow. But you must also be careful to isolate
    the tests (especially files on disk)!
*/


test('webpack HMR', async t => {
    const page = t.context.page;
    await page.goto(t.context.serverUrl);

    await checkCodeVersion(t, page, "v1");
    await stepTheCounter(t, page, 1);
    await modifyElmCode(t, page, "v1", "v2");
    await stepTheCounter(t, page, 2);
    await modifyElmCode(t, page, "v2", "v3");
    await stepTheCounter(t, page, 3);
    await stepTheCounter(t, page, 4);
    await modifyElmCode(t, page, "v3", "v4");
    await stepTheCounter(t, page, 5);
    await stepTheCounter(t, page, 6);
    await stepTheCounter(t, page, 7);
    await modifyElmCode(t, page, "v4", "v5");
    await stepTheCounter(t, page, 8);

    // HACK: manually restore the pristine state. This will have to do until we have
    // a cleaner way to isolate the test from the Main.elm checked in to source control.
    // TODO [kl] cleanup
    await modifyElmCode(t, page, "v5", "v1");
});


// TEST BUILDING BLOCKS


async function stepTheCounter(t, page, expectedPost, selectorScope = "") {
    await incrementCounter(page, selectorScope);
    t.is(await getCounterValue(page, selectorScope), expectedPost);
}

async function modifyElmCode(t, page, oldVersion, newVersion, selectorScope = "") {
    const pathToElmCode = path.join(__dirname, `./src/Main.elm`);
    const elmCode = fs.readFileSync(pathToElmCode, {encoding: "utf8"});
    const originalFragment = `[ text "code: ${oldVersion}" ]`;
    const modifiedFragment = `[ text "code: ${newVersion}" ]`;
    const newElmCode = elmCode.replace(originalFragment, modifiedFragment);
    if (newElmCode === elmCode) {
        throw Error("Failed to modify the compiled Elm code on disk: pattern not found");
    }
    fs.writeFileSync(pathToElmCode, newElmCode);
    // console.log("Finished writing to the compiled Elm file on disk");
    await page.waitFor(2 * 1000);
    // console.log("done sleeping");

    await checkCodeVersion(t, page, newVersion, selectorScope);
}


// ELM COUNTER MANIPULATION


// these must match the ids used in the Elm counter example program
const buttonId = "#counter-button";
const valueId = "#counter-value";
const codeVersionId = "#code-version";

async function incrementCounter(page, selectorScope = "") {
    // console.log("Stepping the counter " + selectorScope);
    await page.click(selectorScope + buttonId, {delay: 10});
}

async function getCounterValue(page, selectorScope = "") {
    const value = await page.$eval(selectorScope + valueId, el => parseInt(el.innerText));
    // console.log("Current counter value is " + value);
    return value;
}

async function checkCodeVersion(t, page, expectedVersion, selectorScope = "") {
    const value = await page.$eval(selectorScope + codeVersionId, el => el.innerText);
    // console.log("Current code version is " + value);
    t.is(value, `code: ${expectedVersion}`);
    return value;
}
