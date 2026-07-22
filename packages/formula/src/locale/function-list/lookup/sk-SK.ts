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
    ADDRESS: {
        description: 'Vráti adresu bunky v hárku podľa zadaného čísla riadka a stĺpca. Napríklad ADDRESS(2,3) vráti $C$2. Ďalší príklad: ADDRESS(77,300) vráti $KN$77. Na poskytnutie argumentov riadka a stĺpca môžete použiť iné funkcie, napríklad ROW a COLUMN.',
        abstract: 'Vráti odkaz ako text na jednu bunku v hárku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: {
                name: 'číslo_riadka',
                detail: 'Číselná hodnota, ktorá určuje číslo riadka použité v odkaze na bunku.',
            },
            column_num: {
                name: 'číslo_stĺpca',
                detail: 'Číselná hodnota, ktorá určuje číslo stĺpca použité v odkaze na bunku.',
            },
            abs_num: {
                name: 'typ_odkazu',
                detail: 'Číselná hodnota, ktorá určuje typ odkazu, ktorý sa má vrátiť.',
            },
            a1: {
                name: 'štýl_odkazu',
                detail: 'Logická hodnota, ktorá určuje štýl odkazu A1 alebo R1C1. V štýle A1 sú stĺpce označené písmenami a riadky číslami. V štýle R1C1 sú stĺpce aj riadky označené číslami. Ak je argument A1 TRUE alebo vynechaný, ADDRESS vráti odkaz v štýle A1; ak je FALSE, vráti odkaz v štýle R1C1.',
            },
            sheet_text: {
                name: 'názov_hárka',
                detail: 'Textová hodnota určujúca názov hárka, ktorý sa použije ako externý odkaz. Napríklad vzorec =ADDRESS(1,1,,,"Sheet2") vráti Sheet2!$A$1. Ak je sheet_text vynechaný, názov hárka sa nepoužije a vrátená adresa sa vzťahuje na aktuálny hárok.',
            },
        },
    },
    AREAS: {
        description: 'Vracia počet oblastí v odkaze',
        abstract: 'Vracia počet oblastí v odkaze',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Odkaz na bunku alebo rozsah buniek, ktorý môže odkazovať na viacero oblastí.' },
        },
    },
    CHOOSE: {
        description: 'Vyberá hodnotu zo zoznamu hodnôt.',
        abstract: 'Vyberá hodnotu zo zoznamu hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index', detail: 'Určuje, ktorý argument hodnoty sa má vybrať. Index_num musí byť číslo medzi 1 a 254, alebo vzorec či odkaz na bunku obsahujúcu číslo medzi 1 a 254.\nAk index_num = 1, CHOOSE vráti value1; ak je 2, vráti value2 atď.\nAk je index_num menší než 1 alebo väčší než počet hodnôt, CHOOSE vráti chybu #VALUE!.\nAk je index_num zlomok, skráti sa na najbližšie nižšie celé číslo.' },
            value1: { name: 'hodnota1', detail: 'CHOOSE vyberá hodnotu alebo akciu podľa index_num. Argumenty môžu byť čísla, odkazy na bunky, definované názvy, vzorce, funkcie alebo text.' },
            value2: { name: 'hodnota2', detail: '1 až 254 argumentov hodnôt.' },
        },
    },
    CHOOSECOLS: {
        description: 'Vracia zadané stĺpce z poľa',
        abstract: 'Vracia zadané stĺpce z poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole obsahujúce stĺpce, ktoré sa majú vrátiť v novom poli.' },
            colNum1: { name: 'číslo_stĺpca1', detail: 'Prvý stĺpec, ktorý sa má vrátiť.' },
            colNum2: { name: 'číslo_stĺpca2', detail: 'Ďalšie stĺpce, ktoré sa majú vrátiť.' },
        },
    },
    CHOOSEROWS: {
        description: 'Vracia zadané riadky z poľa',
        abstract: 'Vracia zadané riadky z poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole obsahujúce riadky, ktoré sa majú vrátiť v novom poli.' },
            rowNum1: { name: 'číslo_riadka1', detail: 'Prvé číslo riadka, ktoré sa má vrátiť.' },
            rowNum2: { name: 'číslo_riadka2', detail: 'Ďalšie čísla riadkov, ktoré sa majú vrátiť.' },
        },
    },
    COLUMN: {
        description: 'Vracia číslo stĺpca zadaného odkazu.',
        abstract: 'Vracia číslo stĺpca odkazu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Bunka alebo rozsah buniek, pre ktoré chcete vrátiť číslo stĺpca.' },
        },
    },
    COLUMNS: {
        description: 'Vracia počet stĺpcov v poli alebo odkaze.',
        abstract: 'Vracia počet stĺpcov v odkaze',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, vzorec poľa alebo odkaz na rozsah buniek, pre ktorý chcete počet stĺpcov.' },
        },
    },
    DROP: {
        description: 'Vylúči zadaný počet riadkov alebo stĺpcov zo začiatku alebo konca poľa',
        abstract: 'Vylúči zadaný počet riadkov alebo stĺpcov zo začiatku alebo konca poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, z ktorého sa majú odstrániť riadky alebo stĺpce.' },
            rows: { name: 'riadky', detail: 'Počet riadkov, ktoré sa majú odstrániť. Záporná hodnota odstráni z konca poľa.' },
            columns: { name: 'stĺpce', detail: 'Počet stĺpcov, ktoré sa majú odstrániť. Záporná hodnota odstráni z konca poľa.' },
        },
    },
    EXPAND: {
        description: 'Rozšíri alebo vyplní pole na zadané rozmery riadkov a stĺpcov',
        abstract: 'Rozšíri alebo vyplní pole na zadané rozmery riadkov a stĺpcov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, ktoré sa má rozšíriť.' },
            rows: { name: 'riadky', detail: 'Počet riadkov v rozšírenom poli. Ak chýba, riadky sa nerozšíria.' },
            columns: { name: 'stĺpce', detail: 'Počet stĺpcov v rozšírenom poli. Ak chýba, stĺpce sa nerozšíria.' },
            padWith: { name: 'doplnit_s', detail: 'Hodnota, ktorou sa má doplniť. Predvolene je #N/A.' },
        },
    },
    FILTER: {
        description: 'Filtruje rozsah údajov podľa kritérií, ktoré určíte',
        abstract: 'Filtruje rozsah údajov podľa kritérií, ktoré určíte',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Rozsah alebo pole, ktoré sa má filtrovať.' },
            include: { name: 'zahrnúť', detail: 'Pole logických hodnôt, kde TRUE znamená, že riadok alebo stĺpec sa má ponechať.' },
            ifEmpty: { name: 'ak_prázdne', detail: 'Hodnota, ktorá sa vráti, ak nič nezostane.' },
        },
    },
    FORMULATEXT: {
        description: 'Vracia vzorec v zadanom odkaze ako text',
        abstract: 'Vracia vzorec v zadanom odkaze ako text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Odkaz na bunku alebo rozsah buniek.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Nižšie zobrazená snímka obrazovky znázorňuje rozloženie kontingenčnej tabuľky použité v ďalších častiach. V tomto príklade funkcia =GETPIVOTDATA("Predaj";A3) vráti celkovú čiastku predaja:',
        abstract: 'Nižšie zobrazená snímka obrazovky znázorňuje rozloženie kontingenčnej tabuľky použité v ďalších častiach. V tomto príklade funkcia =GETPIVOTDATA("Predaj";A3) vráti celkovú čiastku predaja:',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: '' },
            pivotTable: { name: 'pivotTable', detail: '' },
            field1: { name: 'field1', detail: '' },
            item1: { name: 'item1', detail: '' },
        },
    },
    HLOOKUP: {
        description: 'Vyhľadá hodnotu v hornom riadku tabuľky alebo poľa hodnoty a potom vráti hodnotu v tom istom stĺpci počnúc riadkom, ktorý ste v tabuľke alebo poli zadali. Funkcia HLOOKUP sa používa pri vyhľadávaní hodnôt v zadaných riadkoch tabuľky, v ktorej sú porovnávané hodnoty zoradené v prvom riadku tabuľky. Pri vyhľadávaní hodnôt v tabuľke, v ktorej sú porovnávané hodnoty zoradené v prvom stĺpci tabuľky, sa používa funkcia VLOOKUP.',
        abstract: 'Vyhľadá hodnotu v hornom riadku tabuľky alebo poľa hodnoty a potom vráti hodnotu v tom istom stĺpci počnúc riadkom, ktorý ste v tabuľke alebo poli zadali. Funkcia HLOOKUP sa používa pri vyhľadávaní hodnôt v zadaných riadkoch tabuľky, v ktorej sú porovnávané hodnoty zoradené v prvom riadku tabuľky. Pri vyhľadávaní hodnôt v tabuľke, v ktorej sú porovnávané hodnoty zoradené v prvom stĺpci tabuľky, sa používa funkcia VLOOKUP.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'hľadaná_hodnota', detail: 'Povinné. Hodnota, ktorá sa nachádza v prvom riadku tabuľky. Vyhľadávaná_hodnota môže byť hodnotou, odkazom na bunku alebo textovým reťazcom.' },
            tableArray: { name: 'tabuľka', detail: 'Povinné. Tabuľka s informáciami, kde sa hľadajú údaje. Použite odkaz na rozsah alebo názov rozsahu. Hodnoty v prvom riadku tabuľky môžu byť textové, číselné alebo logické. Ak má argument rozsah hodnotu TRUE, musia byť hodnoty v prvom riadku tabuľky zoradené zostupne: ... -2, -1, 0, 1, 2, ..., A-Z, FALSE, TRUE; inak môže funkcia HLOOKUP vrátiť nesprávnu hodnotu. Ak má argument rozsah hodnotu FALSE, hodnoty v prvom riadku tabuľky nemusia byť zoradené. Nerozlišujú sa malé a veľké písmená. Hodnoty sa zoradia vo vzostupnom poradí, zľava doprava. Ďalšie informácie nájdete v téme Zoraďovanie údajov v rozsahu alebo tabuľke .' },
            rowIndexNum: { name: 'číslo_riadka', detail: 'Povinné. Číslo riadka v argumente pole_tabuľky, z ktorého sa vráti hodnota. Argument číslo_indexu_riadka s hodnotou 1 vráti hodnotu prvého riadka v argumente pole_tabuľky, argument číslo_indexu_riadka s hodnotou 2 vráti hodnotu druhého riadka v argumente pole_tabuľky a tak ďalej. Ak je hodnota argumentu číslo_indexu_riadka menšia ako 1, funkcia HLOOKUP vráti chybovú hodnotu #HODNOTA!, ak je hodnota argumentu číslo_indexu_riadka väčšia ako počet riadkov v argumente pole_tabuľky, funkcia HLOOKUP vráti chybovú hodnotu #ODKAZ! .' },
            rangeLookup: { name: 'približná_zhoda', detail: 'Voliteľný argument. Logická hodnota, ktorá určuje, či má funkcia HLOOKUP vyhľadať úplnú alebo približnú zhodu. Ak je hodnota TRUE alebo nie je zadaná, vráti približnú zhodu. Inými slovami, ak sa nenájde presná zhoda, vráti sa ďalšia najväčšia hodnota, ktorá je menšia ako hodnota argumentu vyhľadávaná_hodnota. Ak je hodnota FALSE, funkcia HLOOKUP nájde presnú zhodu. Ak v niektorom prípade nenájde, vráti sa chybová hodnota #NEDOSTUPNÝ.' },
        },
    },
    HSTACK: {
        description: 'Pripojí polia vodorovne a v postupnosti, aby sa vrátilo väčšie pole.',
        abstract: 'Pripojí polia vodorovne a v postupnosti, aby sa vrátilo väčšie pole.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole', detail: 'Maximum počtu riadkov z každého argumentu poľa.' },
            array2: { name: 'pole', detail: 'Skombinovaný počet všetkých stĺpcov z každého argumentu poľa.' },
        },
    },
    HYPERLINK: {
        description: 'Vytvorí hypertextový odkaz v bunke.',
        abstract: 'Vytvorí hypertextový odkaz v bunke.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3093313?hl=sk',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Úplná URL adresa odkazu v úvodzovkách alebo odkaz na bunku, ktorá takúto URL obsahuje.' },
            linkLabel: { name: 'popis', detail: 'Text, ktorý sa má zobraziť v bunke ako odkaz, v úvodzovkách alebo odkaz na bunku s takýmto textom.' },
        },
    },
    IMAGE: {
        description: 'Vracia obrázok zo zadaného zdroja',
        abstract: 'Vracia obrázok zo zadaného zdroja',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'zdroj', detail: 'URL cesta súboru obrázka s protokolom "https".' },
            altText: { name: 'alternatívny_text', detail: 'Alternatívny text, ktorý popisuje obrázok pre prístupnosť.' },
            sizing: { name: 'veľkosť', detail: 'Určuje rozmery obrázka.' },
            height: { name: 'výška', detail: 'Vlastná výška obrázka v pixeloch.' },
            width: { name: 'šírka', detail: 'Vlastná šírka obrázka v pixeloch.' },
        },
    },
    INDEX: {
        description: 'Vracia odkaz na bunku na prieniku zadaného riadka a stĺpca. Ak je odkaz z viacerých nesusediacich výberov, môžete určiť, ktorý výber použiť.',
        abstract: 'Používa index na výber hodnoty z odkazu alebo poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Odkaz na jeden alebo viac rozsahov buniek.' },
            rowNum: { name: 'číslo_riadka', detail: 'Číslo riadka v odkaze, z ktorého sa má vrátiť odkaz.' },
            columnNum: { name: 'číslo_stĺpca', detail: 'Číslo stĺpca v odkaze, z ktorého sa má vrátiť odkaz.' },
            areaNum: { name: 'číslo_oblasti', detail: 'Vyberie rozsah v odkaze, z ktorého sa má vrátiť prienik row_num a column_num.' },
        },
    },
    INDIRECT: {
        description: 'Vracia odkaz určený textovým reťazcom. Odkazy sa okamžite vyhodnotia a zobrazia svoj obsah.',
        abstract: 'Vracia odkaz určený textovou hodnotou',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'text_odkazu', detail: 'Odkaz na bunku, ktorá obsahuje odkaz v štýle A1 alebo R1C1, názov definovaný ako odkaz, alebo odkaz na bunku ako textový reťazec.' },
            a1: { name: 'a1', detail: 'Logická hodnota, ktorá určuje, aký typ odkazu obsahuje bunka ref_text.' },
        },
    },
    LOOKUP: {
        description: 'Použite, keď potrebujete hľadať v jednom riadku alebo stĺpci a nájsť hodnotu z rovnakej pozície v druhom riadku alebo stĺpci',
        abstract: 'Vyhľadáva hodnoty vo vektore alebo poli',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'hľadaná_hodnota',
                detail: 'Hodnota, ktorú LOOKUP hľadá v prvom vektore. Môže to byť číslo, text, logická hodnota alebo názov či odkaz na hodnotu.',
            },
            lookupVectorOrArray: {
                name: 'vyhľadávací_vektor_či_pole',
                detail: 'Rozsah obsahujúci iba jeden riadok alebo jeden stĺpec.',
            },
            resultVector: {
                name: 'výsledný_vektor',
                detail: 'Rozsah obsahujúci iba jeden riadok alebo jeden stĺpec. Argument result_vector musí mať rovnakú veľkosť ako lookup_vector.',
            },
        },
    },
    MATCH: {
        description: 'Funkcia MATCH vyhľadá zadanú položku v rozsahu buniek a vráti jej relatívnu pozíciu v rozsahu.',
        abstract: 'Vyhľadáva hodnoty v odkaze alebo poli',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'hľadaná_hodnota', detail: 'Hodnota, ktorú chcete nájsť v lookup_array.' },
            lookupArray: { name: 'vyhľadávacie_pole', detail: 'Rozsah buniek, v ktorom sa vyhľadáva.' },
            matchType: { name: 'typ_zhody', detail: 'Číslo -1, 0 alebo 1.' },
        },
    },
    OFFSET: {
        description: 'Vracia odkaz posunutý od zadaného odkazu',
        abstract: 'Vracia odkaz posunutý od zadaného odkazu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Odkaz, od ktorého chcete posun odvodzovať.' },
            rows: { name: 'riadky', detail: 'Počet riadkov nahor alebo nadol, o ktoré má odkaz ukazovať ľavý horný roh výsledku.' },
            cols: { name: 'stĺpce', detail: 'Počet stĺpcov doľava alebo doprava, o ktoré má odkaz ukazovať ľavý horný roh výsledku.' },
            height: { name: 'výška', detail: 'Výška v počte riadkov, ktorú má mať vrátený odkaz. Výška musí byť kladné číslo.' },
            width: { name: 'šírka', detail: 'Šírka v počte stĺpcov, ktorú má mať vrátený odkaz. Šírka musí byť kladné číslo.' },
        },
    },
    ROW: {
        description: 'Vracia číslo riadka odkazu',
        abstract: 'Vracia číslo riadka odkazu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Bunka alebo rozsah buniek, pre ktoré chcete číslo riadka.' },
        },
    },
    ROWS: {
        description: 'Vracia počet riadkov v poli alebo odkaze.',
        abstract: 'Vracia počet riadkov v odkaze',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, vzorec poľa alebo odkaz na rozsah buniek, pre ktorý chcete počet riadkov.' },
        },
    },
    RTD: {
        description: 'Získava údaje v reálnom čase z programu, ktorý podporuje automatizáciu COM',
        abstract: 'Získava údaje v reálnom čase z programu, ktorý podporuje automatizáciu COM',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'Identifikátor programu', detail: 'Identifikátor lokálne nainštalovaného doplnku automatizácie COM.' },
            server: { name: 'Server', detail: 'Názov servera doplnku; pre lokálny server použite prázdny reťazec.' },
            topic1: { name: 'Téma 1', detail: 'Prvý text určujúci údaje v reálnom čase, ktoré sa majú načítať.' },
            topic2: { name: 'Téma 2', detail: 'Voliteľné. Ďalšie texty určujúce údaje v reálnom čase.' },
        },
    },
    SORT: {
        description: 'Zoradí obsah rozsahu alebo poľa',
        abstract: 'Zoradí obsah rozsahu alebo poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Rozsah alebo pole, ktoré sa má zoradiť.' },
            sortIndex: { name: 'index_zoradenia', detail: 'Číslo určujúce poradie triedenia (podľa riadkov alebo stĺpcov).' },
            sortOrder: { name: 'poradie', detail: 'Číslo predstavujúce požadované poradie: 1 pre vzostupné (predvolené), -1 pre zostupné.' },
            byCol: { name: 'podľa_stĺpcov', detail: 'Logická hodnota určujúca smer triedenia; FALSE triedi podľa riadkov (predvolené), TRUE podľa stĺpcov.' },
        },
    },
    SORTBY: {
        description: 'Zoradí obsah rozsahu alebo poľa podľa hodnôt v zodpovedajúcom rozsahu alebo poli',
        abstract: 'Zoradí obsah rozsahu alebo poľa podľa hodnôt v zodpovedajúcom rozsahu alebo poli',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Rozsah alebo pole, ktoré sa má zoradiť.' },
            byArray1: { name: 'podľa_pola1', detail: 'Rozsah alebo pole, podľa ktorého sa má triediť.' },
            sortOrder1: { name: 'poradie1', detail: 'Číslo predstavujúce požadované poradie: 1 pre vzostupné (predvolené), -1 pre zostupné.' },
            byArray2: { name: 'podľa_pola2', detail: 'Rozsah alebo pole, podľa ktorého sa má triediť.' },
            sortOrder2: { name: 'poradie2', detail: 'Číslo predstavujúce požadované poradie: 1 pre vzostupné (predvolené), -1 pre zostupné.' },
        },
    },
    TAKE: {
        description: 'Vracia zadaný počet súvislých riadkov alebo stĺpcov zo začiatku alebo konca poľa',
        abstract: 'Vracia zadaný počet súvislých riadkov alebo stĺpcov zo začiatku alebo konca poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, z ktorého sa majú vziať riadky alebo stĺpce.' },
            rows: { name: 'riadky', detail: 'Počet riadkov, ktoré sa majú vziať. Záporná hodnota berie z konca poľa.' },
            columns: { name: 'stĺpce', detail: 'Počet stĺpcov, ktoré sa majú vziať. Záporná hodnota berie z konca poľa.' },
        },
    },
    TOCOL: {
        description: 'Vráti pole v jednom stĺpci',
        abstract: 'Vráti pole v jednom stĺpci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo odkaz, ktoré sa má vrátiť ako stĺpec.' },
            ignore: { name: 'ignorovať', detail: 'Či sa majú ignorovať určité typy hodnôt. Predvolene sa neignoruje nič. Zadajte jednu z možností:\n0 Zachovať všetky hodnoty (predvolené)\n1 Ignorovať prázdne\n2 Ignorovať chyby\n3 Ignorovať prázdne a chyby' },
            scanByColumn: { name: 'skenovať_po_stĺpcoch', detail: 'Skenovať pole po stĺpcoch. Predvolene sa pole skenuje po riadkoch. Skenovanie určuje, či sa hodnoty usporiadajú podľa riadkov alebo stĺpcov.' },
        },
    },
    TOROW: {
        description: 'Vráti pole v jednom riadku',
        abstract: 'Vráti pole v jednom riadku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo odkaz, ktoré sa má vrátiť ako riadok.' },
            ignore: { name: 'ignorovať', detail: 'Či sa majú ignorovať určité typy hodnôt. Predvolene sa neignoruje nič. Zadajte jednu z možností:\n0 Zachovať všetky hodnoty (predvolené)\n1 Ignorovať prázdne\n2 Ignorovať chyby\n3 Ignorovať prázdne a chyby' },
            scanByColumn: { name: 'skenovať_po_stĺpcoch', detail: 'Skenovať pole po stĺpcoch. Predvolene sa pole skenuje po riadkoch. Skenovanie určuje, či sa hodnoty usporiadajú podľa riadkov alebo stĺpcov.' },
        },
    },
    TRANSPOSE: {
        description: 'Vracia transpozíciu poľa',
        abstract: 'Vracia transpozíciu poľa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Rozsah buniek alebo pole v hárku.' },
        },
    },
    UNIQUE: {
        description: 'Vracia zoznam jedinečných hodnôt v zozname alebo rozsahu',
        abstract: 'Vracia zoznam jedinečných hodnôt v zozname alebo rozsahu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Rozsah alebo pole, z ktorého sa vracajú jedinečné riadky alebo stĺpce.' },
            byCol: { name: 'podľa_stĺpcov', detail: 'Logická hodnota: porovnáva riadky navzájom a vráti jedinečné hodnoty = FALSE alebo vynechané; porovnáva stĺpce navzájom a vráti jedinečné hodnoty = TRUE.' },
            exactlyOnce: { name: 'len_raz', detail: 'Logická hodnota: vráti riadky alebo stĺpce, ktoré sa v poli vyskytujú len raz = TRUE; vráti všetky odlišné riadky alebo stĺpce = FALSE alebo vynechané.' },
        },
    },
    VLOOKUP: {
        description: 'Použite VLOOKUP, keď potrebujete nájsť hodnoty v tabuľke alebo rozsahu podľa riadku. Napríklad vyhľadať cenu dielu podľa čísla dielu, alebo meno zamestnanca podľa jeho ID.',
        abstract: 'Vyhľadá v prvom stĺpci poľa a vráti hodnotu z riadka',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'hľadaná_hodnota',
                detail: 'Hodnota, ktorú chcete vyhľadať. Musí byť v prvom stĺpci rozsahu buniek zadaného v argumente table_array.',
            },
            tableArray: {
                name: 'tabuľka',
                detail: 'Rozsah buniek, v ktorom VLOOKUP hľadá hľadanú hodnotu a hodnotu na vrátenie. Môžete použiť pomenovaný rozsah alebo tabuľku; v argumente možno použiť názvy namiesto odkazov na bunky.',
            },
            colIndexNum: {
                name: 'číslo_stĺpca',
                detail: 'Číslo stĺpca (začína 1 pre ľavý stĺpec table_array), ktorý obsahuje hodnotu na vrátenie.',
            },
            rangeLookup: {
                name: 'približná_zhoda',
                detail: 'Logická hodnota určujúca, či má VLOOKUP nájsť približnú alebo presnú zhodu: Približná zhoda - 1/TRUE, Presná zhoda - 0/FALSE.',
            },
        },
    },
    VSTACK: {
        description: 'Pripojí polia vertikálne a postupne, aby vrátilo väčšie pole',
        abstract: 'Pripojí polia vertikálne a postupne, aby vrátilo väčšie pole',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole', detail: 'Polia, ktoré sa majú pripojiť.' },
            array2: { name: 'pole', detail: 'Polia, ktoré sa majú pripojiť.' },
        },
    },
    WRAPCOLS: {
        description: 'Zalomením podľa stĺpcov rozdelí zadaný riadok alebo stĺpec hodnôt po zadanom počte prvkov',
        abstract: 'Zalomením podľa stĺpcov rozdelí zadaný riadok alebo stĺpec hodnôt po zadanom počte prvkov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vektor', detail: 'Vektor alebo odkaz, ktorý sa má zalomiť.' },
            wrapCount: { name: 'počet_na_stĺpec', detail: 'Maximálny počet hodnôt v každom stĺpci.' },
            padWith: { name: 'doplnit_s', detail: 'Hodnota, ktorou sa má doplniť. Predvolene je #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Zalomením podľa riadkov rozdelí zadaný riadok alebo stĺpec hodnôt po zadanom počte prvkov',
        abstract: 'Zalomením podľa riadkov rozdelí zadaný riadok alebo stĺpec hodnôt po zadanom počte prvkov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vektor', detail: 'Vektor alebo odkaz, ktorý sa má zalomiť.' },
            wrapCount: { name: 'počet_na_riadok', detail: 'Maximálny počet hodnôt v každom riadku.' },
            padWith: { name: 'doplnit_s', detail: 'Hodnota, ktorou sa má doplniť. Predvolene je #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Vyhľadáva v rozsahu alebo poli a vráti položku zodpovedajúcu prvej nájdenej zhode. Ak zhoda neexistuje, XLOOKUP môže vrátiť najbližšiu (približnú) zhodu.',
        abstract: 'Vyhľadáva v rozsahu alebo poli a vráti položku zodpovedajúcu prvej nájdenej zhode.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'hľadaná_hodnota',
                detail: 'Hodnota, ktorú chcete hľadať. Ak je vynechaná, XLOOKUP vráti prázdne bunky, ktoré nájde v lookup_array.',
            },
            lookupArray: { name: 'vyhľadávacie_pole', detail: 'Pole alebo rozsah, v ktorom sa má hľadať.' },
            returnArray: { name: 'návratové_pole', detail: 'Pole alebo rozsah, ktorý sa má vrátiť.' },
            ifNotFound: {
                name: 'ak_nenájdené',
                detail: 'Ak sa nenájde platná zhoda, vráti sa text [if_not_found], ktorý zadáte. Ak [if_not_found] chýba, vráti sa #N/A.',
            },
            matchMode: {
                name: 'režim_zhody',
                detail: 'Určuje typ zhody: 0 - Presná zhoda. Ak sa nenájde, vráti #N/A (predvolené). -1 - Presná zhoda; ak sa nenájde, vráti najbližšiu menšiu položku. 1 - Presná zhoda; ak sa nenájde, vráti najbližšiu väčšiu položku. 2 - Zástupná zhoda, kde *, ?, a ~ majú špeciálny význam.',
            },
            searchMode: {
                name: 'režim_hľadania',
                detail: 'Určuje režim hľadania: 1 - Hľadanie od prvej položky (predvolené). -1 - Hľadanie odzadu (od poslednej položky). 2 - Binárne hľadanie s predpokladom vzostupného zoradenia lookup_array. Ak nie je zoradené, výsledok môže byť nesprávny. -2 - Binárne hľadanie s predpokladom zostupného zoradenia lookup_array. Ak nie je zoradené, výsledok môže byť nesprávny.',
            },
        },
    },
    XMATCH: {
        description: 'Vyhľadá zadanú položku v poli alebo rozsahu buniek a vráti jej relatívnu pozíciu.',
        abstract: 'Vracia relatívnu pozíciu položky v poli alebo rozsahu buniek.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'hľadaná_hodnota', detail: 'Hľadaná hodnota.' },
            lookupArray: { name: 'vyhľadávacie_pole', detail: 'Pole alebo rozsah, v ktorom sa má hľadať.' },
            matchMode: { name: 'režim_zhody', detail: 'Určuje typ zhody:\n0 - Presná zhoda (predvolené)\n-1 - Presná zhoda alebo najbližšia menšia položka\n1 - Presná zhoda alebo najbližšia väčšia položka\n2 - Zástupná zhoda, kde *, ?, a ~ majú špeciálny význam.' },
            searchMode: { name: 'režim_hľadania', detail: 'Určuje typ hľadania:\n1 - Hľadať od začiatku (predvolené)\n-1 - Hľadať odzadu.\n2 - Binárne hľadanie s predpokladom vzostupného zoradenia lookup_array. Ak nie je zoradené, výsledok môže byť nesprávny.\n-2 - Binárne hľadanie s predpokladom zostupného zoradenia lookup_array. Ak nie je zoradené, výsledok môže byť nesprávny.' },
        },
    },
};

export default locale;
