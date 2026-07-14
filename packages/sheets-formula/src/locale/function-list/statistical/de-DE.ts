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
    AVEDEV: {
        description: 'Gibt die durchschnittliche absolute Abweichung einer Reihe von Merkmalsausprägungen und ihrem Mittelwert zurück. MITTELABW ist ein Maß für die Streuung innerhalb einer Datengruppe.',
        abstract: 'Gibt die durchschnittliche absolute Abweichung einer Reihe von Merkmalsausprägungen und ihrem Mittelwert zurück. MITTELABW ist ein Maß für die Streuung innerhalb einer Datengruppe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Durchschnitt der absoluten Abweichungen verwenden möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Durchschnitt der absoluten Abweichungen verwenden möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    AVERAGE: {
        description: 'Gibt den Mittelwert (arithmetisches Mittel) der Argumente zurück. Wenn beispielsweise der Bereich A1:A20 Zahlen enthält, gibt die Formel =MITTELWERT(A1:A20) den Mittelwert dieser Zahlen zurück.',
        abstract: 'Gibt den Mittelwert (arithmetisches Mittel) der Argumente zurück. Wenn beispielsweise der Bereich A1:A20 Zahlen enthält, gibt die Formel =MITTELWERT(A1:A20) den Mittelwert dieser Zahlen zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Die erste Zahl, der Zellbezug oder der erste Bereich, für den Sie den Durchschnitt verwenden möchten.' },
            number2: { name: 'number2', detail: 'Optional. Bis zu 255 zusätzliche Zahlen, Zellbezüge oder Bereiche, für die Sie den Mittelwert berechnen möchten.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Die Funktion AVERAGE.WEIGHTED berechnet den gewichteten Mittelwert einer Wertemenge anhand der Werte und ihrer jeweiligen Gewichtungen.',
        abstract: 'Die Funktion AVERAGE.WEIGHTED berechnet den gewichteten Mittelwert einer Wertemenge anhand der Werte und ihrer jeweiligen Gewichtungen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=de',
            },
        ],
        functionParameter: {
            values: { name: 'Werte', detail: 'Die Werte, deren Mittelwert berechnet werden soll. Dies kann ein Zellbereich oder eine Liste von Werten sein.' },
            weights: { name: 'Gewichtungen', detail: 'Die entsprechende Liste der anzuwendenden Gewichtungen. Gewichtungen dürfen null, aber nicht negativ sein; mindestens eine Gewichtung muss positiv sein. Ein Zellbereich muss dieselbe Anzahl von Zeilen und Spalten wie der Wertebereich haben.' },
            additionalValues: { name: 'zusätzliche_Werte', detail: 'Weitere optionale Werte, deren Mittelwert berechnet werden soll.' },
            additionalWeights: { name: 'zusätzliche_Gewichtungen', detail: 'Weitere optionale Gewichtungen. Auf jeden zusätzlichen_Wert muss genau eine zusätzliche_Gewichtung folgen.' },
        },
    },
    AVERAGEA: {
        description: 'Berechnet den Mittelwert (arithmetisches Mittel) der Werte in der Liste der Argumente.',
        abstract: 'Berechnet den Mittelwert (arithmetisches Mittel) der Werte in der Liste der Argumente.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Zellen, Zellbereiche oder Werte, für die Sie den Durchschnitt verwenden möchten.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Zellen, Zellbereiche oder Werte, für die Sie den Durchschnitt verwenden möchten.' },
        },
    },
    AVERAGEIF: {
        description: 'Gibt den Durchschnittswert (arithmetisches Mittel) für alle Zellen eines Bereichs zurück, die einem angegebenen Kriterium entsprechen.',
        abstract: 'Gibt den Durchschnittswert (arithmetisches Mittel) für alle Zellen eines Bereichs zurück, die einem angegebenen Kriterium entsprechen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Erforderlich. Der Bereich der Zellen, für die der Mittelwert berechnet werden soll, einschließlich Zahlen, Namen, Arrays oder Bezügen, die Zahlen enthalten.' },
            criteria: { name: 'criteria', detail: 'Erforderlich. Die Kriterien in Form einer Zahl, eines Ausdrucks, eines Zellbezugs oder eines Texts, mit denen definiert wird, für welche Zellen der Mittelwert berechnet werden soll. Kriterien können beispielsweise als 32, "32", ">32", "Äpfel" oder B4 ausgedrückt werden.' },
            averageRange: { name: 'average_range', detail: 'Optional. Der tatsächliche Bereich der Zellen, für die der Mittelwert berechnet wird. Fehlt diese Argument, wird "Bereich" verwendet.' },
        },
    },
    AVERAGEIFS: {
        description: 'Gibt den Durchschnittswert (arithmetisches Mittel) aller Zellen zurück, die mehreren Kriterien entsprechen.',
        abstract: 'Gibt den Durchschnittswert (arithmetisches Mittel) aller Zellen zurück, die mehreren Kriterien entsprechen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Erforderlich. Der Bereich der Zellen, für die der Mittelwert berechnet werden soll, einschließlich Zahlen, Namen, Arrays oder Bezügen, die Zahlen enthalten.' },
            criteriaRange1: { name: 'criteria_range1', detail: '"Kriterien_Bereich1" ist erforderlich, weitere Kriterienbereiche sind optional. 1 bis 127 Bereiche, für die die zugeordneten Kriterien ausgewertet werden sollen.' },
            criteria1: { name: 'criteria1', detail: 'Criteria1 ist erforderlich, nachfolgende Kriterien sind optional. 1 bis 127 Kriterien in Form einer Zahl, eines Ausdrucks, eines Zellbezugs oder eines Texts, mit denen definiert wird, für welche Zellen der Mittelwert berechnet werden soll. Kriterien können beispielsweise als 32, "32", ">32", "Äpfel" oder B4 ausgedrückt werden.' },
            criteriaRange2: { name: 'criteria_range2', detail: '"Kriterien_Bereich1" ist erforderlich, weitere Kriterienbereiche sind optional. 1 bis 127 Bereiche, für die die zugeordneten Kriterien ausgewertet werden sollen.' },
            criteria2: { name: 'criteria2', detail: 'Criteria1 ist erforderlich, nachfolgende Kriterien sind optional. 1 bis 127 Kriterien in Form einer Zahl, eines Ausdrucks, eines Zellbezugs oder eines Texts, mit denen definiert wird, für welche Zellen der Mittelwert berechnet werden soll. Kriterien können beispielsweise als 32, "32", ">32", "Äpfel" oder B4 ausgedrückt werden.' },
        },
    },
    BETA_DIST: {
        description: 'Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        abstract: 'Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, an dem die Funktion im Intervall zwischen A und B ausgewertet werden soll.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, BETA. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
            A: { name: 'A', detail: 'Eine untere Grenze des Intervalls für X.' },
            B: { name: 'B', detail: 'Optional. Eine obere Grenze des Intervalls für X.' },
        },
    },
    BETA_INV: {
        description: 'Wenn Wahrscheinlichkeit = BETA.VERT(x;...WAHR) ist, dann ist BETA.INV(Wahrsch;...) = x. Die Betaverteilung kann für eine Projektplanung verwendet werden, um ausgehend von einem erwarteten Endtermin und der Streuung den wahrscheinlichen Endtermin zu modellieren.',
        abstract: 'Wenn Wahrscheinlichkeit = BETA.VERT(x;...WAHR) ist, dann ist BETA.INV(Wahrsch;...) = x. Die Betaverteilung kann für eine Projektplanung verwendet werden, um ausgehend von einem erwarteten Endtermin und der Streuung den wahrscheinlichen Endtermin zu modellieren.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Betaverteilung gehörende Wahrscheinlichkeit.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            A: { name: 'A', detail: 'Eine untere Grenze des Intervalls für X.' },
            B: { name: 'B', detail: 'Optional. Eine obere Grenze des Intervalls für X.' },
        },
    },
    BINOM_DIST: {
        description: 'Gibt Wahrscheinlichkeiten einer binomialverteilten Zufallsvariablen zurück. Verwenden Sie BINOM.VERT bei Problemen mit einer festgelegten Anzahl von Tests oder Versuchen, wenn das Ergebnis jedes einzelnen Versuchs entweder Erfolg oder Misserfolg ist, die einzelnen Versuche voneinander unabhängig sind und die Wahrscheinlichkeit des Erfolgs für alle Versuche konstant ist. Mit BINOM.VERT lässt sich beispielsweise die Wahrscheinlichkeit ermitteln, mit der zwei von drei Neugeborenen männlich sind.',
        abstract: 'Gibt Wahrscheinlichkeiten einer binomialverteilten Zufallsvariablen zurück. Verwenden Sie BINOM.VERT bei Problemen mit einer festgelegten Anzahl von Tests oder Versuchen, wenn das Ergebnis jedes einzelnen Versuchs entweder Erfolg oder Misserfolg ist, die einzelnen Versuche voneinander unabhängig sind und die Wahrscheinlichkeit des Erfolgs für alle Versuche konstant ist. Mit BINOM.VERT lässt sich beispielsweise die Wahrscheinlichkeit ermitteln, mit der zwei von drei Neugeborenen männlich sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Erforderlich. Die Anzahl der Erfolge in einer Versuchsreihe.' },
            trials: { name: 'trials', detail: 'Erforderlich. Die Anzahl der voneinander unabhängigen Versuche.' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit eines Erfolgs für jeden Versuch.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, dann BINOM. DIST gibt die kumulierte Verteilungsfunktion zurück, also die Wahrscheinlichkeit, dass es höchstens number_s Erfolge gibt; False gibt die Wahrscheinlichkeits-Massenfunktion zurück, d. h. die Wahrscheinlichkeit, dass es number_s Erfolge gibt.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Gibt die Erfolgswahrscheinlichkeit eines Versuchsergebnisses als Binomialverteilung zurück.',
        abstract: 'Gibt die Erfolgswahrscheinlichkeit eines Versuchsergebnisses als Binomialverteilung zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Erforderlich. Die Anzahl von unabhängigen Versuchen. Muss größer gleich 0 sein.' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit eines Erfolgs in jedem Versuch. Muss größer gleich 0 und kleiner gleich 1 sein.' },
            numberS: { name: 'number_s', detail: 'Erforderlich. Die Anzahl von Erfolgen in Versuchen. Muss größer gleich 0 und kleiner gleich "Versuche" sein.' },
            numberS2: { name: 'number_s2', detail: 'Optional. Gibt bei Angabe die Wahrscheinlichkeit zurück, dass die Anzahl der erfolgreichen Testversionen zwischen Number_s und number_s2 liegt. Muss größer oder gleich Number_s und kleiner oder gleich Testversionen sein.' },
        },
    },
    BINOM_INV: {
        description: 'Gibt den kleinsten Wert zurück, für den die kumulierten Wahrscheinlichkeiten der Binomialverteilung größer oder gleich einer Grenzwahrscheinlichkeit sind.',
        abstract: 'Gibt den kleinsten Wert zurück, für den die kumulierten Wahrscheinlichkeiten der Binomialverteilung größer oder gleich einer Grenzwahrscheinlichkeit sind.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Erforderlich. Die Anzahl der Bernoulliexperimente.' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit eines Erfolgs für jeden Versuch.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Die Grenzwahrscheinlichkeit.' },
        },
    },
    CHISQ_DIST: {
        description: 'Gibt die Chi-Quadrat-Verteilung zurück.',
        abstract: 'Gibt die Chi-Quadrat-Verteilung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit berechnet werden soll.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, CHISQ. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Die χ2-Verteilung wird bei einem χ2-Test benötigt. Mit dem χ2-Test lassen sich beobachtete und erwartete Werte miteinander vergleichen. So wird beispielsweise in einem genetischen Experiment die Hypothese aufgestellt, dass die nächste Pflanzengeneration eine bestimmte Farbzusammensetzung aufweist. Durch Vergleich der beobachteten mit den erwarteten Ergebnissen lässt sich die Hypothese validieren.',
        abstract: 'Die χ2-Verteilung wird bei einem χ2-Test benötigt. Mit dem χ2-Test lassen sich beobachtete und erwartete Werte miteinander vergleichen. So wird beispielsweise in einem genetischen Experiment die Hypothese aufgestellt, dass die nächste Pflanzengeneration eine bestimmte Farbzusammensetzung aufweist. Durch Vergleich der beobachteten mit den erwarteten Ergebnissen lässt sich die Hypothese validieren.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit berechnet werden soll.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
        },
    },
    CHISQ_INV: {
        description: 'Gibt die Werte der Verteilungsfunktion einer Chi-Quadrat-verteilten Zufallsvariablen zurück. Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        abstract: 'Gibt die Werte der Verteilungsfunktion einer Chi-Quadrat-verteilten Zufallsvariablen zurück. Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Chi-Quadrat-Verteilung gehörende Wahrscheinlichkeit.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Ist Wahrsch = CHIQU.VERT.RE(x;...) gegeben, dann gilt CHIQU.INV.RE(Wahrsch;...) = x. Mithilfe dieser Funktion lassen sich zum Zweck der Validierung von Hypothesen beobachtete und erwartete Ergebnisse miteinander vergleichen.',
        abstract: 'Ist Wahrsch = CHIQU.VERT.RE(x;...) gegeben, dann gilt CHIQU.INV.RE(Wahrsch;...) = x. Mithilfe dieser Funktion lassen sich zum Zweck der Validierung von Hypothesen beobachtete und erwartete Ergebnisse miteinander vergleichen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Chi-Quadrat-Verteilung gehörende Wahrscheinlichkeit.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
        },
    },
    CHISQ_TEST: {
        description: 'Liefert die Teststatistik eines Unabhängigkeitstests. CHIQU.TEST gibt den Wert der chi-quadrierten (χ2)-Verteilung für die Teststatistik mit den entsprechenden Freiheitsgraden zurück. Mithilfe von χ2-Tests können Sie feststellen, ob in Experimenten die Ergebnisse bestätigt werden, die aufgrund von Hypothesen erwartet wurden.',
        abstract: 'Liefert die Teststatistik eines Unabhängigkeitstests. CHIQU.TEST gibt den Wert der chi-quadrierten (χ2)-Verteilung für die Teststatistik mit den entsprechenden Freiheitsgraden zurück. Mithilfe von χ2-Tests können Sie feststellen, ob in Experimenten die Ergebnisse bestätigt werden, die aufgrund von Hypothesen erwartet wurden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Erforderlich. Der Bereich beobachteter Daten, mit dem Sie die erwarteten Werte testen möchten.' },
            expectedRange: { name: 'expected_range', detail: 'Erforderlich. Der Bereich erwarteter Beobachtungen, die sich aus der Division der miteinander multiplizierten Rangsummen und der Gesamtsumme berechnen lassen.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Das Konfidenzintervall ist ein Wertebereich. Ihr Stichprobenmittelwert x befindet sich in der Mitte dieses Bereichs, und der Bereich ist x ± CONFIDENCE.NORM. Wenn z. B. x der Stichprobenmittelwert der Lieferzeiten für Produkte ist, die per Post bestellt wurden, ± X KONFIDENZ. NORM ist ein Bereich von Bevölkerungsmitteln. Bei jedem Populationsmittel μ0 in diesem Bereich ist die Wahrscheinlichkeit, einen Probenmittelwert zu erhalten, der weiter von μ0 als x liegt, größer als alpha; für jeden Populationsmittelwert μ0, der sich nicht in diesem Bereich befindet, ist die Wahrscheinlichkeit, einen Stichprobenmittelwert zu erhalten, der weiter von μ0 als x liegt, kleiner als alpha. Anders ausgedrückt: Angenommen, wir verwenden x, standard_dev und size, um einen zweiseitigen Test auf Signifikanzebene alpha der Hypothese zu erstellen, dass der Grundgesamtheitsmittel μ0 ist. Dann werden wir diese Hypothese nicht ablehnen, wenn μ0 im Konfidenzintervall liegt, und diese Hypothese wird abgelehnt, wenn μ0 nicht im Konfidenzintervall liegt. Das Konfidenzintervall lässt nicht zu, dass die Wahrscheinlichkeit 1 – Alpha besteht, dass das nächste Paket eine Lieferzeit im Konfidenzintervall nimmt.',
        abstract: 'Das Konfidenzintervall ist ein Wertebereich. Ihr Stichprobenmittelwert x befindet sich in der Mitte dieses Bereichs, und der Bereich ist x ± CONFIDENCE.NORM. Wenn z. B. x der Stichprobenmittelwert der Lieferzeiten für Produkte ist, die per Post bestellt wurden, ± X KONFIDENZ. NORM ist ein Bereich von Bevölkerungsmitteln. Bei jedem Populationsmittel μ0 in diesem Bereich ist die Wahrscheinlichkeit, einen Probenmittelwert zu erhalten, der weiter von μ0 als x liegt, größer als alpha; für jeden Populationsmittelwert μ0, der sich nicht in diesem Bereich befindet, ist die Wahrscheinlichkeit, einen Stichprobenmittelwert zu erhalten, der weiter von μ0 als x liegt, kleiner als alpha. Anders ausgedrückt: Angenommen, wir verwenden x, standard_dev und size, um einen zweiseitigen Test auf Signifikanzebene alpha der Hypothese zu erstellen, dass der Grundgesamtheitsmittel μ0 ist. Dann werden wir diese Hypothese nicht ablehnen, wenn μ0 im Konfidenzintervall liegt, und diese Hypothese wird abgelehnt, wenn μ0 nicht im Konfidenzintervall liegt. Das Konfidenzintervall lässt nicht zu, dass die Wahrscheinlichkeit 1 – Alpha besteht, dass das nächste Paket eine Lieferzeit im Konfidenzintervall nimmt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Erforderlich. Die Irrtumswahrscheinlichkeit bei der Berechnung des Konfidenzintervalls. Das Konfidenzintervall ist gleich 100*(1 - Alpha)%, was bedeutet, dass ein Wert für Alpha von 0,05 einem Konfidenzniveau von 95% entspricht.' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die als bekannt angenommene Standardabweichung der Grundgesamtheit.' },
            size: { name: 'size', detail: 'Erforderlich. Der Umfang der Stichprobe.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Gibt das Konfidenzintervall für den Erwartungswert einer Zufallsvariablen zurück, wobei der Studentsche T-Test verwendet wird',
        abstract: 'Gibt das Konfidenzintervall für den Erwartungswert einer Zufallsvariablen zurück, wobei der Studentsche T-Test verwendet wird',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Erforderlich. Die Irrtumswahrscheinlichkeit bei der Berechnung des Konfidenzintervalls. Das Konfidenzintervall ist gleich 100*(1 - Alpha)%, was bedeutet, dass ein Wert für Alpha von 0,05 einem Konfidenzniveau von 95% entspricht.' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die als bekannt angenommene Standardabweichung der Grundgesamtheit.' },
            size: { name: 'size', detail: 'Erforderlich. Der Umfang der Stichprobe.' },
        },
    },
    CORREL: {
        description: 'Die CORREL-Funktion gibt den Korrelationskoeffizient von zwei Zellbereichen zurück. Mithilfe des Korrelationskoeffizienten lässt sich feststellen, ob es eine Beziehung zwischen zwei Eigenschaften gibt. Sie können beispielsweise die Beziehung zwischen der Durchschnittstemperatur eines Orts und dem Einsatz von Klimaanlagen untersuchen.',
        abstract: 'Die CORREL-Funktion gibt den Korrelationskoeffizient von zwei Zellbereichen zurück. Mithilfe des Korrelationskoeffizienten lässt sich feststellen, ob es eine Beziehung zwischen zwei Eigenschaften gibt. Sie können beispielsweise die Beziehung zwischen der Durchschnittstemperatur eines Orts und dem Einsatz von Klimaanlagen untersuchen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Ein Zellwertbereich.' },
            array2: { name: 'array2', detail: 'Erforderlich. Ein zweiter Zellwertbereich.' },
        },
    },
    COUNT: {
        description: 'Die Funktion ANZAHL zählt die Zellen, die Zahlen enthalten, sowie Zahlen innerhalb der Liste mit Argumenten. Mithilfe der Funktion ANZAHL können Sie die Anzahl der Einträge in einem Zahlenfeld ermitteln, das sich in einem Bereich oder einer Matrix von Zahlen befindet. Sie können beispielsweise die folgende Formel zum Zählen der Zahlen im Bereich A1:A20 eingeben: =ANZAHL(A1:A20) . Wenn in diesem Beispiel fünf der Zellen im Bereich Zahlen enthalten, lautet das Ergebnis 5 .',
        abstract: 'Die Funktion ANZAHL zählt die Zellen, die Zahlen enthalten, sowie Zahlen innerhalb der Liste mit Argumenten. Mithilfe der Funktion ANZAHL können Sie die Anzahl der Einträge in einem Zahlenfeld ermitteln, das sich in einem Bereich oder einer Matrix von Zahlen befindet. Sie können beispielsweise die folgende Formel zum Zählen der Zahlen im Bereich A1:A20 eingeben: =ANZAHL(A1:A20) . Wenn in diesem Beispiel fünf der Zellen im Bereich Zahlen enthalten, lautet das Ergebnis 5 .',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Erforderlich. Das erste Element, der Zellbezug oder der Bereich, in dem Zahlen ermittelt werden sollen.' },
            value2: { name: 'value 2', detail: 'Optional. Bis zu 255 zusätzliche Elemente, Zellbezüge oder Bereiche, in denen Zahlen ermittelt werden sollen.' },
        },
    },
    COUNTA: {
        description: 'Die FUNKTION COUNTA zählt die Anzahl der Zellen, die in einem Bereich nicht leer sind.',
        abstract: 'Die FUNKTION COUNTA zählt die Anzahl der Zellen, die in einem Bereich nicht leer sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Zellen, Zellbereiche oder Werte, für die Sie den Durchschnitt verwenden möchten.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Zellen, Zellbereiche oder Werte, für die Sie den Durchschnitt verwenden möchten.' },
        },
    },
    COUNTBLANK: {
        description: 'Verwenden Sie die Funktion COUNTBLANK , eine der Statistischen Funktionen, um die Anzahl leerer Zellen in einem Zellbereich zu zählen.',
        abstract: 'Verwenden Sie die Funktion COUNTBLANK , eine der Statistischen Funktionen, um die Anzahl leerer Zellen in einem Zellbereich zu zählen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Erforderlich. Der Bereich, von dem Sie wissen möchten, wie viele seiner Zellen leer sind.' },
        },
    },
    COUNTIF: {
        description: 'Verwenden Sie ZÄHLENWENN, eine der statistischen Funktionen , um die Anzahl der Zellen zu zählen, die ein Kriterium erfüllen; beispielsweise, um zu ermitteln, wie oft eine bestimmte Stadt in einer Kundenliste vorkommt.',
        abstract: 'Verwenden Sie ZÄHLENWENN, eine der statistischen Funktionen , um die Anzahl der Zellen zu zählen, die ein Kriterium erfüllen; beispielsweise, um zu ermitteln, wie oft eine bestimmte Stadt in einer Kundenliste vorkommt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Die Gruppe von Zellen, die Sie zählen möchten. Bereich kann Zahlen, Arrays, einen benannten Bereich oder Bezüge enthalten, die Zahlen enthalten. Leere Werte und Textwerte werden ignoriert. Informationen zum Markieren von Bereichen auf einem Arbeitsblatt .' },
            criteria: { name: 'criteria', detail: 'Eine Zahl, ein Ausdruck, ein Zellbezug oder eine Textzeichenfolge, durch die bzw. den definiert wird, welche Zellen gezählt werden. Sie können beispielsweise eine Zahl wie 32, einen Vergleich wie ">32", eine Zelle wie B4 oder ein Wort wie "Äpfel" verwenden. Für ZÄHLENWENN kann nur ein einzelnes Suchkriterium angegeben werden. Verwenden Sie ZÄHLENWENNS , wenn Sie mehrere Kriterien angeben möchten.' },
        },
    },
    COUNTIFS: {
        description: 'Die FUNKTION ZÄHLENWENNS wendet Kriterien auf Zellen in mehreren Bereichen an und zählt, wie oft alle Kriterien erfüllt sind.',
        abstract: 'Die FUNKTION ZÄHLENWENNS wendet Kriterien auf Zellen in mehreren Bereichen an und zählt, wie oft alle Kriterien erfüllt sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Erforderlich. Der erste Bereich, in dem die zugehörigen Kriterien ausgewertet werden sollen.' },
            criteria1: { name: 'criteria1', detail: 'Erforderlich. Die Kriterien in Form einer Zahl, eines Ausdrucks, Zellbezugs oder Texts, mit denen definiert wird, welche Zellen gezählt werden. Kriterien können beispielsweise als 32, ">32", B4, "Äpfel" oder "32" ausgedrückt werden.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Optional. Zusätzliche Bereiche und deren zugehörige Kriterien. Es sind bis zu 127 Bereich/Kriterien-Paare zulässig.' },
            criteria2: { name: 'criteria2', detail: 'Optional. Zusätzliche Bereiche und deren zugehörige Kriterien. Es sind bis zu 127 Bereich/Kriterien-Paare zulässig.' },
        },
    },
    COVARIANCE_P: {
        description: 'Gibt die Kovarianz der Grundgesamtheit zurück, den Durchschnitt der Produkte der Abweichungen für jedes Datenpunktpaar in zwei Datasets. Die Kovarianz gibt Auskunft darüber, welcher Zusammenhang zwischen zwei Datengruppen besteht. Beispielsweise können Sie ermitteln, ob ein größeres Einkommen Folge des jeweiligen Ausbindungsgrads ist.',
        abstract: 'Gibt die Kovarianz der Grundgesamtheit zurück, den Durchschnitt der Produkte der Abweichungen für jedes Datenpunktpaar in zwei Datasets. Die Kovarianz gibt Auskunft darüber, welcher Zusammenhang zwischen zwei Datengruppen besteht. Beispielsweise können Sie ermitteln, ob ein größeres Einkommen Folge des jeweiligen Ausbindungsgrads ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Der erste Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
            array2: { name: 'array2', detail: 'Erforderlich. Der zweite Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
        },
    },
    COVARIANCE_S: {
        description: 'Gibt die Kovarianz einer Stichprobe zurück, d. h. den Mittelwert der für alle Datenpunktpaare gebildeten Produkte der Abweichungen',
        abstract: 'Gibt die Kovarianz einer Stichprobe zurück, d. h. den Mittelwert der für alle Datenpunktpaare gebildeten Produkte der Abweichungen',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Der erste Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
            array2: { name: 'array2', detail: 'Erforderlich. Der zweite Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
        },
    },
    DEVSQ: {
        description: 'Gibt die Summe der quadrierten Abweichungen von Datenpunkten von deren Stichprobenmittelwert zurück.',
        abstract: 'Gibt die Summe der quadrierten Abweichungen von Datenpunkten von deren Stichprobenmittelwert zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie die Summe der quadratischen Abweichungen berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie die Summe der quadratischen Abweichungen berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    EXPON_DIST: {
        description: 'Gibt Wahrscheinlichkeiten einer exponential verteilten Zufallsvariablen zurück. Mithilfe der EXPON.VERT-Funktion lassen sich Zeiträume zwischen Ereignissen modellieren, z. B. wie lange ein Geldautomat für die Ausgabe von Geld benötigt. Beispielsweise können Sie mit EXPON.VERT berechnen, wie wahrscheinlich es ist, dass dieser Vorgang eine Minute dauert.',
        abstract: 'Gibt Wahrscheinlichkeiten einer exponential verteilten Zufallsvariablen zurück. Mithilfe der EXPON.VERT-Funktion lassen sich Zeiträume zwischen Ereignissen modellieren, z. B. wie lange ein Geldautomat für die Ausgabe von Geld benötigt. Beispielsweise können Sie mit EXPON.VERT berechnen, wie wahrscheinlich es ist, dass dieser Vorgang eine Minute dauert.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert für die Funktion' },
            lambda: { name: 'lambda', detail: 'Erforderlich. Der übergebene Wert' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der angibt, welche Form der exponentiellen Funktion bereitgestellt werden soll. Wenn kumulativ TRUE ist, EXPON. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    F_DIST: {
        description: 'Gibt die F-Wahrscheinlichkeitsverteilung zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Sie können z. B. die Testergebnisse von Männern und Frauen untersuchen, die das Gymnasium betreten, und feststellen, ob sich die Variabilität bei den Frauen von der bei den Männchen unterscheidet.',
        abstract: 'Gibt die F-Wahrscheinlichkeitsverteilung zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Sie können z. B. die Testergebnisse von Männern und Frauen untersuchen, die das Gymnasium betreten, und feststellen, ob sich die Variabilität bei den Frauen von der bei den Männchen unterscheidet.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumuliert TRUE ist, gibt F.DIST die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    F_DIST_RT: {
        description: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (rechtsseitigen) F-verteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Beispielsweise können Sie die Punktzahlen untersuchen, die Männer und Frauen bei einem Einstellungstest erzielt haben, und ermitteln, ob sich die für die Frauen gefundene Streuung von derjenigen der Männer unterscheidet.',
        abstract: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (rechtsseitigen) F-verteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Beispielsweise können Sie die Punktzahlen untersuchen, die Männer und Frauen bei einem Einstellungstest erzielt haben, und ermitteln, ob sich die für die Frauen gefundene Streuung von derjenigen der Männer unterscheidet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
        },
    },
    F_INV: {
        description: 'Gibt Quantile der F-Verteilung zurück. Ist p = F.VERT(x,...), dann ist F.INV(p,...) = x. Die F-Verteilung kann in F-Tests verwendet werden, bei denen die Streuungen zweier Datenmengen ins Verhältnis gesetzt werden. Zum Beispiel können Sie die Verteilung der in den USA und Kanada erzielten Einkommen daraufhin analysieren, ob in den beiden Ländern ähnliche Einkommensverteilungen vorliegen.',
        abstract: 'Gibt Quantile der F-Verteilung zurück. Ist p = F.VERT(x,...), dann ist F.INV(p,...) = x. Die F-Verteilung kann in F-Tests verwendet werden, bei denen die Streuungen zweier Datenmengen ins Verhältnis gesetzt werden. Zum Beispiel können Sie die Verteilung der in den USA und Kanada erzielten Einkommen daraufhin analysieren, ob in den beiden Ländern ähnliche Einkommensverteilungen vorliegen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur F-Verteilung gehörige Wahrscheinlichkeit' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
        },
    },
    F_INV_RT: {
        description: 'Gibt Quantile der (rechtsseitigen) F-Verteilung zurück. Ist p = F.VERT.RE(x;...), dann ist F.INV.RE(p;...) = x. Die F-Verteilung kann in F-Tests verwendet werden, bei denen die Streuungen zweier Datenmengen ins Verhältnis gesetzt werden. Zum Beispiel können Sie die Verteilung der in den USA und Kanada erzielten Einkommen daraufhin analysieren, ob in den beiden Ländern ähnliche Einkommensverteilungen vorliegen.',
        abstract: 'Gibt Quantile der (rechtsseitigen) F-Verteilung zurück. Ist p = F.VERT.RE(x;...), dann ist F.INV.RE(p;...) = x. Die F-Verteilung kann in F-Tests verwendet werden, bei denen die Streuungen zweier Datenmengen ins Verhältnis gesetzt werden. Zum Beispiel können Sie die Verteilung der in den USA und Kanada erzielten Einkommen daraufhin analysieren, ob in den beiden Ländern ähnliche Einkommensverteilungen vorliegen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur F-Verteilung gehörige Wahrscheinlichkeit' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
        },
    },
    F_TEST: {
        description: 'Verwenden Sie diese Funktion, um zu bestimmen, ob zwei Stichproben unterschiedliche Varianzen aufweisen. Mit Testergebnissen von öffentlichen und privaten Schulen können Sie beispielsweise testen, ob diese Schulen unterschiedliche Stufen der Testbewertungsvielfalt aufweisen.',
        abstract: 'Verwenden Sie diese Funktion, um zu bestimmen, ob zwei Stichproben unterschiedliche Varianzen aufweisen. Mit Testergebnissen von öffentlichen und privaten Schulen können Sie beispielsweise testen, ob diese Schulen unterschiedliche Stufen der Testbewertungsvielfalt aufweisen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Die erste Matrix oder der erste Wertebereich.' },
            array2: { name: 'array2', detail: 'Erforderlich. Die zweite Matrix oder der zweite Wertebereich.' },
        },
    },
    FISHER: {
        description: 'Gibt die Fisher-Transformation für x zurück. Diese Transformation erzeugt eine Funktion, die normalverteilt ist und somit eine Schiefe von ungefähr Null besitzt. Mit dieser Funktion können Sie eine Hypothese bezüglich des Korrelationskoeffizienten prüfen.',
        abstract: 'Gibt die Fisher-Transformation für x zurück. Diese Transformation erzeugt eine Funktion, die normalverteilt ist und somit eine Schiefe von ungefähr Null besitzt. Mit dieser Funktion können Sie eine Hypothese bezüglich des Korrelationskoeffizienten prüfen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Ein numerischer Wert, für den Sie die Transformation durchführen möchten.' },
        },
    },
    FISHERINV: {
        description: 'Gibt die Umkehrung der Fisher-Transformation zurück. Mithilfe dieser Transformation können Sie die Korrelation zwischen Datenbereichen oder Matrizen untersuchen. Ist y = FISHER(x), dann ist FISHERINV(y) = x.',
        abstract: 'Gibt die Umkehrung der Fisher-Transformation zurück. Mithilfe dieser Transformation können Sie die Korrelation zwischen Datenbereichen oder Matrizen untersuchen. Ist y = FISHER(x), dann ist FISHERINV(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Erforderlich. Der Wert, dessen Transformation Sie umkehren möchten' },
        },
    },
    FORECAST: {
        description: 'Berechnen oder Vorhersagen eines zukünftigen Werts mithilfe vorhandener Werte. Der Future-Wert ist ein y-Wert für einen bestimmten x-Wert. Die vorhandenen Werte sind bekannte x-Werte und y-Werte, und der zukünftige Wert wird mithilfe der linearen Regression vorhergesagt. Sie können diese Funktionen verwenden, um zukünftige Verkäufe, Bestandsanforderungen oder Verbrauchertrends vorherzusagen.',
        abstract: 'Berechnen oder Vorhersagen eines zukünftigen Werts mithilfe vorhandener Werte. Der Future-Wert ist ein y-Wert für einen bestimmten x-Wert. Die vorhandenen Werte sind bekannte x-Werte und y-Werte, und der zukünftige Wert wird mithilfe der linearen Regression vorhergesagt. Sie können diese Funktionen verwenden, um zukünftige Verkäufe, Bestandsanforderungen oder Verbrauchertrends vorherzusagen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Ja Der Datenpunkt, dessen Wert Sie schätzen möchten.' },
            knownYs: { name: 'known_y\'s', detail: 'Ja Eine abhängige Matrix oder ein abhängiger Datenbereich.' },
            knownXs: { name: 'known_x\'s', detail: 'Ja Eine unabhängige Matrix oder ein unabhängiger Datenbereich.' },
        },
    },
    FORECAST_ETS: {
        description: 'Berechnet oder prognostiziert einen zukünftigen Wert auf Grundlage vorhandener Werte mithilfe der AAA-Version des Exponential-Smoothing-Algorithmus (ETS).',
        abstract: 'Berechnet oder prognostiziert einen zukünftigen Wert auf Grundlage vorhandener Werte mithilfe der AAA-Version des Exponential-Smoothing-Algorithmus (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Zieldatum', detail: 'Der Datenpunkt, für den ein Wert vorhergesagt werden soll.' },
            values: { name: 'Werte', detail: 'Die historischen Werte für die Prognose.' },
            timeline: { name: 'Zeitachse', detail: 'Ein unabhängiger Bereich oder eine Matrix numerischer Datums- oder Zeitwerte mit konstantem Abstand.' },
            seasonality: { name: 'Saisonalität', detail: 'Optional. Saisonlänge; 1 für automatische Erkennung und 0 für keine Saisonalität.' },
            dataCompletion: { name: 'Datenvervollständigung', detail: 'Optional. 1 interpoliert fehlende Punkte, 0 behandelt sie als null.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. Ein Wert von 1 bis 7 legt die Aggregation doppelter Zeitstempel fest.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Gibt ein Konfidenzintervall für den prognostizierten Wert am angegebenen Zieltermin zurück.',
        abstract: 'Gibt ein Konfidenzintervall für den prognostizierten Wert am angegebenen Zieltermin zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Zieldatum', detail: 'Der Datenpunkt, für den ein Wert vorhergesagt werden soll.' },
            values: { name: 'Werte', detail: 'Die historischen Werte für die Prognose.' },
            timeline: { name: 'Zeitachse', detail: 'Ein unabhängiger Bereich oder eine Matrix numerischer Datums- oder Zeitwerte mit konstantem Abstand.' },
            confidenceLevel: { name: 'Konfidenzniveau', detail: 'Optional. Eine Zahl zwischen 0 und 1; Standardwert ist 0,95.' },
            seasonality: { name: 'Saisonalität', detail: 'Optional. Saisonlänge; 1 für automatische Erkennung und 0 für keine Saisonalität.' },
            dataCompletion: { name: 'Datenvervollständigung', detail: 'Optional. 1 interpoliert fehlende Punkte, 0 behandelt sie als null.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. Ein Wert von 1 bis 7 legt die Aggregation doppelter Zeitstempel fest.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Gibt die Länge des sich wiederholenden Musters zurück, das Excel für die angegebene Zeitreihe erkennt.',
        abstract: 'Gibt die Länge des sich wiederholenden Musters zurück, das Excel für die angegebene Zeitreihe erkennt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Werte', detail: 'Die historischen Werte für die Prognose.' },
            timeline: { name: 'Zeitachse', detail: 'Ein unabhängiger Bereich oder eine Matrix numerischer Datums- oder Zeitwerte mit konstantem Abstand.' },
            dataCompletion: { name: 'Datenvervollständigung', detail: 'Optional. 1 interpoliert fehlende Punkte, 0 behandelt sie als null.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. Ein Wert von 1 bis 7 legt die Aggregation doppelter Zeitstempel fest.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Gibt einen statistischen Wert infolge von Zeitreihenprognosen zurück.',
        abstract: 'Gibt einen statistischen Wert infolge von Zeitreihenprognosen zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Werte', detail: 'Die historischen Werte für die Prognose.' },
            timeline: { name: 'Zeitachse', detail: 'Ein unabhängiger Bereich oder eine Matrix numerischer Datums- oder Zeitwerte mit konstantem Abstand.' },
            statisticType: { name: 'Statistiktyp', detail: 'Ein Wert von 1 bis 8 legt die zurückzugebende Prognosestatistik fest.' },
            seasonality: { name: 'Saisonalität', detail: 'Optional. Saisonlänge; 1 für automatische Erkennung und 0 für keine Saisonalität.' },
            dataCompletion: { name: 'Datenvervollständigung', detail: 'Optional. 1 interpoliert fehlende Punkte, 0 behandelt sie als null.' },
            aggregation: { name: 'Aggregation', detail: 'Optional. Ein Wert von 1 bis 7 legt die Aggregation doppelter Zeitstempel fest.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Berechnen oder Vorhersagen eines zukünftigen Werts mithilfe vorhandener Werte. Der Future-Wert ist ein y-Wert für einen bestimmten x-Wert. Die vorhandenen Werte sind bekannte x-Werte und y-Werte, und der zukünftige Wert wird mithilfe der linearen Regression vorhergesagt. Sie können diese Funktionen verwenden, um zukünftige Verkäufe, Bestandsanforderungen oder Verbrauchertrends vorherzusagen.',
        abstract: 'Berechnen oder Vorhersagen eines zukünftigen Werts mithilfe vorhandener Werte. Der Future-Wert ist ein y-Wert für einen bestimmten x-Wert. Die vorhandenen Werte sind bekannte x-Werte und y-Werte, und der zukünftige Wert wird mithilfe der linearen Regression vorhergesagt. Sie können diese Funktionen verwenden, um zukünftige Verkäufe, Bestandsanforderungen oder Verbrauchertrends vorherzusagen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Ja Der Datenpunkt, dessen Wert Sie schätzen möchten.' },
            knownYs: { name: 'known_y\'s', detail: 'Ja Eine abhängige Matrix oder ein abhängiger Datenbereich.' },
            knownXs: { name: 'known_x\'s', detail: 'Ja Eine unabhängige Matrix oder ein unabhängiger Datenbereich.' },
        },
    },
    FREQUENCY: {
        description: 'Die Funktion HÄUFIGKEIT berechnet, wie oft Werte innerhalb eines Wertebereichs auftreten, und gibt dann ein vertikales Zahlenfeld zurück. Verwenden Sie HÄUFIGKEIT beispielsweise, um die Prüfungsergebnisse innerhalb bestimmter Ergebnisbereiche zu zählen. Da HÄUFIGKEIT eine Matrix zurückgibt, muss die Formel als Matrixformel eingegeben werden.',
        abstract: 'Die Funktion HÄUFIGKEIT berechnet, wie oft Werte innerhalb eines Wertebereichs auftreten, und gibt dann ein vertikales Zahlenfeld zurück. Verwenden Sie HÄUFIGKEIT beispielsweise, um die Prüfungsergebnisse innerhalb bestimmter Ergebnisbereiche zu zählen. Da HÄUFIGKEIT eine Matrix zurückgibt, muss die Formel als Matrixformel eingegeben werden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Erforderlich. Entspricht einer Matrix von oder einem Bezug auf eine Wertemenge, deren Häufigkeiten Sie zählen möchten. Enthält "Daten" keine Werte (Zahlen), gibt HÄUFIGKEIT eine mit Nullen belegte Matrix zurück.' },
            binsArray: { name: 'bins_array', detail: 'Erforderlich. Die als Matrix oder Bezug auf einen Zellbereich eingegebenen Intervallgrenzen, nach denen Sie die in "Daten" enthaltenen Werte einordnen möchten. Falls "Klassen" keine Werte enthält, gibt HÄUFIGKEIT die Anzahl der zu "Daten" gehörenden Elemente zurück.' },
        },
    },
    GAMMA: {
        description: 'Gibt den Wert der Gammafunktion zurück.',
        abstract: 'Gibt den Wert der Gammafunktion zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Gibt eine Zahl zurück.' },
        },
    },
    GAMMA_DIST: {
        description: 'Gibt Wahrscheinlichkeiten einer gammaverteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie Variablen untersuchen, die eine schiefe Verteilung besitzen. Die Gammaverteilung wird häufig bei Warteschlangenanalysen verwendet.',
        abstract: 'Gibt Wahrscheinlichkeiten einer gammaverteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie Variablen untersuchen, die eine schiefe Verteilung besitzen. Die Gammaverteilung wird häufig bei Warteschlangenanalysen verwendet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit berechnet werden soll.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung. Wenn "Beta" = 1, gibt GAMMA.VERT die Standard-Gammaverteilung zurück.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, GAMMA. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    GAMMA_INV: {
        description: 'Gibt Quantile der Gammaverteilung zurück. Gilt p = GAMMA.VERT(x;...), dann gilt GAMMA.INV(p;...) = x. Mit dieser Funktion können Sie eine Variable untersuchen, deren Verteilung eventuell schief ist.',
        abstract: 'Gibt Quantile der Gammaverteilung zurück. Gilt p = GAMMA.VERT(x;...), dann gilt GAMMA.INV(p;...) = x. Mit dieser Funktion können Sie eine Variable untersuchen, deren Verteilung eventuell schief ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Gammaverteilung gehörige Wahrscheinlichkeit' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung. Wenn "Beta" = 1, gibt GAMMA.INV die Standard-Gammaverteilung zurück.' },
        },
    },
    GAMMALN: {
        description: 'Gibt den natürlichen Logarithmus der Gammafunktion zurück, Γ(x).',
        abstract: 'Gibt den natürlichen Logarithmus der Gammafunktion zurück, Γ(x).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den GAMMALN berechnet werden soll.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Gibt den natürlichen Logarithmus der Gammafunktion zurück, Γ(x).',
        abstract: 'Gibt den natürlichen Logarithmus der Gammafunktion zurück, Γ(x).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den GAMMALN.GENAU berechnet werden soll.' },
        },
    },
    GAUSS: {
        description: 'Berechnet die Wahrscheinlichkeit, dass ein Element einer Standardgrundgesamtheit zwischen dem Mittelwert und z Standardabweichungen vom Mittelwert liegt.',
        abstract: 'Berechnet die Wahrscheinlichkeit, dass ein Element einer Standardgrundgesamtheit zwischen dem Mittelwert und z Standardabweichungen vom Mittelwert liegt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Erforderlich. Gibt eine Zahl zurück.' },
        },
    },
    GEOMEAN: {
        description: 'Gibt das geometrische Mittel einer Menge positiver Zahlen zurück. Zum Beispiel können Sie mit GEOMITTEL eine mittlere Wachstumsrate berechnen, wenn für einen Zinseszins variable Zinssätze gegeben sind.',
        abstract: 'Gibt das geometrische Mittel einer Menge positiver Zahlen zurück. Zum Beispiel können Sie mit GEOMITTEL eine mittlere Wachstumsrate berechnen, wenn für einen Zinseszins variable Zinssätze gegeben sind.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Mittelwert berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Mittelwert berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    GROWTH: {
        description: 'Liefert Werte, die sich aus einem exponentiellen Trend ergeben. VARIATION liefert die y-Werte für eine Reihe neuer x-Werte, die Sie mithilfe vorhandener x- und y-Werte festlegen. Sie können die Arbeitsblattfunktion VARIATION auch verwenden, um eine zu den vorhandenen x- und y-Werten passende Exponentialkurve zu ermitteln.',
        abstract: 'Liefert Werte, die sich aus einem exponentiellen Trend ergeben. VARIATION liefert die y-Werte für eine Reihe neuer x-Werte, die Sie mithilfe vorhandener x- und y-Werte festlegen. Sie können die Arbeitsblattfunktion VARIATION auch verwenden, um eine zu den vorhandenen x- und y-Werten passende Exponentialkurve zu ermitteln.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Die y-Werte, die Ihnen aus der jeweiligen Beziehung y = b*m^x bereits bekannt sind Besteht die Matrix Y_Werte aus nur einer Spalte, wird jede Spalte der Matrix X_Werte als eigenständige Variable interpretiert. Besteht die Matrix Y_Werte aus nur einer Zeile, wird jede Zeile der Matrix X_Werte als eigenständige Variable interpretiert. Wenn eine der Zahlen in known_y 0 oder negativ ist, gibt GROWTH die #NUM! zurück.' },
            knownXs: { name: 'known_x\'s', detail: 'Optional. Eine optionale Gruppe von x-Werten, die Ihnen aus der Beziehung y = b*m^x eventuell bereits bekannt sind Die Matrix X_Werte kann eine oder mehrere Gruppen von Variablen umfassen. Wird nur eine Variable verwendet, können Y_Werte und X_Werte Bereiche beliebiger Form sein, solange sie dieselben Dimensionen haben. Werden mehrere Variablen verwendet, muss Y_Werte ein Vektor sein (das heißt ein Bereich, der aus nur einer Zeile oder nur einer Spalte besteht). Fehlt die Matrix X_Werte, wird an ihrer Stelle die Matrix {1.2.3...} angenommen, die genauso viele Elemente wie Y_Werte enthält.' },
            newXs: { name: 'new_x\'s', detail: 'Optional. Die neuen x-Werte, für die die VARIATION-Funktion die zugehörigen y-Werte liefern soll. Analog zu X_Werte muss auch Neue_x_Werte für jede unabhängige Variable eine eigene Spalte (oder Zeile) bereitstellen. Daher müssen die Matrizen X_Werte und Neue_x_Werte gleich viele Spalten haben, wenn Y_Werte sich in einer einzelnen Spalte befindet. Wenn sich Y_Werte in einer einzelnen Zeile befindet, müssen X_Werte und Neue_x_Werte gleich viele Zeilen haben. Fehlt die Matrix Neue_x_Werte, wird angenommen, dass sie mit der Matrix X_Werte identisch ist. Fehlt sowohl die Matrix X_Werte als auch die Matrix Neue_x_Werte, werden diese als die Matrix {1.2.3...} angenommen, die genauso viele Elemente wie die Matrix Y_Werte enthalten.' },
            constb: { name: 'const', detail: 'Optional. Ein Wahrheitswert, der angibt, ob die Konstante b den Wert 1 annehmen soll Ist Konstante mit WAHR belegt oder nicht angegeben, wird b normal berechnet. Ist Konstante mit FALSCH belegt, wird b gleich 1 gesetzt, und der Wert von m wird so angepasst, dass y = m^x gilt.' },
        },
    },
    HARMEAN: {
        description: 'Gibt das harmonische Mittel einer Datenmenge zurück. Ein harmonisches Mittel ist der Kehrwert eines aus Kehrwerten berechneten arithmetischen Mittels.',
        abstract: 'Gibt das harmonische Mittel einer Datenmenge zurück. Ein harmonisches Mittel ist der Kehrwert eines aus Kehrwerten berechneten arithmetischen Mittels.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Mittelwert berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie den Mittelwert berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Gibt die hypergeometrische Verteilung zurück. HYPGEOM. DIST gibt die Wahrscheinlichkeit einer bestimmten Anzahl von Stichprobenerfolgen unter Berücksichtigung der Stichprobengröße, der Populationserfolge und der Populationsgröße zurück. Verwenden Sie HYPGEOM. DIST für Probleme mit einer endlichen Population, bei der jede Beobachtung entweder ein Erfolg oder ein Fehler ist und jede Teilmenge einer bestimmten Größe mit gleicher Wahrscheinlichkeit ausgewählt wird.',
        abstract: 'Gibt die hypergeometrische Verteilung zurück. HYPGEOM. DIST gibt die Wahrscheinlichkeit einer bestimmten Anzahl von Stichprobenerfolgen unter Berücksichtigung der Stichprobengröße, der Populationserfolge und der Populationsgröße zurück. Verwenden Sie HYPGEOM. DIST für Probleme mit einer endlichen Population, bei der jede Beobachtung entweder ein Erfolg oder ein Fehler ist und jede Teilmenge einer bestimmten Größe mit gleicher Wahrscheinlichkeit ausgewählt wird.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Erforderlich. Die Anzahl der in der Stichprobe erzielten Erfolge' },
            numberSample: { name: 'number_sample', detail: 'Erforderlich. Der Umfang (Größe) der Stichprobe' },
            populationS: { name: 'population_s', detail: 'Erforderlich. Die Anzahl der in der Grundgesamtheit möglichen Erfolge' },
            numberPop: { name: 'number_pop', detail: 'Erforderlich. Der Umfang (Größe) der Grundgesamtheit' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, dann HYPGEOM. DIST gibt die kumulierte Verteilungsfunktion zurück. wenn FALSE, wird die Wahrscheinlichkeits-Massenfunktion zurückgegeben.' },
        },
    },
    INTERCEPT: {
        description: 'Berechnet den Punkt, an dem eine Linie die y-Achse unter Verwendung vorhandener x-Werte und y-Werte überschneidet. Der Abfangpunkt basiert auf einer Am besten geeigneten Regressionslinie, die durch die bekannten x-Werte und bekannten y-Werte gezeichnet wird. Verwenden Sie die INTERCEPT-Funktion, wenn Sie den Wert der abhängigen Variablen bestimmen möchten, wenn die unabhängige Variable 0 (null) ist. Beispielsweise können Sie die INTERCEPT-Funktion verwenden, um den elektrischen Widerstand eines Metalls bei 0 °C vorherzusagen, wenn Ihre Datenpunkte bei Raumtemperatur und höher erfasst wurden.',
        abstract: 'Berechnet den Punkt, an dem eine Linie die y-Achse unter Verwendung vorhandener x-Werte und y-Werte überschneidet. Der Abfangpunkt basiert auf einer Am besten geeigneten Regressionslinie, die durch die bekannten x-Werte und bekannten y-Werte gezeichnet wird. Verwenden Sie die INTERCEPT-Funktion, wenn Sie den Wert der abhängigen Variablen bestimmen möchten, wenn die unabhängige Variable 0 (null) ist. Beispielsweise können Sie die INTERCEPT-Funktion verwenden, um den elektrischen Widerstand eines Metalls bei 0 °C vorherzusagen, wenn Ihre Datenpunkte bei Raumtemperatur und höher erfasst wurden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Die Gruppe der abhängigen Messwerte oder Daten' },
            knownXs: { name: 'known_x\'s', detail: 'Erforderlich. Die Gruppe der unabhängigen Messwerte oder Daten' },
        },
    },
    KURT: {
        description: 'Gibt die Kurtosis (Exzess) eines Datasets zurück. Die Kurtosis ist ein Maß für die Wölbung (d.h. wie spitz oder flach) einer Verteilung im Vergleich zu der Normalverteilung. Eine positive Kurtosis weist auf eine relativ schmale, spitze Verteilung hin. Eine negative Kurtosis weist auf eine relativ flache Verteilung hin.',
        abstract: 'Gibt die Kurtosis (Exzess) eines Datasets zurück. Die Kurtosis ist ein Maß für die Wölbung (d.h. wie spitz oder flach) einer Verteilung im Vergleich zu der Normalverteilung. Eine positive Kurtosis weist auf eine relativ schmale, spitze Verteilung hin. Eine negative Kurtosis weist auf eine relativ flache Verteilung hin.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie Kurtosis berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie Kurtosis berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    LARGE: {
        description: 'Gibt den k-größten Wert eines Datasets zurück. Mit dieser Funktion können Sie eine Zahl auf Basis ihrer relativen Größe ermitteln. Beispielsweise können Sie mit KGRÖSSTE den Punktestand des Erst-, Zweit- oder Drittplatzierten ermitteln.',
        abstract: 'Gibt den k-größten Wert eines Datasets zurück. Mit dieser Funktion können Sie eine Zahl auf Basis ihrer relativen Größe ermitteln. Beispielsweise können Sie mit KGRÖSSTE den Punktestand des Erst-, Zweit- oder Drittplatzierten ermitteln.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Die Matrix oder der Datenbereich, deren k-größten Wert Sie bestimmen möchten' },
            k: { name: 'k', detail: 'Erforderlich. Der Rang des Elements einer Matrix oder eines Zellbereichs, dessen Wert zurückgegeben werden soll' },
        },
    },
    LINEST: {
        description: 'Die Funktion RGP berechnet die Statistik für eine Linie nach der Methode der kleinsten Quadrate, um eine gerade Linie zu berechnen, die am besten an die Daten angepasst ist, und gibt dann eine Matrix zurück, die die Linie beschreibt. Sie können RGP auch mit anderen Funktionen kombinieren, um die Statistiken für andere Modelltypen zu berechnen, die lineare unbekannte Parameter aufweisen, einschließlich polynomischer, logarithmischer und exponentieller Reihen sowie Potenzen. Da diese Funktion eine Matrix von Werten zurückgibt, muss die Formel als Matrixformel eingegeben werden. Anweisungen dazu sind nach den Beispielen in diesem Artikel angegeben.',
        abstract: 'Die Funktion RGP berechnet die Statistik für eine Linie nach der Methode der kleinsten Quadrate, um eine gerade Linie zu berechnen, die am besten an die Daten angepasst ist, und gibt dann eine Matrix zurück, die die Linie beschreibt. Sie können RGP auch mit anderen Funktionen kombinieren, um die Statistiken für andere Modelltypen zu berechnen, die lineare unbekannte Parameter aufweisen, einschließlich polynomischer, logarithmischer und exponentieller Reihen sowie Potenzen. Da diese Funktion eine Matrix von Werten zurückgibt, muss die Formel als Matrixformel eingegeben werden. Anweisungen dazu sind nach den Beispielen in diesem Artikel angegeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Die y-Werte, die Ihnen bereits aus der Beziehung y = mx + b bekannt sind. Wenn sich der Bereich der known_y in einer einzelnen Spalte befindet, wird jede Spalte von known_x als separate Variable interpretiert. Wenn der Bereich der known_y in einer einzelnen Zeile enthalten ist, wird jede Zeile von known_x als separate Variable interpretiert.' },
            knownXs: { name: 'known_x\'s', detail: 'Optional. Die x-Werte, die Ihnen möglicherweise bereits aus der Beziehung y = mx + b bekannt sind. Der Bereich der known_x kann einen oder mehrere Variablensätze enthalten. Wenn nur eine Variable verwendet wird, können known_y und known_x bereiche beliebiger Form sein, sofern sie die gleichen Dimensionen haben. Wenn mehr als eine Variable verwendet wird, muss known_y ein Vektor sein (d. a. ein Bereich mit einer Höhe von einer Zeile oder einer Breite von einer Spalte). Wenn known_x nicht angegeben wird, wird davon ausgegangen, dass es sich um das Array {1,2,3,...} handelt, das die gleiche Größe wie known_y hat .' },
            constb: { name: 'const', detail: 'Optional. Ein Wahrheitswert, der angibt, ob die Konstante b den Wert 0 annehmen soll. Wenn const TRUE ist oder ausgelassen wird, wird b normal berechnet. Wenn const FALSE ist, wird b gleich 0 festgelegt, und die m-Werte werden so angepasst, dass sie y = mx anpassen.' },
            stats: { name: 'stats', detail: 'Optional. Ein Wahrheitswert, der angibt, ob zusätzliche Regressionskenngrößen zurückgegeben werden sollen. Wenn stats den Wert TRUE hat, gibt LINEST die zusätzlichen Regressionsstatistiken zurück. Daher ist das zurückgegebene Array {mn,mn-1,...,m1,b; sen,sen-1,...,se1,seb; r 2,sey ; F,df; ssreg,ssresid} . Wenn stats FALSE ist oder ausgelassen wird, gibt LINEST nur die m-Koeffizienten und die Konstante b zurück. Die folgenden Regressionskenngrößen (-statistiken) können zusätzlich ermittelt werden:' },
        },
    },
    LOGEST: {
        description: 'Die Gleichung der Kurve lautet',
        abstract: 'Die Gleichung der Kurve lautet',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Die y-Werte, die Ihnen aus der jeweiligen Beziehung y = b*m^x bereits bekannt sind Besteht die Matrix Y_Werte aus nur einer Spalte, wird jede Spalte der Matrix X_Werte als eigenständige Variable interpretiert. Besteht die Matrix Y_Werte aus nur einer Zeile, wird jede Zeile der Matrix X_Werte als eigenständige Variable interpretiert.' },
            knownXs: { name: 'known_x\'s', detail: 'Optional. Eine optionale Gruppe von x-Werten, die Ihnen aus der Beziehung y = b*m^x eventuell bereits bekannt sind Die Matrix X_Werte kann eine oder mehrere Gruppen von Variablen umfassen. Wird nur eine Variable verwendet, können Y_Werte und X_Werte Bereiche beliebiger Form sein, solange sie dieselben Dimensionen haben. Werden mehrere Variablen verwendet, müssen Y_Werte als Zellbereiche vorliegen, wobei sich der Bereich nur über eine Zeile oder eine Spalte erstrecken darf (auch als "Vektor" bezeichnet). Fehlt die Matrix X_Werte, wird an ihrer Stelle die Matrix {1.2.3...} angenommen, die genauso viele Elemente wie Y_Werte enthält.' },
            constb: { name: 'const', detail: 'Optional. Ein Wahrheitswert, der angibt, ob die Konstante b den Wert 1 annehmen soll Ist Konstante mit WAHR belegt oder nicht angegeben, wird b normal berechnet. Ist Konstante mit FALSCH belegt, wird b gleich 1 festgelegt, und die m-Werte werden gemäß y = m^x berechnet.' },
            stats: { name: 'stats', detail: 'Optional. Ein Wahrheitswert, der angibt, ob zusätzliche Regressionskenngrößen ausgegeben werden sollen Ist Stats mit WAHR belegt, gibt RKP diese zusätzlichen Regressionskenngrößen zurück, sodass die zurückgegebene Matrix wie folgt aussieht:{mn.mn-1. ... .m1.b;sen.sen-1. ... .se1.seb;r 2.sey;F.df;ssreg.ssresid}. Ist Stats mit FALSCH belegt oder nicht angegeben, gibt RKP nur die m-Koeffizienten und die Konstante b zurück.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Mit dieser Funktion können Sie Daten untersuchen, die logarithmisch transformiert wurden.',
        abstract: 'Mit dieser Funktion können Sie Daten untersuchen, die logarithmisch transformiert wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            mean: { name: 'mean', detail: 'Erforderlich. Der Mittelwert der Lognormalverteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Lognormalverteilung' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, LOGNORM. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    LOGNORM_INV: {
        description: 'Gibt Quantile der Lognormalverteilung von x zurück, wobei ln(x) mit den Parametern Mittelwert und Standabwn normal verteilt ist. Ist p = LOGNORM.VERT(x,...), gilt LOGNORM.INV(p,...) = x.',
        abstract: 'Gibt Quantile der Lognormalverteilung von x zurück, wobei ln(x) mit den Parametern Mittelwert und Standabwn normal verteilt ist. Ist p = LOGNORM.VERT(x,...), gilt LOGNORM.INV(p,...) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Lognormalverteilung gehörige Wahrscheinlichkeit' },
            mean: { name: 'mean', detail: 'Erforderlich. Der Mittelwert der Lognormalverteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Lognormalverteilung' },
        },
    },
    MARGINOFERROR: {
        description: 'Diese Funktion berechnet die Fehlerspanne aus einem Wertebereich und einem Konfidenzniveau.',
        abstract: 'Diese Funktion berechnet die Fehlerspanne aus einem Wertebereich und einem Konfidenzniveau.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=de',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Range – Der Wertebereich, der zur Berechnung der Fehlerspanne verwendet wird.' },
            confidence: { name: 'confidence', detail: 'Confidence – Das gewünschte Konfidenzniveau zwischen 0 und 1.' },
        },
    },
    MAX: {
        description: 'Gibt den größten Wert innerhalb einer Argumentliste zurück.',
        abstract: 'Gibt den größten Wert innerhalb einer Argumentliste zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Zahlen, für die Sie den Maximalwert finden möchten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Zahlen, für die Sie den Maximalwert finden möchten.' },
        },
    },
    MAXA: {
        description: 'Gibt den größten Wert in einer Liste von Argumenten zurück, einschließlich Zahlen, Text und Wahrheitswerten.',
        abstract: 'Gibt den größten Wert in einer Liste von Argumenten zurück, einschließlich Zahlen, Text und Wahrheitswerten.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'Wert1', detail: 'Erforderlich. Das erste numerische Argument, dessen größter Wert zurückgegeben werden soll.' },
            value2: { name: 'Wert2', detail: 'Optional. Die numerischen Argumente 2 bis 255, deren größter Wert ermittelt werden soll.' },
        },
    },
    MAXIFS: {
        description: 'Die Funktion MAXWENNS gibt den Maximalwert aus Zellen zurück, die mit einem bestimmten Satz Bedingungen oder Kriterien angegeben wurden.',
        abstract: 'Die Funktion MAXWENNS gibt den Maximalwert aus Zellen zurück, die mit einem bestimmten Satz Bedingungen oder Kriterien angegeben wurden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'Der tatsächliche Zellenbereich, in dem das Maximum ermittelt wird.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Die Reihe der Zellen, die anhand der Kriterien ausgewertet werden sollen.' },
            criteria1: { name: 'criteria1', detail: 'Sind die Kriterien, die in Form einer Zahl, eines Ausdrucks oder eines Texts festgelegt werden und beschreiben, welche Zellen als Maximum ausgewertet werden. Der gleiche Kriteriensatz kann auch für die Funktionen MINWENNS , SUMMEWENNS und MITTELWERTWENNS verwendet werden.' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 126 Bereich/Kriterien-Paare eingeben.' },
            criteria2: { name: 'criteria2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 126 Bereich/Kriterien-Paare eingeben.' },
        },
    },
    MEDIAN: {
        description: 'Gibt den Median der angegebenen Zahlen zurück. Der Median ist die Zahl, die in der Mitte einer Zahlenreihe liegt.',
        abstract: 'Gibt den Median der angegebenen Zahlen zurück. Der Median ist die Zahl, die in der Mitte einer Zahlenreihe liegt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Zahlen, deren Median Sie berechnen möchten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Zahlen, deren Median Sie berechnen möchten.' },
        },
    },
    MIN: {
        description: 'Gibt den kleinsten Wert innerhalb einer Argumentliste zurück.',
        abstract: 'Gibt den kleinsten Wert innerhalb einer Argumentliste zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist optional, nachfolgende Zahlen sind optional. 1 bis 255 Zahlen, aus denen Sie die kleinste Zahl heraussuchen möchten.' },
            number2: { name: 'number2', detail: 'Zahl1 ist optional, nachfolgende Zahlen sind optional. 1 bis 255 Zahlen, aus denen Sie die kleinste Zahl heraussuchen möchten.' },
        },
    },
    MINA: {
        description: 'Gibt den kleinsten Wert einer Liste von Argumenten zurück.',
        abstract: 'Gibt den kleinsten Wert einer Liste von Argumenten zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, deren kleinster Wert ermittelt werden soll.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, deren kleinster Wert ermittelt werden soll.' },
        },
    },
    MINIFS: {
        description: 'Die Funktion MINWENNS gibt den Minimalwert aus Zellen zurück, die mit einem bestimmten Satz Bedingungen oder Kriterien angegeben wurden.',
        abstract: 'Die Funktion MINWENNS gibt den Minimalwert aus Zellen zurück, die mit einem bestimmten Satz Bedingungen oder Kriterien angegeben wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'Der tatsächliche Zellenbereich, in dem der Minimalwert ermittelt wird.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Die Reihe der Zellen, die anhand der Kriterien ausgewertet werden sollen.' },
            criteria1: { name: 'criteria1', detail: 'Sind die Kriterien, die in Form einer Zahl, eines Ausdrucks oder eines Texts festgelegt werden und beschreiben, welche Zellen als Minimum ausgewertet werden. Die gleichen Kriterien können auch für die Funktionen MAXWENNS , SUMMEWENNS und MITTELWERTWENNS verwendet werden.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 126 Bereich/Kriterien-Paare eingeben.' },
            criteria2: { name: 'criteria2', detail: 'Zusätzliche Bereiche und zugehörige Kriterien. Sie können bis zu 126 Bereich/Kriterien-Paare eingeben.' },
        },
    },
    MODE_MULT: {
        description: 'Gibt es mehrere Modalwerte, werden mehrere Ergebnisse zurückgegeben. Da diese Funktion ein Array von Werten zurückgibt, muss die Formel als Arrayformel eingegeben werden.',
        abstract: 'Gibt es mehrere Modalwerte, werden mehrere Ergebnisse zurückgegeben. Da diese Funktion ein Array von Werten zurückgibt, muss die Formel als Arrayformel eingegeben werden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, für das der Modalwert (Modus) berechnet werden soll' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 254 numerische Argumente, für die Sie den Modalwert (Modus) berechnen möchten. An Stelle der durch Semikolons getrennten Argumente können Sie auch ein Array oder einen Arraybezug verwenden.' },
        },
    },
    MODE_SNGL: {
        description: 'Gibt den häufigsten Wert einer Matrix oder eines Datenbereichs zurück.',
        abstract: 'Gibt den häufigsten Wert einer Matrix oder eines Datenbereichs zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste Argument, für das der Modalwert (Modus) berechnet werden soll' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 254 Argumente, für die Sie den Modalwert (Modus) berechnen möchten. An Stelle der durch Semikolons getrennten Argumente können Sie auch ein Array oder einen Arraybezug verwenden.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Gibt Wahrscheinlichkeiten einer negativen, binominal verteilten Zufallsvariablen zurück. NEGBINOM.VERT berechnet, wie wahrscheinlich es ist, dass es "Zahl_Mißerfolge" vor dem durch "Zahl_Erfolge" angegebenen Erfolg gibt, wobei "Erfolgswahrsch" die Wahrscheinlichkeit für den günstigen Ausgang des Experiments ist.',
        abstract: 'Gibt Wahrscheinlichkeiten einer negativen, binominal verteilten Zufallsvariablen zurück. NEGBINOM.VERT berechnet, wie wahrscheinlich es ist, dass es "Zahl_Mißerfolge" vor dem durch "Zahl_Erfolge" angegebenen Erfolg gibt, wobei "Erfolgswahrsch" die Wahrscheinlichkeit für den günstigen Ausgang des Experiments ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Erforderlich. Die Zahl der ungünstigen Ereignisse' },
            numberS: { name: 'number_s', detail: 'Erforderlich. Die Zahl der günstigen Ereignisse' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit für den günstigen Ausgang des Experiments' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, NEGBINOM. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    NORM_DIST: {
        description: 'Gibt die Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück. Diese Funktion hat sehr viele Anwendungsgebiete innerhalb der Statistik, so unter anderem auch Testen von Hypothesen.',
        abstract: 'Gibt die Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück. Diese Funktion hat sehr viele Anwendungsgebiete innerhalb der Statistik, so unter anderem auch Testen von Hypothesen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert der Verteilung, dessen Wahrscheinlichkeit Sie berechnen möchten' },
            mean: { name: 'mean', detail: 'Erforderlich. Das arithmetische Mittel der Verteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Verteilung' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, NORM. DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    NORM_INV: {
        description: 'Gibt Perzentile der Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück.',
        abstract: 'Gibt Perzentile der Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Standardnormalverteilung gehörige Wahrscheinlichkeit' },
            mean: { name: 'mean', detail: 'Erforderlich. Das arithmetische Mittel der Verteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Verteilung' },
        },
    },
    NORM_S_DIST: {
        description: 'Die NORM. Die S.DIST-Funktion in Excel gibt die Standardnormalverteilung zurück ( d. h., sie hat einen Mittelwert von 0 und eine Standardabweichung von 1 ). Sie können diese Funktion anstelle einer Tabelle mit Standard-Normalkurvenbereichen verwenden.',
        abstract: 'Die NORM. Die S.DIST-Funktion in Excel gibt die Standardnormalverteilung zurück ( d. h., sie hat einen Mittelwert von 0 und eine Standardabweichung von 1 ). Sie können diese Funktion anstelle einer Tabelle mit Standard-Normalkurvenbereichen verwenden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Erforderlich. Dies ist der Wert, für den Sie die Verteilung verwenden möchten.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Das kumulative Argument kann entweder TRUE oder FALSE sein. Dieser logische Wert bestimmt die Form der Funktion. Wenn kumulativ TRUE ist, dann NORM. S.DIST gibt die kumulierte Verteilungsfunktion zurück. Wenn der Wert FALSE ist, wird die Wahrscheinlichkeits-Massenfunktion zurückgegeben.' },
        },
    },
    NORM_S_INV: {
        description: 'Gibt Quantile der Standardnormalverteilung zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1.',
        abstract: 'Gibt Quantile der Standardnormalverteilung zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Standardnormalverteilung gehörige Wahrscheinlichkeit' },
        },
    },
    PEARSON: {
        description: 'Gibt den Pearsonschen Korrelationskoeffizienten r zurück. Dieser Koeffizient ist ein dimensionsloser Index mit dem Wertebereich -1,0 ≤ r ≤ 1,0 und ein Maß dafür, inwieweit zwischen zwei Datensätzen eine lineare Abhängigkeit besteht.',
        abstract: 'Gibt den Pearsonschen Korrelationskoeffizienten r zurück. Dieser Koeffizient ist ein dimensionsloser Index mit dem Wertebereich -1,0 ≤ r ≤ 1,0 und ein Maß dafür, inwieweit zwischen zwei Datensätzen eine lineare Abhängigkeit besteht.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Eine Reihe unabhängiger Werte' },
            array2: { name: 'array2', detail: 'Erforderlich. Eine Reihe abhängiger Werte' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Gibt das k-te Perzentil der Werte eines Datensatzes zurück (0 und 1 ausgeschlossen).',
        abstract: 'Gibt das k-te Perzentil der Werte eines Datensatzes zurück (0 und 1 ausgeschlossen).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'Array', detail: 'Erforderlich. Ein Array oder ein Datenbereich, das bzw. der die relative Lage der Daten beschreibt.' },
            k: { name: 'K', detail: 'Erforderlich. Ein Perzentilwert im Bereich 0 < k < 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Sie können das QUANTIL verwenden. INC-Funktion zum Festlegen eines Akzeptanzschwellenwerts. So könnten Sie beispielsweise entscheiden, dass nur Kandidaten untersucht werden, deren Prüfungsergebnisse oberhalb des 90 %-Quantils liegen.',
        abstract: 'Sie können das QUANTIL verwenden. INC-Funktion zum Festlegen eines Akzeptanzschwellenwerts. So könnten Sie beispielsweise entscheiden, dass nur Kandidaten untersucht werden, deren Prüfungsergebnisse oberhalb des 90 %-Quantils liegen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array oder ein Datenbereich, das/der die relative Lage der Daten beschreibt' },
            k: { name: 'k', detail: 'Erforderlich. Der Perzentilwert im Bereich von 0 bis einschließlich 1.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Gibt den prozentualen (0..1 ausschließlich) Rang (Alpha) eines Werts in einem Dataset zurück',
        abstract: 'Gibt den prozentualen (0..1 ausschließlich) Rang (Alpha) eines Werts in einem Dataset zurück',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Das Array oder der Bereich numerischer Daten, das/der die relative Lage der Daten beschreibt' },
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Rang Sie bestimmen möchten' },
            significance: { name: 'significance', detail: 'Optional. Ein Wert, der die Anzahl der Nachkommastellen des zurückgegebenen Quantilsrangs festlegt. Falls nicht angegeben, PERCENTRANK. EXC verwendet drei Ziffern (0.xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Diese Funktion kann dazu verwendet werden, die relative Position zu ermitteln, die ein Wert innerhalb einer Datenmenge einnimmt. So können Sie beispielsweise mithilfe von QUANTILSRANG.INKL ermitteln, welche relative Position das Ergebnis einer Eingangsuntersuchung innerhalb der Ergebnisse aller Untersuchungen einnimmt.',
        abstract: 'Diese Funktion kann dazu verwendet werden, die relative Position zu ermitteln, die ein Wert innerhalb einer Datenmenge einnimmt. So können Sie beispielsweise mithilfe von QUANTILSRANG.INKL ermitteln, welche relative Position das Ergebnis einer Eingangsuntersuchung innerhalb der Ergebnisse aller Untersuchungen einnimmt.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Die Matrix oder der Bereich numerischer Daten, die/der die relative Lage der Daten beschreibt' },
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Rang Sie bestimmen möchten' },
            significance: { name: 'significance', detail: 'Optional. Ein Wert, der die Anzahl der Nachkommastellen des zurückgegebenen Quantilsrangs festlegt. Falls nicht angegeben, PERCENTRANK. INC verwendet drei Ziffern (0.xxx).' },
        },
    },
    PERMUT: {
        description: 'Gibt die Anzahl der Möglichkeiten zurück, um k Elemente aus einer Menge von n Elementen ohne Zurücklegen zu ziehen. Eine Variation ist eine Menge von Elementen oder Ereignissen, deren interne Anordnung oder Reihenfolge relevant ist. Variationen unterscheiden sich von Kombinationen, für welche die interne Anordnung nicht relevant ist. Verwenden Sie diese Funktion z. B. für die Berechnung von Wahrscheinlichkeiten bei Zahlenlotterien.',
        abstract: 'Gibt die Anzahl der Möglichkeiten zurück, um k Elemente aus einer Menge von n Elementen ohne Zurücklegen zu ziehen. Eine Variation ist eine Menge von Elementen oder Ereignissen, deren interne Anordnung oder Reihenfolge relevant ist. Variationen unterscheiden sich von Kombinationen, für welche die interne Anordnung nicht relevant ist. Verwenden Sie diese Funktion z. B. für die Berechnung von Wahrscheinlichkeiten bei Zahlenlotterien.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Anzahl aller Elemente' },
            numberChosen: { name: 'number_chosen', detail: 'Erforderlich. Gibt an, aus wie vielen Elementen jede Variationsmöglichkeit bestehen soll' },
        },
    },
    PERMUTATIONA: {
        description: 'Gibt die Anzahl der Permutationen für eine angegebene Anzahl von Objekten zurück (mit Wiederholungen), die aus der Gesamtmenge der Objekte ausgewählt werden können.',
        abstract: 'Gibt die Anzahl der Permutationen für eine angegebene Anzahl von Objekten zurück (mit Wiederholungen), die aus der Gesamtmenge der Objekte ausgewählt werden können.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Eine ganze Zahl zur Angabe der Gesamtzahl von Objekten.' },
            numberChosen: { name: 'number_chosen', detail: 'Erforderlich. Eine ganze Zahl zur Angabe der Anzahl von Objekten in jeder Permutation.' },
        },
    },
    PHI: {
        description: 'Gibt den Wert der Dichtefunktion für eine Standardnormalverteilung zurück.',
        abstract: 'Gibt den Wert der Dichtefunktion für eine Standardnormalverteilung zurück.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. X ist die Zahl, für die Sie die Dichte der Standardnormalverteilung verwenden möchten.' },
        },
    },
    POISSON_DIST: {
        description: 'Gibt Wahrscheinlichkeiten einer poissonverteilten Zufallsvariablen zurück. Eine übliche Anwendung der Poissonverteilung ist die Modellierung der Anzahl der Ereignisse innerhalb eines bestimmten Zeitraumes, beispielsweise die Anzahl der Bankkunden, die innerhalb einer Stunde an einem Geldautomaten eintreffen.',
        abstract: 'Gibt Wahrscheinlichkeiten einer poissonverteilten Zufallsvariablen zurück. Eine übliche Anwendung der Poissonverteilung ist die Modellierung der Anzahl der Ereignisse innerhalb eines bestimmten Zeitraumes, beispielsweise die Anzahl der Bankkunden, die innerhalb einer Stunde an einem Geldautomaten eintreffen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Die Zahl der Fälle' },
            mean: { name: 'mean', detail: 'Erforderlich. Der erwartete Zahlenwert' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der zurückgegebenen Wahrscheinlichkeitsverteilung bestimmt. Wenn kumulativ TRUE ist, POISSON. DIST gibt die kumulative Poisson-Wahrscheinlichkeit zurück, dass die Anzahl der zufälligen Ereignisse zwischen null und x einschließlich liegt; False gibt die Poisson-Wahrscheinlichkeits-Massenfunktion zurück, dass die Anzahl der ereignisse genau x ist.' },
        },
    },
    PROB: {
        description: 'Gibt die Wahrscheinlichkeit für ein von zwei Werten eingeschlossenes Intervall zurück. Ist das Argument Obergrenze nicht angegeben, berechnet diese Funktion die Wahrscheinlichkeit, dass zu Beob_Werte gehörende Werte gleich dem Wert von Untergrenze sind.',
        abstract: 'Gibt die Wahrscheinlichkeit für ein von zwei Werten eingeschlossenes Intervall zurück. Ist das Argument Obergrenze nicht angegeben, berechnet diese Funktion die Wahrscheinlichkeit, dass zu Beob_Werte gehörende Werte gleich dem Wert von Untergrenze sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Erforderlich. Der Bereich von Realisationen der Zufallsvariablen, denen Wahrscheinlichkeiten zugeordnet sind' },
            probRange: { name: 'prob_range', detail: 'Erforderlich. Die Wahrscheinlichkeiten zu den beobachteten Werten' },
            lowerLimit: { name: 'lower_limit', detail: 'Optional. Die untere Grenze der Werte, deren Wahrscheinlichkeit berechnet werden soll' },
            upperLimit: { name: 'upper_limit', detail: 'Optional. Die optionale obere Grenze der Werte, deren Wahrscheinlichkeit berechnet werden soll' },
        },
    },
    QUARTILE_EXC: {
        description: 'Gibt das Quartil des Datasets basierend auf Perzentilwerten von 0 bis 1 (exklusiv) zurück.',
        abstract: 'Gibt das Quartil des Datasets basierend auf Perzentilwerten von 0 bis 1 (exklusiv) zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array oder ein Zellbereich numerischer Werte, deren Quartile Sie bestimmen möchten' },
            quart: { name: 'quart', detail: 'Erforderlich. Gibt an, welcher Wert ausgegeben werden soll' },
        },
    },
    QUARTILE_INC: {
        description: 'Gibt das Quartil eines Datensatzes zurück (einschließlich 0 und 1).',
        abstract: 'Gibt das Quartil eines Datensatzes zurück (einschließlich 0 und 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'Array', detail: 'Erforderlich. Ein Array oder ein Zellbereich numerischer Werte, deren Quartile Sie bestimmen möchten.' },
            quart: { name: 'Quart', detail: 'Erforderlich. Gibt an, welcher Quartilswert ausgegeben werden soll.' },
        },
    },
    RANK_AVG: {
        description: 'Gibt den Rang einer Zahl in einer Liste von Zahlen zurück: ihre Größe relativ zu anderen Werten in der Liste. Wenn mehrere Werte denselben Rang aufweisen, wird der durchschnittliche Rang zurückgegeben.',
        abstract: 'Gibt den Rang einer Zahl in einer Liste von Zahlen zurück: ihre Größe relativ zu anderen Werten in der Liste. Wenn mehrere Werte denselben Rang aufweisen, wird der durchschnittliche Rang zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, für die der Rang ermittelt werden soll' },
            ref: { name: 'ref', detail: 'Erforderlich. Ein Array von oder ein Bezug auf eine Liste mit Zahlen. Nicht numerische Werte im Bezug werden ignoriert.' },
            order: { name: 'order', detail: 'Optional. Eine Zahl, die angibt, wie der Rang von "Zahl" bestimmt werden soll' },
        },
    },
    RANK_EQ: {
        description: 'Gibt den Rang zurück, den eine Zahl innerhalb einer Liste von Zahlen einnimmt. Seine Größe ist relativ zu anderen Werten in der Liste; Wenn mehrere Werte denselben Rang haben, wird der oberste Rang dieser Wertemenge zurückgegeben.',
        abstract: 'Gibt den Rang zurück, den eine Zahl innerhalb einer Liste von Zahlen einnimmt. Seine Größe ist relativ zu anderen Werten in der Liste; Wenn mehrere Werte denselben Rang haben, wird der oberste Rang dieser Wertemenge zurückgegeben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, für die der Rang ermittelt werden soll' },
            ref: { name: 'ref', detail: 'Erforderlich. Ein Array von oder ein Bezug auf eine Liste mit Zahlen. Nicht numerische Werte im Bezug werden ignoriert.' },
            order: { name: 'order', detail: 'Optional. Eine Zahl, die angibt, wie der Rang von "Zahl" bestimmt werden soll' },
        },
    },
    RSQ: {
        description: 'Gibt das Quadrat des Pearsonschen Korrelationskoeffizienten zurück, entsprechend den in "Y_Werte" und "X_Werte" abgelegten Datenpunkten. Weitere Informationen finden Sie unter PEARSON (Funktion) . Ein r-quadrat-Wert kann als der Anteil der Varianz von Y, der durch die Varianz von X erklärt wird, interpretiert werden.',
        abstract: 'Gibt das Quadrat des Pearsonschen Korrelationskoeffizienten zurück, entsprechend den in "Y_Werte" und "X_Werte" abgelegten Datenpunkten. Weitere Informationen finden Sie unter PEARSON (Funktion) . Ein r-quadrat-Wert kann als der Anteil der Varianz von Y, der durch die Varianz von X erklärt wird, interpretiert werden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Eine Matrix oder ein Zellbereich numerisch abhängiger Datenpunkte' },
            knownXs: { name: 'known_x\'s', detail: 'Erforderlich. Eine Reihe unabhängiger Datenpunkte' },
        },
    },
    SKEW: {
        description: 'Gibt die Schiefe einer Verteilung zurück. Die Schiefe ist ein Maß für die Asymmetrie einer eingipfligen Häufigkeitsverteilung um ihren Mittelwert. Eine positive Schiefe zeigt eine Verteilung an, deren Gipfel sich tendenziell zu Werten größer dem Mittelwert hin orientiert. Eine negative Schiefe zeigt eine Verteilung an, deren Gipfel sich tendenziell zu Werten kleiner dem Mittelwert hin orientiert.',
        abstract: 'Gibt die Schiefe einer Verteilung zurück. Die Schiefe ist ein Maß für die Asymmetrie einer eingipfligen Häufigkeitsverteilung um ihren Mittelwert. Eine positive Schiefe zeigt eine Verteilung an, deren Gipfel sich tendenziell zu Werten größer dem Mittelwert hin orientiert. Eine negative Schiefe zeigt eine Verteilung an, deren Gipfel sich tendenziell zu Werten kleiner dem Mittelwert hin orientiert.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie die Schiefe berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Zahl1 ist erforderlich, nachfolgende Nummern sind optional. 1 bis 255 Argumente, für die Sie die Schiefe berechnen möchten. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    SKEW_P: {
        description: 'Gibt die Schiefe einer Verteilung auf der Basis einer Grundgesamtheit zurück: eine Charakterisierung des Asymmetriegrads einer Verteilung um ihren Mittelwert.',
        abstract: 'Gibt die Schiefe einer Verteilung auf der Basis einer Grundgesamtheit zurück: eine Charakterisierung des Asymmetriegrads einer Verteilung um ihren Mittelwert.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Die erste Zahl, der erste Zellbezug oder Bereich, für die bzw. den Sie die Schiefe berechnen möchten.' },
            number2: { name: 'number2', detail: 'Weitere Zahlen, Zellbezüge oder Bereiche, für die bzw. den Sie die Schiefe berechnen möchten, bis zu maximal 255.' },
        },
    },
    SLOPE: {
        description: 'Gibt die Steigung der Regressionsgeraden zurück, die an die in Y_Werte und X_Werte abgelegten Datenpunkte angepasst ist. Die Steigung entspricht dem Quotienten aus dem jeweiligen vertikalen und dem horizontalen Abstand zweier beliebiger Punkte der Geraden und ist ein Maß für die Änderung entlang der Regressionsgeraden.',
        abstract: 'Gibt die Steigung der Regressionsgeraden zurück, die an die in Y_Werte und X_Werte abgelegten Datenpunkte angepasst ist. Die Steigung entspricht dem Quotienten aus dem jeweiligen vertikalen und dem horizontalen Abstand zweier beliebiger Punkte der Geraden und ist ein Maß für die Änderung entlang der Regressionsgeraden.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Eine Matrix oder ein Zellbereich numerisch abhängiger Datenpunkte' },
            knownXs: { name: 'known_x\'s', detail: 'Erforderlich. Eine Reihe unabhängiger Datenpunkte' },
        },
    },
    SMALL: {
        description: 'Gibt den k-kleinsten Wert einer Datengruppe zurück. Mit dieser Funktion können Sie Werte ermitteln, die innerhalb einer Datenmenge eine bestimmte relative Größe haben.',
        abstract: 'Gibt den k-kleinsten Wert einer Datengruppe zurück. Mit dieser Funktion können Sie Werte ermitteln, die innerhalb einer Datenmenge eine bestimmte relative Größe haben.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Eine Matrix oder ein Bereich von numerischen Daten, deren k-kleinsten Wert Sie bestimmen möchten' },
            k: { name: 'k', detail: 'Erforderlich. Der Rang des Elements einer Matrix oder eines Zellbereichs, dessen Wert zurückgegeben werden soll' },
        },
    },
    STANDARDIZE: {
        description: 'Gibt den standardisierten Wert einer Verteilung zurück, die durch Mittelwert und Standabwn charakterisiert ist.',
        abstract: 'Gibt den standardisierten Wert einer Verteilung zurück, die durch Mittelwert und Standabwn charakterisiert ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, den Sie standardisieren möchten' },
            mean: { name: 'mean', detail: 'Erforderlich. Das arithmetische Mittel der Verteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Verteilung' },
        },
    },
    STDEV_P: {
        description: 'Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        abstract: 'Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Grundgesamtheit entspricht' },
            number2: { name: 'number2', detail: 'Optional. 1 bis 254 numerische Argumente, die einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    STDEV_S: {
        description: 'Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        abstract: 'Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Stichprobe einer Grundgesamtheit entspricht. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 254 numerische Argumente, die einer Stichprobe einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    STDEVA: {
        description: 'Schätzt die Standardabweichung ausgehend von einer Stichprobe. Die Standardabweichung ist ein Maß dafür, wie weit die jeweiligen Werte um den Mittelwert (Durchschnitt) streuen.',
        abstract: 'Schätzt die Standardabweichung ausgehend von einer Stichprobe. Die Standardabweichung ist ein Maß dafür, wie weit die jeweiligen Werte um den Mittelwert (Durchschnitt) streuen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, die einer Stichprobe einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, die einer Stichprobe einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    STDEVPA: {
        description: 'Berechnet die Standardabweichung ausgehend von einer als Argumente angegebenen Grundgesamtheit, einschließlich Text und Wahrheitswerte. Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        abstract: 'Berechnet die Standardabweichung ausgehend von einer als Argumente angegebenen Grundgesamtheit, einschließlich Text und Wahrheitswerte. Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, die einer Population entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Werte, die einer Population entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    STEYX: {
        description: 'Gibt den Standardfehler der geschätzten y-Werte für alle x-Werte der Regression zurück. Der Standardfehler ist ein Maß dafür, wie groß der Fehler bei der Prognose (Vorhersage) des zu einem x-Wert gehörenden y-Werts ist.',
        abstract: 'Gibt den Standardfehler der geschätzten y-Werte für alle x-Werte der Regression zurück. Der Standardfehler ist ein Maß dafür, wie groß der Fehler bei der Prognose (Vorhersage) des zu einem x-Wert gehörenden y-Werts ist.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Erforderlich. Eine Matrix oder ein Bereich abhängiger Datenpunkte' },
            knownXs: { name: 'known_x\'s', detail: 'Erforderlich. Eine Matrix oder ein Bereich unabhängiger Datenpunkte' },
        },
    },
    T_DIST: {
        description: 'Gibt die linksseitige Student-t-Verteilung zurück. Die t-Verteilung wird in der Hypothesenüberprüfung von kleinen Beispieldatasets verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        abstract: 'Gibt die linksseitige Student-t-Verteilung zurück. Die t-Verteilung wird in der Hypothesenüberprüfung von kleinen Beispieldatasets verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der numerische Wert, für den die Verteilung ausgewertet werden soll' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Eine ganze Zahl, mit der die Anzahl der Freiheitsgrade angegeben wird' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, gibt T.DIST die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    T_DIST_2T: {
        description: 'Die (Student) t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        abstract: 'Die (Student) t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der numerische Wert, für den die Verteilung ausgewertet werden soll' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Eine ganze Zahl, mit der die Anzahl der Freiheitsgrade angegeben wird' },
        },
    },
    T_DIST_RT: {
        description: 'Die t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        abstract: 'Die t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Verwenden Sie diese Funktion anstelle einer Tabelle mit kritischen Werten für die t-Verteilung.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der numerische Wert, für den die Verteilung ausgewertet werden soll' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Eine ganze Zahl, mit der die Anzahl der Freiheitsgrade angegeben wird' },
        },
    },
    T_INV: {
        description: 'Gibt die Umkehrfunktion der Wahrscheinlichkeit für die Studentsche t-Verteilung zurück.',
        abstract: 'Gibt die Umkehrfunktion der Wahrscheinlichkeit für die Studentsche t-Verteilung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'Wahrscheinlichkeit', detail: 'Erforderlich. Die der Student-t-Verteilung zugeordnete Wahrscheinlichkeit.' },
            degFreedom: { name: 'Deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade, durch die die Verteilung bestimmt ist.' },
        },
    },
    T_INV_2T: {
        description: 'Gibt zweiseitige Quantile der (Student) t-Verteilung zurück.',
        abstract: 'Gibt zweiseitige Quantile der (Student) t-Verteilung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die der (Student) t-Verteilung zugeordnete Wahrscheinlichkeit' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade, durch die die Verteilung bestimmt ist' },
        },
    },
    T_TEST: {
        description: 'Gibt die Teststatistik eines Student\'schen t-Tests zurück. Mithilfe von T.TEST können Sie testen, ob zwei Stichproben aus zwei Grundgesamtheiten mit demselben Mittelwert stammen.',
        abstract: 'Gibt die Teststatistik eines Student\'schen t-Tests zurück. Mithilfe von T.TEST können Sie testen, ob zwei Stichproben aus zwei Grundgesamtheiten mit demselben Mittelwert stammen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Das erste Dataset' },
            array2: { name: 'array2', detail: 'Erforderlich. Das zweite Dataset' },
            tails: { name: 'tails', detail: 'Erforderlich. Gibt die Anzahl der Verteilungsfragmente an. Wenn Tails = 1 ist, verwendet T.TEST die einseitige Verteilung. Wenn Tails = 2 ist, verwendet T.TEST die zweiseitige Verteilung.' },
            type: { name: 'type', detail: 'Erforderlich. Der Typ des durchzuführenden t-Tests' },
        },
    },
    TREND: {
        description: 'Die TREND-Funktion gibt Werte entlang eines linearen Trends zurück. Es passt eine gerade Linie (mit der Methode der geringsten Quadrate) an die known_y und known_x des Arrays. TREND gibt die y-Werte entlang dieser Zeile für das Array von new_x zurück, das Sie angeben.',
        abstract: 'Die TREND-Funktion gibt Werte entlang eines linearen Trends zurück. Es passt eine gerade Linie (mit der Methode der geringsten Quadrate) an die known_y und known_x des Arrays. TREND gibt die y-Werte entlang dieser Zeile für das Array von new_x zurück, das Sie angeben.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Der Satz von y-Werten, den Sie bereits in der Beziehung y = mx + b kennen Besteht die Matrix Y_Werte aus nur einer Spalte, wird jede Spalte der Matrix X_Werte als eigenständige Variable interpretiert. Besteht die Matrix Y_Werte aus nur einer Zeile, wird jede Zeile der Matrix X_Werte als eigenständige Variable interpretiert.' },
            knownXs: { name: 'known_x\'s', detail: 'Ein optionaler Satz von X-Werten, den Sie möglicherweise bereits in der Beziehung y = mx + b kennen Die Matrix X_Werte kann eine oder mehrere Gruppen von Variablen umfassen. Wird nur eine Variable verwendet, können Y_Werte und X_Werte Bereiche beliebiger Form sein, solange sie dieselben Dimensionen haben. Werden mehrere Variablen verwendet, muss Y_Werte ein Vektor sein (das heißt ein Bereich, der aus nur einer Zeile oder nur einer Spalte besteht). Fehlt die Matrix X_Werte, wird an ihrer Stelle die Matrix {1.2.3...} angenommen, die genauso viele Elemente wie Y_Werte enthält.' },
            newXs: { name: 'new_x\'s', detail: 'Neue x-Werte, für die TREND die entsprechenden y-Werte zurückgeben soll Analog zur Matrix X_Werte muss auch Neue_x_Werte für jede unabhängige Variable eine eigene Spalte (oder Zeile) bereitstellen. Daher müssen die Matrizen X_Werte und Neue_x_Werte gleich viele Spalten haben, wenn Y_Werte sich in einer einzelnen Spalte befindet. Befindet sich Y_Werte in einer einzelnen Zeile, müssen die Matrizen X_Werte und Neue_x_Werte gleich viele Zeilen haben. Fehlt die Matrix Neue_x_Werte, wird angenommen, dass sie mit der Matrix X_Werte identisch ist. Fehlt sowohl die Matrix X_Werte als auch die Matrix Neue_x_Werte, werden diese als die Matrix {1;2;3;...} angenommen, die genauso viele Elemente wie die Matrix Y_Werte enthält.' },
            constb: { name: 'const', detail: 'Ein logischer Wert, der angibt, ob die Konstante b auf 0 festgelegt werden soll. Ist Konstante mit WAHR belegt oder nicht angegeben, wird b normal berechnet. Ist Konstante mit FALSCH belegt, wird b gleich 0 (Null) gesetzt und m so angepasst, dass y = mx gilt.' },
        },
    },
    TRIMMEAN: {
        description: 'Gibt den Mittelwert einer Datengruppe zurück, ohne die Randwerte zu berücksichtigen. GESTUTZTMITTEL berechnet den Mittelwert einer Teilmenge der Datenpunkte, die darauf basiert, dass entsprechend des jeweils angegebenen Prozentsatzes die kleinsten und größten Werte der ursprünglichen Datenpunkte ausgeschlossen werden. Diese Funktion können Sie immer dann verwenden, wenn bei der Auswertung keine Daten berücksichtigt werden sollen, die als Ausreißer anzusehen sind.',
        abstract: 'Gibt den Mittelwert einer Datengruppe zurück, ohne die Randwerte zu berücksichtigen. GESTUTZTMITTEL berechnet den Mittelwert einer Teilmenge der Datenpunkte, die darauf basiert, dass entsprechend des jeweils angegebenen Prozentsatzes die kleinsten und größten Werte der ursprünglichen Datenpunkte ausgeschlossen werden. Diese Funktion können Sie immer dann verwenden, wenn bei der Auswertung keine Daten berücksichtigt werden sollen, die als Ausreißer anzusehen sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Eine Matrix oder Gruppe von Werten, die ohne ihre Ausreißer gemittelt wird.' },
            percent: { name: 'percent', detail: 'Erforderlich. Die Bruchzahl der Datenpunkte, die aus der Berechnung ausgeschlossen werden sollen. Wenn beispielsweise Prozent = 0,2 ist, werden vier Punkte aus einem Dataset von 20 Punkten (20 x 0,2) gekürzt: 2 von oben und 2 vom unteren Rand des Satzes.' },
        },
    },
    VAR_P: {
        description: 'Berechnet die Varianz ausgehend von der Grundgesamtheit (logische Werte und Text werden ignoriert).',
        abstract: 'Berechnet die Varianz ausgehend von der Grundgesamtheit (logische Werte und Text werden ignoriert).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Grundgesamtheit entspricht' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 254 numerische Argumente, die einer Grundgesamtheit entsprechen' },
        },
    },
    VAR_S: {
        description: 'Schätzt die Varianz ausgehend von einer Stichprobe (logische Werte und Text werden in der Stichprobe ignoriert).',
        abstract: 'Schätzt die Varianz ausgehend von einer Stichprobe (logische Werte und Text werden in der Stichprobe ignoriert).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Stichprobe einer Grundgesamtheit entspricht.' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 254 numerische Argumente, die einer Stichprobe einer Grundgesamtheit entsprechen' },
        },
    },
    VARA: {
        description: 'Schätzt die Varianz auf der Basis einer Stichprobe.',
        abstract: 'Schätzt die Varianz auf der Basis einer Stichprobe.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Wertargumente, die einer Stichprobe einer Grundgesamtheit entsprechen.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Wertargumente, die einer Stichprobe einer Grundgesamtheit entsprechen.' },
        },
    },
    VARPA: {
        description: 'Berechnet die Varianz ausgehend von der Grundgesamtheit.',
        abstract: 'Berechnet die Varianz ausgehend von der Grundgesamtheit.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Wertargumente, die einer Grundgesamtheit entsprechen.' },
            value2: { name: 'value2', detail: 'Wert1 ist erforderlich, nachfolgende Werte sind optional. 1 bis 255 Wertargumente, die einer Grundgesamtheit entsprechen.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Gibt die Weibull-Verteilung zurück.',
        abstract: 'Gibt die Weibull-Verteilung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Der Wert, für den Sie die Verteilung berechnen möchten.' },
            alpha: { name: 'alpha', detail: 'Ein Parameter der Verteilung.' },
            beta: { name: 'beta', detail: 'Ein Parameter der Verteilung.' },
            cumulative: { name: 'cumulative', detail: 'Ein Wahrheitswert, der die Form der Funktion bestimmt. Ist cumulative TRUE, gibt WEIBULL.DIST die kumulative Verteilungsfunktion zurück; ist cumulative FALSE, die Wahrscheinlichkeitsdichtefunktion.' },
        },
    },
    Z_TEST: {
        description: 'Beispiele für die Verwendung von G.TEST in einer Formel zur Berechnung eines zweiseitigen Wahrscheinlichkeitswerts finden Sie unten im Abschnitt "Hinweise".',
        abstract: 'Beispiele für die Verwendung von G.TEST in einer Formel zur Berechnung eines zweiseitigen Wahrscheinlichkeitswerts finden Sie unten im Abschnitt "Hinweise".',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Die Matrix (Array) oder der Datenbereich, gegen die/den Sie x testen möchten.' },
            x: { name: 'x', detail: 'Erforderlich. Der zu testende Wert' },
            sigma: { name: 'sigma', detail: 'Optional. Die bekannte Standardabweichung der Grundgesamtheit. Ohne Angabe wird die Beispielstandardabweichung verwendet.' },
        },
    },
};

export default locale;
