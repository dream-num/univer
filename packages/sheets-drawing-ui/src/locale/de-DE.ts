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
    'sheets-drawing-ui': {
        title: 'Bild',
        uploadLoading: {
            loading: 'Wird geladen..., verbleibend',
        },

        upload: {
            float: 'Schwebendes Bild',
            cell: 'Zellenbild',
        },

        panel: {
            title: 'Bild bearbeiten',
        },

        save: {
            title: 'Zellenbilder speichern',
            menuLabel: 'Zellenbilder speichern',
            imageCount: 'Bildanzahl',
            fileNameConfig: 'Dateiname',
            useRowCol: 'Zellenadresse verwenden (A1, B2...)',
            useColumnValue: 'Spaltenwert verwenden',
            selectColumn: 'Spalte auswählen',
            cancel: 'Abbrechen',
            confirm: 'Speichern',
            saving: 'Speichern...',
            error: 'Zellenbilder konnten nicht gespeichert werden',
        },
        'image-popup': {
            replace: 'Ersetzen',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            crop: 'Zuschneiden',
            reset: 'Größe zurücksetzen',
            flipH: 'Horizontal spiegeln',
            flipV: 'Vertikal spiegeln',
        },
        'update-status': {
            exceedMaxSize: 'Bildgröße überschreitet das Limit, Limit ist {0}M',
            invalidImageType: 'Ungültiger Bildtyp',
            exceedMaxCount: 'Es können nur {0} Bilder gleichzeitig hochgeladen werden',
            invalidImage: 'Ungültiges Bild',
        },
        'drawing-anchor': {
            title: 'Anker-Eigenschaften',
            both: 'Mit Zellen verschieben und skalieren',
            position: 'Mit Zellen verschieben, aber nicht skalieren',
            none: 'Weder verschieben noch skalieren mit Zellen',
        },
        'cell-image': {
            pasteTitle: 'Als Zellenbild einfügen',
            pasteContent: 'Das Einfügen eines Zellenbilds überschreibt den bestehenden Inhalt der Zelle, mit dem Einfügen fortfahren?',
            pasteError: 'Kopieren und Einfügen von Zellenbildern wird in dieser Einheit nicht unterstützt',
        },
        permission: {
            dialog: {
                editErr: 'Der Bereich ist geschützt, und Sie haben keine Bearbeitungsberechtigung. Um zu bearbeiten, wenden Sie sich bitte an den Ersteller.',
            },
        },
        shortcut: {
            'drawing-view': 'Zeichnungsansicht',
            'drawing-move-down': 'Zeichnung nach unten verschieben',
            'drawing-move-up': 'Zeichnung nach oben verschieben',
            'drawing-move-left': 'Zeichnung nach links verschieben',
            'drawing-move-right': 'Zeichnung nach rechts verschieben',
            'drawing-delete': 'Zeichnung löschen',
        },
    },
};

export default locale;
