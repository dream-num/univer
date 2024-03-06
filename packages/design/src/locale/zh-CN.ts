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

import PickerZhCN from 'rc-picker/lib/locale/zh_CN';
import dajsZhCN from 'dayjs/locale/zh';
import type { ILocale } from './interface';

const locale: ILocale = {
    design: {
        Confirm: {
            cancel: '取消',
            confirm: '确定',
        },
        Slider: {
            resetTo: '恢复至',
        },
        Picker: {
            ...dajsZhCN,
            ...PickerZhCN,
        },
    },
};

export default locale;
