/**
 * Copyright 2023-present DreamNum Inc.
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

import ICON_MAP from '../assets/icon-map.json';

export type IIconItem = string;

export const iconGroup: { title: string;group: { name: string;list: string[] }[] }[] = [
    {
        title: 'sheet.cf.iconSet.direction',
        group: [
            { name: '3Arrows', list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['right-gold'], ICON_MAP.arrow['down-red']] },
            { name: '_3Shape', list: [ICON_MAP.shape.up, ICON_MAP.shape.cross, ICON_MAP.shape.down] },
            { name: '4Arrows', list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['rightAndUp-gold'], ICON_MAP.arrow['rightAndDown-gold'], ICON_MAP.arrow['down-red']] },
            { name: '5Arrows', list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['rightAndUp-gold'], ICON_MAP.arrow['right-gold'], ICON_MAP.arrow['rightAndDown-gold'], ICON_MAP.arrow['down-red']] },
        ],

    },
    {
        title: 'sheet.cf.iconSet.shape',
        group: [
            {
                name: '3TrafficLights1', list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['roundness-gold'], ICON_MAP.shape['roundness-red']],
            },
            {
                name: '3Signs', list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['triangle-gold'], ICON_MAP.shape['rhomboid-red']],
            },
            {
                name: '4RedToBlack', list: [ICON_MAP.shape['roundness-red'], ICON_MAP.shape['roundness-pink'], ICON_MAP.shape['roundness-gray'], ICON_MAP.shape['roundness-black']],
            },
            {
                name: '4TrafficLights', list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['roundness-gold'], ICON_MAP.shape['roundness-red'], ICON_MAP.shape['roundness-black']],
            },
            { name: '_3Indicate', list: [ICON_MAP.shape['indicate-greed'], ICON_MAP.shape['indicate-gold'], ICON_MAP.shape['indicate-red']] },
        ],
    },
    {
        title: 'sheet.cf.iconSet.mark',
        group: [
            {
                name: '3Symbols', list: [ICON_MAP.feedback.correct, ICON_MAP.feedback.warn, ICON_MAP.feedback.mistake],
            },
            {
                name: '3Symbols2', list: [ICON_MAP.feedback2.correct2, ICON_MAP.feedback2.warn2, ICON_MAP.feedback2.mistake2],
            },
            {
                name: '3Flags', list: [ICON_MAP.flag['flag-green'], ICON_MAP.flag['flag-gold'], ICON_MAP.flag['flag-red']],
            },

        ],
    },
    {
        title: 'sheet.cf.iconSet.rank',
        group: [
            {
                name: '3Stars', list: [ICON_MAP.star.starEmpty, ICON_MAP.star.starIncomplete, ICON_MAP.star.starFull],
            },
            {
                name: '5Quarters', list: [ICON_MAP.progress.progress0, ICON_MAP.progress.progress25, ICON_MAP.progress.progress50, ICON_MAP.progress.progress75, ICON_MAP.progress.progress100],
            },
            {
                name: '5Rating', list: [ICON_MAP.feeling.guffaw, ICON_MAP.feeling.smile, ICON_MAP.feeling.noninductive, ICON_MAP.feeling.dissatisfied, ICON_MAP.feeling.impatient],
            },
            {
                name: '_5Rating2', list: [ICON_MAP.signal.signal0, ICON_MAP.signal.signal25, ICON_MAP.signal.signal50, ICON_MAP.signal.signal75, ICON_MAP.signal.signal100],
            },
            {
                name: '_5Rating3', list: [ICON_MAP.cell['cell-0'], ICON_MAP.cell['cell-25'], ICON_MAP.cell['cell-50'], ICON_MAP.cell['cell-75'], ICON_MAP.cell['cell-100']],
            },
        ],
    },
];

export const iconMap = iconGroup.reduce((result, cur) => {
    const { group } = cur;
    for (const v of group) {
        result[v.name] = v.list;
    }
    return result;
}, {} as Record<string, string[]>);
export type IIconType = keyof typeof iconMap;

for (const key in iconMap) {
    const v = iconMap[key as IIconType];
    Object.freeze(v);
}
export const EMPTY_ICON_TYPE = 'EMPTY_ICON_TYPE';
