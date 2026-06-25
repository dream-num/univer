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
    'sheets-hyper-link-ui': {
        form: {
            editTitle: 'Link bearbeiten',
            addTitle: 'Link einfügen',
            label: 'Beschriftung',
            type: 'Typ',
            link: 'Link',
            linkPlaceholder: 'Link eingeben',
            range: 'Bereich',
            worksheet: 'Arbeitsblatt',
            definedName: 'Definierter Name',
            ok: 'Bestätigen',
            cancel: 'Abbrechen',
            labelPlaceholder: 'Beschriftung eingeben',
            inputError: 'Bitte eingeben',
            selectError: 'Bitte auswählen',
            linkError: 'Bitte einen gültigen Link eingeben',
        },
        menu: {
            add: 'Link einfügen',
        },
        permission: {
            hyperLinkErr: 'Sie haben keine Berechtigung, einen Link einzufügen.',
        },
        message: {
            noSheet: 'Zielblatt wurde gelöscht',
            refError: 'Ungültiger Bereich',
            hiddenSheet: 'Der Link kann nicht geöffnet werden, da das verknüpfte Blatt ausgeblendet ist',
            coped: 'Link in Zwischenablage kopiert',
        },
        popup: {
            copy: 'Link kopieren',
            edit: 'Link bearbeiten',
            cancel: 'Link aufheben',
        },
    },
};

export default locale;
