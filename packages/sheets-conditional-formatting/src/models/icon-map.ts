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

import type { LocaleKey } from '../locale/types';
import { ICON_MAP } from '../assets/icon-map';

export enum IIconSetType {
    threeArrows = '3Arrows',
    threeArrowsGray = '3ArrowsGray',
    fourArrows = '4Arrows',
    fourArrowsGray = '4ArrowsGray',
    fiveArrows = '5Arrows',
    fiveArrowsGray = '5ArrowsGray',
    threeTriangles = '3Triangles',
    threeTrafficLights1 = '3TrafficLights1',
    threeSigns = '3Signs',
    threeTrafficLights2 = '3TrafficLights2',
    fourRedToBlack = '4RedToBlack',
    fourTrafficLights = '4TrafficLights',
    threeSymbols = '3Symbols',
    threeSymbols2 = '3Symbols2',
    threeFlags = '3Flags',
    fourRating = '4Rating',
    fiveRating = '5Rating',
    fiveQuarters = '5Quarters',
    fiveFelling = '_5Felling',
    fiveBoxes = '5Boxes',
    threeStars = '3Stars',
    empty = 'EMPTY_ICON_TYPE',
}

export const iconGroup: { title: LocaleKey; group: { name: IIconSetType; list: string[] }[] }[] = [
    {
        title: 'sheets-conditional-formatting.iconSet.direction',
        group: [
            {
                name: IIconSetType.threeArrows,
                list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['right-gold'], ICON_MAP.arrow['down-red']],
            },
            {
                name: IIconSetType.threeArrowsGray,
                list: [ICON_MAP.arrow['up-gray'], ICON_MAP.arrow['right-gray'], ICON_MAP.arrow['down-gray']],
            },
            {
                name: IIconSetType.fourArrows,
                list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['rightAndUp-gold'], ICON_MAP.arrow['rightAndDown-gold'], ICON_MAP.arrow['down-red']],
            },
            {
                name: IIconSetType.fourArrowsGray,
                list: [ICON_MAP.arrow['up-gray'], ICON_MAP.arrow['rightAndUp-gray'], ICON_MAP.arrow['rightAndDown-gray'], ICON_MAP.arrow['down-gray']],
            },
            {
                name: IIconSetType.fiveArrows,
                list: [ICON_MAP.arrow['up-green'], ICON_MAP.arrow['rightAndUp-gold'], ICON_MAP.arrow['right-gold'], ICON_MAP.arrow['rightAndDown-gold'], ICON_MAP.arrow['down-red']],
            },
            {
                name: IIconSetType.fiveArrowsGray,
                list: [ICON_MAP.arrow['up-gray'], ICON_MAP.arrow['rightAndUp-gray'], ICON_MAP.arrow['right-gray'], ICON_MAP.arrow['rightAndDown-gray'], ICON_MAP.arrow['down-gray']],
            },
            {
                name: IIconSetType.threeTriangles,
                list: [ICON_MAP.shape.up, ICON_MAP.shape.cross, ICON_MAP.shape.down],
            },
        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.shape',
        group: [
            {
                name: IIconSetType.threeTrafficLights1,
                list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['roundness-gold'], ICON_MAP.shape['roundness-red']],
            },
            {
                name: IIconSetType.threeSigns,
                list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['triangle-gold'], ICON_MAP.shape['rhomboid-red']],
            },
            {
                name: IIconSetType.threeTrafficLights2,
                list: [ICON_MAP.shape['indicate-greed'], ICON_MAP.shape['indicate-gold'], ICON_MAP.shape['indicate-red']],
            },
            {
                name: IIconSetType.fourRedToBlack,
                list: [ICON_MAP.shape['roundness-red'], ICON_MAP.shape['roundness-pink'], ICON_MAP.shape['roundness-gray'], ICON_MAP.shape['roundness-black']],
            },
            {
                name: IIconSetType.fourTrafficLights,
                list: [ICON_MAP.shape['roundness-greed'], ICON_MAP.shape['roundness-gold'], ICON_MAP.shape['roundness-red'], ICON_MAP.shape['roundness-black']],
            },
        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.mark',
        group: [
            {
                name: IIconSetType.threeSymbols,
                list: [ICON_MAP.feedback.correct, ICON_MAP.feedback.warn, ICON_MAP.feedback.mistake],
            },
            {
                name: IIconSetType.threeSymbols2,
                list: [ICON_MAP.feedback2.correct2, ICON_MAP.feedback2.warn2, ICON_MAP.feedback2.mistake2],
            },
            {
                name: IIconSetType.threeFlags,
                list: [ICON_MAP.flag['flag-green'], ICON_MAP.flag['flag-gold'], ICON_MAP.flag['flag-red']],
            },

        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.rank',
        group: [
            {
                name: IIconSetType.fourRating,
                list: [ICON_MAP.signal.signal25, ICON_MAP.signal.signal50, ICON_MAP.signal.signal75, ICON_MAP.signal.signal100],
            },
            {
                name: IIconSetType.fiveRating,
                list: [ICON_MAP.signal.signal0, ICON_MAP.signal.signal25, ICON_MAP.signal.signal50, ICON_MAP.signal.signal75, ICON_MAP.signal.signal100],
            },
            {
                name: IIconSetType.fiveQuarters,
                list: [ICON_MAP.progress.progress100, ICON_MAP.progress.progress75, ICON_MAP.progress.progress50, ICON_MAP.progress.progress25, ICON_MAP.progress.progress0],
            },
            {
                name: IIconSetType.fiveFelling,
                list: [ICON_MAP.feeling.guffaw, ICON_MAP.feeling.smile, ICON_MAP.feeling.noninductive, ICON_MAP.feeling.dissatisfied, ICON_MAP.feeling.impatient],
            },
            {
                name: IIconSetType.fiveBoxes,
                list: [ICON_MAP.cell['cell-100'], ICON_MAP.cell['cell-75'], ICON_MAP.cell['cell-50'], ICON_MAP.cell['cell-25'], ICON_MAP.cell['cell-0']],
            },
            {
                name: IIconSetType.threeStars,
                list: [ICON_MAP.star.starFull, ICON_MAP.star.starIncomplete, ICON_MAP.star.starEmpty],
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
}, {} as Record<IIconSetType, string[]>);

for (const key in iconMap) {
    const v = iconMap[key as IIconSetType];
    Object.freeze(v);
}
