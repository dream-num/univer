/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'node:fs';

const progress = [
    ['progress0', '@univerjs/icons-svg/single/edit/progress-0-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress25', '@univerjs/icons-svg/single/edit/progress-25-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress50', '@univerjs/icons-svg/single/edit/progress-50-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress75', '@univerjs/icons-svg/single/edit/progress-75-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],
    ['progress100', '@univerjs/icons-svg/single/edit/progress-100-single.svg', { black: '#7A7A7A', '#E5E5E5': '#7A7A7A' }],

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
const feedback2 = [
    ['mistake2', '@univerjs/icons-svg/single/edit/mistake-single.svg', { black: '#FE4B4B' }],
    ['warn2', '@univerjs/icons-svg/single/edit/warn-single.svg', { black: '#FFBD37' }],
    ['correct2', '@univerjs/icons-svg/single/edit/correct-single.svg', { black: '#59D01E' }],
];

const arrow = [
    ['down-red', '@univerjs/icons-svg/single/edit/arrow-down-single.svg', { black: '#FE4B4B' }],
    ['right-gold', '@univerjs/icons-svg/single/edit/arrow-righe-single.svg', { black: '#FFBD37' }],
    ['up-green', '@univerjs/icons-svg/single/edit/arrow-up-single.svg', { black: '#59D01E' }],
    ['rightAndDown-gold', '@univerjs/icons-svg/single/edit/arrow-tilt-down-single.svg', { black: '#FFBD37' }],
    ['rightAndUp-gold', '@univerjs/icons-svg/single/edit/arrow-tilt-up-single.svg', { black: '#FFBD37' }],

    ['down-gray', '@univerjs/icons-svg/single/edit/arrow-down-single.svg', { black: '#999999' }],
    ['right-gray', '@univerjs/icons-svg/single/edit/arrow-righe-single.svg', { black: '#999999' }],
    ['up-gray', '@univerjs/icons-svg/single/edit/arrow-up-single.svg', { black: '#999999' }],
    ['rightAndDown-gray', '@univerjs/icons-svg/single/edit/arrow-tilt-down-single.svg', { black: '#999999' }],
    ['rightAndUp-gray', '@univerjs/icons-svg/single/edit/arrow-tilt-up-single.svg', { black: '#999999' }],
];
const flag = [
    ['flag-green', '@univerjs/icons-svg/single/edit/flag-single.svg', { black: '#59D01E' }],
    ['flag-gold', '@univerjs/icons-svg/single/edit/flag-single.svg', { black: '#FFBD37' }],
    ['flag-red', '@univerjs/icons-svg/single/edit/flag-single.svg', { black: '#FE4B4B' }],
];

const shape = [
    ['cross', '@univerjs/icons-svg/single/edit/cross-single.svg', { black: '#FFBD37' }],
    ['up', '@univerjs/icons-svg/single/edit/up-single.svg', { black: '#59D01E' }],
    ['down', '@univerjs/icons-svg/single/edit/down-single.svg', { black: '#FE4B4B' }],

    ['rhomboid-red', '@univerjs/icons-svg/single/edit/rhomboid-single.svg', { black: '#FE4B4B' }],
    ['rhomboid-gold', '@univerjs/icons-svg/single/edit/rhomboid-single.svg', { black: '#FFBD37' }],
    ['roundness-greed', '@univerjs/icons-svg/single/edit/roundness-single.svg', { black: '#59D01E' }],
    ['roundness-gold', '@univerjs/icons-svg/single/edit/roundness-single.svg', { black: '#FFBD37' }],
    ['roundness-red', '@univerjs/icons-svg/single/edit/roundness-single.svg', { black: '#FE4B4B' }],
    ['roundness-pink', '@univerjs/icons-svg/single/edit/roundness-single.svg', { black: '#FB9D9D' }],
    ['roundness-gray', '@univerjs/icons-svg/single/edit/roundness-single.svg', { black: '#999999' }],
    ['roundness-black', '@univerjs/icons-svg/single/edit/roundness-single.svg'],
    ['triangle-gold', '@univerjs/icons-svg/single/edit/triangle-single.svg', { black: '#FFBD37' }],

    ['indicate-greed', '@univerjs/icons-svg/binary/start-page/indicate.svg', { '#E5E5E5': '#59D01E' }],
    ['indicate-gold', '@univerjs/icons-svg/binary/start-page/indicate.svg', { '#E5E5E5': '#FFBD37' }],
    ['indicate-red', '@univerjs/icons-svg/binary/start-page/indicate.svg', { '#E5E5E5': '#FE4B4B' }],

];

const cell = [
    ['cell-0', '@univerjs/icons-svg/binary/start-page/cell-0.svg', { white: '#0493EE', black: '#0493EE' }],
    ['cell-25', '@univerjs/icons-svg/binary/start-page/cell-25.svg', { white: '#0493EE', black: '#0493EE' }],
    ['cell-50', '@univerjs/icons-svg/binary/start-page/cell-50.svg', { white: '#0493EE', black: '#0493EE' }],
    ['cell-75', '@univerjs/icons-svg/binary/start-page/cell-75.svg', { white: '#0493EE', black: '#0493EE' }],
    ['cell-100', '@univerjs/icons-svg/binary/start-page/cell-100.svg', { white: '#0493EE', black: '#0493EE' }],

];

function replaceFillAndConvertToBase64(filePath, replaceMap) {
    try {
        let svgContent = fs.readFileSync(filePath, 'utf8');
        if (replaceMap) {
            for (const key in replaceMap) {
                svgContent = svgContent.replace(new RegExp(`"${key}"`, 'g'), `"${replaceMap[key]}"`);
            }
        }

        const base64Encoded = encodeURIComponent(svgContent);
        return base64Encoded;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function runTask() {
    const base64EncodedSVGs = {};
    const obj = { feedback, star, progress, signal, feeling, arrow, shape, feedback2, flag, cell };
    for (const iconType in obj) {
        const list = obj[iconType];
        const map = {};
        base64EncodedSVGs[iconType] = map;
        for (const element of list) {
            const [key, path, replaceMap] = element;
            const base64 = replaceFillAndConvertToBase64(`./node_modules/${path}`, replaceMap);
            map[key] = `data:image/svg+xml;charset=utf-8,${base64}`;
        }
    }

    if (!fs.existsSync('./src/assets')) {
        fs.mkdirSync('./src/assets');
    }

    fs.writeFileSync('./src/assets/icon-map.json', `${JSON.stringify(base64EncodedSVGs, null, 4)}\n`);
};

runTask();
