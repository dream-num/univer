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
    AND: {
        description: 'Die Funktion UND gibt den Wert WAHR zurück, wenn alle Argumente als WAHR bewertet werden. Werden ein oder mehrere Argumente als FALSCH bewertet, gibt die Funktion den Wert FALSCH zurück.',
        abstract: 'Die Funktion UND gibt den Wert WAHR zurück, wenn alle Argumente als WAHR bewertet werden. Werden ein oder mehrere Argumente als FALSCH bewertet, gibt die Funktion den Wert FALSCH zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Die erste Bedingung, die Sie testen möchten und die WAHR oder FALSCH ergeben kann.' },
            logical2: { name: 'logical2', detail: 'Weitere Bedingungen, die Sie testen möchten und die WAHR oder FALSCH ergeben können, bis zu maximal 255 Bedingungen.' },
        },
    },
    BYCOL: {
        description: 'Wendet einen LAMBDA-Wert auf jede Spalte an und gibt ein Array der Ergebnisse zurück. Wenn das ursprüngliche Array beispielsweise aus 3 Spalten mal 2 Zeilen besteht, enthält das zurückgegebene Array 3 Spalten mal 1 Zeilen.',
        abstract: 'Wendet einen LAMBDA-Wert auf jede Spalte an und gibt ein Array der Ergebnisse zurück. Wenn das ursprüngliche Array beispielsweise aus 3 Spalten mal 2 Zeilen besteht, enthält das zurückgegebene Array 3 Spalten mal 1 Zeilen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Eine Matrix, die nach Spalten aufgeteilt wird.' },
            lambda: { name: 'lambda', detail: 'Ein LAMBDA, das eine Spalte als einzelnen Parameter annimmt und ein Ergebnis berechnet. LAMBDA übernimmt einen einzelnen Parameter: eine Spalte aus array.' },
        },
    },
    BYROW: {
        description: 'Wendet eine LAMBDA auf jede Zeile an und gibt ein Array der Ergebnisse zurück. Wenn das ursprüngliche Array beispielsweise aus 3 Spalten mal 2 Zeilen besteht, enthält das zurückgegebene Array 1 Spalte mal 2 Zeilen.',
        abstract: 'Wendet eine LAMBDA auf jede Zeile an und gibt ein Array der Ergebnisse zurück. Wenn das ursprüngliche Array beispielsweise aus 3 Spalten mal 2 Zeilen besteht, enthält das zurückgegebene Array 1 Spalte mal 2 Zeilen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Eine Matrix, die nach Zeilen aufgeteilt wird.' },
            lambda: { name: 'lambda', detail: 'Ein LAMBDA, das eine Zeile als einzelnen Parameter annimmt und ein Ergebnis berechnet. LAMBDA übernimmt einen einzelnen Parameter: eine Zeile aus array.' },
        },
    },
    FALSE: {
        description: 'Gibt den Wahrheitswert FALSCH zurück.',
        abstract: 'Gibt den Wahrheitswert FALSCH zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Beispiel: Bei "=WENN(C2="Ja";1;2)" lautet die Anweisung: WENN(C2 = Ja, 1 zurückgeben, andernfalls 2 zurückgeben).',
        abstract: 'Beispiel: Bei "=WENN(C2="Ja";1;2)" lautet die Anweisung: WENN(C2 = Ja, 1 zurückgeben, andernfalls 2 zurückgeben).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'Die zu prüfende Bedingung.' },
            valueIfTrue: { name: 'value_if_true', detail: 'Der Wert, der zurückgegeben werden soll, wenn das Ergebnis von logical_test TRUE ist.' },
            valueIfFalse: { name: 'value_if_false', detail: 'Der Wert, der zurückgegeben werden soll, wenn das Ergebnis von logical_test FALSE ist.' },
        },
    },
    IFERROR: {
        description: 'Sie können die Funktion WENNFEHLER verwenden, um Fehler in einer Formel zu behandeln. WENNFEHLER gibt einen Wert zurück, den Sie angeben, wenn eine Formel einen Fehler auswertet. Andernfalls wird das Ergebnis der Formel zurückgegeben.',
        abstract: 'Sie können die Funktion WENNFEHLER verwenden, um Fehler in einer Formel zu behandeln. WENNFEHLER gibt einen Wert zurück, den Sie angeben, wenn eine Formel einen Fehler auswertet. Andernfalls wird das Ergebnis der Formel zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Erforderlich. Das Argument, das auf einen Fehler geprüft wird' },
            valueIfError: { name: 'value_if_error', detail: 'Erforderlich. Der zurückzugebende Wert, wenn die Formel als Fehler ausgewertet wird. Die folgenden Fehlertypen werden ausgewertet: #N/V, #WERT!, #BEZUG!, #DIV/0!, #ZAHL!, #NAME?, oder #NULL!.' },
        },
    },
    IFNA: {
        description: 'Die IFNA-Funktion gibt den wert zurück, den Sie angeben, wenn eine Formel den #N/A-Fehlerwert zurückgibt. andernfalls wird das Ergebnis der Formel zurückgegeben.',
        abstract: 'Die IFNA-Funktion gibt den wert zurück, den Sie angeben, wenn eine Formel den #N/A-Fehlerwert zurückgibt. andernfalls wird das Ergebnis der Formel zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Das Argument, das auf den Fehlerwert "#N/V" geprüft wird.' },
            valueIfNa: { name: 'value_if_na', detail: 'Der zurückzugebende Wert, wenn die Formel zum Fehlerwert "#N/V" ausgewertet wird.' },
        },
    },
    IFS: {
        description: 'Die IFS-Funktion überprüft, ob eine oder mehrere Bedingungen erfüllt sind, und gibt einen Wert zurück, der der ersten TRUE-Bedingung entspricht. WENNS kann als Ersatz für zahlreiche geschachtelte WENN-Anweisungen dienen und ist einfacher zu lesen, wenn mehrere Bedingungen verwendet werden.',
        abstract: 'Die IFS-Funktion überprüft, ob eine oder mehrere Bedingungen erfüllt sind, und gibt einen Wert zurück, der der ersten TRUE-Bedingung entspricht. WENNS kann als Ersatz für zahlreiche geschachtelte WENN-Anweisungen dienen und ist einfacher zu lesen, wenn mehrere Bedingungen verwendet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Eine Bedingung, die WAHR oder FALSCH ergibt.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Ergebnis, das zurückgegeben wird, wenn logical_test1 WAHR ergibt. Kann leer sein.' },
            logicalTest2: { name: 'logical_test2', detail: 'Eine Bedingung, die WAHR oder FALSCH ergibt.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Ergebnis, das zurückgegeben wird, wenn logical_testN WAHR ergibt. Jedes value_if_trueN entspricht einer Bedingung logical_testN. Kann leer sein.' },
        },
    },
    LAMBDA: {
        description: 'Sie können eine Funktion für eine häufig verwendete Formel erstellen, die Notwendigkeit des Kopierens und Einfügens dieser Formel beseitigen (was fehleranfällig sein kann) und effektiv Ihre eigenen Funktionen zur Bibliothek nativer Excel-Funktionen hinzufügen. Darüber hinaus sind für eine LAMBDA-Funktion weder VBA noch Makros oder JavaScript erforderlich. Daher können auch Nicht-Programmierer von deren Verwendung profitieren.',
        abstract: 'Sie können eine Funktion für eine häufig verwendete Formel erstellen, die Notwendigkeit des Kopierens und Einfügens dieser Formel beseitigen (was fehleranfällig sein kann) und effektiv Ihre eigenen Funktionen zur Bibliothek nativer Excel-Funktionen hinzufügen. Darüber hinaus sind für eine LAMBDA-Funktion weder VBA noch Makros oder JavaScript erforderlich. Daher können auch Nicht-Programmierer von deren Verwendung profitieren.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Ein Wert, der an die Funktion übergeben werden soll, z. B. ein Zellbezug, eine Zeichenfolge oder eine Zahl. Sie können bis zu 253 Parameter eingeben. Dieses Argument ist optional.' },
            calculation: { name: 'calculation', detail: 'Die Formel, die ausgeführt und als Ergebnis der Funktion zurückgegeben werden soll. Dies muss das letzte Argument sein und es muss ein Ergebnis zurückgeben. Dieses Argument ist erforderlich.' },
        },
    },
    LET: {
        description: 'Die LET Funktion weist Den Berechnungsergebnissen Namen zu. Auf diese Weise können Zwischenberechnungen, Werte oder definierte Namen innerhalb einer Formel gespeichert werden. Diese Namen gelten nur innerhalb des Bereichs der LET Funktion. Ähnlich wie Variablen bei der Programmierung LET wird durch die native Formelsyntax von Excel erreicht.',
        abstract: 'Die LET Funktion weist Den Berechnungsergebnissen Namen zu. Auf diese Weise können Zwischenberechnungen, Werte oder definierte Namen innerhalb einer Formel gespeichert werden. Diese Namen gelten nur innerhalb des Bereichs der LET Funktion. Ähnlich wie Variablen bei der Programmierung LET wird durch die native Formelsyntax von Excel erreicht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'Der erste zuzuweisende Name. Muss mit einem Buchstaben beginnen. Darf nicht das Ergebnis einer Formel sein oder mit der Bereichssyntax kollidieren.' },
            nameValue1: { name: 'name_value1', detail: 'Der Wert, der name1 zugewiesen wird.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'Eines der Folgenden:\n1. Eine Berechnung, die alle Namen innerhalb der LET-Funktion verwendet. Dies muss das letzte Argument der LET-Funktion sein.\n2. Ein zweiter Name, dem ein zweiter name_value zugewiesen wird. Wenn ein Name angegeben wird, sind name_value2 und calculation_or_name3 erforderlich.' },
            nameValue2: { name: 'name_value2', detail: 'Der Wert, der calculation_or_name2 zugewiesen wird.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'Eines der Folgenden:\n1. Eine Berechnung, die alle Namen innerhalb der LET-Funktion verwendet. Das letzte Argument der LET-Funktion muss eine Berechnung sein.\n2. Ein dritter Name, dem ein dritter name_value zugewiesen wird. Wenn ein Name angegeben wird, sind name_value3 und calculation_or_name4 erforderlich.' },
        },
    },
    MAKEARRAY: {
        description: 'Gibt ein berechnetes Array einer angegebenen Zeilen- und Spaltengröße zurück, indem eine LAMBDA-Funktion angewendet wird.',
        abstract: 'Gibt ein berechnetes Array einer angegebenen Zeilen- und Spaltengröße zurück, indem eine LAMBDA-Funktion angewendet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'Die Anzahl der Zeilen in der Matrix. Muss größer als null sein.' },
            number2: { name: 'cols', detail: 'Die Anzahl der Spalten in der Matrix. Muss größer als null sein.' },
            value3: { name: 'lambda', detail: 'Ein LAMBDA, das zum Erstellen der Matrix aufgerufen wird. LAMBDA übernimmt zwei Parameter: row (den Zeilenindex der Matrix) und col (den Spaltenindex der Matrix).' },
        },
    },
    MAP: {
        description: 'Gibt ein Array zurück, das gebildet wird, indem jeder Wert in den Arrays einem neuen Wert zugeordnet wird, indem ein LAMBDA-Wert angewendet wird, um einen neuen Wert zu erstellen.',
        abstract: 'Gibt ein Array zurück, das gebildet wird, indem jeder Wert in den Arrays einem neuen Wert zugeordnet wird, indem ein LAMBDA-Wert angewendet wird, um einen neuen Wert zu erstellen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Eine zuzuordnende Matrix array1.' },
            array2: { name: 'array2', detail: 'Eine zuzuordnende Matrix array2.' },
            lambda: { name: 'lambda', detail: 'Ein LAMBDA, das das letzte Argument sein muss und für jede übergebene Matrix einen Parameter haben muss.' },
        },
    },
    NOT: {
        description: 'Bei der Funktion NICHT wird der Wert des Arguments umgekehrt.',
        abstract: 'Bei der Funktion NICHT wird der Wert des Arguments umgekehrt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'Die Bedingung, deren Logik Sie umkehren möchten und die WAHR oder FALSCH ergeben kann.' },
        },
    },
    OR: {
        description: 'Die Funktion ODER gibt den Wert WAHR zurück, wenn eines der Argumente als WAHR bewertet wird. Wenn alle Argumente als FALSCH bewertet werden, gibt die Funktion den Wert FALSCH zurück.',
        abstract: 'Die Funktion ODER gibt den Wert WAHR zurück, wenn eines der Argumente als WAHR bewertet wird. Wenn alle Argumente als FALSCH bewertet werden, gibt die Funktion den Wert FALSCH zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Die erste Bedingung, die Sie testen möchten und die WAHR oder FALSCH ergeben kann.' },
            logical2: { name: 'logical2', detail: 'Weitere Bedingungen, die Sie testen möchten und die WAHR oder FALSCH ergeben können, bis zu maximal 255 Bedingungen.' },
        },
    },
    REDUCE: {
        description: 'Reduziert ein Array auf einen akkumulierten Wert, indem ein LAMBDA-Wert auf jeden Wert angewendet und der Gesamtwert im Akkumulator zurückgegeben wird.',
        abstract: 'Reduziert ein Array auf einen akkumulierten Wert, indem ein LAMBDA-Wert auf jeden Wert angewendet und der Gesamtwert im Akkumulator zurückgegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Legt den Anfangswert für den Akkumulator fest.' },
            array: { name: 'array', detail: 'Eine zu reduzierende Matrix.' },
            lambda: { name: 'lambda', detail: 'Ein LAMBDA, das zum Reduzieren der Matrix aufgerufen wird. LAMBDA übernimmt drei Parameter: 1. den aufsummierten und als Endergebnis zurückgegebenen Wert, 2. den aktuellen Wert aus der Matrix und 3. die auf jedes Element der Matrix angewendete Berechnung.' },
        },
    },
    SCAN: {
        description: 'Scannt ein Array, indem ein LAMBDA-Wert auf jeden Wert angewendet wird, und gibt ein Array zurück, das über jeden Zwischenwert verfügt.',
        abstract: 'Scannt ein Array, indem ein LAMBDA-Wert auf jeden Wert angewendet wird, und gibt ein Array zurück, das über jeden Zwischenwert verfügt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Legt den Startwert für den Akkumulator fest.' },
            array: { name: 'array', detail: 'Ein zu überprüfende Array.' },
            lambda: { name: 'lambda', detail: 'Ein LAMBDA-Wert, der aufgerufen wird, um das Array zu reduzieren. Der LAMBDA-Parameter akzeptiert drei Parameter: Akku Der Wert, der sich summiert hat und als Endergebnis zurückgegeben wird. Wert Der aktuelle Wert aus dem Array. Körper Die Berechnung, die auf jedes Element im Array angewendet wird.' },
        },
    },
    SWITCH: {
        description: 'Die SWITCH-Funktion wertet einen Wert (als Ausdruck bezeichnet) anhand einer Liste von Werten aus und gibt das Ergebnis zurück, das dem ersten übereinstimmenden Wert entspricht. Wenn es keine Übereinstimmung gibt, kann ein optionaler Standardwert zurückgegeben werden.',
        abstract: 'Die SWITCH-Funktion wertet einen Wert (als Ausdruck bezeichnet) anhand einer Liste von Werten aus und gibt das Ergebnis zurück, das dem ersten übereinstimmenden Wert entspricht. Wenn es keine Übereinstimmung gibt, kann ein optionaler Standardwert zurückgegeben werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Expression ist der Wert (etwa eine Zahl, ein Datum oder Text), der mit value1 bis value126 verglichen wird.' },
            value1: { name: 'value1', detail: 'ValueN ist ein Wert, der mit expression verglichen wird.' },
            result1: { name: 'result1', detail: 'ResultN ist der Wert, der zurückgegeben wird, wenn das entsprechende Argument valueN mit expression übereinstimmt. Für jedes entsprechende Argument valueN muss ein ResultN angegeben werden.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Default ist der Wert, der zurückgegeben wird, wenn in den Ausdrücken valueN keine Übereinstimmung gefunden wird. Das Argument Default ist daran erkennbar, dass kein entsprechender Ausdruck resultN vorhanden ist. Default muss das letzte Argument der Funktion sein.' },
            result2: { name: 'result2', detail: 'ResultN ist der Wert, der zurückgegeben wird, wenn das entsprechende Argument valueN mit expression übereinstimmt. Für jedes entsprechende Argument valueN muss ein ResultN angegeben werden.' },
        },
    },
    TRUE: {
        description: 'Gibt den Wahrheitswert WAHR zurück. Sie können diese Funktion verwenden, wenn Sie den Wert TRUE basierend auf einer Bedingung zurückgeben möchten. Beispiel:',
        abstract: 'Gibt den Wahrheitswert WAHR zurück. Sie können diese Funktion verwenden, wenn Sie den Wert TRUE basierend auf einer Bedingung zurückgeben möchten. Beispiel:',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'Die XOR-Funktion gibt ein logisches exklusives Or aller Argumente zurück.',
        abstract: 'Die XOR-Funktion gibt ein logisches exklusives Or aller Argumente zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Die erste Bedingung, die Sie testen möchten und die WAHR oder FALSCH ergeben kann.' },
            logical2: { name: 'logical2', detail: 'Weitere Bedingungen, die Sie testen möchten und die WAHR oder FALSCH ergeben können, bis zu maximal 255 Bedingungen.' },
        },
    },
};

export default locale;
