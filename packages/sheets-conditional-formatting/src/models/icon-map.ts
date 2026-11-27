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
import { iconUrls } from '../assets/icon-map';
import { conditionalFormattingIconPresets } from './conditional-formatting-icon-presets';

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

type IconPresetKey = keyof typeof conditionalFormattingIconPresets;

export interface IConditionalFormattingIcon {
    name: (typeof conditionalFormattingIconPresets)[IconPresetKey]['name'];
    colors?: Record<string, string>;
}

const groups: { title: LocaleKey; group: { name: IIconSetType; list: IconPresetKey[] }[] }[] = [
    {
        title: 'sheets-conditional-formatting.iconSet.direction',
        group: [
            {
                name: IIconSetType.threeArrows,
                list: ['upGreen', 'rightGold', 'downRed'],
            },
            {
                name: IIconSetType.threeArrowsGray,
                list: ['upGray', 'rightGray', 'downGray'],
            },
            {
                name: IIconSetType.fourArrows,
                list: ['upGreen', 'rightAndUpGold', 'rightAndDownGold', 'downRed'],
            },
            {
                name: IIconSetType.fourArrowsGray,
                list: ['upGray', 'rightAndUpGray', 'rightAndDownGray', 'downGray'],
            },
            {
                name: IIconSetType.fiveArrows,
                list: ['upGreen', 'rightAndUpGold', 'rightGold', 'rightAndDownGold', 'downRed'],
            },
            {
                name: IIconSetType.fiveArrowsGray,
                list: ['upGray', 'rightAndUpGray', 'rightGray', 'rightAndDownGray', 'downGray'],
            },
            {
                name: IIconSetType.threeTriangles,
                list: ['up', 'cross', 'down'],
            },
        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.shape',
        group: [
            {
                name: IIconSetType.threeTrafficLights1,
                list: ['roundnessGreen', 'roundnessGold', 'roundnessRed'],
            },
            {
                name: IIconSetType.threeSigns,
                list: ['roundnessGreen', 'triangleGold', 'rhomboidRed'],
            },
            {
                name: IIconSetType.threeTrafficLights2,
                list: ['indicateGreen', 'indicateGold', 'indicateRed'],
            },
            {
                name: IIconSetType.fourRedToBlack,
                list: ['roundnessRed', 'roundnessPink', 'roundnessGray', 'roundnessBlack'],
            },
            {
                name: IIconSetType.fourTrafficLights,
                list: ['roundnessGreen', 'roundnessGold', 'roundnessRed', 'roundnessBlack'],
            },
        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.mark',
        group: [
            {
                name: IIconSetType.threeSymbols,
                list: ['correct', 'warn', 'mistake'],
            },
            {
                name: IIconSetType.threeSymbols2,
                list: ['correct2', 'warn2', 'mistake2'],
            },
            {
                name: IIconSetType.threeFlags,
                list: ['flagGreen', 'flagGold', 'flagRed'],
            },

        ],
    },
    {
        title: 'sheets-conditional-formatting.iconSet.rank',
        group: [
            {
                name: IIconSetType.fourRating,
                list: ['signal25', 'signal50', 'signal75', 'signal100'],
            },
            {
                name: IIconSetType.fiveRating,
                list: ['signal0', 'signal25', 'signal50', 'signal75', 'signal100'],
            },
            {
                name: IIconSetType.fiveQuarters,
                list: ['progress100', 'progress75', 'progress50', 'progress25', 'progress0'],
            },
            {
                name: IIconSetType.fiveFelling,
                list: ['guffaw', 'smile', 'noninductive', 'dissatisfied', 'impatient'],
            },
            {
                name: IIconSetType.fiveBoxes,
                list: ['cell100', 'cell75', 'cell50', 'cell25', 'cell0'],
            },
            {
                name: IIconSetType.threeStars,
                list: ['starFull', 'starIncomplete', 'starEmpty'],
            },
        ],
    },
];

function resolveIconGroups<T>(presets: Record<IconPresetKey, T>) {
    return groups.map(({ title, group }) => ({
        title,
        group: group.map(({ name, list }) => {
            const icons = list.map((key) => presets[key]);
            Object.freeze(icons);
            return { name, list: icons };
        }),
    }));
}

export const conditionalFormattingIconGroups = resolveIconGroups<IConditionalFormattingIcon>(conditionalFormattingIconPresets);
export const conditionalFormattingIcons: Partial<Record<IIconSetType, IConditionalFormattingIcon[]>> = Object.fromEntries(
    conditionalFormattingIconGroups.flatMap(({ group }) => group.map(({ name, list }) => [name, list]))
);

export const iconGroup = resolveIconGroups(iconUrls);
export const iconMap = Object.fromEntries(
    iconGroup.flatMap(({ group }) => group.map(({ name, list }) => [name, list]))
) as Record<IIconSetType, string[]>;
