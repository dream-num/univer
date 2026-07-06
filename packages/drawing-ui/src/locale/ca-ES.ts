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
            error: 'No es poden retallar objectes que no siguin imatges.',
        },
        objectListPanel: {
            title: 'Objectes',
            empty: 'Sense objectes',
            showAll: 'Mostra-ho tot',
            hideAll: 'Amaga-ho tot',
            moveForward: 'Porta endavant',
            moveBackward: 'Envia enrere',
            close: 'Tanca',
            show: 'Mostra',
            hide: 'Amaga',
            lock: 'Bloqueja',
            unlock: 'Desbloqueja',
            name: 'Nom',
            nameInput: 'Nom de l\'objecte',
            description: 'Descripcio',
            descriptionPlaceholder: 'Afegeix descripcio',
            details: 'Detalls',
            locate: 'Localitza',
            expand: 'Expandeix',
            collapse: 'Replega',
            dragToReorder: 'Arrossegueu per reordenar',
            search: 'Cerca',
            filterAll: 'Tot',
            filterHidden: 'Ocults',
            filterLocked: 'Bloquejats',
            sectionCanvas: 'Capa del llenç',
            sectionFloating: 'Capa flotant',
            typeNames: {
                object: 'Objecte',
                shape: 'Forma',
                connector: 'Connector',
                image: 'Imatge',
                chart: 'Gràfic',
                table: 'Taula',
                smartArt: 'SmartArt',
                video: 'Vídeo',
                group: 'Grup',
                unit: 'Unitat',
                dom: 'DOM',
                text: 'Text',
                placeholder: 'Marcador de posició',
                container: 'Contenidor',
            },
            noSelection: 'Seleccioneu un objecte per editar-ne els detalls',
        },
        'image-panel': {
            arrange: {
                title: 'Organitza',
                forward: 'Porta endavant',
                backward: 'Envia enrere',
                front: 'Porta al davant',
                back: 'Envia al fons',
            },
            transform: {
                title: 'Transforma',
                rotate: 'Gira (°)',
                x: 'X (px)',
                y: 'Y (px)',
                width: 'Amplada (px)',
                height: 'Alçada (px)',
                lock: 'Bloca proporció (%)',
            },
            crop: {
                title: 'Retalla',
                start: 'Inicia retallada',
                mode: 'Lliure',
            },
            group: {
                title: 'Agrupa',
                group: 'Agrupa',
                unGroup: 'Desagrupa',
            },
            align: {
                title: 'Alinea',
                default: 'Selecciona tipus d’alineació',
                left: 'Alinea a l’esquerra',
                center: 'Alinea al centre',
                right: 'Alinea a la dreta',
                top: 'Alinea a dalt',
                middle: 'Alinea al mig',
                bottom: 'Alinea a baix',
                horizon: 'Distribueix horitzontalment',
                vertical: 'Distribueix verticalment',
            },
            null: 'Cap objecte seleccionat',
        },
        'image-text-wrap': {
            title: 'Ajust del text',
            wrappingStyle: 'Estil d\'ajust',
            square: 'Quadrat',
            topAndBottom: 'A dalt i a baix',
            inline: 'En línia amb el text',
            behindText: 'Darrere del text',
            inFrontText: 'Davant del text',
            wrapText: 'Ajusta el text',
            bothSide: 'Ambdós costats',
            leftOnly: 'Només esquerra',
            rightOnly: 'Només dreta',
            distanceFromText: 'Distància del text',
            top: 'A dalt(px)',
            left: 'Esquerra(px)',
            bottom: 'A baix(px)',
            right: 'Dreta(px)',
        },
        'image-popup': {
            replace: 'Reemplaça',
            delete: 'Elimina',
            edit: 'Edita',
            crop: 'Retalla',
            reset: 'Restableix la mida',
        },
    },
};

export default locale;
