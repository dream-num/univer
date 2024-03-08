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
export const iconMap = {
    feedback: [ICON_MAP.feedback.mistake, ICON_MAP.feedback.warn, ICON_MAP.feedback.correct],
    star: [ICON_MAP.star.starEmpty, ICON_MAP.star.starIncomplete, ICON_MAP.star.starFull],
    feeling: [ICON_MAP.feeling.impatient, ICON_MAP.feeling.dissatisfied, ICON_MAP.feeling.noninductive, ICON_MAP.feeling.smile, ICON_MAP.feeling.guffaw],
    progress: [ICON_MAP.progress.progress0, ICON_MAP.progress.progress25, ICON_MAP.progress.progress50, ICON_MAP.progress.progress75, ICON_MAP.progress.progress100],
    signal: [ICON_MAP.signal.signal0, ICON_MAP.signal.signal25, ICON_MAP.signal.signal50, ICON_MAP.signal.signal75, ICON_MAP.signal.signal100],
    arrow: [ICON_MAP.arrow.goldRight, ICON_MAP.arrow.goldRightAndDown, ICON_MAP.arrow.goldRightAndUp, ICON_MAP.arrow.greenUp, ICON_MAP.arrow.redDown],
    shape: [ICON_MAP.shape.cross, ICON_MAP.shape.down, ICON_MAP.shape.up],
};
export type IIconType = keyof typeof iconMap;

for (const key in iconMap) {
    const v = iconMap[key as IIconType];
    Object.freeze(v);
}
