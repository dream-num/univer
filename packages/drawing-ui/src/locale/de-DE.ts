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
        'image-cropper': {
            error: 'Nicht-Bildobjekte können nicht zugeschnitten werden.',
        },
        objectListPanel: {
            title: 'Objekte',
            empty: 'Keine Objekte',
            showAll: 'Alle anzeigen',
            hideAll: 'Alle ausblenden',
            moveForward: 'Eine Ebene nach vorne',
            moveBackward: 'Eine Ebene nach hinten',
            close: 'Schliessen',
            show: 'Anzeigen',
            hide: 'Ausblenden',
            lock: 'Sperren',
            unlock: 'Entsperren',
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
            title: 'Textumbruch',
            wrappingStyle: 'Umbruchstil',
            square: 'Quadratisch',
            topAndBottom: 'Oben und unten',
            inline: 'Im Textfluss',
            behindText: 'Hinter dem Text',
            inFrontText: 'Vor dem Text',
            wrapText: 'Text umbrechen',
            bothSide: 'Beide Seiten',
            leftOnly: 'Nur links',
            rightOnly: 'Nur rechts',
            distanceFromText: 'Abstand vom Text',
            top: 'Oben(px)',
            left: 'Links(px)',
            bottom: 'Unten(px)',
            right: 'Rechts(px)',
        },
        'image-popup': {
            replace: 'Ersetzen',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            crop: 'Zuschneiden',
            reset: 'Größe zurücksetzen',
        },
    },
};

export default locale;
