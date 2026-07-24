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
    BESSELI: {
        description: 'Gibt die modifizierte Besselfunktion In(x) zurück, die der für rein imaginäre Argumente ausgewerteten Besselfunktion Jn entspricht.',
        abstract: 'Gibt die modifizierte Besselfunktion In(x) zurück, die der für rein imaginäre Argumente ausgewerteten Besselfunktion Jn entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            n: { name: 'N', detail: 'Erforderlich. Die Ordnung der Besselfunktion. Ist "n" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    BESSELJ: {
        description: 'Gibt die Besselfunktion Jn(x) zurück.',
        abstract: 'Gibt die Besselfunktion Jn(x) zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            n: { name: 'N', detail: 'Erforderlich. Die Ordnung der Besselfunktion. Ist "n" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    BESSELK: {
        description: 'Gibt die modifizierte Besselfunktion Kn(x) zurück, die den für rein imaginäre Argumente ausgewerteten Besselfunktionen Jn und Yn entspricht.',
        abstract: 'Gibt die modifizierte Besselfunktion Kn(x) zurück, die den für rein imaginäre Argumente ausgewerteten Besselfunktionen Jn und Yn entspricht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            n: { name: 'N', detail: 'Erforderlich. Die Ordnung der Funktion. Ist "n" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    BESSELY: {
        description: 'Gibt die Besselfunktion Yn(x) zurück, die auch als Webersche Funktion oder Neumannsche Funktion bezeichnet wird.',
        abstract: 'Gibt die Besselfunktion Yn(x) zurück, die auch als Webersche Funktion oder Neumannsche Funktion bezeichnet wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            n: { name: 'N', detail: 'Erforderlich. Die Ordnung der Funktion. Ist "n" keine ganze Zahl, werden deren Nachkommastellen abgeschnitten.' },
        },
    },
    BIN2DEC: {
        description: 'Wandelt eine binäre Zahl (Dualzahl) in eine dezimale Zahl um.',
        abstract: 'Wandelt eine binäre Zahl (Dualzahl) in eine dezimale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die binäre Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen (10 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 9 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
        },
    },
    BIN2HEX: {
        description: 'Wandelt eine binäre Zahl (Dualzahl) in eine hexadezimale Zahl um.',
        abstract: 'Wandelt eine binäre Zahl (Dualzahl) in eine hexadezimale Zahl um.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die binäre Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen (10 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 9 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet BIN2HEX die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    BIN2OCT: {
        description: 'Wandelt eine binäre Zahl (Dualzahl) in eine oktale Zahl um.',
        abstract: 'Wandelt eine binäre Zahl (Dualzahl) in eine oktale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die binäre Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen (10 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 9 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet BIN2OCT die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    BITAND: {
        description: 'Gibt ein bitweises UND zweier Zahlen zurück.',
        abstract: 'Gibt ein bitweises UND zweier Zahlen zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Muss in dezimaler Form vorliegen und größer gleich 0 sein.' },
            number2: { name: 'number2', detail: 'Erforderlich. Muss in dezimaler Form vorliegen und größer gleich 0 sein.' },
        },
    },
    BITLSHIFT: {
        description: 'Gibt die Zahl zurück, die sich ergibt, nachdem die angegebene Zahl um die angegebene Anzahl von Bits nach links verschoben wurde.',
        abstract: 'Gibt die Zahl zurück, die sich ergibt, nachdem die angegebene Zahl um die angegebene Anzahl von Bits nach links verschoben wurde.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. "Zahl" muss eine ganze Zahl sein, die größer gleich 0 ist.' },
            shiftAmount: { name: 'shift_amount', detail: 'Erforderlich. "Verschiebebetrag" muss eine ganze Zahl sein.' },
        },
    },
    BITOR: {
        description: 'Gibt ein bitweises ODER zweier Zahlen zurück.',
        abstract: 'Gibt ein bitweises ODER zweier Zahlen zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Muss in dezimaler Form vorliegen und größer gleich 0 sein.' },
            number2: { name: 'number2', detail: 'Erforderlich. Muss in dezimaler Form vorliegen und größer gleich 0 sein.' },
        },
    },
    BITRSHIFT: {
        description: 'Gibt die Zahl zurück, die sich ergibt, nachdem die angegebene Zahl um die angegebene Anzahl von Bits nach rechts verschoben wurde.',
        abstract: 'Gibt die Zahl zurück, die sich ergibt, nachdem die angegebene Zahl um die angegebene Anzahl von Bits nach rechts verschoben wurde.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Muss eine ganze Zahl sein, die größer gleich 0 ist.' },
            shiftAmount: { name: 'shift_amount', detail: 'Erforderlich. Muss eine ganze Zahl sein.' },
        },
    },
    BITXOR: {
        description: 'Gibt ein bitweises XODER zweier Zahlen zurück.',
        abstract: 'Gibt ein bitweises XODER zweier Zahlen zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Muss größer gleich 0 sein.' },
            number2: { name: 'number2', detail: 'Erforderlich. Muss größer gleich 0 sein.' },
        },
    },
    COMPLEX: {
        description: 'Wandelt den Real- und Imaginärteil in eine komplexe Zahl um (x + yi oder x + yj).',
        abstract: 'Wandelt den Real- und Imaginärteil in eine komplexe Zahl um (x + yi oder x + yj).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Erforderlich. Der Realteil der komplexen Zahl.' },
            iNum: { name: 'i_num', detail: 'Erforderlich. Der Imaginärteil der komplexen Zahl.' },
            suffix: { name: 'suffix', detail: 'Optional. Der Buchstabe, der für die imaginäre Einheit der komplexen Zahl verwendet werden soll. Fehlt das Argument "Suffix", wird es als "i" angenommen.' },
        },
    },
    CONVERT: {
        description: 'Wandelt eine Zahl aus einem Maßsystem in ein anderes um. Beispielsweise kann UMWANDELN eine Tabelle mit Entfernungen in Meilen in eine Tabelle mit Entfernungen in Kilometern umwandeln.',
        abstract: 'Wandelt eine Zahl aus einem Maßsystem in ein anderes um. Beispielsweise kann UMWANDELN eine Tabelle mit Entfernungen in Meilen in eine Tabelle mit Entfernungen in Kilometern umwandeln.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Der Wert in from_unit, der umgewandelt werden soll.' },
            fromUnit: { name: 'from_unit', detail: 'Die Einheit für number.' },
            toUnit: { name: 'to_unit', detail: 'Die Einheit für das Ergebnis.' },
        },
    },
    DEC2BIN: {
        description: 'Wandelt eine dezimale Zahl in eine binäre Zahl (Dualzahl) um.',
        abstract: 'Wandelt eine dezimale Zahl in eine binäre Zahl (Dualzahl) um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die dezimale ganzzahlige Zahl, die Sie konvertieren möchten. Wenn number negativ ist, werden gültige Ortswerte ignoriert, und DEC2BIN gibt eine 10-stellige Binärzahl (10 Bit) zurück, bei der das wichtigste Bit das Vorzeichenbit ist. Die verbleibenden 9 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet DEC2BIN die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    DEC2HEX: {
        description: 'Wandelt eine dezimale Zahl in eine hexadezimale Zahl um.',
        abstract: 'Wandelt eine dezimale Zahl in eine hexadezimale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die dezimale ganzzahlige Zahl, die Sie konvertieren möchten. Wenn number negativ ist, werden Orte ignoriert, und DEC2HEX gibt eine hexadezimale Zahl mit 10 Zeichen (40 Bit) zurück, bei der das signifikanteste Bit das Vorzeichenbit ist. Die verbleibenden 39 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet DEC2HEX die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    DEC2OCT: {
        description: 'Wandelt eine dezimale Zahl in eine oktale Zahl um.',
        abstract: 'Wandelt eine dezimale Zahl in eine oktale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die dezimale ganzzahlige Zahl, die Sie konvertieren möchten. Wenn number negativ ist, werden Orte ignoriert, und DEC2OCT gibt eine 10-stellige (30-Bit)-Oktalzahl zurück, bei der das wichtigste Bit das Vorzeichenbit ist. Die verbleibenden 29 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Fehlt das Argument "Stellen", verwendet DEZINOKT nicht mehr Zeichen, als unbedingt erforderlich sind. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    DELTA: {
        description: 'Testet, ob zwei Werte gleich sind. Gibt 1 zurück, wenn Zahl1 = Zahl2; gibt andernfalls 0 zurück. Mit dieser Funktion können Sie eine Gruppe von Werten filtern. Wenn Sie beispielsweise mehrere DELTA-Funktionen addieren, berechnen Sie die Anzahl der gleichen Paare. Diese Funktion wird auch als Kronecker Delta-Funktion bezeichnet.',
        abstract: 'Testet, ob zwei Werte gleich sind. Gibt 1 zurück, wenn Zahl1 = Zahl2; gibt andernfalls 0 zurück. Mit dieser Funktion können Sie eine Gruppe von Werten filtern. Wenn Sie beispielsweise mehrere DELTA-Funktionen addieren, berechnen Sie die Anzahl der gleichen Paare. Diese Funktion wird auch als Kronecker Delta-Funktion bezeichnet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Die erste Zahl.' },
            number2: { name: 'number2', detail: 'Optional. Die zweite Zahl. Fehlt das Argument "Zahl2", wird es als 0 angenommen.' },
        },
    },
    ERF: {
        description: 'Gibt die Gauß\'sche Fehlerfunktion zurück.',
        abstract: 'Gibt die Gauß\'sche Fehlerfunktion zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Erforderlich. Die untere Grenze für die Integration in GAUSSFEHLER.' },
            upperLimit: { name: 'upper_limit', detail: 'Optional. Die obere Grenze für die Integration in GAUSSFEHLER. Fehlt dieses Argument, integriert GAUSSFEHLER von 0 (Null) bis "Untere_Grenze".' },
        },
    },
    ERF_PRECISE: {
        description: 'Gibt die Fehlerfunktion zurück.',
        abstract: 'Gibt die Fehlerfunktion zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Die untere Grenze für die Integration in GAUSSF.GENAU.' },
        },
    },
    ERFC: {
        description: 'Gibt das Komplement zur Funktion GAUSSFEHLER integriert zwischen x und Unendlichkeit zurück',
        abstract: 'Gibt das Komplement zur Funktion GAUSSFEHLER integriert zwischen x und Unendlichkeit zurück',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Die untere Grenze für die Integration in GAUSSFKOMPL.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Gibt das Komplement zur Funktion GAUSSFEHLER integriert zwischen x und Unendlichkeit zurück',
        abstract: 'Gibt das Komplement zur Funktion GAUSSFEHLER integriert zwischen x und Unendlichkeit zurück',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Die untere Grenze für die Integration in GAUSSFKOMPL.GENAU.' },
        },
    },
    GESTEP: {
        description: 'Gibt den Wert 1 zurück, wenn Zahl ≥ Schritt gilt; andernfalls gibt sie 0 (Null) zurück. Mit dieser Funktion können Sie eine Gruppe von Werten filtern. Beispielsweise können Sie durch Aufsummieren mehrerer GGANZZAHL-Funktionen berechnen, wie viele Werte größer sind als ein Schwellenwert.',
        abstract: 'Gibt den Wert 1 zurück, wenn Zahl ≥ Schritt gilt; andernfalls gibt sie 0 (Null) zurück. Mit dieser Funktion können Sie eine Gruppe von Werten filtern. Beispielsweise können Sie durch Aufsummieren mehrerer GGANZZAHL-Funktionen berechnen, wie viele Werte größer sind als ein Schwellenwert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Der Wert, der gegen "Schritt" geprüft werden soll.' },
            step: { name: 'step', detail: 'Optional. Der Schwellenwert. Wenn Sie für "Schritt" keinen Wert angeben, arbeitet GGANZZAHL mit 0.' },
        },
    },
    HEX2BIN: {
        description: 'Wandelt eine hexadezimale Zahl in eine Binärzahl um.',
        abstract: 'Wandelt eine hexadezimale Zahl in eine Binärzahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die hexadezimale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit (40. Bit von rechts). Die verbleibenden 9 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet HEX2BIN die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    HEX2DEC: {
        description: 'Wandelt eine hexadezimale Zahl in eine dezimale Zahl um.',
        abstract: 'Wandelt eine hexadezimale Zahl in eine dezimale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die hexadezimale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen (40 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 39 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
        },
    },
    HEX2OCT: {
        description: 'Wandelt eine hexadezimale Zahl in eine Oktalzahl um.',
        abstract: 'Wandelt eine hexadezimale Zahl in eine Oktalzahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die hexadezimale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 39 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet HEX2OCT die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    IMABS: {
        description: 'Gibt den Absolutwert (Modul) einer komplexen Zahl zurück. Akzeptiert werden Zeichenfolgen der Form x + yi oder x + yj.',
        abstract: 'Gibt den Absolutwert (Modul) einer komplexen Zahl zurück. Akzeptiert werden Zeichenfolgen der Form x + yi oder x + yj.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Absolutwert Sie berechnen möchten.' },
        },
    },
    IMAGINARY: {
        description: 'Gibt den Imaginärteil einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj vorliegt.',
        abstract: 'Gibt den Imaginärteil einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj vorliegt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Imaginärteil Sie ermitteln möchten.' },
        },
    },
    IMARGUMENT: {
        description: 'Gibt das Argument (Theta) zurück, ein im Bogenmaß ausgedrückter Winkel, sodass:',
        abstract: 'Gibt das Argument (Theta) zurück, ein im Bogenmaß ausgedrückter Winkel, sodass:',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Eine komplexe Zahl, für die das Argument soll.' },
        },
    },
    IMCONJUGATE: {
        description: 'Gibt die konjugiert komplexe Zahl zu einer komplexen Zahl zurück, wobei die komplexe Zahl als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt die konjugiert komplexe Zahl zu einer komplexen Zahl zurück, wobei die komplexe Zahl als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren konjugierte komplexe Zahl Sie erzeugen möchten' },
        },
    },
    IMCOS: {
        description: 'Gibt den Kosinus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj vorliegt.',
        abstract: 'Gibt den Kosinus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj vorliegt.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Kosinus Sie berechnen möchten' },
        },
    },
    IMCOSH: {
        description: 'Gibt den hyperbolischen Kosinus einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den hyperbolischen Kosinus einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren hyperbolischen Kosinus Sie berechnen möchten.' },
        },
    },
    IMCOT: {
        description: 'Gibt den Kotangens einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den Kotangens einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Eine komplexe Zahl, deren Kotangens Sie berechnen möchten.' },
        },
    },
    IMCOTH: {
        description: 'Die Funktion IMCOTH gibt den hyperbolischen Kotangens der angegebenen komplexen Zahl zurück. Beispielsweise gibt die komplexe Zahl „x+yi“ den Wert „coth(x+yi)“ zurück.',
        abstract: 'Die Funktion IMCOTH gibt den hyperbolischen Kotangens der angegebenen komplexen Zahl zurück. Beispielsweise gibt die komplexe Zahl „x+yi“ den Wert „coth(x+yi)“ zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=de',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Die komplexe Zahl, deren hyperbolischen Kotangens Sie berechnen möchten. Dies kann das Ergebnis der Funktion COMPLEX, eine als komplexe Zahl mit dem Imaginärteil 0 interpretierte reelle Zahl oder eine Zeichenfolge im Format „x+yi“ sein, wobei x und y Zahlen sind.' },
        },
    },
    IMCSC: {
        description: 'Gibt den Kosekans einer komplexen Zahl im Textformat "x+yi" oder "x+yj" zurück.',
        abstract: 'Gibt den Kosekans einer komplexen Zahl im Textformat "x+yi" oder "x+yj" zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Kosekans Sie berechnen möchten' },
        },
    },
    IMCSCH: {
        description: 'Gibt den hyperbolischen Koseant einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den hyperbolischen Koseant einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren hyperbolischen Kosekans Sie berechnen möchten' },
        },
    },
    IMDIV: {
        description: 'Gibt den Quotient zweier komplexer Zahlen zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        abstract: 'Gibt den Quotient zweier komplexer Zahlen zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Erforderlich. Der komplexe Zähler oder Dividend' },
            inumber2: { name: 'inumber2', detail: 'Erforderlich. Der komplexe Nenner oder Divisor' },
        },
    },
    IMEXP: {
        description: 'Gibt die algebraische Form einer in exponentieller Form vorliegenden komplexen Zahl zurück, wobei deren Exponent als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt die algebraische Form einer in exponentieller Form vorliegenden komplexen Zahl zurück, wobei deren Exponent als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, die den Exponent der in exponentieller Form vorliegenden komplexen Zahl angibt' },
        },
    },
    IMLN: {
        description: 'Gibt den natürlichen Logarithmus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt den natürlichen Logarithmus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren natürlichen Logarithmus Sie berechnen möchten' },
        },
    },
    IMLOG: {
        description: 'Die Funktion IMLOG gibt den Logarithmus einer komplexen Zahl zu einer angegebenen Basis zurück.',
        abstract: 'Die Funktion IMLOG gibt den Logarithmus einer komplexen Zahl zu einer angegebenen Basis zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=de',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Der Eingabewert der Logarithmusfunktion. Die Zahl kann als einfache Zahl, z. B. 1, geschrieben werden und wird dann als reelle Zahl interpretiert. Sie kann auch als Text in Anführungszeichen geschrieben werden, um Real- und Imaginärteil anzugeben.' },
            base: { name: 'base', detail: 'Die Basis für die Berechnung des Logarithmus. Sie muss eine positive reelle Zahl sein.' },
        },
    },
    IMLOG10: {
        description: 'Gibt den Logarithmus einer komplexen Zahl zur Basis 10 zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt den Logarithmus einer komplexen Zahl zur Basis 10 zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren gewöhnlichen (dekadischen) Logarithmus Sie berechnen möchten' },
        },
    },
    IMLOG2: {
        description: 'Gibt den Logarithmus einer komplexen Zahl zur Basis 2 zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt den Logarithmus einer komplexen Zahl zur Basis 2 zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Zweierlogarithmus Sie berechnen möchten' },
        },
    },
    IMPOWER: {
        description: 'Potenziert eine komplexe Zahl, die als Zeichenfolge der Form x + yi oder x + yj vorliegt, mit einer ganzen Zahl.',
        abstract: 'Potenziert eine komplexe Zahl, die als Zeichenfolge der Form x + yi oder x + yj vorliegt, mit einer ganzen Zahl.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, die Sie in eine Potenz erheben möchten' },
            number: { name: 'number', detail: 'Erforderlich. Der Exponent, mit dem Sie die komplexe Zahl potenzieren möchten' },
        },
    },
    IMPRODUCT: {
        description: 'Gibt das Produkt der komplexen Zahlen 1 bis 255 zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        abstract: 'Gibt das Produkt der komplexen Zahlen 1 bis 255 zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: '"Komplexe_Zahl1" ist erforderlich, die weiteren nicht. 1 bis 255 komplexe Zahlen, die multipliziert werden sollen.' },
            inumber2: { name: 'inumber2', detail: '"Komplexe_Zahl1" ist erforderlich, die weiteren nicht. 1 bis 255 komplexe Zahlen, die multipliziert werden sollen.' },
        },
    },
    IMREAL: {
        description: 'Gibt den Realteil einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt den Realteil einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Realteil Sie ermitteln möchten' },
        },
    },
    IMSEC: {
        description: 'Gibt den Sekans einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den Sekans einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Sekans Sie berechnen möchten' },
        },
    },
    IMSECH: {
        description: 'Gibt den hyperbolischen Sekans einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den hyperbolischen Sekans einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren hyperbolischen Sekans Sie berechnen möchten' },
        },
    },
    IMSIN: {
        description: 'Diese Funktion gibt den Sinus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Diese Funktion gibt den Sinus einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Sinus Sie berechnen möchten' },
        },
    },
    IMSINH: {
        description: 'Die FUNKTION IMSINH gibt den hyperbolischen Sinus einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Die FUNKTION IMSINH gibt den hyperbolischen Sinus einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren hyperbolischen Sinus Sie berechnen möchten' },
        },
    },
    IMSQRT: {
        description: 'Gibt die Quadratwurzel einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        abstract: 'Gibt die Quadratwurzel einer komplexen Zahl zurück, die als Zeichenfolge der Form x + yi oder x + yj eingegeben wird.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Quadratwurzel Sie berechnen möchten' },
        },
    },
    IMSUB: {
        description: 'Gibt die Differenz zweier komplexer Zahlen zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        abstract: 'Gibt die Differenz zweier komplexer Zahlen zurück, die beide als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Erforderlich. Die komplexe Zahl, von der "Komplexe_Zahl2" subtrahiert werden soll.' },
            inumber2: { name: 'inumber2', detail: 'Erforderlich. Die komplexe Zahl, die von "Komplexe_Zahl1" subtrahiert werden soll.' },
        },
    },
    IMSUM: {
        description: 'Gibt die Summe komplexer Zahlen zurück, die als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        abstract: 'Gibt die Summe komplexer Zahlen zurück, die als Zeichenfolgen der Form x + yi oder x + yj erwartet werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Inumber1 ist erforderlich, nachfolgende Zahlen nicht. 1 bis 255 komplexe Zahlen, die addiert werden sollen.' },
            inumber2: { name: 'inumber2', detail: 'Inumber1 ist erforderlich, nachfolgende Zahlen nicht. 1 bis 255 komplexe Zahlen, die addiert werden sollen.' },
        },
    },
    IMTAN: {
        description: 'Gibt den Tangens einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        abstract: 'Gibt den Tangens einer komplexen Zahl im Textformat x+yi oder x+yj zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Erforderlich. Die komplexe Zahl, deren Tangens Sie berechnen möchten' },
        },
    },
    IMTANH: {
        description: 'Die Funktion IMTANH gibt den hyperbolischen Tangens der angegebenen komplexen Zahl zurück. Beispielsweise gibt die komplexe Zahl „x+yi“ den Wert „tanh(x+yi)“ zurück.',
        abstract: 'Die Funktion IMTANH gibt den hyperbolischen Tangens der angegebenen komplexen Zahl zurück. Beispielsweise gibt die komplexe Zahl „x+yi“ den Wert „tanh(x+yi)“ zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=de',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Die komplexe Zahl, deren hyperbolischen Tangens Sie berechnen möchten. Dies kann das Ergebnis der Funktion COMPLEX, eine als komplexe Zahl mit dem Imaginärteil 0 interpretierte reelle Zahl oder eine Zeichenfolge im Format „x+yi“ sein, wobei x und y Zahlen sind.' },
        },
    },
    OCT2BIN: {
        description: 'Wandelt eine oktale Zahl in eine binäre Zahl (Dualzahl) um.',
        abstract: 'Wandelt eine oktale Zahl in eine binäre Zahl (Dualzahl) um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die oktale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 Zeichen enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 29 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet OCT2BIN die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
    OCT2DEC: {
        description: 'Wandelt eine oktale Zahl in eine dezimale Zahl um.',
        abstract: 'Wandelt eine oktale Zahl in eine dezimale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die oktale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 oktale Zeichen (30 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 29 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
        },
    },
    OCT2HEX: {
        description: 'Wandelt eine oktale Zahl in eine hexadezimale Zahl um.',
        abstract: 'Wandelt eine oktale Zahl in eine hexadezimale Zahl um.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die oktale Zahl, die Sie konvertieren möchten. Die Zahl darf nicht mehr als 10 oktale Zeichen (30 Bits) enthalten. Das wichtigste Bit der Zahl ist das Vorzeichenbit. Die verbleibenden 29 Bits sind Magnitude-Bits. Negative Zahlen werden mit der Komplementnotation von zwei dargestellt.' },
            places: { name: 'places', detail: 'Optional. Gibt an, wie viele Zeichen angezeigt werden sollen. Wenn Orte weggelassen werden, verwendet OCT2HEX die erforderliche Mindestanzahl von Zeichen. Das Argument Stellen ist speziell dann hilfreich, wenn der jeweilige Rückgabewert mit führenden Nullen aufgefüllt werden soll.' },
        },
    },
};

export default locale;
