'use strict'

/**
 * Code adapted from:
 * http://blogs.msdn.com/b/dawate/archive/2009/06/24/intro-to-audio-programming-part-3-synthesizing-simple-wave-audio-using-c.aspx
 */

const Readable = require('stream').Readable;
const bufferAlloc = require('buffer-alloc');
const Speaker = require('speaker');

function play() {
// the frequency to play
    const freq = 440.0 // Concert A, default tone

// seconds worth of audio data to generate before emitting "end"
    const duration = 1.5

    console.log('generating a %dhz sine wave for %d seconds', freq, duration)

// A SineWaveGenerator readable stream
    const sine = new Readable()
    sine.bitDepth = 16
    sine.channels = 2
    sine.sampleRate = 44100
    sine.samplesGenerated = 0
    sine._read = read

// create a SineWaveGenerator instance and pipe it to the speaker
    sine.pipe(new Speaker())

// the Readable "_read()" callback function
    function read(n) {
        const sampleSize = this.bitDepth / 8
        const blockAlign = sampleSize * this.channels
        const numSamples = n / blockAlign | 0
        const buf = bufferAlloc(numSamples * blockAlign)
        const amplitude = 32760 // Max amplitude for 16-bit audio

        // the "angle" used in the function, adjusted for the number of
        // channels and sample rate. This value is like the period of the wave.
        const t = (Math.PI * 2 * freq) / this.sampleRate

        for (let i = 0; i < numSamples; i++) {
            // fill with a simple sine wave at max amplitude
            for (let channel = 0; channel < this.channels; channel++) {
                const s = this.samplesGenerated + i
                const val = Math.round(amplitude * Math.sin(t * s)) // sine wave
                const offset = (i * sampleSize * this.channels) + (channel * sampleSize)
                buf[`writeInt${this.bitDepth}LE`](val, offset)
            }
        }

        this.push(buf)

        this.samplesGenerated += numSamples
        if (this.samplesGenerated >= this.sampleRate * duration) {
            // after generating "duration" second of audio, emit "end"
            this.push(null)
        }
    }
}

const fetch = require('node-fetch');

async function monitor() {
    const resp = await fetch("https://ticket.railway.ge/Home/GetFreePlaces?IsBack=false&LeavingDateBack=2021.08.18&leavingDate=2021.08.21&stationFrom=57151&stationTo=56014", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "Cookie": "_ga=GA1.2.1181063491.1629025497; _fbp=fb.1.1629025497490.2034967977; _culture=en-US; __RequestVerificationToken=hr59I8hCPX-cbVpCnuii173oZY0OlcsGPA7ayGhx1tHpUAVhtVyDbQtwCHBRE0XtXeHSSBraD-BBFWOEHz8VHS6tesSq3X1fARatadonTUY1; BIGipServerTickets_pool=572726444.48139.0000; TS01fbb3c2=016d34b54c3a5e35bd60767468745f07c0d598ef67aca3ec3a5dc9cd5f68d7742b465274f10a716b9b65233ce7e114af4959c9111c4c761310b57ece5d3f64a2cb90fba4107d2218273458a57f317df60b1303ce80a7d8bad0417ccdf13f85e5e39f2219f205db3b6293928d31deda64b08473c52f7360cdbf0e4b447dbcc15c401fa87211681eda01268fcf17c79e68dd6fbc61af789f7fe5b2c6d1e7dfd9c9b96a9d66140d544d978dac100040ef6c174d42631a836220df4a2e3344107167847419437a; .ASPXAUTH=B357E7BDB1843EDFC3450DA904A3EED8A07DD2A4469A5B98A96F3D6BC8B9747560D30EF0C6B7E9625CAA25FCA46AFDD6769C34B19387DB2B8F24F9E1D7B84E69B0BBD6B4C97AF6280BD6BF0F6EAFF2790C1218BFAC224D55A88825ABA97365205AB060EC2906E00D071B46EC4C88E0E4; ASP.NET_SessionId=nde4cf4u4vj4tbg11rdhx0yd; ADRUM_BTa=R:36|g:9e85f435-4afd-495d-9177-584b82a95b2b|n:georailway_acb90f64-080f-45ab-8851-aaad80511b76; SameSite=None; ADRUM_BT1=R:36|i:3653575|e:130",
        },
        "referrer": "https://ticket.railway.ge/Home/Index",
        "method": "GET",
        "mode": "cors"
    });

    let data = await resp.json();
    const accepted = [801];
    const interesting = data.freeplaces.filter(t => accepted.includes(t.TrainNumber));

    if (interesting.length) {
        interesting.forEach(i => console.log(i));
        play();
    } else {
        console.log('No results,', data.freeplaces.map(t => t.TrainNumber));
    }
}
monitor();

setInterval(async () => {
    await monitor();
}, 20000);
