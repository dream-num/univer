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
    'script-panel': {
        title: 'Uniscript',
        tooltip: {
            'menu-button': '打開收起 Uniscript 面板',
        },
        panel: {
            execute: '執行 Uniscript',
        },
    },
    uniscript: {
        message: {
            success: '執行成功',
            failed: '執行失敗',
        },
    },
};

export default locale;
