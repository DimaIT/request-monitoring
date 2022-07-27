import fetch from 'node-fetch';
import { play } from "./audio.js";

const INTERVAL = 40_000; // ms

let lastStatus = null;

async function check() {
    const resp = await fetch("https://www.ticketswap.com/rammstein-ostend-4-augustus-2022", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/103.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1"
        },
        "method": "GET",
        "mode": "cors"
    });

    const rawData = await resp.text();
    const count = rawData.match(/>0<\//g)?.length;

    if (typeof count !== 'number') {
        console.log(rawData)
        console.log('\nUnexpected data, abort');
        process.exit();
    } else if (count < 4) {
        console.log('\n\nSlot available!!!!', count);
        console.log("https://www.ticketswap.com/rammstein-ostend-4-augustus-2022");
        play();
    }

    const matches = [...rawData.matchAll(/(\d+)<\/span><h6[^>]*>([^<]*)<\/h6>/g)];
    const status = matches.map(match => `${match[1]} - ${match[2]}`).join('; ');

    if (status !== lastStatus) {
        console.log(new Date(), status);
        lastStatus = status;
    }
}

(function monitor() {
    check();
    const next = randomize(INTERVAL);
    setTimeout(monitor, next);
})()

function randomize(base) {
    const variable = (Math.random() - 0.5) * base * 0.4;
    return base + variable
}
