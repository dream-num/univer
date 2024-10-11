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

import { Tools } from '@univerjs/core';

import sheetsenUS from '@univerjs/sheets/locale/en-US';
import sheetsfaIR from '@univerjs/sheets/locale/fa-IR';
import sheetsruRU from '@univerjs/sheets/locale/ru-RU';
import sheetsviVN from '@univerjs/sheets/locale/vi-VN';
import sheetszhCN from '@univerjs/sheets/locale/zh-CN';
import sheetszhTW from '@univerjs/sheets/locale/zh-TW';
import sheetssortenUS from '@univerjs/sheets-sort/locale/en-US';
import sheetssortfaIR from '@univerjs/sheets-sort/locale/fa-IR';
import sheetssortruRU from '@univerjs/sheets-sort/locale/ru-RU';
import sheetssortviVN from '@univerjs/sheets-sort/locale/vi-VN';
import sheetssortzhCN from '@univerjs/sheets-sort/locale/zh-CN';
import sheetssortzhTW from '@univerjs/sheets-sort/locale/zh-TW';

export const enUS = Tools.deepMerge(
    {},
    sheetsenUS,
    sheetssortenUS
);
export const ruRU = Tools.deepMerge(
    {},
    sheetsruRU,
    sheetssortruRU
);
export const zhCN = Tools.deepMerge(
    {},
    sheetszhCN,
    sheetssortzhCN
);
export const zhTW = Tools.deepMerge(
    {},
    sheetszhTW,
    sheetssortzhTW
);
export const viVN = Tools.deepMerge(
    {},
    sheetsviVN,
    sheetssortviVN
);
export const faIR = Tools.deepMerge(
    {},
    sheetsfaIR,
    sheetssortfaIR
);
