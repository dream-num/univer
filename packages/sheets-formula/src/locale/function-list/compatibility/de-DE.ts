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
    BETADIST: {
        description: 'Gibt die kumulierte Beta-Wahrscheinlichkeitsdichtefunktion zurück. Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        abstract: 'Gibt die kumulierte Beta-Wahrscheinlichkeitsdichtefunktion zurück. Die Betaverteilung wird i. d. R. verwendet, um die Streuung bei mehreren Stichproben zu bestimmten Vorgängen zu untersuchen. Beispielsweise kann prozentual ermittelt werden, wie viel Zeit am Tag Personen vor dem Fernsehgerät verbringen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, an dem die Funktion im Intervall zwischen A und B ausgewertet werden soll.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung.' },
            A: { name: 'A', detail: 'Eine untere Grenze des Intervalls für X.' },
            B: { name: 'B', detail: 'Optional. Eine obere Grenze des Intervalls für X.' },
        },
    },
    BETAINV: {
        description: 'Gibt die Quantile der Verteilungsfunktion einer betaverteilten Zufallsvariablen zurück. Das bedeutet, wenn Wahrscheinlichkeit = BETAVERT(x;...) ist, dann ist BETAINV(Wahrsch;...) = x. Die Betaverteilung kann für eine Projektplanung verwendet werden, um ausgehend von einem erwarteten Endtermin und der Streuung den wahrscheinlichen Endtermin zu modellieren.',
        abstract: 'Gibt die Quantile der Verteilungsfunktion einer betaverteilten Zufallsvariablen zurück. Das bedeutet, wenn Wahrscheinlichkeit = BETAVERT(x;...) ist, dann ist BETAINV(Wahrsch;...) = x. Die Betaverteilung kann für eine Projektplanung verwendet werden, um ausgehend von einem erwarteten Endtermin und der Streuung den wahrscheinlichen Endtermin zu modellieren.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/betainv-function',
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
    BINOMDIST: {
        description: 'Gibt Wahrscheinlichkeiten einer binomialverteilten Zufallsvariablen zurück. Verwenden Sie BINOMVERT bei Problemen mit einer festgelegten Anzahl von Tests oder Versuchen, wenn das Ergebnis jedes einzelnen Versuchs entweder Erfolg oder Misserfolg ist, die einzelnen Versuche voneinander unabhängig sind und die Wahrscheinlichkeit des Erfolgs für alle Versuche konstant ist. Mit BINOMVERT lässt sich beispielsweise die Wahrscheinlichkeit ermitteln, mit der zwei von drei Neugeborenen männlich sind.',
        abstract: 'Gibt Wahrscheinlichkeiten einer binomialverteilten Zufallsvariablen zurück. Verwenden Sie BINOMVERT bei Problemen mit einer festgelegten Anzahl von Tests oder Versuchen, wenn das Ergebnis jedes einzelnen Versuchs entweder Erfolg oder Misserfolg ist, die einzelnen Versuche voneinander unabhängig sind und die Wahrscheinlichkeit des Erfolgs für alle Versuche konstant ist. Mit BINOMVERT lässt sich beispielsweise die Wahrscheinlichkeit ermitteln, mit der zwei von drei Neugeborenen männlich sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Erforderlich. Die Anzahl der Erfolge in einer Versuchsreihe.' },
            trials: { name: 'trials', detail: 'Erforderlich. Die Anzahl der voneinander unabhängigen Versuche.' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit eines Erfolgs für jeden Versuch.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, gibt BINOMDIST die kumulierte Verteilungsfunktion zurück. Dies ist die Wahrscheinlichkeit, dass es höchstens number_s Erfolge gibt; False gibt die Wahrscheinlichkeits-Massenfunktion zurück, d. h. die Wahrscheinlichkeit, dass es number_s Erfolge gibt.' },
        },
    },
    CHIDIST: {
        description: 'Gibt Werte der rechtsseitigen Verteilungsfunktion (1-Alpha) einer Chi-Quadrat-verteilten Zufallsgröße zurück. Die χ2-Verteilung wird bei einem χ2-Test benötigt. Mit dem χ2-Test lassen sich beobachtete und erwartete Werte miteinander vergleichen. So wird beispielsweise in einem genetischen Experiment die Hypothese aufgestellt, dass die nächste Pflanzengeneration eine bestimmte Farbzusammensetzung aufweist. Durch Vergleich der beobachteten mit den erwarteten Ergebnissen lässt sich die Hypothese validieren.',
        abstract: 'Gibt Werte der rechtsseitigen Verteilungsfunktion (1-Alpha) einer Chi-Quadrat-verteilten Zufallsgröße zurück. Die χ2-Verteilung wird bei einem χ2-Test benötigt. Mit dem χ2-Test lassen sich beobachtete und erwartete Werte miteinander vergleichen. So wird beispielsweise in einem genetischen Experiment die Hypothese aufgestellt, dass die nächste Pflanzengeneration eine bestimmte Farbzusammensetzung aufweist. Durch Vergleich der beobachteten mit den erwarteten Ergebnissen lässt sich die Hypothese validieren.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit berechnet werden soll.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
        },
    },
    CHIINV: {
        description: 'Gibt Perzentile der rechtsseitigen Chi-Quadrat-Verteilung zurück. Ist Wahrsch = CHIVERT(x;...) gegeben, dann gilt CHIINV(Wahrsch;...) = x. Mithilfe dieser Funktion lassen sich zum Zweck der Validierung von Hypothesen beobachtete und erwartete Ergebnisse miteinander vergleichen.',
        abstract: 'Gibt Perzentile der rechtsseitigen Chi-Quadrat-Verteilung zurück. Ist Wahrsch = CHIVERT(x;...) gegeben, dann gilt CHIINV(Wahrsch;...) = x. Mithilfe dieser Funktion lassen sich zum Zweck der Validierung von Hypothesen beobachtete und erwartete Ergebnisse miteinander vergleichen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Chi-Quadrat-Verteilung gehörende Wahrscheinlichkeit.' },
            degFreedom: { name: 'deg_freedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade.' },
        },
    },
    CHITEST: {
        description: 'Liefert die Teststatistik eines Unabhängigkeitstests. CHITEST gibt den Wert der chi-quadrierten (χ2)-Verteilung für die Teststatistik mit den entsprechenden Freiheitsgraden zurück. Mithilfe von χ2-Tests können Sie feststellen, ob in Experimenten die Ergebnisse bestätigt werden, die aufgrund von Hypothesen erwartet wurden.',
        abstract: 'Liefert die Teststatistik eines Unabhängigkeitstests. CHITEST gibt den Wert der chi-quadrierten (χ2)-Verteilung für die Teststatistik mit den entsprechenden Freiheitsgraden zurück. Mithilfe von χ2-Tests können Sie feststellen, ob in Experimenten die Ergebnisse bestätigt werden, die aufgrund von Hypothesen erwartet wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Erforderlich. Der Bereich beobachteter Daten, mit dem Sie die erwarteten Werte testen möchten.' },
            expectedRange: { name: 'expected_range', detail: 'Erforderlich. Der Bereich erwarteter Beobachtungen, die sich aus der Division der miteinander multiplizierten Rangsummen und der Gesamtsumme berechnen lassen.' },
        },
    },
    CONFIDENCE: {
        description: 'Ermöglicht die Berechnung des 1-Alpha Konfidenzintervalls für den Erwartungswert einer Zufallsvariablen und verwendet dazu die Normalverteilung.',
        abstract: 'Ermöglicht die Berechnung des 1-Alpha Konfidenzintervalls für den Erwartungswert einer Zufallsvariablen und verwendet dazu die Normalverteilung.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Erforderlich. Die Irrtumswahrscheinlichkeit bei der Berechnung des Konfidenzintervalls. Das Konfidenzintervall ist gleich 100*(1 - Alpha)%, was bedeutet, dass ein Wert für Alpha von 0,05 einem Konfidenzniveau von 95% entspricht.' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die als bekannt angenommene Standardabweichung der Grundgesamtheit.' },
            size: { name: 'size', detail: 'Erforderlich. Der Umfang der Stichprobe.' },
        },
    },
    COVAR: {
        description: 'Gibt kovarianz zurück, den Durchschnitt der Produkte von Abweichungen für jedes Datenpunktpaar in zwei Datasets.',
        abstract: 'Gibt kovarianz zurück, den Durchschnitt der Produkte von Abweichungen für jedes Datenpunktpaar in zwei Datasets.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Der erste Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
            array2: { name: 'array2', detail: 'Erforderlich. Der zweite Zellbereich, dessen Zellen mit ganzen Zahlen belegt sind.' },
        },
    },
    CRITBINOM: {
        description: 'Gibt den kleinsten Wert zurück, für den die kumulierten Wahrscheinlichkeiten der Binomialverteilung größer oder gleich einer Grenzwahrscheinlichkeit sind. Mit dieser Funktion können Sie Aufgaben erledigen, die im Bereich Qualitätssicherung anfallen. Mithilfe der KRITBINOM-Funktion lässt sich beispielsweise ermitteln, wie viele defekte Teile höchstens an einem Fließband Ausschuss sein dürfen, ohne dass das gesamte Fertigungslos zurückgewiesen werden muss.',
        abstract: 'Gibt den kleinsten Wert zurück, für den die kumulierten Wahrscheinlichkeiten der Binomialverteilung größer oder gleich einer Grenzwahrscheinlichkeit sind. Mit dieser Funktion können Sie Aufgaben erledigen, die im Bereich Qualitätssicherung anfallen. Mithilfe der KRITBINOM-Funktion lässt sich beispielsweise ermitteln, wie viele defekte Teile höchstens an einem Fließband Ausschuss sein dürfen, ohne dass das gesamte Fertigungslos zurückgewiesen werden muss.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Erforderlich. Die Anzahl der Bernoulliexperimente.' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit eines Erfolgs für jeden Versuch.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Die Grenzwahrscheinlichkeit.' },
        },
    },
    EXPONDIST: {
        description: 'Gibt Wahrscheinlichkeiten einer exponential verteilten Zufallsvariablen zurück. Mithilfe der EXPONVERT-Funktion lassen sich Zeiträume zwischen Ereignissen modellieren, z. B. wie lange ein Geldautomat für die Ausgabe von Geld benötigt. Beispielsweise können Sie mit EXPONVERT berechnen, wie wahrscheinlich es ist, dass dieser Vorgang eine Minute dauert.',
        abstract: 'Gibt Wahrscheinlichkeiten einer exponential verteilten Zufallsvariablen zurück. Mithilfe der EXPONVERT-Funktion lassen sich Zeiträume zwischen Ereignissen modellieren, z. B. wie lange ein Geldautomat für die Ausgabe von Geld benötigt. Beispielsweise können Sie mit EXPONVERT berechnen, wie wahrscheinlich es ist, dass dieser Vorgang eine Minute dauert.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert für die Funktion' },
            lambda: { name: 'lambda', detail: 'Erforderlich. Der übergebene Wert' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der angibt, welche Form der exponentiellen Funktion bereitgestellt werden soll. Wenn kumulativ TRUE ist, gibt EXPONDIST die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    FDIST: {
        description: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (rechtsseitigen) F-verteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Beispielsweise können Sie die Punktzahlen untersuchen, die Männer und Frauen bei einem Einstellungstest erzielt haben, und ermitteln, ob sich die für die Frauen gefundene Streuung von derjenigen der Männer unterscheidet.',
        abstract: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (rechtsseitigen) F-verteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie feststellen, ob zwei Datenmengen unterschiedlichen Streuungen unterliegen. Beispielsweise können Sie die Punktzahlen untersuchen, die Männer und Frauen bei einem Einstellungstest erzielt haben, und ermitteln, ob sich die für die Frauen gefundene Streuung von derjenigen der Männer unterscheidet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
        },
    },
    FINV: {
        description: 'Gibt Quantile der (rechtsseitigen) F-Verteilung zurück. Ist p = FVERT(x;...), dann ist FINV(p;...) = x.',
        abstract: 'Gibt Quantile der (rechtsseitigen) F-Verteilung zurück. Ist p = FVERT(x;...), dann ist FINV(p;...) = x.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur F-Verteilung gehörige Wahrscheinlichkeit' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Zähler' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade im Nenner' },
        },
    },
    FTEST: {
        description: 'Gibt das Ergebnis eines F-Tests zurück. Ein F-Test gibt die zweiseitige Wahrscheinlichkeit zurück, dass sich die Varianzen in Array1 und Array2 nicht signifikant unterscheiden. Verwenden Sie diese Funktion, um zu bestimmen, ob zwei Stichproben unterschiedliche Varianzen aufweisen. Mit Testergebnissen von öffentlichen und privaten Schulen können Sie beispielsweise testen, ob diese Schulen unterschiedliche Stufen der Testbewertungsvielfalt aufweisen.',
        abstract: 'Gibt das Ergebnis eines F-Tests zurück. Ein F-Test gibt die zweiseitige Wahrscheinlichkeit zurück, dass sich die Varianzen in Array1 und Array2 nicht signifikant unterscheiden. Verwenden Sie diese Funktion, um zu bestimmen, ob zwei Stichproben unterschiedliche Varianzen aufweisen. Mit Testergebnissen von öffentlichen und privaten Schulen können Sie beispielsweise testen, ob diese Schulen unterschiedliche Stufen der Testbewertungsvielfalt aufweisen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Die erste Matrix oder der erste Wertebereich.' },
            array2: { name: 'array2', detail: 'Erforderlich. Die zweite Matrix oder der zweite Wertebereich.' },
        },
    },
    GAMMADIST: {
        description: 'Gibt Wahrscheinlichkeiten einer gammaverteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie Variablen untersuchen, die eine schiefe Verteilung besitzen. Die Gammaverteilung wird häufig bei Warteschlangenanalysen verwendet.',
        abstract: 'Gibt Wahrscheinlichkeiten einer gammaverteilten Zufallsvariablen zurück. Mit dieser Funktion können Sie Variablen untersuchen, die eine schiefe Verteilung besitzen. Die Gammaverteilung wird häufig bei Warteschlangenanalysen verwendet.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit berechnet werden soll.' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung. Wenn Beta = 1, gibt GAMMAVERT die Standard-Gammaverteilung zurück.' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumuliert TRUE ist, gibt GAMMADIST die kumulierte Verteilungsfunktion zurück. Wenn FALSE, wird die Wahrscheinlichkeitsdichtefunktion zurückgegeben.' },
        },
    },
    GAMMAINV: {
        description: 'Gibt Quantile der Gammaverteilung zurück. Gilt p = GAMMAVERT(x;...), dann gilt GAMMAINV(p;...) = x. Mit dieser Funktion können Sie eine Variable untersuchen, deren Verteilung eventuell schief ist.',
        abstract: 'Gibt Quantile der Gammaverteilung zurück. Gilt p = GAMMAVERT(x;...), dann gilt GAMMAINV(p;...) = x. Mit dieser Funktion können Sie eine Variable untersuchen, deren Verteilung eventuell schief ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Gammaverteilung gehörige Wahrscheinlichkeit' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung. Wenn Beta = 1, gibt GAMMAINV die Standard-Gammaverteilung zurück.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Gibt die hypergeometrische Verteilung zurück. HYPGEOMDIST gibt die Wahrscheinlichkeit einer bestimmten Anzahl von Stichprobenerfolgen in Anbetracht der Stichprobengröße, der Populationserfolge und der Populationsgröße zurück. Verwenden Sie HYPGEOMDIST für Probleme mit einer endlichen Grundgesamtheit, bei der jede Beobachtung entweder ein Erfolg oder ein Fehler ist und bei denen jede Teilmenge einer bestimmten Größe mit gleicher Wahrscheinlichkeit ausgewählt wird.',
        abstract: 'Gibt die hypergeometrische Verteilung zurück. HYPGEOMDIST gibt die Wahrscheinlichkeit einer bestimmten Anzahl von Stichprobenerfolgen in Anbetracht der Stichprobengröße, der Populationserfolge und der Populationsgröße zurück. Verwenden Sie HYPGEOMDIST für Probleme mit einer endlichen Grundgesamtheit, bei der jede Beobachtung entweder ein Erfolg oder ein Fehler ist und bei denen jede Teilmenge einer bestimmten Größe mit gleicher Wahrscheinlichkeit ausgewählt wird.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Erforderlich. Die Anzahl der in der Stichprobe erzielten Erfolge' },
            numberSample: { name: 'number_sample', detail: 'Erforderlich. Der Umfang (Größe) der Stichprobe' },
            populationS: { name: 'population_s', detail: 'Erforderlich. Die Anzahl der in der Grundgesamtheit möglichen Erfolge' },
            numberPop: { name: 'number_pop', detail: 'Erforderlich. Der Umfang (Größe) der Grundgesamtheit' },
        },
    },
    LOGINV: {
        description: 'Gibt die Umkehrung der lognormalen kumulativen Verteilungsfunktion von x zurück, wobei ln(x) normalerweise mit den Parametern Mean und standard_dev verteilt wird. Wenn p = LOGNORMDIST(x,...) dann LOGINV(p,...) = x.',
        abstract: 'Gibt die Umkehrung der lognormalen kumulativen Verteilungsfunktion von x zurück, wobei ln(x) normalerweise mit den Parametern Mean und standard_dev verteilt wird. Wenn p = LOGNORMDIST(x,...) dann LOGINV(p,...) = x.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Lognormalverteilung gehörige Wahrscheinlichkeit' },
            mean: { name: 'mean', detail: 'Erforderlich. Der Mittelwert der Lognormalverteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Lognormalverteilung' },
        },
    },
    LOGNORMDIST: {
        description: 'Gibt Werte der Verteilungsfunktion einer lognormalverteilten Zufallsvariablen zurück, wobei ln(x) mit den Parametern Mittelwert und Standabwn normalverteilt ist. Mit dieser Funktion können Sie Daten untersuchen, die logarithmisch transformiert wurden.',
        abstract: 'Gibt Werte der Verteilungsfunktion einer lognormalverteilten Zufallsvariablen zurück, wobei ln(x) mit den Parametern Mittelwert und Standabwn normalverteilt ist. Mit dieser Funktion können Sie Daten untersuchen, die logarithmisch transformiert wurden.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            mean: { name: 'mean', detail: 'Erforderlich. Der Mittelwert der Lognormalverteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Lognormalverteilung' },
        },
    },
    MODE: {
        description: 'Angenommen, Sie möchten die häufigste Anzahl von Vogelarten herausfinden, die in einer Stichprobe von Vogelzählungen in einem kritischen Feuchtgebiet über einen Zeitraum von 30 Jahren gesichtet wurden, oder Sie möchten die am häufigsten auftretende Anzahl von Telefonanrufen in einem Telefonsupportcenter außerhalb der Spitzenzeiten herausfinden. Verwenden Sie die MODE-Funktion , um den Modus einer Zahlengruppe zu berechnen.',
        abstract: 'Angenommen, Sie möchten die häufigste Anzahl von Vogelarten herausfinden, die in einer Stichprobe von Vogelzählungen in einem kritischen Feuchtgebiet über einen Zeitraum von 30 Jahren gesichtet wurden, oder Sie möchten die am häufigsten auftretende Anzahl von Telefonanrufen in einem Telefonsupportcenter außerhalb der Spitzenzeiten herausfinden. Verwenden Sie die MODE-Funktion , um den Modus einer Zahlengruppe zu berechnen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, für das der Modalwert (Modus) berechnet werden soll' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 255 numerische Argumente, für die Sie den Modalwert (Modus) berechnen möchten. An Stelle der durch Semikolons getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix verwenden.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Gibt Wahrscheinlichkeiten einer negativbinomialverteilten Zufallsvariablen zurück. NEGBINOMVERT berechnet, wie wahrscheinlich es ist, dass es genau Zahl_Mißerfolge gibt bevor der letzte positive Ausgang (Zahl_Erfolge) gezogen wird, wenn Erfolgswahrsch die gleichbleibende Wahrscheinlichkeit eines Erfolges angibt. Die Vorgehensweise dieser Funktion unterscheidet sich von der Binomialverteilung nur dadurch, dass die Anzahl der Erfolge feststeht und die Anzahl der Versuche variabel ist. Analog zu einer Binomialverteilung wird vorausgesetzt, dass die jeweiligen Versuche voneinander unabhängig sind.',
        abstract: 'Gibt Wahrscheinlichkeiten einer negativbinomialverteilten Zufallsvariablen zurück. NEGBINOMVERT berechnet, wie wahrscheinlich es ist, dass es genau Zahl_Mißerfolge gibt bevor der letzte positive Ausgang (Zahl_Erfolge) gezogen wird, wenn Erfolgswahrsch die gleichbleibende Wahrscheinlichkeit eines Erfolges angibt. Die Vorgehensweise dieser Funktion unterscheidet sich von der Binomialverteilung nur dadurch, dass die Anzahl der Erfolge feststeht und die Anzahl der Versuche variabel ist. Analog zu einer Binomialverteilung wird vorausgesetzt, dass die jeweiligen Versuche voneinander unabhängig sind.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Erforderlich. Die Zahl der ungünstigen Ereignisse' },
            numberS: { name: 'number_s', detail: 'Erforderlich. Die Zahl der günstigen Ereignisse' },
            probabilityS: { name: 'probability_s', detail: 'Erforderlich. Die Wahrscheinlichkeit für den günstigen Ausgang des Experiments' },
        },
    },
    NORMDIST: {
        description: 'Die NORMDIST-Funktion gibt die Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück. Diese Funktion verfügt über eine Vielzahl von Anwendungen in der Statistik, einschließlich Hypothesentests.',
        abstract: 'Die NORMDIST-Funktion gibt die Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück. Diese Funktion verfügt über eine Vielzahl von Anwendungen in der Statistik, einschließlich Hypothesentests.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, dessen Verteilung Sie verwenden möchten.' },
            mean: { name: 'mean', detail: 'Erforderlich. Das arithmetische Mittel der Verteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Verteilung' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der Funktion bestimmt. Wenn kumulativ TRUE ist, gibt NORMDIST die kumulierte Verteilungsfunktion zurück. Wenn kumulativ FALSE ist, wird die Wahrscheinlichkeits-Massenfunktion zurückgegeben.' },
        },
    },
    NORMINV: {
        description: 'Gibt Perzentile der Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück.',
        abstract: 'Gibt Perzentile der Normalverteilung für den angegebenen Mittelwert und die angegebene Standardabweichung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Standardnormalverteilung gehörige Wahrscheinlichkeit' },
            mean: { name: 'mean', detail: 'Erforderlich. Das arithmetische Mittel der Verteilung' },
            standardDev: { name: 'standard_dev', detail: 'Erforderlich. Die Standardabweichung der Verteilung' },
        },
    },
    NORMSDIST: {
        description: 'Gibt Werte der Verteilungsfunktion einer standardnormalverteilten Zufallsvariablen zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1. Sie können diese Funktion an Stelle einer Tabelle verwenden, in der Werte der Verteilungsfunktion der Standardnormalverteilung zusammengestellt sind.',
        abstract: 'Gibt Werte der Verteilungsfunktion einer standardnormalverteilten Zufallsvariablen zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1. Sie können diese Funktion an Stelle einer Tabelle verwenden, in der Werte der Verteilungsfunktion der Standardnormalverteilung zusammengestellt sind.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Erforderlich. Der Wert, dessen Wahrscheinlichkeit Sie berechnen möchten' },
        },
    },
    NORMSINV: {
        description: 'Gibt Quantile der Standardnormalverteilung zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1.',
        abstract: 'Gibt Quantile der Standardnormalverteilung zurück. Die Standardnormalverteilung hat einen Mittelwert von 0 und eine Standardabweichung von 1.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur Standardnormalverteilung gehörige Wahrscheinlichkeit' },
        },
    },
    PERCENTILE: {
        description: 'Gibt das Alpha-Quantil einer Gruppe von Daten zurück. Mithilfe dieser Funktion können Sie einen Akzeptanzschwellenwert festlegen. So könnten Sie beispielsweise entscheiden, dass nur Kandidaten untersucht werden, deren Prüfungsergebnisse oberhalb des 90 %-Quantils liegen.',
        abstract: 'Gibt das Alpha-Quantil einer Gruppe von Daten zurück. Mithilfe dieser Funktion können Sie einen Akzeptanzschwellenwert festlegen. So könnten Sie beispielsweise entscheiden, dass nur Kandidaten untersucht werden, deren Prüfungsergebnisse oberhalb des 90 %-Quantils liegen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array oder ein Datenbereich, das/der die relative Lage der Daten beschreibt' },
            k: { name: 'k', detail: 'Erforderlich. Der Quantilwert aus dem geschlossenen Intervall von 0 bis 1.' },
        },
    },
    PERCENTRANK: {
        description: 'Die PERCENTRANK-Funktion gibt den Rang eines Werts in einem Dataset als Prozentsatz des Datasets zurück– im Wesentlichen die relative Position eines Werts innerhalb des gesamten Datasets. Sie können beispielsweise PERCENTRANK verwenden, um den Stand der Testbewertung einer Person im Feld aller Bewertungen für denselben Test zu bestimmen.',
        abstract: 'Die PERCENTRANK-Funktion gibt den Rang eines Werts in einem Dataset als Prozentsatz des Datasets zurück– im Wesentlichen die relative Position eines Werts innerhalb des gesamten Datasets. Sie können beispielsweise PERCENTRANK verwenden, um den Stand der Testbewertung einer Person im Feld aller Bewertungen für denselben Test zu bestimmen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Der Datenbereich (oder ein vordefiniertes Array) numerischer Werte, in dem der Prozentwert bestimmt wird.' },
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den Sie den Rang innerhalb des Arrays kennen möchten.' },
            significance: { name: 'significance', detail: 'Optional. Ein Wert, der die Anzahl der Nachkommastellen des zurückgegebenen Quantilsrangs festlegt. Fehlt dieses Argument, verwendet QUANTILSRANG drei Dezimalstellen (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Gibt Wahrscheinlichkeiten einer poissonverteilten Zufallsvariablen zurück. Eine übliche Anwendung der Poissonverteilung ist die Modellierung der Anzahl der Ereignisse innerhalb eines bestimmten Zeitraumes, beispielsweise die Anzahl der Bankkunden, die innerhalb einer Stunde an einem Geldautomaten eintreffen.',
        abstract: 'Gibt Wahrscheinlichkeiten einer poissonverteilten Zufallsvariablen zurück. Eine übliche Anwendung der Poissonverteilung ist die Modellierung der Anzahl der Ereignisse innerhalb eines bestimmten Zeitraumes, beispielsweise die Anzahl der Bankkunden, die innerhalb einer Stunde an einem Geldautomaten eintreffen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Die Zahl der Fälle' },
            mean: { name: 'mean', detail: 'Erforderlich. Der erwartete Zahlenwert' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Ein logischer Wert, der die Form der zurückgegebenen Wahrscheinlichkeitsverteilung bestimmt. Wenn kumulativ TRUE ist, gibt POISSON die kumulative Poisson-Wahrscheinlichkeit zurück, dass die Anzahl der zufälligen Ereignisse zwischen null und x einschließlich liegt; False gibt die Poisson-Wahrscheinlichkeits-Massenfunktion zurück, dass die Anzahl der ereignisse genau x ist.' },
        },
    },
    QUARTILE: {
        description: 'Gibt die Quartile der Datengruppe zurück. Quartile werden häufig bei Verkaufs- oder Umfragedaten verwendet, um die Grundgesamtheiten in Gruppen einzuteilen. Beispielsweise können Sie mit QUARTILE für eine Stichprobe erhobener Einkommen den Wert ermitteln, ab dessen Höhe ein Einkommen zu den oberen 25 Prozent der Einkommen gehört.',
        abstract: 'Gibt die Quartile der Datengruppe zurück. Quartile werden häufig bei Verkaufs- oder Umfragedaten verwendet, um die Grundgesamtheiten in Gruppen einzuteilen. Beispielsweise können Sie mit QUARTILE für eine Stichprobe erhobener Einkommen den Wert ermitteln, ab dessen Höhe ein Einkommen zu den oberen 25 Prozent der Einkommen gehört.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Erforderlich. Ein Array oder ein Zellbereich numerischer Werte, deren Quartile Sie bestimmen möchten' },
            quart: { name: 'quart', detail: 'Erforderlich. Gibt an, welcher Wert ausgegeben werden soll' },
        },
    },
    RANK: {
        description: 'Gibt den Rang zurück, den eine Zahl innerhalb einer Liste von Zahlen einnimmt. Als Rang einer Zahl wird deren Größe, bezogen auf die anderen Werte der jeweiligen Liste, bezeichnet. (Wenn Sie die Liste sortieren würden, würde die Rangzahl der Zahl deren Position angeben.)',
        abstract: 'Gibt den Rang zurück, den eine Zahl innerhalb einer Liste von Zahlen einnimmt. Als Rang einer Zahl wird deren Größe, bezogen auf die anderen Werte der jeweiligen Liste, bezeichnet. (Wenn Sie die Liste sortieren würden, würde die Rangzahl der Zahl deren Position angeben.)',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Erforderlich. Die Zahl, für die der Rang ermittelt werden soll' },
            ref: { name: 'ref', detail: 'Erforderlich. Ein Verweis auf eine Liste von Zahlen. Nicht numerische Werte im Bezug werden ignoriert.' },
            order: { name: 'order', detail: 'Optional. Eine Zahl, die angibt, wie der Rang von "Zahl" bestimmt werden soll Ist Reihenfolge mit 0 (Null) belegt oder nicht angegeben, bestimmt Microsoft Excel den Rang von Zahl so, als wäre Bezug eine in absteigender Reihenfolge sortierte Liste. Ist Reihenfolge mit einem Wert ungleich 0 belegt, bestimmt Microsoft Excel den Rang von Zahl so, als wäre Bezug eine in aufsteigender Reihenfolge sortierte Liste.' },
        },
    },
    STDEV: {
        description: 'Schätzt die Standardabweichung ausgehend von einer Stichprobe. Die Standardabweichung ist ein Maß dafür, wie weit die jeweiligen Werte um den Mittelwert (Durchschnitt) streuen.',
        abstract: 'Schätzt die Standardabweichung ausgehend von einer Stichprobe. Die Standardabweichung ist ein Maß dafür, wie weit die jeweiligen Werte um den Mittelwert (Durchschnitt) streuen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Stichprobe einer Grundgesamtheit entspricht.' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 255 numerische Argumente, die einer Stichprobe einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    STDEVP: {
        description: 'Berechnet die Standardabweichung basierend auf der gesamten Grundgesamtheit, die als Argumente angegeben wird. Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        abstract: 'Berechnet die Standardabweichung basierend auf der gesamten Grundgesamtheit, die als Argumente angegeben wird. Die Standardabweichung ist ein Maß für die Streuung von Werten bezüglich ihres Mittelwerts (dem Durchschnitt).',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Grundgesamtheit entspricht' },
            number2: { name: 'number2', detail: 'Optional. 1 bis 255 numerische Argumente, die einer Grundgesamtheit entsprechen. Anstelle der durch Semikolons voneinander getrennten Argumente können Sie auch eine Matrix oder einen Bezug auf eine Matrix angeben.' },
        },
    },
    TDIST: {
        description: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (Student) t-verteilten Zufallsvariable zurück. Die t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Sie können diese Funktion an Stelle einer Wertetabelle mit den kritischen Werten der t-Verteilung heranziehen.',
        abstract: 'Gibt Werte der Verteilungsfunktion (1-Alpha) einer (Student) t-verteilten Zufallsvariable zurück. Die t-Verteilung wird für das Testen von Hypothesen bei kleinem Stichprobenumfang verwendet. Sie können diese Funktion an Stelle einer Wertetabelle mit den kritischen Werten der t-Verteilung heranziehen.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der numerische Wert, für den die Verteilung ausgewertet werden soll' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Eine ganze Zahl, mit der die Anzahl der Freiheitsgrade angegeben wird' },
            tails: { name: 'tails', detail: 'Erforderlich. Gibt die Anzahl der zurückzugebenden Verteilungsfragmente an. Wenn Tails = 1 ist, gibt TDIST die einseitige Verteilung zurück. Wenn Tails = 2 ist, gibt TDIST die zweiseitige Verteilung zurück.' },
        },
    },
    TINV: {
        description: 'Gibt zweiseitige Quantile der (Student) t-Verteilung zurück.',
        abstract: 'Gibt zweiseitige Quantile der (Student) t-Verteilung zurück.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Erforderlich. Die zur t-Verteilung gehörige Wahrscheinlichkeit (zweiseitig)' },
            degFreedom: { name: 'degFreedom', detail: 'Erforderlich. Die Anzahl der Freiheitsgrade, durch die die Verteilung bestimmt ist' },
        },
    },
    TTEST: {
        description: 'Gibt die Teststatistik eines Student\'schen t-Tests zurück. Mithilfe von TTEST können Sie testen, ob zwei Stichproben aus zwei Grundgesamtheiten mit demselben Mittelwert stammen.',
        abstract: 'Gibt die Teststatistik eines Student\'schen t-Tests zurück. Mithilfe von TTEST können Sie testen, ob zwei Stichproben aus zwei Grundgesamtheiten mit demselben Mittelwert stammen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Erforderlich. Das erste Dataset' },
            array2: { name: 'array2', detail: 'Erforderlich. Das zweite Dataset' },
            tails: { name: 'tails', detail: 'Erforderlich. Gibt die Anzahl der Verteilungsfragmente an. Wenn Tails = 1 ist, verwendet TTEST die einseitige Verteilung. Wenn Tails = 2 ist, verwendet TTEST die zweiseitige Verteilung.' },
            type: { name: 'type', detail: 'Erforderlich. Der Typ des durchzuführenden t-Tests' },
        },
    },
    VAR: {
        description: 'Schätzt die Varianz auf der Basis einer Stichprobe.',
        abstract: 'Schätzt die Varianz auf der Basis einer Stichprobe.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Stichprobe einer Grundgesamtheit entspricht.' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 255 numerische Argumente, die einer Stichprobe einer Grundgesamtheit entsprechen' },
        },
    },
    VARP: {
        description: 'Berechnet die Varianz ausgehend von der Grundgesamtheit.',
        abstract: 'Berechnet die Varianz ausgehend von der Grundgesamtheit.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Erforderlich. Das erste numerische Argument, das einer Grundgesamtheit entspricht' },
            number2: { name: 'number2', detail: 'Optional. 2 bis 255 numerische Argumente, die einer Grundgesamtheit entsprechen' },
        },
    },
    WEIBULL: {
        description: 'Gibt Wahrscheinlichkeiten einer weibullverteilten Zufallsvariablen zurück. Diese Verteilung können Sie bei Zuverlässigkeitsanalysen verwenden, also beispielsweise dazu, die mittlere Lebensdauer eines Gerätes zu berechnen.',
        abstract: 'Gibt Wahrscheinlichkeiten einer weibullverteilten Zufallsvariablen zurück. Diese Verteilung können Sie bei Zuverlässigkeitsanalysen verwenden, also beispielsweise dazu, die mittlere Lebensdauer eines Gerätes zu berechnen.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/de-de/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Erforderlich. Der Wert, für den die Funktion ausgewertet werden soll' },
            alpha: { name: 'alpha', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            beta: { name: 'beta', detail: 'Erforderlich. Ein Parameter der Verteilung' },
            cumulative: { name: 'cumulative', detail: 'Erforderlich. Bestimmt den Typ der Funktion' },
        },
    },
    ZTEST: {
        description: 'Gibt den einseitigen Wahrscheinlichkeitswert für einen Gaußtest (Normalverteilung) zurück. Für einen Erwartungswert einer Zufallsvariablen, µ0, gibt GTEST die Wahrscheinlichkeit zurück, mit der der Stichprobenmittelwert größer als der Durchschnitt der für diesen Datensatz (Array) durchgeführten Beobachtungen (also dem beobachteten Stichprobenmittel) ist.',
        abstract: 'Gibt den einseitigen Wahrscheinlichkeitswert für einen Gaußtest (Normalverteilung) zurück. Für einen Erwartungswert einer Zufallsvariablen, µ0, gibt GTEST die Wahrscheinlichkeit zurück, mit der der Stichprobenmittelwert größer als der Durchschnitt der für diesen Datensatz (Array) durchgeführten Beobachtungen (also dem beobachteten Stichprobenmittel) ist.',
        links: [
            {
                title: 'Anleitung',
                url: 'https://support.microsoft.com/de-de/excel/functions/ztest-function',
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
