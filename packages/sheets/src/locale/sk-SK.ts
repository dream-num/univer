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
            sheetCopy: '(Kópia{0})',
            sheet: 'Hárok',
        },
        info: {
            overlappingSelections: 'Na prekrývajúcich sa výberoch nie je možné použiť tento príkaz',
            acrossMergedCell: 'Cez zlúčenú bunku',
            partOfCell: 'Je vybraná iba časť zlúčenej bunky',
            hideSheet: 'Po skrytí tohto hárka nebude viditeľný žiadny hárok',
        },
        definedName: {
            nameEmpty: 'Názov nemôže byť prázdny',
            nameDuplicate: 'Názov už existuje',
            nameInvalid: 'Názov je neplatný',
            nameSheetConflict: 'Názov je v konflikte s názvom hárka',
            formulaOrRefStringEmpty: 'Vzorec alebo referenčný reťazec nemôže byť prázdny',
            nameConflict: 'Názov je v konflikte s názvom funkcie',
            defaultName: 'DefinovanýNázov',
        },
        permission: {
            dialog: {
                autoFillErr: 'Rozsah je chránený a nemáte oprávnenie na automatické dopĺňanie. Ak chcete použiť automatické dopĺňanie, kontaktujte autora.',
                editErr: 'Rozsah je chránený a nemáte oprávnenie na úpravy. Ak chcete upravovať, kontaktujte autora.',
                formulaErr: 'Rozsah alebo referenčný rozsah je chránený a nemáte oprávnenie na úpravu. Ak chcete upravovať, kontaktujte autora.',
                insertOrDeleteMoveRangeErr: 'Vložený alebo odstránený rozsah sa prekrýva s chráneným rozsahom a táto operácia zatiaľ nie je podporovaná.',
                insertRowColErr: 'Rozsah je chránený a nemáte oprávnění pro vkládání řádků a sloupců. Pokud chcete vkládat řádky a sloupce, kontaktujte autora.',
                moveRangeErr: 'Rozsah je chránený a nemáte oprávnenie presúvať výber. Ak chcete presúvať výber, kontaktujte autora.',
                moveRowColErr: 'Rozsah je chránený a nemáte oprávnenie presúvať riadky a stĺpce. Ak chcete presúvať riadky a stĺpce, kontaktujte autora.',
                operatorSheetErr: 'Hárok je chránený a nemáte oprávnenie pracovať s hárkom. Ak chcete pracovať s hárkom, kontaktujte autora.',
                removeRowColErr: 'Rozsah je chránený a nemáte oprávnění pro odstraňování řádků a sloupců. Pokud chcete odstraňovat řádky a sloupce, kontaktujte autora.',
                setRowColStyleErr: 'Rozsah je chránený a nemáte oprávnenie nastavovať štýly riadkov a stĺpcov. Ak chcete nastavovať štýly riadkov a stĺpcov, kontaktujte autora.',
                setStyleErr: 'Rozsah je chránený a nemáte oprávnenie nastavovať štýly. Ak chcete nastavovať štýly, kontaktujte autora.',
            },
        },
        autoFill: {
            copy: 'Kopírovať bunku',
            series: 'Vyplniť sériu',
            formatOnly: 'Iba formát',
            noFormat: 'Žiadny formát',
        },
        merge: {
            confirm: {
                title: 'Pokračovanie v zlúčení zachová iba hodnotu hornej ľavej bunky, ostatné hodnoty sa zahodia. Ste si istí, že chcete pokračovať?',
                cancel: 'Zrušiť zlúčenie',
                confirm: 'Pokračovať v zlúčení',
                warning: 'Varovanie',
                dismantleMergeCellWarning: 'To spôsobí rozdelenie niektorých zlúčených buniek. Chcete pokračovať?',
            },
        },
    },
};

export default locale;
