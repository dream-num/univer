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
    // Traducció al català pendent per a cada funció
    ACCRINT: {
        description: '',
        abstract: '',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/en-us/office/accrint-function-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            issue: { name: 'emissió', detail: '' },
            firstInterest: { name: 'primer_interès', detail: '' },
            settlement: { name: 'liquidació', detail: '' },
            rate: { name: 'taxa', detail: '' },
            par: { name: 'valor_nominal', detail: '' },
            frequency: { name: 'freqüència', detail: '' },
            basis: { name: 'base', detail: '' },
            calcMethod: { name: 'mètode_càlcul', detail: '' },
        },
    },
    // ... (la resta de funcions seguiran el mateix patró)
};

export default locale;
