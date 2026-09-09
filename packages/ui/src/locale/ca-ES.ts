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
import emojiLocale from './emoji-locale/ca-ES.generated';

const locale: typeof enUS = {
    ui: {
        accessibility: {
            menu: 'Menú',
            zoom: 'Zoom',
            zoomIn: 'Apropa',
            zoomOut: 'Allunya',
            resetZoom: 'Restableix el zoom',
        },
        objectPermission: {
            operationDenied: 'Aquest contingut està protegit. No es pot fer aquesta acció.',
            remove: 'Elimina la protecció',
            roleOwner: 'Propietari del fitxer',
            roleEditor: 'Editor del fitxer',
            selectedCount: 'Seleccionats: {0}',
            searchPeople: 'Cerca persones',
            noMatchingPeople: 'No hi ha persones coincidents',
            loadMore: 'Carrega’n més',
            fileHint: 'La compartició del fitxer determina els membres. Aquests paràmetres limiten les accions d’aquests membres.',
            documentParent: 'Les restriccions d’edició del document també s’apliquen a aquesta secció.',
            paragraphParent: 'Les restriccions d’edició del document i de la secció que conté aquest paràgraf també s’hi apliquen.',
            documentObjectParent: 'El document i les seccions i paràgrafs que contenen o ancoren aquest objecte també poden restringir-ne l’edició.',
            slideParent: 'Les restriccions d’edició de la presentació també s’apliquen.',
            slideObjectParent: 'Les restriccions d’edició de la presentació i de la diapositiva o patró que conté aquest objecte també s’apliquen.',
            baseParent: 'Les restriccions d’edició de Base també s’apliquen.',
            baseObjectParent: 'Les restriccions d’edició de Base i de la taula que conté aquest objecte també s’apliquen.',
            recordParent: 'Les restriccions de Base i de la taula continuen vigents. Editar un valor també requereix permís per al seu camp.',
            boardParent: 'Les restriccions d’edició de la pissarra també s’apliquen a aquest objecte.',
            ownerInherit: 'Propietari del fitxer, accés heretat',
            peopleError: 'No s’han pogut carregar les persones. Torna-ho a provar.',
            document: 'Document',
            section: 'Secció',
            paragraph: 'Paràgraf',
            entity: 'Objecte',
            presentation: 'Presentació',
            page: 'Diapositiva',
            master: 'Vista del patró',
            base: 'Base',
            table: 'Taula',
            field: 'Camp',
            record: 'Registre',
            view: 'Vista',
            board: 'Pissarra',
            objectName: '{0}: {1}',

            search: 'Cerca objectes',
            empty: 'No hi ha objectes coincidents',
            more: 'Es mostren els primers 100 objectes. Fes servir la cerca per reduir la llista.',
            title: 'Permisos',
            cancel: 'Cancel·la',
            save: 'Desa',
            saving: 'S’està desant…',
            loading: 'S’està carregant…',
            conflict: 'Els permisos han canviat. Torna a carregar abans de desar.',
            error: 'No s’han pogut carregar o desar els permisos. S’han conservat els canvis.',
            reload: 'Torna a carregar',
            denied: 'No pots gestionar els permisos d’aquest objecte.',
            edit: 'Qui pot editar',
            all: 'Tots els editors del fitxer',
            owner: 'Només el propietari de l’objecte',
            members: 'Membres seleccionats',
            copy: 'Permet que els editors copiïn',
            print: 'Permet que els editors imprimeixin',
            export: 'Permet que els editors exportin',
            comment: 'Permet que els editors comentin',
            parentHint: 'Les restriccions del fitxer i de l’objecte superior continuen vigents.',
        },
        featureSearch: {
            title: 'Cerca funcions',
            placeholder: 'Escriviu una funció o un nom de menú...',
            empty: 'No s\'han trobat funcions disponibles',
            ribbon: 'Cinta',
            contextMenu: 'Menú contextual',
        },
        emojiPicker: {
            search: 'Cerca',
            random: 'Emoji aleatori',
            recents: 'Recents',
            emojis: 'Emojis',
            animals: 'Animals',
            food: 'Menjar',
            activities: 'Activitats',
            places: 'Llocs',
            objects: 'Objectes',
            symbols: 'Símbols',
            searchResults: 'Resultats de cerca',
            noResults: 'No s’ha trobat cap emoji',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: 'Matemàtiques',
            greek: 'Grec',
            common: 'Comuns',
        },
        toolbar: {
            heading: {
                normal: 'Normal',
                title: 'Títol',
                subTitle: 'Subtítol',
                1: 'Encapçalament 1',
                2: 'Encapçalament 2',
                3: 'Encapçalament 3',
                4: 'Encapçalament 4',
                5: 'Encapçalament 5',
            },
        },
        ribbon: {
            start: 'Inici',
            startDesc: 'Inicia el full de càlcul i estableix els paràmetres bàsics.',
            insert: 'Insereix',
            insertDesc: 'Insereix files, columnes, gràfics i altres elements.',
            formulas: 'Fórmules',
            formulasDesc: 'Utilitza funcions i fórmules per a càlculs de dades.',
            data: 'Dades',
            dataDesc: 'Gestiona les dades, incloent importació, ordenació i filtratge.',
            view: 'Vista',
            viewDesc: 'Canvia els modes de vista i ajusta l\'efecte de visualització.',
            others: 'Altres',
            othersDesc: 'Altres funcions i configuracions.',
            more: 'Més',
        },
        fontFamily: {
            'not-supported': 'No s\'ha trobat aquesta font al sistema, s\'utilitza la font per defecte.',
        },
        'shortcut-panel': {
            title: 'Dreceres',
        },
        shortcut: {
            undo: 'Desfer',
            redo: 'Refer',
            cut: 'Retalla',
            copy: 'Copia',
            paste: 'Enganxa',
            'shortcut-panel': 'Alterna el panell de dreceres',
        },
        'common-edit': 'Dreceres d\'edició comunes',
        'toggle-shortcut-panel': 'Alterna el panell de dreceres',
        navigation: {
            back: 'Enrere',
            previous: 'Anterior',
            next: 'Següent',
        },
        sidebar: {
            panel: 'Panell lateral',
            resize: 'Canvia la mida del panell lateral',
            close: 'Tanca el panell lateral',
        },
        beforeClose: {
            title: 'Alguns canvis no s\'han desat',
        },
        clipboard: {
            authentication: {
                title: 'Permís denegat',
                content: 'Si us plau, permet que Univer accedeixi al teu porta-retalls.',
            },
        },
        rangeSelector: {
            cancel: 'Cancel·la',
        },
        'global-shortcut': 'Drecera global',
        row: 'Fila',
        column: 'Columna',
    },
};

export default locale;
