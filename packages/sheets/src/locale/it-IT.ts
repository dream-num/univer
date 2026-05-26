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
            sheetCopy: '(Copia{0})',
            sheet: 'Foglio',
        },
        info: {
            overlappingSelections: 'Impossibile utilizzare questo comando su selezioni sovrapposte',
            acrossMergedCell: 'Attraverso una cella unita',
            partOfCell: 'È selezionata solo una parte di una cella unita',
            hideSheet: 'Nessun foglio visibile dopo aver nascosto questo',
        },
        definedName: {
            nameEmpty: 'Il nome non può essere vuoto',
            nameDuplicate: 'Il nome esiste già',
            nameInvalid: 'Il nome non è valido',
            nameSheetConflict: 'Il nome è in conflitto con il nome del foglio',
            formulaOrRefStringEmpty: 'La formula o la stringa di riferimento non può essere vuota',
            nameConflict: 'Il nome è in conflitto con il nome della funzione',
            defaultName: 'NomeDefinito',
        },
        permission: {
            dialog: {
                autoFillErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per il riempimento automatico. Per utilizzare il riempimento automatico, contattare il creatore.',
                editErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione di modifica. Per modificare, contattare il creatore.',
                formulaErr: 'L\'intervallo o l\'intervallo di riferimento è protetto e non si dispone dell\'autorizzazione di modifica. Per modificare, contattare il creatore.',
                insertOrDeleteMoveRangeErr: 'L\'intervallo inserito o eliminato interseca l\'intervallo protetto e questa operazione non è supportata al momento.',
                insertRowColErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per inserire righe e colonne. Per inserire righe e colonne, contattare il creatore.',
                moveRangeErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per spostare la selezione. Per spostare la selezione, contattare il creatore.',
                moveRowColErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per spostare righe e colonne. Per spostare righe e colonne, contattare il creatore.',
                operatorSheetErr: 'Il foglio di lavoro è protetto e non si dispone dell\'autorizzazione per operare sul foglio di lavoro. Per operare sul foglio di lavoro, contattare il creatore.',
                removeRowColErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per eliminare righe e colonne. Per eliminare righe e colonne, contattare il creatore.',
                setRowColStyleErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per impostare gli stili di riga e colonna. Per impostare gli stili di riga e colonna, contattare il creatore.',
                setStyleErr: 'L\'intervallo è protetto e non si dispone dell\'autorizzazione per impostare gli stili. Per impostare gli stili, contattare il creatore.',
            },
        },
        autoFill: {
            copy: 'Copia cella',
            series: 'Riempi serie',
            formatOnly: 'Solo formato',
            noFormat: 'Nessun formato',
        },
        merge: {
            confirm: {
                title: 'Continuando l\'unione verrà mantenuto solo il valore della cella in alto a sinistra, scartando gli altri valori. Continuare?',
                cancel: 'Annulla unione',
                confirm: 'Continua unione',
                warning: 'Avviso',
                dismantleMergeCellWarning: 'Questo comporterà la divisione di alcune celle unite. Continuare?',
            },
        },
    },
};

export default locale;
