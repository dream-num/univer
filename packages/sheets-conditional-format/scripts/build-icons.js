const { Buffer } = require('node:buffer');
const fs = require('node:fs').promises;
const sharp = require('sharp');

const progress = [
    ['progress0', '@univerjs/icons-svg/single/start-page/progress-0-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress25', '@univerjs/icons-svg/single/start-page/progress-25-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress50', '@univerjs/icons-svg/single/start-page/progress-50-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress75', '@univerjs/icons-svg/single/start-page/progress-75-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress100', '@univerjs/icons-svg/single/start-page/progress-100-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],

];
const star = [
    ['starEmpty', '@univerjs/icons-svg/binary/start-page/star-empty.svg', { black: '#FFBD37', '#E5E5E5': '#fff' }],
    ['starIncomplete', '@univerjs/icons-svg/binary/start-page/star-incomplete.svg', { black: '#FFBD37', '#E5E5E5': '#fff' }],
    ['starFull', '@univerjs/icons-svg/binary/start-page/star-full.svg', { black: '#FFBD37', '#E5E5E5': '#fff' }],
];
const feeling = [
    ['guffaw', '@univerjs/icons-svg/binary/start-page/guffaw.svg', { black: '#8F5F00', '#E5E5E5': '#FFBD37' }],
    ['smile', '@univerjs/icons-svg/binary/start-page/smile.svg', { black: '#8F5F00', '#E5E5E5': '#FFBD37' }],
    ['noninductive', '@univerjs/icons-svg/binary/start-page/noninductive.svg', { black: '#8F5F00', '#E5E5E5': '#FFBD37' }],
    ['dissatisfied', '@univerjs/icons-svg/binary/start-page/dissatisfied.svg', { black: '#8F5F00', '#E5E5E5': '#FFBD37' }],
    ['impatient', '@univerjs/icons-svg/binary/start-page/impatient.svg', { black: '#8F5F00', '#E5E5E5': '#FFBD37' }],
];

const signal = [
    ['signal0', '@univerjs/icons-svg/binary/start-page/signal-0.svg', { black: '#0493EE' }],
    ['signal25', '@univerjs/icons-svg/binary/start-page/signal-25.svg', { black: '#0493EE' }],
    ['signal50', '@univerjs/icons-svg/binary/start-page/signal-50.svg', { black: '#0493EE' }],
    ['signal75', '@univerjs/icons-svg/binary/start-page/signal-75.svg', { black: '#0493EE' }],
    ['signal100', '@univerjs/icons-svg/binary/start-page/signal-100.svg', { black: '#0493EE' }],
];
const feedback = [
    ['mistake', '@univerjs/icons-svg/binary/start-page/mistake.svg', { black: '#FE4B4B', '#E5E5E5': '#FFFFFF' }],
    ['warn', '@univerjs/icons-svg/binary/start-page/warn.svg', { black: '#FFBD37', '#E5E5E5': '#FFFFFF' }],
    ['correct', '@univerjs/icons-svg/binary/start-page/correct.svg', { black: '#59D01E', '#E5E5E5': '#FFFFFF' }],
];

const arrow = [
    ['redDown', '@univerjs/icons-svg/single/start-page/arrow-down-single.svg', { black: '#FE4B4B' }],
    ['goldRight', '@univerjs/icons-svg/single/start-page/arrow-righe-single.svg', { black: '#FFBD37' }],
    ['greenUp', '@univerjs/icons-svg/single/start-page/arrow-up-single.svg', { black: '#59D01E' }],
    ['goldRightAndDown', '@univerjs/icons-svg/single/start-page/arrow-tilt-down-single.svg', { black: '#FFBD37' }],
    ['goldRightAndUp', '@univerjs/icons-svg/single/start-page/arrow-tilt-up-single.svg', { black: '#FFBD37' }],
];

const shape = [
    ['cross', '@univerjs/icons-svg/single/start-page/cross-single.svg', { black: '#FFBD37' }],
    ['up', '@univerjs/icons-svg/single/start-page/up-single.svg', { black: '#59D01E' }],
    ['down', '@univerjs/icons-svg/single/start-page/down-single.svg', { black: '#FE4B4B' }],
];

async function replaceFillAndConvertToBase64(filePath, replaceMap) {
    try {
        let svgContent = await fs.readFile(filePath, 'utf8');
        if (replaceMap) {
            for (const key in replaceMap) {
                svgContent = svgContent.replace(new RegExp(`"${key}"`, 'g'), `"${replaceMap[key]}"`);
            }
        }

        const base64Encoded = await sharp(Buffer.from(svgContent)).resize(72)
            .png({ progressive: true, compressionLevel: 0 })
            .toBuffer()
            .then((pngBuffer) => pngBuffer.toString('base64'));

        return base64Encoded;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
const runTask = async () => {
    const base64EncodedSVGs = {};
    const obj = { feedback, star, progress, signal, feedback, feeling, arrow, shape };
    for (const iconType in obj) {
        const list = obj[iconType];
        const map = {};
        base64EncodedSVGs[iconType] = map;
        for (let index = 0; index < list.length; index++) {
            const [key, path, replaceMap] = list[index];
            const base64 = await replaceFillAndConvertToBase64(`./node_modules/${path}`, replaceMap);
            map[key] = `data:image/png;base64,${base64}`;
        }
    }

    fs.writeFile('./src/assets/icon-map.json', JSON.stringify(base64EncodedSVGs, null, 4), 'utf8');
};
runTask();
