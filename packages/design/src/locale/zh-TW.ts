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

import type { ILocale } from './interface';
import dajsZhTw from 'dayjs/locale/zh-tw';
import PickerZhTw from 'rc-picker/lib/locale/zh_TW';

const locale: ILocale = {
    design: {
        Confirm: {
            cancel: '取消',
            confirm: '確定',
        },
        Slider: {
            resetTo: '恢復至',
        },
        Picker: {
            ...dajsZhTw,
            ...PickerZhTw,
        },
        CascaderList: {
            empty: '無',
        },
        Select: {
            empty: '無',
        },
    },
};

export default locale;
