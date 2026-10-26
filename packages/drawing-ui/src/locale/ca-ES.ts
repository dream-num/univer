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
            externalAttachment: 'Fitxer adjunt enllaçat',
            externalHint: 'El fitxer original d’aquest adjunt no està incrustat al document. La previsualització i la baixada no estan disponibles.',
            missingHint: 'Falten les dades d’aquest adjunt al document. La previsualització i la baixada no estan disponibles.',
            unavailableSummary: 'Aquest document conté {0} fitxers adjunts no disponibles. Se n’han conservat els marcadors. Passeu el cursor sobre la icona d’avís per veure’n el motiu.',
            rename: 'Canvia el nom',
            saveName: 'Desa el nom',
            cancel: 'Cancel·la',
            invalidName: 'Introduïu un nom de fitxer vàlid de fins a 255 caràcters.',
            renameFailed: 'No es pot canviar el nom de l’adjunt. Torneu-ho a provar.',
            actions: 'Accions del fitxer adjunt',
            linkSaveFailed: 'S’ha creat el fitxer en línia, però no s’ha pogut desar l’enllaç. Torna a provar de desar-lo.',
            conversionFailed: 'No s’ha pogut convertir aquest fitxer adjunt. Torna-ho a provar.',
            converted: 'Conversió completada. Pots obrir el fitxer en línia en una pestanya nova.',
            converting: 'S’està convertint…',
            openSlide: 'Obre la presentació en línia en una pestanya nova',
            openDoc: 'Obre el document en línia en una pestanya nova',
            openSheet: 'Obre el full de càlcul en línia en una pestanya nova',
            convertSlide: 'Converteix en presentació en línia',
            convertDoc: 'Converteix en document en línia',
            convertSheet: 'Converteix en full de càlcul en línia',
            nativePreviewHint: 'Si el navegador no pot mostrar el fitxer, baixa l’original.',
            attachment: 'Fitxer adjunt OLE',
            external: 'Fitxer extern no disponible',
            missing: 'Dades del fitxer adjunt no disponibles',
            opaque: 'Binari OLE original (es pot baixar)',
            download: 'Baixa',
            preview: 'Previsualitza',
            remove: 'Suprimeix',
            failed: 'No es pot llegir el fitxer adjunt original. Torna-ho a provar.',
            unsupported: 'La previsualització no està disponible per a aquest fitxer. Pots baixar l’original.',
        },
        mobile: { close: 'Tanca', more: 'Més' },
        'image-cropper': {
            error: 'No es poden retallar objectes que no siguin imatges.',
        },
        objectListPanel: {
            title: 'Capes',
            empty: 'Sense objectes',
            showAll: 'Mostra-ho tot',
            hideAll: 'Amaga-ho tot',
            lockAll: 'Bloqueja-ho tot',
            unlockAll: 'Desbloqueja-ho tot',
            moveForward: 'Porta endavant',
            moveBackward: 'Envia enrere',
            close: 'Tanca',
            show: 'Mostra',
            hide: 'Amaga',
            lock: 'Bloqueja',
            unlock: 'Desbloqueja',
            lockHint: 'Bloqueja per evitar seleccions accidentals',
            unlockHint: 'Bloquejat. Fes clic per desbloquejar',
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
                cancel: 'Cancel·la',
                apply: 'Fet',
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
            square: 'Quadrat',
            topAndBottom: 'A dalt i a baix',
            inline: 'En línia amb el text',
            behindText: 'Darrere del text',
            inFrontText: 'Davant del text',
        },
    },
};

export default locale;
