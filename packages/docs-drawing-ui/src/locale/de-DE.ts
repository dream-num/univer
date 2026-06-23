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
    'docs-drawing-ui': {
        title: 'Bild',
        upload: {
            float: 'Bild einfügen',
        },
        shape: {
            insert: {
                title: 'Form einfügen',
                rectangle: 'Rechteck einfügen',
                ellipse: 'Ellipse einfügen',
            },
        },
        panel: {
            title: 'Bild bearbeiten',
        },
        'image-popup': {
            replace: 'Ersetzen',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            crop: 'Zuschneiden',
            reset: 'Größe zurücksetzen',
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
        'image-position': {
            title: 'Position',
            horizontal: 'Horizontal',
            vertical: 'Vertikal',
            absolutePosition: 'Absolute Position(px)',
            relativePosition: 'Relative Position',
            toTheRightOf: 'rechts von',
            relativeTo: 'relativ zu',
            bellow: 'unterhalb',
            options: 'Optionen',
            moveObjectWithText: 'Objekt mit Text verschieben',
            column: 'Spalte',
            margin: 'Rand',
            page: 'Seite',
            line: 'Zeile',
            paragraph: 'Absatz',
        },
        'update-status': {
            exceedMaxSize: 'Bildgröße überschreitet das Limit, das Limit ist {0}M',
            invalidImageType: 'Ungültiger Bildtyp',
            exceedMaxCount: 'Es können nur {0} Bilder gleichzeitig hochgeladen werden',
            invalidImage: 'Ungültiges Bild',
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
