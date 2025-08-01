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
import dajsZhCN from 'dayjs/locale/zh';
import PickerZhCN from 'rc-picker/lib/locale/zh_CN';

const locale: typeof enUS = {
    design: {
        Confirm: {
            cancel: '取消',
            confirm: '确定',
        },
        Picker: {
            ...dajsZhCN,
            ...PickerZhCN,
        },
        CascaderList: {
            empty: '无',
        },
        Calendar: {
            year: '年',
            weekDays: ['日', '一', '二', '三', '四', '五', '六'],
            months: [
                '一月',
                '二月',
                '三月',
                '四月',
                '五月',
                '六月',
                '七月',
                '八月',
                '九月',
                '十月',
                '十一月',
                '十二月',
            ],
        },
        Select: {
            empty: '无',
        },
        ColorPicker: {
            more: '更多颜色',
            cancel: '取消',
            confirm: '确定',
        },
    },
};

export default locale;
