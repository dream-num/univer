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
    'drawing-ui': {
        ole: {
            externalAttachment: 'Verknüpfter Anhang',
            externalHint: 'Die Originaldatei dieses Anhangs ist nicht in dieses Dokument eingebettet. Vorschau und Download sind nicht verfügbar.',
            missingHint: 'Die Daten dieses Anhangs fehlen im Dokument. Vorschau und Download sind nicht verfügbar.',
            unavailableSummary: 'Dieses Dokument enthält {0} nicht verfügbare Anhänge. Die Platzhalter wurden beibehalten. Bewegen Sie den Zeiger über das Warnsymbol, um den Grund zu sehen.',
            rename: 'Umbenennen',
            saveName: 'Namen speichern',
            cancel: 'Abbrechen',
            invalidName: 'Geben Sie einen gültigen Dateinamen mit höchstens 255 Zeichen ein.',
            renameFailed: 'Der Anhang konnte nicht umbenannt werden. Versuchen Sie es erneut.',
            actions: 'Anhangaktionen',
            linkSaveFailed: 'Die Online-Datei wurde erstellt, aber ihr Link konnte nicht gespeichert werden. Erneut versuchen, um den Link zu speichern.',
            conversionFailed: 'Dieser Anhang konnte nicht umgewandelt werden. Bitte erneut versuchen.',
            converted: 'Umwandlung abgeschlossen. Die Online-Datei kann in einem neuen Tab geöffnet werden.',
            converting: 'Wird umgewandelt…',
            openSlide: 'Online-Präsentation in neuem Tab öffnen',
            openDoc: 'Online-Dokument in neuem Tab öffnen',
            openSheet: 'Online-Tabelle in neuem Tab öffnen',
            convertSlide: 'In Online-Präsentation umwandeln',
            convertDoc: 'In Online-Dokument umwandeln',
            convertSheet: 'In Online-Tabelle umwandeln',
            nativePreviewHint: 'Wenn der Browser die Datei nicht anzeigen kann, laden Sie das Original herunter.',
            attachment: 'OLE-Anhang',
            external: 'Externe Datei nicht verfügbar',
            missing: 'Anhangsdaten nicht verfügbar',
            opaque: 'Originale OLE-Binärdatei (Download verfügbar)',
            download: 'Herunterladen',
            preview: 'Vorschau',
            remove: 'Löschen',
            failed: 'Der Originalanhang konnte nicht gelesen werden. Bitte erneut versuchen.',
            unsupported: 'Für diese Datei ist keine Vorschau verfügbar. Sie können das Original herunterladen.',
        },
        mobile: { close: 'Schließen', more: 'Mehr' },
        'image-cropper': {
            error: 'Nicht-Bildobjekte können nicht zugeschnitten werden.',
        },
        objectListPanel: {
            title: 'Ebenen',
            empty: 'Keine Objekte',
            showAll: 'Alle anzeigen',
            hideAll: 'Alle ausblenden',
            lockAll: 'Alle sperren',
            unlockAll: 'Alle entsperren',
            moveForward: 'Eine Ebene nach vorne',
            moveBackward: 'Eine Ebene nach hinten',
            close: 'Schliessen',
            show: 'Anzeigen',
            hide: 'Ausblenden',
            lock: 'Sperren',
            unlock: 'Entsperren',
            lockHint: 'Sperren, um versehentliches Auswählen zu verhindern',
            unlockHint: 'Gesperrt. Klicken zum Entsperren',
            name: 'Name',
            nameInput: 'Objektname',
            description: 'Beschreibung',
            descriptionPlaceholder: 'Beschreibung hinzufuegen',
            details: 'Details',
            locate: 'Suchen',
            expand: 'Erweitern',
            collapse: 'Reduzieren',
            dragToReorder: 'Zum Neuordnen ziehen',
            search: 'Suchen',
            filterAll: 'Alle',
            filterHidden: 'Ausgeblendet',
            filterLocked: 'Gesperrt',
            sectionCanvas: 'Canvas-Ebene',
            sectionFloating: 'Schwebende Ebene',
            typeNames: {
                object: 'Objekt',
                shape: 'Form',
                connector: 'Verbinder',
                image: 'Bild',
                chart: 'Diagramm',
                table: 'Tabelle',
                smartArt: 'SmartArt',
                video: 'Video',
                group: 'Gruppe',
                unit: 'Einheit',
                dom: 'DOM',
                text: 'Text',
                placeholder: 'Platzhalter',
                container: 'Container',
            },
            noSelection: 'Wählen Sie ein Objekt aus, um Details zu bearbeiten',
        },
        'image-panel': {
            arrange: {
                title: 'Anordnen',
                forward: 'Eine Ebene nach vorne',
                backward: 'Eine Ebene nach hinten',
                front: 'In den Vordergrund',
                back: 'In den Hintergrund',
            },
            transform: {
                title: 'Transformieren',
                rotate: 'Drehen (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Breite (px)',
                height: 'Höhe (px)',
                lock: 'Verhältnis sperren (%)',
            },
            crop: {
                cancel: 'Abbrechen',
                apply: 'Fertig',
                title: 'Zuschneiden',
                start: 'Zuschneiden starten',
                mode: 'Frei',
            },
            group: {
                title: 'Gruppe',
                group: 'Gruppieren',
                unGroup: 'Gruppierung aufheben',
            },
            align: {
                title: 'Ausrichten',
                default: 'Ausrichtungstyp auswählen',
                left: 'Linksbündig',
                center: 'Zentriert',
                right: 'Rechtsbündig',
                top: 'Oben bündig',
                middle: 'Mittig',
                bottom: 'Unten bündig',
                horizon: 'Horizontal verteilen',
                vertical: 'Vertikal verteilen',
            },
            null: 'Keine Objektauswahl',
        },
        'image-text-wrap': {
            square: 'Quadratisch',
            topAndBottom: 'Oben und unten',
            inline: 'Im Textfluss',
            behindText: 'Hinter dem Text',
            inFrontText: 'Vor dem Text',
        },
    },
};

export default locale;
