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
    CUBEKPIMEMBER: {
        description: 'Vráti vlastnosť kľúčového indikátora výkonu (KPI) a v bunke zobrazí názov KPI. Kľúčový indikátor výkonu (KPI) je kvantitatívna miera, ako napríklad hrubý mesačný zisk alebo štvrťročná fluktuácia zamestnancov, ktoré sa používajú na sledovanie výkonu organizácie.',
        abstract: 'Vráti vlastnosť kľúčového indikátora výkonu (KPI) a v bunke zobrazí názov KPI. Kľúčový indikátor výkonu (KPI) je kvantitatívna miera, ako napríklad hrubý mesačný zisk alebo štvrťročná fluktuácia zamestnancov, ktoré sa používajú na sledovanie výkonu organizácie.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            kpiName: { name: 'Kpi_name', detail: 'Povinné. Predstavuje textový reťazec názvu indikátora KPI v kocke.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Povinné. Predstavuje vrátený komponent indikátora KPI a môže byť jedným z nasledovných:' },
            caption: { name: 'Titulky', detail: 'Voliteľný argument. Predstavuje alternatívny textový reťazec, ktorý sa zobrazí v bunke namiesto argumentov názov_kuv a vlastnosť_kuv.' },
        },
    },
    CUBEMEMBER: {
        description: 'Vráti člen alebo n-ticu kocky. Používa sa na overenie existencie člena alebo n-tice v kocke.',
        abstract: 'Vráti člen alebo n-ticu kocky. Používa sa na overenie existencie člena alebo n-tice v kocke.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            memberExpression: { name: 'Member_expression', detail: 'Povinné. Predstavuje textový reťazec multidimenzionálneho výrazu (MDX), ktorý sa vyhodnocuje ako jedinečný člen v kocke. Argument členský_výraz môže byť n-tica určená ako rozsah buniek alebo pole konštánt.' },
            caption: { name: 'Titulky', detail: 'Voliteľný argument. Predstavuje textový reťazec, ktorý sa zobrazí v bunke namiesto nadpisu (ak je definovaný) z kocky. Ak je vrátená n-tica, použije sa nadpis posledného člena n-tice.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Funkcia CUBEMEMBERPROPERTY , jedna z funkcií kocky v Exceli, vráti hodnotu vlastnosti člena kocky. Používa sa na overenie existencie názvu člena kocky a vráti určitú vlastnosť tohto člena.',
        abstract: 'Funkcia CUBEMEMBERPROPERTY , jedna z funkcií kocky v Exceli, vráti hodnotu vlastnosti člena kocky. Používa sa na overenie existencie názvu člena kocky a vráti určitú vlastnosť tohto člena.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            memberExpression: { name: 'Member_expression', detail: 'Povinné. Predstavuje textový reťazec multidimenzionálneho výrazu (MDX) člena kocky.' },
            property: { name: 'Vlastnosť', detail: 'Povinné. Predstavuje textový reťazec názvu vrátenej vlastnosti alebo referenciu na bunku obsahujúcu názov vlastnosti.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Vráti n-tého alebo zoradeného člena množiny. Používa sa na vrátenie jedného alebo viacerých prvkov množiny, ako napríklad najpredávanejšieho interpreta alebo 10 najlepších študentov.',
        abstract: 'Vráti n-tého alebo zoradeného člena množiny. Používa sa na vrátenie jedného alebo viacerých prvkov množiny, ako napríklad najpredávanejšieho interpreta alebo 10 najlepších študentov.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            setExpression: { name: 'Set_expression', detail: 'Povinné. Predstavuje textový reťazec výrazu množiny, ako napríklad "{[Položka1].children}". Argumentom výraz_množiny môže byť aj funkcia CUBESET alebo odkaz na bunku obsahujúcu funkciu CUBESET.' },
            rank: { name: 'Pozícia', detail: 'Povinné. Predstavuje celočíselnú hodnotu určujúcu, ktorá najvyššia hodnota sa má vrátiť. Ak má argument poradie hodnotu 1, vráti sa najvyššia hodnota, ak má argument poradie hodnotu 2, vráti sa druhá najvyššia hodnota, atď. Ak chcete vrátiť prvých 5 hodnôt, použite funkciu CUBERANKEDMEMBER päťkrát a zakaždým určite odlišný argument poradie, od 1 po 5.' },
            caption: { name: 'Titulky', detail: 'Voliteľný argument. Predstavuje textový reťazec, ktorý sa zobrazí v bunke namiesto nadpisu (ak je definovaný) z kocky.' },
        },
    },
    CUBESET: {
        description: 'Definuje vypočítavanú množinu členov alebo n-tíc odoslaním výrazu pre množinu do kocky na serveri, ktorý vytvára množinu, a potom ju odošle programu Microsoft Excel.',
        abstract: 'Definuje vypočítavanú množinu členov alebo n-tíc odoslaním výrazu pre množinu do kocky na serveri, ktorý vytvára množinu, a potom ju odošle programu Microsoft Excel.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            setExpression: { name: 'Set_expression', detail: 'Povinné. Predstavuje textový reťazec výrazu množiny, ktorého výsledkom je množina členov alebo n-tíc. Argumentom výraz_množiny môže byť aj odkaz na rozsah buniek programu Excel obsahujúci jeden alebo viacero členov, n-tíc alebo množín obsiahnutých v množine.' },
            caption: { name: 'Titulky', detail: 'Voliteľný argument. Predstavuje textový reťazec, ktorý sa zobrazí v bunke namiesto nadpisu (ak je definovaný) z kocky.' },
            sortOrder: { name: 'Sort_order', detail: 'Voliteľný argument. Predstavuje druh radenia, aké sa v prípade jeho zadania vykoná, pričom môže byť jedným z nasledovných:' },
            sortBy: { name: 'Sort_by', detail: 'Voliteľný argument. Predstavuje textový reťazec hodnoty, podľa ktorej sa má zoraďovať. Ak napríklad chcete získať mesto s najvyšším predajom, set_expression by predstavovala množina miest a sort_by bola miera predaja. Ak by sme chceli získať mesto s najvyššou populáciou, set_expression by išlo o množinu miest a sort_by by bola miera počtu obyvateľov. Ak sort_order vyžaduje sort_by a sort_by nie je zadaná, funkcia CUBESET vráti #VALUE! chybové hlásenie.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Vráti počet položiek v množine.',
        abstract: 'Vráti počet položiek v množine.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Nastaviť', detail: 'Povinné. Predstavuje textový reťazec výrazu programu Microsoft Excel, ktorý nadobúda hodnotu množiny definovanej funkciou CUBESET. Argumentom množina môže byť aj funkcia CUBESET alebo odkaz na bunku obsahujúcu funkciu CUBESET.' },
        },
    },
    CUBEVALUE: {
        description: 'Vráti súhrnnú hodnotu kocky.',
        abstract: 'Vráti súhrnnú hodnotu kocky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Pripojenie', detail: 'Povinné. Predstavuje textový reťazec názvu pripojenia ku kocke.' },
            memberExpression: { name: 'Member_expression', detail: 'Voliteľný argument. Predstavuje textový reťazec multidimenzionálneho výrazu (MDX), ktorý sa vyhodnocuje ako jedinečný člen alebo n-tica v kocke. Argumentom členský_výraz môže byť aj množina definovaná funkciou CUBESET. Argument členský_výraz používajte ako rozdeľovač, ktorým definujete časť kocky, ktorej agregátnu hodnotu chcete vrátiť. Ak argument členský_výraz neurčuje žiadnu mieru, použije sa predvolená miera kocky.' },
        },
    },
};

export default locale;
