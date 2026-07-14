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
    ABS: {
        description: 'Liefert den Absolutwert einer Zahl. Der Absolutwert einer Zahl ist die Zahl ohne ihr Vorzeichen.',
        abstract: 'Liefert den Absolutwert einer Zahl. Der Absolutwert einer Zahl ist die Zahl ohne ihr Vorzeichen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Es ist die reelle Zahl, deren Absolutwert Sie ermitteln möchten.' },
        },
    },
    ACOS: {
        description: 'Liefert den Arkuskosinus oder umgekehrten Kosinus einer Zahl. Der Arkuskosinus ist der Winkel, dessen Kosinus "Zahl" ist. Der Ergebniswinkel wird im Bogenmaß (Radiant) im Wertebereich von 0 (Null) bis pi (Pi) angegeben.',
        abstract: 'Liefert den Arkuskosinus oder umgekehrten Kosinus einer Zahl. Der Arkuskosinus ist der Winkel, dessen Kosinus "Zahl" ist. Der Ergebniswinkel wird im Bogenmaß (Radiant) im Wertebereich von 0 (Null) bis pi (Pi) angegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Kosinus des jeweiligen Winkels und muss zwischen -1 und 1 liegen.' },
        },
    },
    ACOSH: {
        description: 'Gibt den umgekehrten hyperbolischen Kosinus einer Zahl zurück. Die Zahl muss größer oder gleich 1 sein. Der umgekehrte hyperbolische Kosinus ist der Wert, dessen hyperbolischer Kosinus zahl ist, sodass ACOSH(COSH(number)) gleich number ist.',
        abstract: 'Gibt den umgekehrten hyperbolischen Kosinus einer Zahl zurück. Die Zahl muss größer oder gleich 1 sein. Der umgekehrte hyperbolische Kosinus ist der Wert, dessen hyperbolischer Kosinus zahl ist, sodass ACOSH(COSH(number)) gleich number ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Jede beliebige reelle Zahl, die größer gleich 1 ist.' },
        },
    },
    ACOT: {
        description: 'Gibt den Hauptwert des Arkuskotangens (Umkehrfunktion des Kotangens) einer Zahl zurück.',
        abstract: 'Gibt den Hauptwert des Arkuskotangens (Umkehrfunktion des Kotangens) einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. "Zahl" ist der Kotangens des Winkels, den Sie berechnen möchten. Der Wert muss eine reelle Zahl sein.' },
        },
    },
    ACOTH: {
        description: 'Gibt den umgekehrten hyperbolischen Kotangens einer Zahl zurück.',
        abstract: 'Gibt den umgekehrten hyperbolischen Kotangens einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Der Absolutwert von number muss größer als 1 sein.' },
        },
    },
    AGGREGATE: {
        description: 'Gibt ein Aggregat in einer Liste oder einer Datenbank zurück. Mit der Funktion AGGREGAT können verschiedene Aggregatfunktionen auf eine Liste oder Datenbank mit der Option angewendet werden, ausgeblendete Zeilen sowie Fehlerwerte zu ignorieren.',
        abstract: 'Gibt ein Aggregat in einer Liste oder einer Datenbank zurück. Mit der Funktion AGGREGAT können verschiedene Aggregatfunktionen auf eine Liste oder Datenbank mit der Option angewendet werden, ausgeblendete Zeilen sowie Fehlerwerte zu ignorieren.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Erforderlich. Ein Wert von 1 bis 19, der die zu verwendende Funktion angibt.' },
            options: { name: 'options', detail: 'Erforderlich. Ein numerischer Wert, der bestimmt, welche Werte im Berechnungsbereich ignoriert werden sollen. Hinweis Ausgeblendete Zeilen, geschachtelte Teilergebnisse oder geschachtelte Aggregate werden von der Funktion nicht ignoriert, wenn das Arrayargument eine Berechnung enthält, z. B.: =AGGREGATE(14;3;A1:A100*(A1:A100>0);1)' },
            ref1: { name: 'ref1', detail: 'Erforderlich. Das erste numerische Argument für Funktionen, die mehrere numerische Argumente nutzen, für die Sie den Aggregatwert ermitteln möchten.' },
            ref2: { name: 'ref2', detail: 'Optional. Die numerischen Argumente 2 bis 253, deren Aggregatwert Sie berechnen möchten. Bei Funktionen, die ein Array annehmen, ist ref1 ein Array, eine Arrayformel oder ein Verweis auf einen Zellbereich, für den Sie den Aggregatwert verwenden möchten. Ref2 ist ein zweites Argument, das für bestimmte Funktionen erforderlich ist. Die folgenden Funktionen erfordern ein ref2-Argument:' },
        },
    },
    ARABIC: {
        description: 'Wandelt eine römische Zahl in eine arabische Zahl um.',
        abstract: 'Wandelt eine römische Zahl in eine arabische Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich. Eine Zeichenfolge in Anführungszeichen, eine leere Zeichenfolge ("") oder ein Verweis auf eine Zelle, die Text enthält.' },
        },
    },
    ASIN: {
        description: 'Gibt den Arkussinus oder umgekehrten Sinus einer Zahl zurück. Der Arkussinus ist der Winkel, dessen Sinus zahl ist. Der zurückgegebene Winkel wird im Bogenmaß im Bereich -pi/2 bis pi/2 angegeben.',
        abstract: 'Gibt den Arkussinus oder umgekehrten Sinus einer Zahl zurück. Der Arkussinus ist der Winkel, dessen Sinus zahl ist. Der zurückgegebene Winkel wird im Bogenmaß im Bereich -pi/2 bis pi/2 angegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Sinus des jeweiligen Winkels, der zwischen -1 und 1 liegen muss.' },
        },
    },
    ASINH: {
        description: 'Gibt den umgekehrten hyperbolischen Sinus einer Zahl zurück. Der inverse hyperbolische Sinus ist der Wert, dessen hyperbolischer Sinus zahl ist, sodass ASINH(SINH(number)) gleich number ist.',
        abstract: 'Gibt den umgekehrten hyperbolischen Sinus einer Zahl zurück. Der inverse hyperbolische Sinus ist der Wert, dessen hyperbolischer Sinus zahl ist, sodass ASINH(SINH(number)) gleich number ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine beliebige reelle Zahl.' },
        },
    },
    ATAN: {
        description: 'Gibt den Arkustangens oder umgekehrten Tangens einer Zahl zurück. Der Arkustangens ist der Winkel, dessen Tangens zahl ist. Der zurückgegebene Winkel wird im Bogenmaß im Bereich -pi/2 bis pi/2 angegeben.',
        abstract: 'Gibt den Arkustangens oder umgekehrten Tangens einer Zahl zurück. Der Arkustangens ist der Winkel, dessen Tangens zahl ist. Der zurückgegebene Winkel wird im Bogenmaß im Bereich -pi/2 bis pi/2 angegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Tangens des Winkels, den Sie berechnen möchten.' },
        },
    },
    ATAN2: {
        description: 'Gibt den Arkustangens oder auch umgekehrten Tangens ausgehend von einer x- und einer y-Koordinate zurück. Dieser Arkustangens ist der Winkel zwischen der x-Achse und der Linie, die durch den Koordinatenursprung (0; 0) und den Punkt verläuft, der die Koordinaten (x_Koordinate; y_Koordinate) hat. Der Winkel wird im Bogenmaß (Radiant) mit einem Wert zwischen -pi und pi (ausgenommen -pi) ausgegeben.',
        abstract: 'Gibt den Arkustangens oder auch umgekehrten Tangens ausgehend von einer x- und einer y-Koordinate zurück. Dieser Arkustangens ist der Winkel zwischen der x-Achse und der Linie, die durch den Koordinatenursprung (0; 0) und den Punkt verläuft, der die Koordinaten (x_Koordinate; y_Koordinate) hat. Der Winkel wird im Bogenmaß (Radiant) mit einem Wert zwischen -pi und pi (ausgenommen -pi) ausgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Erforderlich. Die x-Koordinate des Punkts.' },
            yNum: { name: 'y_num', detail: 'Erforderlich. Die y-Koordinate des Punkts.' },
        },
    },
    ATANH: {
        description: 'Gibt den umgekehrten hyperbolischen Tangens einer Zahl zurück. Die Zahl muss zwischen -1 und 1 (ausgenommen -1 und 1) sein. Der umgekehrte hyperbolische Tangens ist der Wert, dessen hyperbolischer Tangens zahl ist, sodass ATANH(TANH(number)) gleich number ist.',
        abstract: 'Gibt den umgekehrten hyperbolischen Tangens einer Zahl zurück. Die Zahl muss zwischen -1 und 1 (ausgenommen -1 und 1) sein. Der umgekehrte hyperbolische Tangens ist der Wert, dessen hyperbolischer Tangens zahl ist, sodass ATANH(TANH(number)) gleich number ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Jede beliebige reelle Zahl zwischen 1 und -1.' },
        },
    },
    BASE: {
        description: 'Wandelt eine Zahl in eine Textdarstellung mit der angegebenen Basis um.',
        abstract: 'Wandelt eine Zahl in eine Textdarstellung mit der angegebenen Basis um.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, die Sie umwandeln möchten. Muss eine ganze Zahl sein, die größer gleich 0 und kleiner als 2^53 ist.' },
            radix: { name: 'radix', detail: 'Erforderlich. Die Basis, in die Sie die Zahl umwandeln möchten. Muss eine ganze Zahl sein, die größer gleich 2 und kleiner gleich 36 ist.' },
            minLength: { name: 'min_length', detail: 'Optional. Die Mindestlänge der zurückgegebenen Zeichenfolge. Muss eine ganze Zahl sein, die größer gleich 0 ist.' },
        },
    },
    CEILING: {
        description: 'Rundet eine Zahl betragsmäßig auf das kleinste Vielfache von Schritt auf. Wenn Sie beispielsweise verhindern möchten, dass bei Ihren Preisen Cent verwendet werden, wobei Ihr Produkt 4,42 € kostet, können Sie die Formel =OBERGRENZE(4,42;0,05) verwenden, um die Preise entsprechend einer 5-Cent-Stufung aufzurunden.',
        abstract: 'Rundet eine Zahl betragsmäßig auf das kleinste Vielfache von Schritt auf. Wenn Sie beispielsweise verhindern möchten, dass bei Ihren Preisen Cent verwendet werden, wobei Ihr Produkt 4,42 € kostet, können Sie die Formel =OBERGRENZE(4,42;0,05) verwenden, um die Preise entsprechend einer 5-Cent-Stufung aufzurunden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, den Sie runden möchten.' },
            significance: { name: 'significance', detail: 'Erforderlich. Das Vielfache, auf das Sie runden möchten.' },
        },
    },
    CEILING_MATH: {
        description: 'Die OBERGRENZE. Die MATH-Funktion rundet eine Zahl auf die nächste ganze Zahl oder optional auf das nächste Vielfache der Signifikanz auf.',
        abstract: 'Die OBERGRENZE. Die MATH-Funktion rundet eine Zahl auf die nächste ganze Zahl oder optional auf das nächste Vielfache der Signifikanz auf.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. (muss zwischen -2.229E-308.und 9.99E+307 sein.)' },
            significance: { name: 'significance', detail: 'Optional. Dies ist die Anzahl der signifikanten Ziffern nach dem Dezimaltrennzeichen, auf die die Zahl gerundet werden soll.' },
            mode: { name: 'mode', detail: 'Optional. Dadurch wird gesteuert, ob negative Zahlen in Richtung oder weg von 0 gerundet werden.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Gibt eine Zahl zurück, die auf die nächste Ganzzahl oder auf das kleinste Vielfache von "Schritt" gerundet wurde. Die Zahl wird unabhängig von ihrem Vorzeichen aufgerundet. Ist "Zahl" oder "Schritt" 0, wird 0 zurückgegeben.',
        abstract: 'Gibt eine Zahl zurück, die auf die nächste Ganzzahl oder auf das kleinste Vielfache von "Schritt" gerundet wurde. Die Zahl wird unabhängig von ihrem Vorzeichen aufgerundet. Ist "Zahl" oder "Schritt" 0, wird 0 zurückgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll' },
            significance: { name: 'significance', detail: 'Optional. Das Vielfache, auf das die Zahl gerundet wird. Wenn "Schritt" ausgelassen wird, ist der Standardwert 1.' },
        },
    },
    COMBIN: {
        description: 'Gibt die Anzahl von Kombinationen für eine bestimmte Anzahl von Elementen zurück. Verwenden Sie KOMBINATIONEN, um zu berechnen, wie viele Gruppen aus einer bestimmten Anzahl von Elementen gebildet werden können.',
        abstract: 'Gibt die Anzahl von Kombinationen für eine bestimmte Anzahl von Elementen zurück. Verwenden Sie KOMBINATIONEN, um zu berechnen, wie viele Gruppen aus einer bestimmten Anzahl von Elementen gebildet werden können.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Anzahl von Elementen.' },
            numberChosen: { name: 'number_chosen', detail: 'Erforderlich. Gibt an, aus wie vielen Elementen jede Kombination bestehen soll.' },
        },
    },
    COMBINA: {
        description: 'Gibt die Anzahl von Kombinationen (mit Wiederholungen) für eine bestimmte Anzahl von Elementen zurück.',
        abstract: 'Gibt die Anzahl von Kombinationen (mit Wiederholungen) für eine bestimmte Anzahl von Elementen zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Muss größer gleich 0 und größer gleich "gewählte_Zahl" sein. Nicht ganzzahlige Werte werden abgeschnitten.' },
            numberChosen: { name: 'number_chosen', detail: 'Erforderlich. Muss größer gleich 0 sein. Nicht ganzzahlige Werte werden abgeschnitten.' },
        },
    },
    COS: {
        description: 'Gibt den Kosinus einer Zahl zurück.',
        abstract: 'Gibt den Kosinus einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der im Bogenmaß angegebene Winkel, dessen Kosinus Sie berechnen möchten.' },
        },
    },
    COSH: {
        description: 'Gibt den hyperbolischen Kosinus einer Zahl zurück.',
        abstract: 'Gibt den hyperbolischen Kosinus einer Zahl zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine beliebige reelle Zahl, für die Sie den hyperbolischen Kosinus ermitteln möchten.' },
        },
    },
    COT: {
        description: 'Gibt den Kotangens eines im Bogenmaß angegebenen Winkels zurück.',
        abstract: 'Gibt den Kotangens eines im Bogenmaß angegebenen Winkels zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Winkel im Bogenmaß, für den Sie den Kotangens berechnen möchten' },
        },
    },
    COTH: {
        description: 'Gibt den hyperbolischen Kotangens eines hyperbolischen Winkels zurück.',
        abstract: 'Gibt den hyperbolischen Kotangens eines hyperbolischen Winkels zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich.' },
        },
    },
    CSC: {
        description: 'Gibt den Kosekans eines im Bogenmaß angegebenen Winkels zurück.',
        abstract: 'Gibt den Kosekans eines im Bogenmaß angegebenen Winkels zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich.' },
        },
    },
    CSCH: {
        description: 'Gibt den hyperbolischen Kosekans eines im Bogenmaß angegebenen Winkels zurück.',
        abstract: 'Gibt den hyperbolischen Kosekans eines im Bogenmaß angegebenen Winkels zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich.' },
        },
    },
    DECIMAL: {
        description: 'Konvertiert eine Textdarstellung einer Zahl mit einer angegebenen Basis in eine Dezimalzahl.',
        abstract: 'Konvertiert eine Textdarstellung einer Zahl mit einer angegebenen Basis in eine Dezimalzahl.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Erforderlich.' },
            radix: { name: 'radix', detail: 'Erforderlich. Die Basis muss eine ganze Zahl sein.' },
        },
    },
    DEGREES: {
        description: 'Wandelt Bogenmaß (Radiant) in Grad um.',
        abstract: 'Wandelt Bogenmaß (Radiant) in Grad um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Erforderlich. Der in Bogenmaß (Radiant) gegebene Winkel, den Sie umwandeln möchten.' },
        },
    },
    EVEN: {
        description: 'Gibt die zahl zurück, die auf die nächste gerade ganze Zahl aufgerundet wurde. Sie können diese Funktion verwenden, um Elemente zu verarbeiten, die zu zweit vorhanden sind. Beispielsweise akzeptiert eine Packkiste Zeilen mit einem oder zwei Elementen. Die Kiste ist voll, wenn die Auf die nächsten beiden Elemente aufgerundet mit der Kapazität der Kiste übereinstimmt.',
        abstract: 'Gibt die zahl zurück, die auf die nächste gerade ganze Zahl aufgerundet wurde. Sie können diese Funktion verwenden, um Elemente zu verarbeiten, die zu zweit vorhanden sind. Beispielsweise akzeptiert eine Packkiste Zeilen mit einem oder zwei Elementen. Die Kiste ist voll, wenn die Auf die nächsten beiden Elemente aufgerundet mit der Kapazität der Kiste übereinstimmt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll.' },
        },
    },
    EXP: {
        description: 'Potenziert die Basis e mit der als Argument angegebenen Zahl. Die Konstante "e" ist die Basis des natürlichen Logarithmus und hat den Wert 2,71828182845904.',
        abstract: 'Potenziert die Basis e mit der als Argument angegebenen Zahl. Die Konstante "e" ist die Basis des natürlichen Logarithmus und hat den Wert 2,71828182845904.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Exponent zur Basis e.' },
        },
    },
    FACT: {
        description: 'Gibt die Fakultät einer Zahl zurück. Die Fakultät einer Zahl wird aus 1*2*3*...* Zahl berechnet.',
        abstract: 'Gibt die Fakultät einer Zahl zurück. Die Fakultät einer Zahl wird aus 1*2*3*...* Zahl berechnet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die nicht negative Zahl, deren Fakultät Sie berechnen möchten. Ist "Zahl" keine ganze Zahl, werden die Nachkommastellen abgeschnitten.' },
        },
    },
    FACTDOUBLE: {
        description: 'Gibt die Fakultät zu Zahl mit Schrittlänge 2 zurück.',
        abstract: 'Gibt die Fakultät zu Zahl mit Schrittlänge 2 zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, für den die Fakultät mit Schrittlänge 2 berechnet werden soll. Ist "Zahl" keine ganze Zahl, werden die Nachkommastellen abgeschnitten.' },
        },
    },
    FLOOR: {
        description: 'Die FLOOR-Funktion in Excel rundet eine angegebene Zahl auf das nächste angegebene Vielfache von Bedeutung ab. Negative Zahlen werden auf das nächste ganze Vielfache unter 0 (null) gerundet (weiter negativ).',
        abstract: 'Die FLOOR-Funktion in Excel rundet eine angegebene Zahl auf das nächste angegebene Vielfache von Bedeutung ab. Negative Zahlen werden auf das nächste ganze Vielfache unter 0 (null) gerundet (weiter negativ).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der numerische Wert, den Sie runden möchten.' },
            significance: { name: 'significance', detail: 'Erforderlich. Das Vielfache, auf das Sie runden möchten.' },
        },
    },
    FLOOR_MATH: {
        description: 'Rundet eine Zahl auf die nächste ganze Zahl oder auf das nächste Vielfache von Schritt ab.',
        abstract: 'Rundet eine Zahl auf die nächste ganze Zahl oder auf das nächste Vielfache von Schritt ab.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, die Sie abrunden möchten.' },
            significance: { name: 'significance', detail: 'Optional. Das Vielfache, auf das Sie runden möchten.' },
            mode: { name: 'mode', detail: 'Optional. Die Richtung (hin zu oder weg von 0), in der negative Zahlen gerundet werden sollen.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Rundet eine Zahl auf die nächste ganze Zahl oder das nächste Vielfache von "Schritt" ab. Die Zahl wird unabhängig vom Vorzeichen abgerundet. Wenn die Zahl oder der "Schritt" jedoch Null ist, wird Null zurückgegeben.',
        abstract: 'Rundet eine Zahl auf die nächste ganze Zahl oder das nächste Vielfache von "Schritt" ab. Die Zahl wird unabhängig vom Vorzeichen abgerundet. Wenn die Zahl oder der "Schritt" jedoch Null ist, wird Null zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll' },
            significance: { name: 'significance', detail: 'Optional. Das Vielfache, auf das die Zahl gerundet wird. Wenn "Schritt" ausgelassen wird, ist der Standardwert 1.' },
        },
    },
    GCD: {
        description: 'Gibt den größten gemeinsamen Teiler zurück. Der größte gemeinsame Teiler ist die ganze Zahl, durch die sowohl Zahl1 als auch Zahl2 dividiert werden können, ohne dass ein Rest bleibt.',
        abstract: 'Gibt den größten gemeinsamen Teiler zurück. Der größte gemeinsame Teiler ist die ganze Zahl, durch die sowohl Zahl1 als auch Zahl2 dividiert werden können, ohne dass ein Rest bleibt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte. Bei Werten, die keine ganzen Zahlen sind, werden die Nachkommastellen abgeschnitten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte. Bei Werten, die keine ganzen Zahlen sind, werden die Nachkommastellen abgeschnitten.' },
        },
    },
    INT: {
        description: 'Rundet eine Zahl auf die nächste ganze Zahl ab.',
        abstract: 'Rundet eine Zahl auf die nächste ganze Zahl ab.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die reelle Zahl, die Sie auf eine ganze Zahl runden möchten.' },
        },
    },
    ISO_CEILING: {
        description: 'Gibt eine Zahl zurück, die auf die nächste Ganzzahl oder auf das kleinste Vielfache von "Schritt" gerundet wurde. Die Zahl wird unabhängig von ihrem Vorzeichen aufgerundet. Ist "Zahl" oder "Schritt" 0, wird 0 zurückgegeben.',
        abstract: 'Gibt eine Zahl zurück, die auf die nächste Ganzzahl oder auf das kleinste Vielfache von "Schritt" gerundet wurde. Die Zahl wird unabhängig von ihrem Vorzeichen aufgerundet. Ist "Zahl" oder "Schritt" 0, wird 0 zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll' },
            significance: { name: 'significance', detail: 'Optional. Das Vielfache, auf das die Zahl gerundet wird. Wenn "Schritt" ausgelassen wird, ist der Standardwert 1.' },
        },
    },
    LCM: {
        description: 'Gibt das kleinste gemeinsame Vielfache der als Argumente angegebenen ganzen Zahlen zurück. Als kleinstes gemeinsames Vielfaches wird die kleinste positive ganze Zahl bezeichnet, die ein Vielfaches aller ganzzahligen Argumente "Zahl1", "Zahl2" und so weiter ist. KGV können Sie verwenden, wenn Sie Brüche addieren müssen, die unterschiedliche Nenner haben.',
        abstract: 'Gibt das kleinste gemeinsame Vielfache der als Argumente angegebenen ganzen Zahlen zurück. Als kleinstes gemeinsames Vielfaches wird die kleinste positive ganze Zahl bezeichnet, die ein Vielfaches aller ganzzahligen Argumente "Zahl1", "Zahl2" und so weiter ist. KGV können Sie verwenden, wenn Sie Brüche addieren müssen, die unterschiedliche Nenner haben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte, deren kleinstes gemeinsames Vielfaches Sie berechnen möchten. Bei Werten, die keine ganzen Zahlen sind, werden deren Nachkommastellen abgeschnitten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte, deren kleinstes gemeinsames Vielfaches Sie berechnen möchten. Bei Werten, die keine ganzen Zahlen sind, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    LN: {
        description: 'Gibt den natürlichen Logarithmus einer Zahl zurück. Natürliche Logarithmen haben die Konstante e (2,71828182845904) als Basis.',
        abstract: 'Gibt den natürlichen Logarithmus einer Zahl zurück. Natürliche Logarithmen haben die Konstante e (2,71828182845904) als Basis.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die positive reelle Zahl, deren natürlichen Logarithmus Sie berechnen möchten' },
        },
    },
    LOG: {
        description: 'Gibt den Logarithmus einer Zahl zu der angegebenen Basis zurück.',
        abstract: 'Gibt den Logarithmus einer Zahl zu der angegebenen Basis zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die positive reelle Zahl, deren Logarithmus Sie berechnen möchten' },
            base: { name: 'base', detail: 'Optional. Die Basis des Logarithmus. Wenn das Argument "Basis" fehlt, wird es als 10 angenommen.' },
        },
    },
    LOG10: {
        description: 'Gibt den Logarithmus einer Zahl zur Basis 10 zurück.',
        abstract: 'Gibt den Logarithmus einer Zahl zur Basis 10 zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die positive reelle Zahl, deren Logarithmus zur Basis 10 Sie berechnen möchten' },
        },
    },
    MDETERM: {
        description: 'Liefert die Determinante einer Matrix.',
        abstract: 'Liefert die Determinante einer Matrix.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Eine quadratische Matrix (die Anzahl der Zeilen und Spalten ist identisch)' },
        },
    },
    MINVERSE: {
        description: 'Die FUNKTION MINVERSE gibt die umgekehrte Matrix für eine Matrix zurück, die in einem Array gespeichert ist.',
        abstract: 'Die FUNKTION MINVERSE gibt die umgekehrte Matrix für eine Matrix zurück, die in einem Array gespeichert ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Eine quadratische Matrix (die Anzahl der Zeilen und Spalten ist identisch)' },
        },
    },
    MMULT: {
        description: 'Die MMULT-Funktion gibt das Matrixprodukt von zwei Arrays zurück. Das Ergebnis ist eine Matrix, die dieselbe Anzahl von Zeilen wie Matrix1 und dieselbe Anzahl von Spalten wie Matrix2 hat.',
        abstract: 'Die MMULT-Funktion gibt das Matrixprodukt von zwei Arrays zurück. Das Ergebnis ist eine Matrix, die dieselbe Anzahl von Zeilen wie Matrix1 und dieselbe Anzahl von Spalten wie Matrix2 hat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Die Matrizen, die Sie multiplizieren möchten.' },
            array2: { name: 'array2', detail: 'Die Matrizen, die Sie multiplizieren möchten.' },
        },
    },
    MOD: {
        description: 'Gibt den Rest einer Division zurück. Das Ergebnis hat dasselbe Vorzeichen wie Divisor.',
        abstract: 'Gibt den Rest einer Division zurück. Das Ergebnis hat dasselbe Vorzeichen wie Divisor.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, für die der Rest einer Division gesucht wird.' },
            divisor: { name: 'divisor', detail: 'Erforderlich. Die Zahl, durch die "Zahl" dividiert werden soll.' },
        },
    },
    MROUND: {
        description: 'MROUND gibt eine Zahl zurück, die auf das gewünschte Vielfache gerundet ist.',
        abstract: 'MROUND gibt eine Zahl zurück, die auf das gewünschte Vielfache gerundet ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll.' },
            multiple: { name: 'multiple', detail: 'Erforderlich. Das Vielfache, auf das Sie "Zahl" runden möchten.' },
        },
    },
    MULTINOMIAL: {
        description: 'Gibt den Polynomialkoeffizienten einer Gruppe von Zahlen zurück.',
        abstract: 'Gibt den Polynomialkoeffizienten einer Gruppe von Zahlen zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte, deren Polynomialkoeffizienten Sie berechnen möchten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Werte, deren Polynomialkoeffizienten Sie berechnen möchten.' },
        },
    },
    MUNIT: {
        description: 'Die MUNIT-Funktion gibt die Einheitenmatrix für die angegebene Dimension zurück.',
        abstract: 'Die MUNIT-Funktion gibt die Einheitenmatrix für die angegebene Dimension zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Dimension ist eine ganze Zahl, die die Dimension der zurückzugebenden Einheitsmatrix angibt. Die Funktion gibt eine Matrix zurück. Dimension muss größer als null sein.' },
        },
    },
    ODD: {
        description: 'Rundet eine Zahl auf die nächste ungerade ganze Zahl auf.',
        abstract: 'Rundet eine Zahl auf die nächste ungerade ganze Zahl auf.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der aufgerundet werden soll.' },
        },
    },
    PI: {
        description: 'Gibt den Wert pi zurück, die mathematische Konstante (3,14159265358979) mit einer Genauigkeit von 15 Stellen.',
        abstract: 'Gibt den Wert pi zurück, die mathematische Konstante (3,14159265358979) mit einer Genauigkeit von 15 Stellen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Gibt als Ergebnis eine potenzierte Zahl zurück.',
        abstract: 'Gibt als Ergebnis eine potenzierte Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, die Sie mit dem Exponenten potenzieren möchten. Es sind alle reellen Zahlen zulässig.' },
            power: { name: 'power', detail: 'Erforderlich. Der Exponent, mit dem Sie die Zahl potenzieren möchten' },
        },
    },
    PRODUCT: {
        description: 'Die FUNKTION PRODUCT multipliziert alle als Argumente angegebenen Zahlen und gibt das Produkt zurück. Wenn die Zellen A1 und A2 z. B. Zahlen enthalten, können Sie die Formel =PRODUCT(A1, A2) verwenden, um diese beiden Zahlen zusammen zu multiplizieren. Sie können denselben Vorgang auch mit dem mathematischen Operator multiplizieren ( * ) ausführen, z. B. =A1 * A2 .',
        abstract: 'Die FUNKTION PRODUCT multipliziert alle als Argumente angegebenen Zahlen und gibt das Produkt zurück. Wenn die Zellen A1 und A2 z. B. Zahlen enthalten, können Sie die Formel =PRODUCT(A1, A2) verwenden, um diese beiden Zahlen zusammen zu multiplizieren. Sie können denselben Vorgang auch mit dem mathematischen Operator multiplizieren ( * ) ausführen, z. B. =A1 * A2 .',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Die erste Zahl oder der erste Bereich, den Sie multiplizieren möchten.' },
            number2: { name: 'number2', detail: 'Optional. Bis zu 255 zusätzliche Zahlen oder Bereiche, die multipliziert werden sollen.' },
        },
    },
    QUOTIENT: {
        description: 'Gibt den ganzzahligen Anteil einer Division zurück. Diese Funktion können Sie immer dann verwenden, wenn Sie die Nachkommastellen (den Rest) einer Division löschen möchten.',
        abstract: 'Gibt den ganzzahligen Anteil einer Division zurück. Diese Funktion können Sie immer dann verwenden, wenn Sie die Nachkommastellen (den Rest) einer Division löschen möchten.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Erforderlich. Der Dividend' },
            denominator: { name: 'denominator', detail: 'Erforderlich. Der Divisor' },
        },
    },
    RADIANS: {
        description: 'Wandelt Grad in Bogenmaß (Radiant) um.',
        abstract: 'Wandelt Grad in Bogenmaß (Radiant) um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Erforderlich. Ein in Grad gegebener Winkel, den Sie umwandeln möchten' },
        },
    },
    RAND: {
        description: 'Zufallszahl gibt eine gleichmäßig verteilte zufällige reelle Zahl zurück, die größer oder gleich 0 und kleiner als 1 ist. Bei jeder Neuberechnung des jeweiligen Arbeitsblatts wird eine neue zufällige reelle Zahl ausgegeben.',
        abstract: 'Zufallszahl gibt eine gleichmäßig verteilte zufällige reelle Zahl zurück, die größer oder gleich 0 und kleiner als 1 ist. Bei jeder Neuberechnung des jeweiligen Arbeitsblatts wird eine neue zufällige reelle Zahl ausgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'In den folgenden Beispielen wurde ein Array erstellt, das 5 Zeilen hoch und 3 Spalten breit ist. Das erste gibt eine zufällige Gruppe von Werten zwischen 0 und 1 zurück, das Standardverhalten von ZUFALLSMATRIX. Die nächste gibt eine Reihe von zufälligen Dezimalwerten zwischen 1 und 100 zurück. Das dritte Beispiel schließlich gibt eine Reihe von zufälligen ganzen Zahlen zwischen 1 und 100 zurück.',
        abstract: 'In den folgenden Beispielen wurde ein Array erstellt, das 5 Zeilen hoch und 3 Spalten breit ist. Das erste gibt eine zufällige Gruppe von Werten zwischen 0 und 1 zurück, das Standardverhalten von ZUFALLSMATRIX. Die nächste gibt eine Reihe von zufälligen Dezimalwerten zwischen 1 und 100 zurück. Das dritte Beispiel schließlich gibt eine Reihe von zufälligen ganzen Zahlen zwischen 1 und 100 zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Die Anzahl der Zeilen, die zurückgegeben werden sollen' },
            columns: { name: 'columns', detail: 'Die Anzahl der Spalten, die zurückgegeben werden sollen' },
            min: { name: 'min', detail: 'Der Mindestwert, der zurückgegeben werden soll' },
            max: { name: 'max', detail: 'Der Höchstwert, der zurückgegeben werden soll' },
            wholeNumber: { name: 'whole_number', detail: 'Eine ganze Zahl oder einen Dezimalwert zurückgeben WAHR für eine ganze Zahl, FALSE für eine Dezimalzahl' },
        },
    },
    RANDBETWEEN: {
        description: 'Gibt eine ganze Zufallszahl aus dem festgelegten Bereich zurück. Bei jeder Neuberechnung des jeweiligen Arbeitsblatts wird eine neue ganze Zufallszahl ausgegeben.',
        abstract: 'Gibt eine ganze Zufallszahl aus dem festgelegten Bereich zurück. Bei jeder Neuberechnung des jeweiligen Arbeitsblatts wird eine neue ganze Zufallszahl ausgegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Erforderlich. Die kleinste ganze Zahl, die ZUFALLSBEREICH als Ergebnis zurückgeben kann.' },
            top: { name: 'top', detail: 'Erforderlich. Die größte ganze Zahl, die ZUFALLSBEREICH als Ergebnis zurückgeben kann.' },
        },
    },
    ROMAN: {
        description: 'Wandelt eine arabische Zahl in eine römische Zahl als Text um.',
        abstract: 'Wandelt eine arabische Zahl in eine römische Zahl als Text um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die arabische Zahl, die Sie umwandeln möchten' },
            form: { name: 'form', detail: 'Optional. Eine Zahl, die den Typ der römischen Zahl angibt. Die Schreibweise der römischen Zahlen reicht von klassisch bis vereinfacht, wobei die Zeichenfolge kürzer wird, sobald ein höherer Typ vorliegt. Das unten gezeigte Beispiel "RÖMISCH(499;0)" erläutert dies.' },
        },
    },
    ROUND: {
        description: 'Mit der Funktion RUNDEN wird eine Zahl auf eine angegebene Anzahl von Stellen gerundet. Wenn beispielsweise die Zelle A1 den Wert 23,7825 enthält und Sie diesen Wert auf zwei Dezimalstellen runden möchten, können Sie die folgende Formel verwenden:',
        abstract: 'Mit der Funktion RUNDEN wird eine Zahl auf eine angegebene Anzahl von Stellen gerundet. Wenn beispielsweise die Zelle A1 den Wert 23,7825 enthält und Sie diesen Wert auf zwei Dezimalstellen runden möchten, können Sie die folgende Formel verwenden:',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, die gerundet werden soll.' },
            numDigits: { name: 'num_digits', detail: 'Erforderlich. Die Anzahl der Dezimalstellen, auf die die Zahl gerundet werden soll.' },
        },
    },
    ROUNDBANK: {
        description: 'Rundet eine Zahl nach der Banker\'s-Rounding-Methode zur nächsten geraden Zahl.',
        abstract: 'Rundet eine Zahl nach der Banker\'s-Rounding-Methode zur nächsten geraden Zahl.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Die Zahl, die Sie nach der Bankerrundungsmethode runden möchten.' },
            numDigits: { name: 'num_digits', detail: 'Die Anzahl der Stellen, auf die Sie nach der Bankerrundungsmethode runden möchten.' },
        },
    },
    ROUNDDOWN: {
        description: 'Rundet die Zahl auf "Anzahl_Stellen" in Richtung Null ab.',
        abstract: 'Rundet die Zahl auf "Anzahl_Stellen" in Richtung Null ab.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine reelle Zahl, die Sie abrunden möchten' },
            numDigits: { name: 'num_digits', detail: 'Erforderlich. Gibt an, auf wie viele Dezimalstellen die Zahl gerundet werden soll' },
        },
    },
    ROUNDUP: {
        description: 'Rundet die Zahl auf Anzahl_Stellen auf.',
        abstract: 'Rundet die Zahl auf Anzahl_Stellen auf.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine reelle Zahl, die Sie aufrunden möchten' },
            numDigits: { name: 'num_digits', detail: 'Erforderlich. Gibt an, auf wie viele Dezimalstellen die Zahl gerundet werden soll' },
        },
    },
    SEC: {
        description: 'Gibt den Sekans eines Winkels zurück.',
        abstract: 'Gibt den Sekans eines Winkels zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number ist der Winkel im Bogenmaß, für den Sie den Sekans berechnen möchten.' },
        },
    },
    SECH: {
        description: 'Gibt den hyperbolischen Sekans eines Winkels zurück.',
        abstract: 'Gibt den hyperbolischen Sekans eines Winkels zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Number ist der Winkel im Bogenmaß, für den Sie den hyperbolischen Sekans berechnen möchten.' },
        },
    },
    SERIESSUM: {
        description: 'Viele Funktionen können mithilfe einer Potenzreihenentwicklung angenähert werden.',
        abstract: 'Viele Funktionen können mithilfe einer Potenzreihenentwicklung angenähert werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert der unabhängigen Variablen der Potenzreihe' },
            n: { name: 'n', detail: 'Erforderlich. Die Anfangspotenz, in die Sie "x" erheben möchten.' },
            m: { name: 'm', detail: 'Erforderlich. Das Inkrement, um das Sie "n" in jedem Glied der Reihe vergrößern möchten.' },
            coefficients: { name: 'coefficients', detail: 'Erforderlich. Ein Satz von Koeffizienten, mit denen jede aufeinanderfolgende Potenz von x multipliziert wird. Die Anzahl der Werte in Koeffizienten bestimmt die Anzahl der Begriffe in der Leistungsreihe. Wenn beispielsweise drei Werte in Koeffizienten vorhanden sind, gibt es drei Begriffe in der Leistungsreihe.' },
        },
    },
    SEQUENCE: {
        description: 'Im folgenden Beispiel wurde mit =SEQUENZ(4;5) ein Array erstellt, das 4 Zeilen hoch und 5 Spalten breit ist.',
        abstract: 'Im folgenden Beispiel wurde mit =SEQUENZ(4;5) ein Array erstellt, das 4 Zeilen hoch und 5 Spalten breit ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Die Anzahl der Zeilen, die zurückgegeben werden sollen' },
            columns: { name: 'columns', detail: 'Die Anzahl der Spalten, die zurückgegeben werden sollen' },
            start: { name: 'start', detail: 'Die erste Zahl in der Folge' },
            step: { name: 'step', detail: 'Der Betrag zum schrittweisen Erhöhen jedes nachfolgenden Werts im Array' },
        },
    },
    SIGN: {
        description: 'Bestimmt das Vorzeichen einer Zahl. Gibt 1 zurück, wenn die Zahl positiv ist, null (0), wenn die Zahl 0 ist, und -1, wenn die Zahl negativ ist.',
        abstract: 'Bestimmt das Vorzeichen einer Zahl. Gibt 1 zurück, wenn die Zahl positiv ist, null (0), wenn die Zahl 0 ist, und -1, wenn die Zahl negativ ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine beliebige reelle Zahl.' },
        },
    },
    SIN: {
        description: 'Gibt den Sinus einer Zahl zurück.',
        abstract: 'Gibt den Sinus einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Winkel im Bogenmaß, für den Sie den Sinus berechnen möchten' },
        },
    },
    SINH: {
        description: 'Gibt den hyperbolischen Sinus einer Zahl zurück.',
        abstract: 'Gibt den hyperbolischen Sinus einer Zahl zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine beliebige reelle Zahl' },
        },
    },
    SQRT: {
        description: 'Gibt die Quadratwurzel einer Zahl zurück.',
        abstract: 'Gibt die Quadratwurzel einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, deren Quadratwurzel Sie berechnen möchten' },
        },
    },
    SQRTPI: {
        description: 'Gibt die Wurzel aus der mit Pi (pi) multiplizierten Zahl zurück.',
        abstract: 'Gibt die Wurzel aus der mit Pi (pi) multiplizierten Zahl zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, mit der Pi multipliziert wird' },
        },
    },
    SUBTOTAL: {
        description: 'Gibt ein Teilergebnis in einer Liste oder Datenbank zurück. Grundsätzlich ist es einfacher, eine mit Teilergebnissen versehene Liste mithilfe des Befehls Teilergebnisse in der Gruppe Gliederung auf der Registerkarte Daten der Excel-Desktopanwendung zu erstellen. Nachdem eine solche mit Teilergebnissen versehene Liste erstellt wurde, können Sie diese mit der Funktion TEILERGEBNIS bearbeiten.',
        abstract: 'Gibt ein Teilergebnis in einer Liste oder Datenbank zurück. Grundsätzlich ist es einfacher, eine mit Teilergebnissen versehene Liste mithilfe des Befehls Teilergebnisse in der Gruppe Gliederung auf der Registerkarte Daten der Excel-Desktopanwendung zu erstellen. Nachdem eine solche mit Teilergebnissen versehene Liste erstellt wurde, können Sie diese mit der Funktion TEILERGEBNIS bearbeiten.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Erforderlich. Die Zahl 1-11 oder 101-111, die die Funktion angibt, die für das Teilergebnis verwendet werden soll. 1-11 enthält manuell ausgeblendete Zeilen, während 101-111 sie ausschließt; Herausgefilterte Zellen sind immer ausgeschlossen.' },
            ref1: { name: 'ref1', detail: 'Erforderlich. Der erste benannte Bereich oder Bezug, für den Sie das Teilergebnis berechnen möchten' },
            ref2: { name: 'ref2', detail: 'Optional. 2 bis 254 benannte Bereiche oder Bezüge, für die Sie das Teilergebnis berechnen möchten' },
        },
    },
    SUM: {
        description: 'Die FUNKTION SUMME fügt Werte hinzu. Sie können einzelne Werte, Zellbezüge oder Bereiche bzw. eine Kombination aller drei Optionen addieren.',
        abstract: 'Die FUNKTION SUMME fügt Werte hinzu. Sie können einzelne Werte, Zellbezüge oder Bereiche bzw. eine Kombination aller drei Optionen addieren.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'Die erste Zahl, die Sie addieren möchten. Die Zahl kann wie 4, ein Zellbezug wie B6 oder ein Zellbereich wie B2:B8 sein.' },
            number2: { name: 'Number 2', detail: 'Dies ist die zweite Zahl, die Sie addieren möchten. Sie können bis zu 255 Zahlen auf diese Weise angeben.' },
        },
    },
    SUMIF: {
        description: 'Sie verwenden die FUNKTION SUMMEWENN , um die Werte in einem Bereich zu summieren, die den von Ihnen angegebenen Kriterien entsprechen. Angenommen, Sie möchten in einer Spalte, die Zahlen enthält nur die Werte summieren, die größer als 5 sind. Sie können die folgende Formel verwenden: =SUMMEWENN(B2:B25;">5")',
        abstract: 'Sie verwenden die FUNKTION SUMMEWENN , um die Werte in einem Bereich zu summieren, die den von Ihnen angegebenen Kriterien entsprechen. Angenommen, Sie möchten in einer Spalte, die Zahlen enthält nur die Werte summieren, die größer als 5 sind. Sie können die folgende Formel verwenden: =SUMMEWENN(B2:B25;">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Erforderlich. Der Zellbereich, den Sie nach Kriterien auswerten möchten. Zulässige Zellen in jedem Bereich sind Zahlen oder Namen, Arrays oder Bezüge, die Zahlen enthalten. Leere Zellen und Textwerte werden ignoriert. Der ausgewählte Bereich kann Datumsangaben im Excel-Standardformat enthalten (siehe folgende Beispiele).' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Die Suchkriterien in Form einer Zahl, eines Ausdrucks, eines Zellbezugs, eines Texts oder einer Funktion, mit denen definiert wird, welche Zellen addiert werden. Es können Platzhalterzeichen eingefügt werden – ein Fragezeichen (?) zur Übereinstimmung mit einem beliebigen einzelnem Zeichen, ein Sternchen (*) zur Übereinstimmung mit einer beliebigen einzelnen Zeichenfolge. Wenn Sie ein tatsächliches Fragezeichen oder Sternchen suchen möchten, geben Sie eine Tilde ( ~ ) vor dem Zeichen ein. Kriterien können beispielsweise als 32, ">32", B5, "3?", "Apfel*", "*~?" oder HEUTE() ausgedrückt werden. Wichtig Suchkriterien in Textform oder Kriterien, die logische oder mathematische Symbole enthalten, müssen in doppelte Anführungszeichen ( " ) gesetzt werden. Bei numerischen Suchkriterien sind keine doppelten Anführungszeichen erforderlich.' },
            sumRange: { name: 'sum_range', detail: 'Optional. Die tatsächlich hinzuzufügenden Zellen, wenn Sie andere Zellen als die im Range-Argument angegebenen hinzufügen möchten. Wenn das argument sum_range ausgelassen wird, fügt Excel die Zellen hinzu, die im Argument range angegeben sind (die gleichen Zellen, auf die die Kriterien angewendet werden). Sum_range sollte die gleiche Größe und Form aufweisen wie der Bereich . Wenn dies nicht der Fall ist, kann die Leistung beeinträchtigt werden, und die Formel summiert einen Zellbereich, der mit der ersten Zelle in sum_range beginnt, aber die gleichen Dimensionen wie bereich aufweist. Beispiel: Bereich Summe_Bereich Tatsächlich summierte Zellen A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'Mit der Funktion SUMMEWENNS, einer der mathematischen und trigonometrischen Funktionen , werden alle Argumente addiert, die mehrere Kriterien erfüllen. Beispielsweise würden Sie SUMMEWENNS verwenden, um die Anzahl der Einzelhändler im Land zu addieren, (1) die in einem bestimmten Postleitzahlbereich wohnen, und (2) deren Gewinne einen bestimmten Wert überschreiten.',
        abstract: 'Mit der Funktion SUMMEWENNS, einer der mathematischen und trigonometrischen Funktionen , werden alle Argumente addiert, die mehrere Kriterien erfüllen. Beispielsweise würden Sie SUMMEWENNS verwenden, um die Anzahl der Einzelhändler im Land zu addieren, (1) die in einem bestimmten Postleitzahlbereich wohnen, und (2) deren Gewinne einen bestimmten Wert überschreiten.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'Der zu addierende Zellbereich.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Der Bereich, der mit Criteria1 getestet wird. Criteria_range1 und Criteria1 richten ein Suchpaar ein, bei dem ein Bereich nach bestimmten Kriterien durchsucht wird. Sobald Elemente im Bereich gefunden wurden, werden die entsprechenden Werte in Sum_range hinzugefügt.' },
            criteria1: { name: 'criteria1', detail: 'Die Kriterien, die definieren, welche Zellen in Criteria_range1 hinzugefügt werden. Beispielsweise können Kriterien als 32 , ">32" , B4 , "Äpfel" oder "32" eingegeben werden.' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 127 Bereich/Kriterien-Paare eingeben.' },
            criteria2: { name: 'criteria2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 127 Bereich/Kriterien-Paare eingeben.' },
        },
    },
    SUMPRODUCT: {
        description: 'Die FUNKTION SUMMENPRODUKT gibt die Summe der Produkte der entsprechenden Bereiche oder Arrays zurück. Der Standardvorgang ist Multiplikation, aber auch Addition, Subtraktion und Division sind möglich.',
        abstract: 'Die FUNKTION SUMMENPRODUKT gibt die Summe der Produkte der entsprechenden Bereiche oder Arrays zurück. Der Standardvorgang ist Multiplikation, aber auch Addition, Subtraktion und Division sind möglich.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Das erste Arrayargument, dessen Komponenten Sie multiplizieren und anschließend addieren möchten' },
            array2: { name: 'array', detail: '2 bis 255 Arrayargumente, deren Komponenten Sie multiplizieren und anschließend addieren möchten' },
        },
    },
    SUMSQ: {
        description: 'Summiert die quadrierten Argumente.',
        abstract: 'Summiert die quadrierten Argumente.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Nummer1 ist erforderlich. Nachfolgende Zahlen sind optional. Es kann bis zu 255 Argumente geben, für die Sie die Summe der Quadrate verwenden möchten.' },
            number2: { name: 'number2', detail: 'Nummer1 ist erforderlich. Nachfolgende Zahlen sind optional. Es kann bis zu 255 Argumente geben, für die Sie die Summe der Quadrate verwenden möchten.' },
        },
    },
    SUMX2MY2: {
        description: 'Diese Excel-Funktion gibt die Summe der Differenz der Quadrate der entsprechenden Werte in zwei Arrays zurück.',
        abstract: 'Diese Excel-Funktion gibt die Summe der Differenz der Quadrate der entsprechenden Werte in zwei Arrays zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Erforderlich. Die erste Matrix oder der erste Wertebereich' },
            arrayY: { name: 'array_y', detail: 'Erforderlich. Die zweite Matrix oder der zweite Wertebereich' },
        },
    },
    SUMX2PY2: {
        description: 'Summiert für zusammengehörige Komponenten zweier Matrizen die Summen der Quadrate. Die Gesamtsumme aus der Summe von Quadratzahlen ist ein Ausdruck, der häufig in statistischen Berechnungen verwendet wird.',
        abstract: 'Summiert für zusammengehörige Komponenten zweier Matrizen die Summen der Quadrate. Die Gesamtsumme aus der Summe von Quadratzahlen ist ein Ausdruck, der häufig in statistischen Berechnungen verwendet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Erforderlich. Die erste Matrix oder der erste Wertebereich' },
            arrayY: { name: 'array_y', detail: 'Erforderlich. Die zweite Matrix oder der zweite Wertebereich' },
        },
    },
    SUMXMY2: {
        description: 'Die SUMXMY2-Funktion gibt die Summe der Quadrate der Unterschiede der entsprechenden Werte in zwei Arrays zurück.',
        abstract: 'Die SUMXMY2-Funktion gibt die Summe der Quadrate der Unterschiede der entsprechenden Werte in zwei Arrays zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Das erste Array oder der erste Wertebereich. Erforderlich.' },
            arrayY: { name: 'array_y', detail: 'Das zweite Array oder wertebereich. Erforderlich.' },
        },
    },
    TAN: {
        description: 'Gibt den Tangens einer Zahl zurück.',
        abstract: 'Gibt den Tangens einer Zahl zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Winkel im Bogenmaß, für den Sie den Tangens ermitteln möchten' },
        },
    },
    TANH: {
        description: 'Gibt den hyperbolischen Tangens einer Zahl zurück.',
        abstract: 'Gibt den hyperbolischen Tangens einer Zahl zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine beliebige reelle Zahl' },
        },
    },
    TRUNC: {
        description: 'Die TRUNC-Funktionen kürzen eine Zahl auf eine ganze Zahl ab, indem der Bruchteil der Zahl entfernt wird.',
        abstract: 'Die TRUNC-Funktionen kürzen eine Zahl auf eine ganze Zahl ab, indem der Bruchteil der Zahl entfernt wird.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, deren Stellen Sie abschneiden möchten.' },
            numDigits: { name: 'num_digits', detail: 'Optional. Eine Zahl, die angibt, wie viele Nachkommastellen erhalten bleiben sollen. Der Standardwert für "Anzahl_Stellen" ist 0 (null).' },
        },
    },
};

export default locale;
