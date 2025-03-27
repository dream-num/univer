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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    sheets: {
        tabs: {
            sheetCopy: '（副本{0}）',
            sheet: '工作表',
        },
        info: {
            overlappingSelections: '無法對重疊選區使用該命令',
            acrossMergedCell: '無法跨越合併儲存格',
            partOfCell: '僅選擇了合併儲存格的一部份',
            hideSheet: '隱藏後無可見工作表',
        },
    },
};

export default locale;
