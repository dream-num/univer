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
    sheets: {
        tabs: {
            sheetCopy: '(Còpia{0})',
            sheet: 'Full',
        },
        info: {
            overlappingSelections: 'No es pot utilitzar aquesta ordre en seleccions superposades',
            acrossMergedCell: 'A través d\'una cel·la combinada',
            partOfCell: 'Només una part d\'una cel·la combinada està seleccionada',
            hideSheet: 'No hi ha fulls visibles després d\'ocultar aquest',
        },
        definedName: {
            nameEmpty: 'El nom no pot estar buit',
            nameDuplicate: 'El nom ja existeix',
            nameInvalid: 'El nom no és vàlid',
            nameSheetConflict: 'El nom entra en conflicte amb el nom del full de càlcul',
            formulaOrRefStringEmpty: 'La fórmula o la cadena de referència no pot estar buida',
            nameConflict: 'El nom entra en conflicte amb el nom d\'una funció',
            defaultName: 'NomDefinit',
        },
        permission: {
            dialog: {
                autoFillErr: 'L\'interval està protegit i no teniu permís per a l\'emplenament automàtic. Per utilitzar l\'emplenament automàtic, contacteu amb el creador.',
                editErr: 'L\'interval està protegit i no teniu permís d\'edició. Per editar, contacteu amb el creador.',
                formulaErr: 'L\'interval o l\'interval referenciat està protegit, i no teniu permís d\'edició. Per editar, contacteu amb el creador.',
                insertOrDeleteMoveRangeErr: 'L\'interval inserit o suprimit s\'interseca amb l\'interval protegit, i aquesta operació no és compatible per ara.',
                insertRowColErr: 'L\'interval está protegido y no tienes permiso para insertar filas y columnas. Para insertar filas y columnas, contacta con el creador.',
                moveRangeErr: 'L\'interval està protegit i no teniu permís per moure la selecció. Per moure la selecció, contacteu amb el creador.',
                moveRowColErr: 'L\'interval està protegit i no teniu permís per moure files i columnes. Per moure files i columnes, contacteu amb el creador.',
                operatorSheetErr: 'El full de càlcul està protegit i no teniu permís per operar-hi. Per operar al full de càlcul, contacteu amb el creador.',
                removeRowColErr: 'L\'interval está protegido y no tienes permiso para eliminar filas y columnas. Para eliminar filas y columnas, contacta con el creador.',
                setRowColStyleErr: 'L\'interval està protegit i no teniu permís per establir estils de fila i columna. Per establir estils de fila i columna, contacteu amb el creador.',
                setStyleErr: 'L\'interval està protegit i no teniu permís per establir estils. Per establir estils, contacteu amb el creador.',
            },
        },

        autoFill: {
            copy: 'Copia les cel·les',
            series: 'Omple la sèrie',
            formatOnly: 'Només el format',
            noFormat: 'Sense format',
        },
        merge: {
            confirm: {
                title: 'Continuar la fusió només conservarà el valor de la cel·la superior esquerra, descartant els altres valors. Estàs segur de continuar?',
                cancel: 'Cancel·lar fusió',
                confirm: 'Continuar fusió',
                warning: 'Avís',
                dismantleMergeCellWarning: 'Això dividirà algunes cel·les fusionades. Vols continuar?',
            },
        },
    },
};

export default locale;
