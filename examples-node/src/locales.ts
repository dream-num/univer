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

import actionrecorderenUS from '@univerjs/action-recorder/locale/en-US';

import actionrecorderfaIR from '@univerjs/action-recorder/locale/fa-IR';
import actionrecorderruRU from '@univerjs/action-recorder/locale/ru-RU';
import actionrecorderviVN from '@univerjs/action-recorder/locale/vi-VN';
import actionrecorderzhCN from '@univerjs/action-recorder/locale/zh-CN';
import actionrecorderzhTW from '@univerjs/action-recorder/locale/zh-TW';
import { Tools } from '@univerjs/core';
import designenUS from '@univerjs/design/locale/en-US';
import designfaIR from '@univerjs/design/locale/fa-IR';
import designruRU from '@univerjs/design/locale/ru-RU';
import designviVN from '@univerjs/design/locale/vi-VN';
import designzhCN from '@univerjs/design/locale/zh-CN';
import designzhTW from '@univerjs/design/locale/zh-TW';
import findreplaceenUS from '@univerjs/find-replace/locale/en-US';
import findreplacefaIR from '@univerjs/find-replace/locale/fa-IR';
import findreplaceruRU from '@univerjs/find-replace/locale/ru-RU';
import findreplaceviVN from '@univerjs/find-replace/locale/vi-VN';
import findreplacezhCN from '@univerjs/find-replace/locale/zh-CN';
import findreplacezhTW from '@univerjs/find-replace/locale/zh-TW';
import sheetsenUS from '@univerjs/sheets/locale/en-US';
import sheetsfaIR from '@univerjs/sheets/locale/fa-IR';
import sheetsruRU from '@univerjs/sheets/locale/ru-RU';
import sheetsviVN from '@univerjs/sheets/locale/vi-VN';
import sheetszhCN from '@univerjs/sheets/locale/zh-CN';
import sheetszhTW from '@univerjs/sheets/locale/zh-TW';
import sheetscrosshairhighlightenUS from '@univerjs/sheets-crosshair-highlight/locale/en-US';
import sheetscrosshairhighlightfaIR from '@univerjs/sheets-crosshair-highlight/locale/fa-IR';
import sheetscrosshairhighlightruRU from '@univerjs/sheets-crosshair-highlight/locale/ru-RU';
import sheetscrosshairhighlightviVN from '@univerjs/sheets-crosshair-highlight/locale/vi-VN';
import sheetscrosshairhighlightzhCN from '@univerjs/sheets-crosshair-highlight/locale/zh-CN';
import sheetscrosshairhighlightzhTW from '@univerjs/sheets-crosshair-highlight/locale/zh-TW';
import sheetsfindreplaceenUS from '@univerjs/sheets-find-replace/locale/en-US';
import sheetsfindreplacefaIR from '@univerjs/sheets-find-replace/locale/fa-IR';
import sheetsfindreplaceruRU from '@univerjs/sheets-find-replace/locale/ru-RU';
import sheetsfindreplaceviVN from '@univerjs/sheets-find-replace/locale/vi-VN';
import sheetsfindreplacezhCN from '@univerjs/sheets-find-replace/locale/zh-CN';
import sheetsfindreplacezhTW from '@univerjs/sheets-find-replace/locale/zh-TW';
import sheetsnumfmtenUS from '@univerjs/sheets-numfmt/locale/en-US';
import sheetsnumfmtfaIR from '@univerjs/sheets-numfmt/locale/fa-IR';
import sheetsnumfmtruRU from '@univerjs/sheets-numfmt/locale/ru-RU';
import sheetsnumfmtviVN from '@univerjs/sheets-numfmt/locale/vi-VN';
import sheetsnumfmtzhCN from '@univerjs/sheets-numfmt/locale/zh-CN';
import sheetsnumfmtzhTW from '@univerjs/sheets-numfmt/locale/zh-TW';
import sheetssortenUS from '@univerjs/sheets-sort/locale/en-US';
import sheetssortfaIR from '@univerjs/sheets-sort/locale/fa-IR';
import sheetssortruRU from '@univerjs/sheets-sort/locale/ru-RU';
import sheetssortviVN from '@univerjs/sheets-sort/locale/vi-VN';
import sheetssortzhCN from '@univerjs/sheets-sort/locale/zh-CN';
import sheetssortzhTW from '@univerjs/sheets-sort/locale/zh-TW';
import sheetsthreadcommentenUS from '@univerjs/sheets-thread-comment/locale/en-US';
import sheetsthreadcommentfaIR from '@univerjs/sheets-thread-comment/locale/fa-IR';
import sheetsthreadcommentruRU from '@univerjs/sheets-thread-comment/locale/ru-RU';
import sheetsthreadcommentviVN from '@univerjs/sheets-thread-comment/locale/vi-VN';
import sheetsthreadcommentzhCN from '@univerjs/sheets-thread-comment/locale/zh-CN';
import sheetsthreadcommentzhTW from '@univerjs/sheets-thread-comment/locale/zh-TW';
import sheetszeneditorenUS from '@univerjs/sheets-zen-editor/locale/en-US';
import sheetszeneditorfaIR from '@univerjs/sheets-zen-editor/locale/fa-IR';
import sheetszeneditorruRU from '@univerjs/sheets-zen-editor/locale/ru-RU';
import sheetszeneditorviVN from '@univerjs/sheets-zen-editor/locale/vi-VN';
import sheetszeneditorzhCN from '@univerjs/sheets-zen-editor/locale/zh-CN';
import sheetszeneditorzhTW from '@univerjs/sheets-zen-editor/locale/zh-TW';
import uniscriptenUS from '@univerjs/uniscript/locale/en-US';
import uniscriptfaIR from '@univerjs/uniscript/locale/fa-IR';
import uniscriptruRU from '@univerjs/uniscript/locale/ru-RU';
import uniscriptviVN from '@univerjs/uniscript/locale/vi-VN';
import uniscriptzhCN from '@univerjs/uniscript/locale/zh-CN';
import uniscriptzhTW from '@univerjs/uniscript/locale/zh-TW';

export const enUS = Tools.deepMerge(
    {},
    actionrecorderenUS,
    designenUS,
    findreplaceenUS,
    sheetsenUS,
    sheetscrosshairhighlightenUS,
    sheetsfindreplaceenUS,
    sheetsnumfmtenUS,
    sheetssortenUS,
    sheetsthreadcommentenUS,
    sheetszeneditorenUS,
    uniscriptenUS
);
export const ruRU = Tools.deepMerge(
    {},
    actionrecorderruRU,
    designruRU,
    findreplaceruRU,
    sheetsruRU,
    sheetscrosshairhighlightruRU,
    sheetsfindreplaceruRU,
    sheetsnumfmtruRU,
    sheetssortruRU,
    sheetsthreadcommentruRU,
    sheetszeneditorruRU,
    uniscriptruRU
);
export const zhCN = Tools.deepMerge(
    {},
    actionrecorderzhCN,
    designzhCN,
    findreplacezhCN,
    sheetszhCN,
    sheetscrosshairhighlightzhCN,
    sheetsfindreplacezhCN,
    sheetsnumfmtzhCN,
    sheetssortzhCN,
    sheetsthreadcommentzhCN,
    sheetszeneditorzhCN,
    uniscriptzhCN
);
export const zhTW = Tools.deepMerge(
    {},
    actionrecorderzhTW,
    designzhTW,
    findreplacezhTW,
    sheetszhTW,
    sheetscrosshairhighlightzhTW,
    sheetsfindreplacezhTW,
    sheetsnumfmtzhTW,
    sheetssortzhTW,
    sheetsthreadcommentzhTW,
    sheetszeneditorzhTW,
    uniscriptzhTW
);
export const viVN = Tools.deepMerge(
    {},
    actionrecorderviVN,
    designviVN,
    findreplaceviVN,
    sheetsviVN,
    sheetscrosshairhighlightviVN,
    sheetsfindreplaceviVN,
    sheetsnumfmtviVN,
    sheetssortviVN,
    sheetsthreadcommentviVN,
    sheetszeneditorviVN,
    uniscriptviVN
);
export const faIR = Tools.deepMerge(
    {},
    actionrecorderfaIR,
    designfaIR,
    findreplacefaIR,
    sheetsfaIR,
    sheetscrosshairhighlightfaIR,
    sheetsfindreplacefaIR,
    sheetsnumfmtfaIR,
    sheetssortfaIR,
    sheetsthreadcommentfaIR,
    sheetszeneditorfaIR,
    uniscriptfaIR
);
