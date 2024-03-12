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

// Please run  postinstall,if  ICON_MAP is not build.
const objToArr = (o: Record<string, unknown>) => {
    const list = [];
    for (const kye in o) {
        const v = o[kye];
        list.push(v);
    }
    return list;
};
export const iconMap = {
    feedback: objToArr(ICON_MAP.feedback),
    feedback2: objToArr(ICON_MAP.feedbac2),
    star: objToArr(ICON_MAP.star),
    feeling: objToArr(ICON_MAP.feeling),
    progress: objToArr(ICON_MAP.progress),
    signal: objToArr(ICON_MAP.signal),
    arrow: objToArr(ICON_MAP.arrow),
    shape: objToArr(ICON_MAP.shape),
};
export type IIconType = keyof typeof iconMap;

for (const key in iconMap) {
    const v = iconMap[key as IIconType];
    Object.freeze(v);
}
