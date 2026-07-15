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
    'action-recorder': {
        panel: {
            recording: 'Registrazione...',
            startRecording: 'Avvia registrazione',
            cancel: 'Annulla',
            close: 'Chiudi',
            save: 'Salva',
            start: 'Avvia',
            startWithId: 'Avvia (N)',
        },
        menu: {
            title: 'Registra Azioni',
            record: 'Registra Azioni...',
            'replay-local': 'Riproduci Registrazione Locale...',
            'replay-local-name': 'Riproduci Registrazione Locale per Sottoelemento...',
            'replay-local-active': 'Riproduci Registrazione Locale per Sottoelemento Corrente...',
        },
    },
};

export default locale;
