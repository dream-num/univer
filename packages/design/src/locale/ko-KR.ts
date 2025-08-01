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
            cancel: '취소',
            confirm: '확인',
        },
        CascaderList: {
            empty: '없음',
        },
        Calendar: {
            year: '년',
            weekDays: ['일', '월', '화', '수', '목', '금', '토'],
            months: [
                '1월',
                '2월',
                '3월',
                '4월',
                '5월',
                '6월',
                '7월',
                '8월',
                '9월',
                '10월',
                '11월',
                '12월',
            ],
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
