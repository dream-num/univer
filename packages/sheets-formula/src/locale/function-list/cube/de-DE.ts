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
        description: 'Gibt die Eigenschaft eines Key Performance Indicators (KPI) zurück und zeigt den KPI-Namen in der Zelle an. Ein KPI ist eine quantifizierbare Größe (z. B. der monatliche Bruttogewinn oder die quartalsweise Fluktuation), mit dem die Leistung eines Unternehmens überwacht wird.',
        abstract: 'Gibt die Eigenschaft eines Key Performance Indicators (KPI) zurück und zeigt den KPI-Namen in der Zelle an. Ein KPI ist eine quantifizierbare Größe (z. B. der monatliche Bruttogewinn oder die quartalsweise Fluktuation), mit dem die Leistung eines Unternehmens überwacht wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            kpiName: { name: 'Kpi_name', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen des KPI im Cube.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Erforderlich. Es beinhaltet die zurückgegebene KPI-Komponente und kann folgende Werte annehmen:' },
            caption: { name: 'Beschriftung', detail: 'Optional. Eine alternative Textzeichenfolge, die in der Zelle anstelle von kpi_name und kpi_property angezeigt wird.' },
        },
    },
    CUBEMEMBER: {
        description: 'Gibt ein Element oder ein Tupel aus dem Cube zurück. Wird verwendet, um zu überprüfen, ob das Element oder Tupel im Cube vorhanden ist.',
        abstract: 'Gibt ein Element oder ein Tupel aus dem Cube zurück. Wird verwendet, um zu überprüfen, ob das Element oder Tupel im Cube vorhanden ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Erforderlich. Eine Textzeichenfolge eines multidimensionalen Ausdrucks (MDX), der ein eindeutiges Element im Cube ergibt. Alternativ kann "Element_Ausdruck" auch ein Tupel sein, das als ein Zellbereich oder eine Matrixkonstante angegeben wird.' },
            caption: { name: 'Beschriftung', detail: 'Optional. Es enthält eine Textzeichenfolge, die statt der Beschriftung aus dem Cube (sofern definiert) in der Zelle angezeigt wird. Wenn ein Tupel zurückgegeben wird, entspricht die verwendete Beschriftung der Beschriftung für das letzte Element im Tupel.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Die CUBEMEMBERPROPERTY-Funktion , eine der Cubefunktionen in Excel, gibt den Wert einer Membereigenschaft aus einem Cube zurück. Damit wird geprüft, ob ein Elementname im Cube vorhanden ist, und die angegebene Eigenschaft für dieses Element wird zurückgegeben.',
        abstract: 'Die CUBEMEMBERPROPERTY-Funktion , eine der Cubefunktionen in Excel, gibt den Wert einer Membereigenschaft aus einem Cube zurück. Damit wird geprüft, ob ein Elementname im Cube vorhanden ist, und die angegebene Eigenschaft für dieses Element wird zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Erforderlich. Eine Textzeichenfolge eines multidimensionalen Ausdrucks (MDX) für ein Element im Cube.' },
            property: { name: 'Eigenschaft', detail: 'Erforderlich. Eine Textzeichenfolge des Namens der zurückgegebenen Eigenschaft oder ein Bezug auf eine Zelle, die den Namen der Eigenschaft enthält.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Gibt das n-te oder n-rangige Element in einer Menge zurück. Wird verwendet, um mindestens ein Element in einer Menge zurückzugeben, z. B. den besten Vertriebsmitarbeiter oder die 10 besten Kursteilnehmer.',
        abstract: 'Gibt das n-te oder n-rangige Element in einer Menge zurück. Wird verwendet, um mindestens ein Element in einer Menge zurückzugeben, z. B. den besten Vertriebsmitarbeiter oder die 10 besten Kursteilnehmer.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            setExpression: { name: 'Set_expression', detail: 'Erforderlich. Eine Textzeichenfolge eines Mengenausdrucks, z. B. "{[Element1].Kinder}". "Menge_Ausdruck" kann auch die CUBEMENGE-Funktion oder ein Bezug auf eine Zelle mit der CUBEMENGE-Funktion sein.' },
            rank: { name: 'Rang', detail: 'Erforderlich. Ein ganzzahliger Wert zur Angabe des obersten Werts, der zurückgegeben werden soll. Wenn "Rang" der Wert "1" ist, wird der oberste Wert zurückgegeben; ist "Rang" der Wert "2", wird der zweitoberste Wert zurückgegeben usw. Wenn die 5 obersten Werte zurückgegeben werden sollen, verwenden Sie CUBERANGELEMENT fünfmal, und geben Sie jedes Mal einen anderen Rang ("1" bis "5") an.' },
            caption: { name: 'Beschriftung', detail: 'Optional. Es ist eine Textzeichenfolge aus dem Cube, die in der Zelle statt der Beschriftung angezeigt wird, sofern dies entsprechend definiert wurde.' },
        },
    },
    CUBESET: {
        description: 'Definiert einen berechneten Satz von Elementen oder Tupeln, indem ein Satzausdruck an den Cube auf dem Server gesendet wird, der den Satz erstellt und diesen Satz anschließend an Microsoft Excel zurückgibt.',
        abstract: 'Definiert einen berechneten Satz von Elementen oder Tupeln, indem ein Satzausdruck an den Cube auf dem Server gesendet wird, der den Satz erstellt und diesen Satz anschließend an Microsoft Excel zurückgibt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            setExpression: { name: 'Set_expression', detail: 'Erforderlich. Eine Textzeichenfolge eines Set-Ausdrucks, der zu einer Reihe von Membern oder Tupeln führt. Set_expression kann auch ein Zellbezug auf einen Excel-Bereich sein, der ein oder mehrere Elemente, Tupel oder Sätze enthält, die im Satz enthalten sind.' },
            caption: { name: 'Beschriftung', detail: 'Optional. Eine Textzeichenfolge, die in der Zelle anstelle des Untertitel angezeigt wird, sofern definiert, aus dem Cube.' },
            sortOrder: { name: 'Sort_order', detail: 'Optional. Es kann folgende Werte annehmen:' },
            sortBy: { name: 'Sort_by', detail: 'Optional. Eine Textzeichenfolge des Werts, nach dem sortiert werden soll. Um beispielsweise die Stadt mit dem höchsten Umsatz zu erhalten, wäre set_expression eine Reihe von Städten, und sort_by wäre das Sales-Measure. Um die Stadt mit der höchsten Einwohnerzahl zu erhalten, wäre set_expression eine Reihe von Städten, und sort_by wäre das Bevölkerungsmaß. Wenn sort_order sort_by erfordert und sort_by weggelassen wird, gibt CUBESET den #VALUE! zurück.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Gibt die Anzahl der Elemente in einem Satz zurück.',
        abstract: 'Gibt die Anzahl der Elemente in einem Satz zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Festgelegt', detail: 'Erforderlich. Eine Textzeichenfolge eines Microsoft Excel-Ausdrucks, der zu einem von der CUBESET-Funktion definierten Satz ausgewertet wird. Set kann auch die CUBESET-Funktion oder ein Verweis auf eine Zelle sein, die die CUBESET-Funktion enthält.' },
        },
    },
    CUBEVALUE: {
        description: 'Gibt einen aggregierten Wert aus dem Cube zurück.',
        abstract: 'Gibt einen aggregierten Wert aus dem Cube zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Verbindung', detail: 'Erforderlich. Eine Textzeichenfolge mit dem Namen der Verbindung zum Cube.' },
            memberExpression: { name: 'Member_expression', detail: 'Optional. Eine Textzeichenfolge eines mehrdimensionalen Ausdrucks (MDX), der zu einem Member oder Tupel innerhalb des Cubes ausgewertet wird. Alternativ kann member_expression ein mit der CUBESET-Funktion definierter Satz sein. Verwenden Sie member_expression als Slicer, um den Teil des Cubes zu definieren, für den der aggregierte Wert zurückgegeben wird. Wenn in member_expression kein Measure angegeben ist, wird das Standardmeasure für diesen Cube verwendet.' },
        },
    },
};

export default locale;
