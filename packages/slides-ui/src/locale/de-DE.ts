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
    'slides-ui': {
        append: 'Folie anhängen',

        text: {
            insert: {
                title: 'Text einfügen',
            },
        },

        shape: {
            insert: {
                title: 'Form einfügen',
                rectangle: 'Rechteck einfügen',
                ellipse: 'Ellipse einfügen',
            },
        },

        image: {
            insert: {
                title: 'Bild einfügen',
                float: 'Schwebendes Bild einfügen',
            },
        },

        popup: {
            edit: 'Bearbeiten',
            delete: 'Löschen',
        },

        sidebar: {
            text: 'Text bearbeiten',
            shape: 'Form bearbeiten',
            image: 'Bild bearbeiten',
        },

        'image-panel': {
            arrange: {
                title: 'Anordnen',
                forward: 'Nach vorne',
                backward: 'Nach hinten',
                front: 'In den Vordergrund',
                back: 'In den Hintergrund',
            },
            transform: {
                title: 'Transformieren',
                width: 'Breite (px)',
                height: 'Höhe (px)',
                x: 'X (px)',
                y: 'Y (px)',
                rotate: 'Drehen (°)',
            },
        },
        panel: {
            fill: {
                title: 'Füllfarbe',
            },
        },
    },
};

export default locale;
