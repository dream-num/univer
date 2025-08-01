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
            cancel: 'cancel·la',
            confirm: 'ok',
        },
        CascaderList: {
            empty: 'Cap',
        },
        Calendar: {
            year: '',
            weekDays: ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'],
            months: [
                'Gener',
                'Febrer',
                'Març',
                'Abril',
                'Maig',
                'Juny',
                'Juliol',
                'Agost',
                'Setembre',
                'Octubre',
                'Novembre',
                'Desembre',
            ],
        },
        Select: {
            empty: 'Cap',
        },
        ColorPicker: {
            more: 'Més colors',
            cancel: 'cancel·la',
            confirm: 'ok',
        },
    },
};

export default locale;
