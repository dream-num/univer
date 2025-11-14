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

import type enUS from './en-US';

const locale: typeof enUS = {
    design: {
        Confirm: {
            cancel: 'キャンセル',
            confirm: '確認',
        },
        CascaderList: {
            empty: '該当なし',
        },
        Calendar: {
            year: '年',
            weekDays: ['日', '月', '火', '水', '木', '金', '土'],
            months: [
                '1月',
                '2月',
                '3月',
                '4月',
                '5月',
                '6月',
                '7月',
                '8月',
                '9月',
                '10月',
                '11月',
                '12月',
            ],
        },
        Select: {
            empty: '該当なし',
        },
        ColorPicker: {
            more: 'その他の色',
            cancel: 'キャンセル',
            confirm: '確認',
        },
    },
};

export default locale;
