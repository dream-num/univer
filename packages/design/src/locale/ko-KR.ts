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

import type { ILocale } from './interface';
import dajsKoKR from 'dayjs/locale/ko';
import PickerKoKR from 'rc-picker/lib/locale/ko_KR';

const locale: ILocale = {
    design: {
        Confirm: {
            cancel: '취소',
            confirm: '확인',
        },
        Picker: {
            ...dajsKoKR,
            ...PickerKoKR,
        },
        CascaderList: {
            empty: '없음',
        },
        Select: {
            empty: '없음',
        },
        ColorPicker: {
            more: '추가 색상',
            cancel: '취소',
            confirm: '확인',
        },
    },
};

export default locale;
