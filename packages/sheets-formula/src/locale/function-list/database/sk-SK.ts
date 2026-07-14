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
    DAVERAGE: {
        description: 'Vypočíta priemer tých hodnôt poľa (stĺpca) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        abstract: 'Vypočíta priemer tých hodnôt poľa (stĺpca) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'je rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'je rozsah buniek, ktorý obsahuje zadané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DCOUNT: {
        description: 'Spočíta bunky obsahujúce čísla v poli (stĺpci) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        abstract: 'Spočíta bunky obsahujúce čísla v poli (stĺpci) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak argument obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DCOUNTA: {
        description: 'Vráti počet buniek v poli (stĺpci) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        abstract: 'Vráti počet buniek v poli (stĺpci) zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Voliteľný argument. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DGET: {
        description: 'Zo stĺpca zoznamu alebo z databázy vyberie jednu hodnotu, ktorá spĺňa zadané kritériá.',
        abstract: 'Zo stĺpca zoznamu alebo z databázy vyberie jednu hodnotu, ktorá spĺňa zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DMAX: {
        description: 'Vráti maximálnu hodnotu v poli (stĺpci) zoznamu alebo databázy, ktorá spĺňa zadané kritériá.',
        abstract: 'Vráti maximálnu hodnotu v poli (stĺpci) zoznamu alebo databázy, ktorá spĺňa zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DMIN: {
        description: 'Vráti minimálnu hodnotu v poli (stĺpci) zoznamu alebo databázy, ktorá spĺňa zadané kritériá.',
        abstract: 'Vráti minimálnu hodnotu v poli (stĺpci) zoznamu alebo databázy, ktorá spĺňa zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DPRODUCT: {
        description: 'Vynásobí hodnoty v poli (stĺpci) položiek zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        abstract: 'Vynásobí hodnoty v poli (stĺpci) položiek zoznamu alebo databázy, ktoré spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DSTDEV: {
        description: 'Pomocou čísel vzorky, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá, odhadne smerodajnú odchýlku základného súboru.',
        abstract: 'Pomocou čísel vzorky, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá, odhadne smerodajnú odchýlku základného súboru.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DSTDEVP: {
        description: 'Vypočíta smerodajnú odchýlku základného súboru pomocou tých čísel celého základného súboru, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá.',
        abstract: 'Vypočíta smerodajnú odchýlku základného súboru pomocou tých čísel celého základného súboru, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DSUM: {
        description: 'V zozname alebo databáze poskytuje DSUM súčet čísel v poliach (stĺpcoch) záznamov, ktoré spĺňajú zadané podmienky.',
        abstract: 'V zozname alebo databáze poskytuje DSUM súčet čísel v poliach (stĺpcoch) záznamov, ktoré spĺňajú zadané podmienky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Toto je rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia . Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Táto možnosť určuje, ktorý stĺpec funkcia používa. Zadajte označenie stĺpca v úvodzovkách, napríklad "Vek" alebo "Výnos". Prípadne môžete zadať číslo (bez úvodzoviek), ktoré predstavuje pozíciu stĺpca v zozname: napríklad 1 pre prvý stĺpec, 2 pre druhý stĺpec a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Toto je rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DVAR: {
        description: 'Na základe čísiel vzorky, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá, odhadne odchýlku od základného súboru.',
        abstract: 'Na základe čísiel vzorky, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá, odhadne odchýlku od základného súboru.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
    DVARP: {
        description: 'Vypočíta odchýlku od základného súboru z čísel celého základného súboru, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá.',
        abstract: 'Vypočíta odchýlku od základného súboru z čísel celého základného súboru, ktoré v poli (stĺpci) položiek zoznamu alebo databázy spĺňajú zadané kritériá.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'databáza', detail: 'Povinné. Rozsah buniek tvoriacich zoznam alebo databázu. Databáza je zoznam súvisiacich údajov, v ktorom riadky so súvisiacimi informáciami predstavujú záznamy a stĺpce s údajmi predstavujú polia. Prvý riadok zoznamu obsahuje označenia jednotlivých stĺpcov.' },
            field: { name: 'pole', detail: 'Povinné. Označuje, ktorý stĺpec funkcia používa. Zadajte názov stĺpca ako text v úvodzovkách, napríklad "Vek" alebo "Výnos", alebo ako číslo označujúce pozíciu stĺpca v zozname: 1 pre prvý stĺpec, 2 pre druhý stĺpec, a tak ďalej.' },
            criteria: { name: 'kritériá', detail: 'Povinné. Rozsah buniek, ktorý obsahuje dané podmienky. Pre argument kritériá môžete použiť ľubovoľný rozsah, ak obsahuje aspoň jedno označenie stĺpca a aspoň jednu bunku pod týmto označením, ktorá určuje podmienku pre stĺpec.' },
        },
    },
};

export default locale;
