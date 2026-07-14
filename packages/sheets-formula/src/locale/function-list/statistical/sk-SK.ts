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
        description: 'Vracia priemer absolútnych odchýlok dátových bodov od ich priemeru.',
        abstract: 'Vracia priemer absolútnych odchýlok dátových bodov od ich priemeru',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete priemer.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete priemer, maximálne 255.' },
        },
    },
    AVERAGE: {
        description: 'Vracia priemer (aritmetický priemer) argumentov.',
        abstract: 'Vracia priemer svojich argumentov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: {
                name: 'číslo1',
                detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete priemer.',
            },
            number2: {
                name: 'číslo2',
                detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete priemer, maximálne 255.',
            },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Nájde vážený priemer množiny hodnôt na základe hodnôt a zodpovedajúcich váh.',
        abstract: 'Nájde vážený priemer množiny hodnôt na základe hodnôt a zodpovedajúcich váh.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/9084098?hl=sk',
            },
        ],
        functionParameter: {
            values: { name: 'hodnoty', detail: 'Hodnoty, pre ktoré sa má vypočítať priemer.' },
            weights: { name: 'váhy', detail: 'Zodpovedajúci zoznam váh, ktoré sa majú použiť.' },
            additionalValues: { name: 'ďalšie_hodnoty', detail: 'Ďalšie hodnoty na spriemerovanie.' },
            additionalWeights: { name: 'ďalšie_váhy', detail: 'Ďalšie váhy, ktoré sa majú použiť.' },
        },
    },
    AVERAGEA: {
        description: 'Vracia priemer svojich argumentov vrátane čísel, textu a logických hodnôt.',
        abstract: 'Vracia priemer svojich argumentov vrátane čísel, textu a logických hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'hodnota1',
                detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete priemer.',
            },
            value2: {
                name: 'hodnota2',
                detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete priemer, maximálne 255.',
            },
        },
    },
    AVERAGEIF: {
        description: 'Vracia priemer (aritmetický priemer) všetkých buniek v rozsahu, ktoré spĺňajú dané kritérium.',
        abstract: 'Vracia priemer (aritmetický priemer) všetkých buniek v rozsahu, ktoré spĺňajú dané kritérium',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'rozsah', detail: 'Jedna alebo viac buniek na spriemerovanie vrátane čísel alebo názvov, polí alebo odkazov, ktoré obsahujú čísla.' },
            criteria: { name: 'kritérium', detail: 'Kritérium vo forme čísla, výrazu, odkazu na bunku alebo textu, ktoré určuje, ktoré bunky sa spriemerujú. Napríklad kritérium môže byť 32, "32", ">32", "jablká" alebo B4.' },
            averageRange: { name: 'rozsah_priemeru', detail: 'Skutočná množina buniek na spriemerovanie. Ak je vynechaná, použije sa rozsah.' },
        },
    },
    AVERAGEIFS: {
        description: 'Vracia priemer (aritmetický priemer) všetkých buniek, ktoré spĺňajú viacero kritérií.',
        abstract: 'Vracia priemer (aritmetický priemer) všetkých buniek, ktoré spĺňajú viacero kritérií',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'rozsah_priemeru', detail: 'Jedna alebo viac buniek na spriemerovanie vrátane čísel alebo názvov, polí alebo odkazov, ktoré obsahujú čísla.' },
            criteriaRange1: { name: 'rozsah_kritéria1', detail: 'Množina buniek, ktoré sa vyhodnocujú podľa kritéria.' },
            criteria1: { name: 'kritérium1', detail: 'Používa sa na určenie buniek, pre ktoré sa vypočíta priemer. Napríklad kritérium môže byť 32, "32", ">32", "jablko" alebo B4.' },
            criteriaRange2: { name: 'rozsah_kritéria2', detail: 'Ďalšie rozsahy. Môžete zadať až 127 rozsahov.' },
            criteria2: { name: 'kritérium2', detail: 'Ďalšie súvisiace kritériá. Môžete zadať až 127 kritérií.' },
        },
    },
    BETA_DIST: {
        description: 'Vracia kumulatívnu distribučnú funkciu beta rozdelenia',
        abstract: 'Vracia kumulatívnu distribučnú funkciu beta rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota medzi A a B, v ktorej sa má funkcia vyhodnotiť.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, BETA.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
            A: { name: 'A', detail: 'Dolná hranica intervalu x.' },
            B: { name: 'B', detail: 'Horná hranica intervalu x.' },
        },
    },
    BETA_INV: {
        description: 'Vracia inverznú hodnotu kumulatívnej distribučnej funkcie pre zadané beta rozdelenie',
        abstract: 'Vracia inverznú hodnotu kumulatívnej distribučnej funkcie pre zadané beta rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s beta rozdelením.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            A: { name: 'A', detail: 'Dolná hranica intervalu x.' },
            B: { name: 'B', detail: 'Horná hranica intervalu x.' },
        },
    },
    BINOM_DIST: {
        description: 'Vracia pravdepodobnosť binomického rozdelenia pre jednotlivý počet úspechov',
        abstract: 'Vracia pravdepodobnosť binomického rozdelenia pre jednotlivý počet úspechov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'počet_úspechov', detail: 'Počet úspechov v pokusoch.' },
            trials: { name: 'pokusy', detail: 'Počet nezávislých pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_úspechu', detail: 'Pravdepodobnosť úspechu v každom pokuse.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, BINOM.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Vracia pravdepodobnosť výsledku pokusu pomocou binomického rozdelenia',
        abstract: 'Vracia pravdepodobnosť výsledku pokusu pomocou binomického rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'pokusy', detail: 'Počet nezávislých pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_úspechu', detail: 'Pravdepodobnosť úspechu v každom pokuse.' },
            numberS: { name: 'počet_úspechov', detail: 'Počet úspechov v pokusoch.' },
            numberS2: { name: 'počet_úspechov2', detail: 'Ak je zadaný, vráti pravdepodobnosť, že počet úspešných pokusov bude medzi number_s a number_s2.' },
        },
    },
    BINOM_INV: {
        description: 'Vracia najmenšiu hodnotu, pre ktorú je kumulatívne binomické rozdelenie menšie alebo rovné kritériu',
        abstract: 'Vracia najmenšiu hodnotu, pre ktorú je kumulatívne binomické rozdelenie menšie alebo rovné kritériu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'pokusy', detail: 'Počet Bernoulliho pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_úspechu', detail: 'Pravdepodobnosť úspechu v každom pokuse.' },
            alpha: { name: 'alfa', detail: 'Hodnota kritéria.' },
        },
    },
    CHISQ_DIST: {
        description: 'Vracia ľavostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        abstract: 'Vracia ľavostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, v ktorej chcete rozdelenie vyhodnotiť.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, CHISQ.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Vracia pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        abstract: 'Vracia pravostrannú pravdepodobnosť chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, v ktorej chcete rozdelenie vyhodnotiť.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    CHISQ_INV: {
        description: 'Vracia inverznú hodnotu ľavostrannej pravdepodobnosti chí-kvadrát rozdelenia.',
        abstract: 'Vracia inverznú hodnotu ľavostrannej pravdepodobnosti chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s chí-kvadrát rozdelením.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Vracia inverznú hodnotu pravostrannej pravdepodobnosti chí-kvadrát rozdelenia.',
        abstract: 'Vracia inverznú hodnotu pravostrannej pravdepodobnosti chí-kvadrát rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s chí-kvadrát rozdelením.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    CHISQ_TEST: {
        description: 'Vracia test nezávislosti',
        abstract: 'Vracia test nezávislosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'skutočný_rozsah', detail: 'Rozsah údajov, ktorý obsahuje pozorované hodnoty.' },
            expectedRange: { name: 'očakávaný_rozsah', detail: 'Rozsah údajov, ktorý obsahuje očakávané hodnoty.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Vracia interval spoľahlivosti pre priemer populácie pri použití normálneho rozdelenia',
        abstract: 'Vracia interval spoľahlivosti pre priemer populácie pri použití normálneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'Úroveň významnosti použitá na výpočet úrovne spoľahlivosti.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka populácie.' },
            size: { name: 'veľkosť', detail: 'Veľkosť výberu.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Vracia interval spoľahlivosti pre priemer populácie pri použití t-rozdelenia',
        abstract: 'Vracia interval spoľahlivosti pre priemer populácie pri použití t-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'Úroveň významnosti použitá na výpočet úrovne spoľahlivosti.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka populácie.' },
            size: { name: 'veľkosť', detail: 'Veľkosť výberu.' },
        },
    },
    CORREL: {
        description: 'Vracia korelačný koeficient medzi dvoma množinami údajov',
        abstract: 'Vracia korelačný koeficient medzi dvoma množinami údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvá množina hodnôt buniek.' },
            array2: { name: 'pole2', detail: 'Druhá množina hodnôt buniek.' },
        },
    },
    COUNT: {
        description: 'Počíta počet buniek obsahujúcich čísla v zozname argumentov.',
        abstract: 'Počíta počet buniek v zozname argumentov, ktoré obsahujú čísla',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá položka, odkaz na bunku alebo rozsah, v ktorom chcete spočítať čísla.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie položky, odkazy na bunky alebo rozsahy, v ktorých chcete spočítať čísla, maximálne 255.' },
        },
    },
    COUNTA: {
        description: 'Počíta počet neprázdnych buniek v zozname argumentov.',
        abstract: 'Počíta počet neprázdnych buniek v zozname argumentov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: {
                name: 'hodnota1',
                detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete priemer.',
            },
            value2: {
                name: 'hodnota2',
                detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete priemer, maximálne 255.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Počíta počet prázdnych buniek v zadanom rozsahu buniek.',
        abstract: 'Počíta počet prázdnych buniek v zadanom rozsahu buniek',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'rozsah', detail: 'Rozsah, z ktorého chcete spočítať prázdne bunky.' },
        },
    },
    COUNTIF: {
        description: 'Počíta počet buniek v rozsahu, ktoré spĺňajú zadané kritérium.',
        abstract: 'Počíta počet buniek v rozsahu, ktoré spĺňajú zadané kritérium',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'rozsah', detail: 'Rozsah buniek, ktoré chcete spočítať.' },
            criteria: { name: 'kritérium', detail: 'Kritérium vo forme čísla, výrazu, odkazu na bunku alebo textu, ktoré určuje, ktoré bunky sa budú počítať. Napríklad kritérium môže byť 32, ">32", B4, "jablká" alebo "32".' },
        },
    },
    COUNTIFS: {
        description: 'Počíta počet buniek v rozsahu, ktoré spĺňajú viacero kritérií.',
        abstract: 'Počíta počet buniek v rozsahu, ktoré spĺňajú viacero kritérií',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'rozsah_kritéria1', detail: 'Prvý rozsah, v ktorom sa vyhodnotia kritériá.' },
            criteria1: { name: 'kritérium1', detail: 'Kritérium, ktoré určuje, ktoré bunky v rozsah_kritéria1 sa budú počítať.' },
            criteriaRange2: { name: 'rozsah_kritéria2', detail: 'Ďalšie rozsahy. Môžete zadať až 127 párov rozsahov.' },
            criteria2: { name: 'kritérium2', detail: 'Ďalšie súvisiace kritériá. Môžete zadať až 127 párov kritérií.' },
        },
    },
    COVARIANCE_P: {
        description: 'Vracia kovarianciu populácie, priemer súčinov odchýlok pre každý dátový bod.',
        abstract: 'Vracia kovarianciu populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvý rozsah hodnôt buniek.' },
            array2: { name: 'pole2', detail: 'Druhý rozsah hodnôt buniek.' },
        },
    },
    COVARIANCE_S: {
        description: 'Vracia kovarianciu vzorky, priemer súčinov odchýlok pre každý dátový bod.',
        abstract: 'Vracia kovarianciu vzorky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvý rozsah hodnôt buniek.' },
            array2: { name: 'pole2', detail: 'Druhý rozsah hodnôt buniek.' },
        },
    },
    DEVSQ: {
        description: 'Vracia súčet druhých mocnín odchýlok dátových bodov od ich priemeru.',
        abstract: 'Vracia súčet druhých mocnín odchýlok dátových bodov od ich priemeru',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvý argument, pre ktorý chcete vypočítať odchýlky.' },
            number2: { name: 'číslo2', detail: 'Ďalšie argumenty, pre ktoré chcete vypočítať odchýlky, maximálne 255.' },
        },
    },
    EXPON_DIST: {
        description: 'Vracia exponenciálne rozdelenie.',
        abstract: 'Vracia exponenciálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota funkcie.' },
            lambda: { name: 'lambda', detail: 'Hodnota parametra.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, EXPON.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    F_DIST: {
        description: 'Vracia F-rozdelenie pravdepodobnosti.',
        abstract: 'Vracia F-rozdelenie pravdepodobnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, v ktorej chcete vyhodnotiť funkciu.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, F.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    F_DIST_RT: {
        description: 'Vracia pravostrannú pravdepodobnosť F-rozdelenia.',
        abstract: 'Vracia pravostrannú pravdepodobnosť F-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, v ktorej chcete vyhodnotiť funkciu.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
        },
    },
    F_INV: {
        description: 'Vracia inverznú hodnotu F-rozdelenia pravdepodobnosti.',
        abstract: 'Vracia inverznú hodnotu F-rozdelenia pravdepodobnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s F-rozdelením.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
        },
    },
    F_INV_RT: {
        description: 'Vracia inverznú hodnotu pravostrannej pravdepodobnosti F-rozdelenia.',
        abstract: 'Vracia inverznú hodnotu pravostrannej pravdepodobnosti F-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s F-rozdelením.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Počet stupňov voľnosti v menovateli.' },
        },
    },
    F_TEST: {
        description: 'Vracia výsledok F-testu.',
        abstract: 'Vracia výsledok F-testu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvá matica alebo rozsah údajov.' },
            array2: { name: 'pole2', detail: 'Druhá matica alebo rozsah údajov.' },
        },
    },
    FISHER: {
        description: 'Vracia Fisherovu transformáciu.',
        abstract: 'Vracia Fisherovu transformáciu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Číselná hodnota, pre ktorú chcete transformáciu.' },
        },
    },
    FISHERINV: {
        description: 'Vracia inverznú Fisherovu transformáciu.',
        abstract: 'Vracia inverznú Fisherovu transformáciu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Hodnota, pre ktorú chcete inverznú transformáciu.' },
        },
    },
    FORECAST: {
        description: 'Vracia predpovedanú hodnotu na základe lineárneho trendu.',
        abstract: 'Vracia predpovedanú hodnotu na základe lineárneho trendu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota x, pre ktorú chcete predpoveď.' },
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    FORECAST_ETS: {
        description: 'Vracia budúcu hodnotu na základe existujúcich (historických) hodnôt pomocou exponenciálneho vyhladzovania (ETS).',
        abstract: 'Vracia budúcu hodnotu na základe existujúcich (historických) hodnôt pomocou exponenciálneho vyhladzovania (ETS)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Cieľový dátum', detail: 'Údajový bod, pre ktorý chcete predpovedať hodnotu.' },
            values: { name: 'Hodnoty', detail: 'Historické hodnoty použité na prognózu.' },
            timeline: { name: 'Časová os', detail: 'Nezávislý rozsah alebo pole číselných dátumov či časov s konštantným krokom.' },
            seasonality: { name: 'Sezónnosť', detail: 'Voliteľné. 1 pre automatické zistenie a 0 bez sezónnosti.' },
            dataCompletion: { name: 'Doplnenie údajov', detail: 'Voliteľné. Použite 1 na interpoláciu chýbajúcich bodov alebo 0 na ich nahradenie nulou.' },
            aggregation: { name: 'Agregácia', detail: 'Voliteľné. Hodnota 1 až 7 určuje agregáciu duplicitných časových pečiatok.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Vracia interval spoľahlivosti pre predpovedanú hodnotu v zadanom cieľovom dátume.',
        abstract: 'Vracia interval spoľahlivosti pre predpovedanú hodnotu v zadanom cieľovom dátume',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Cieľový dátum', detail: 'Údajový bod, pre ktorý chcete predpovedať hodnotu.' },
            values: { name: 'Hodnoty', detail: 'Historické hodnoty použité na prognózu.' },
            timeline: { name: 'Časová os', detail: 'Nezávislý rozsah alebo pole číselných dátumov či časov s konštantným krokom.' },
            confidenceLevel: { name: 'Úroveň spoľahlivosti', detail: 'Voliteľné. Číslo od 0 do 1; predvolená hodnota je 0,95.' },
            seasonality: { name: 'Sezónnosť', detail: 'Voliteľné. 1 pre automatické zistenie a 0 bez sezónnosti.' },
            dataCompletion: { name: 'Doplnenie údajov', detail: 'Voliteľné. Použite 1 na interpoláciu chýbajúcich bodov alebo 0 na ich nahradenie nulou.' },
            aggregation: { name: 'Agregácia', detail: 'Voliteľné. Hodnota 1 až 7 určuje agregáciu duplicitných časových pečiatok.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Vracia dĺžku sezónneho vzoru pre zadané časové údaje.',
        abstract: 'Vracia dĺžku sezónneho vzoru pre zadané časové údaje',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Hodnoty', detail: 'Historické hodnoty použité na prognózu.' },
            timeline: { name: 'Časová os', detail: 'Nezávislý rozsah alebo pole číselných dátumov či časov s konštantným krokom.' },
            dataCompletion: { name: 'Doplnenie údajov', detail: 'Voliteľné. Použite 1 na interpoláciu chýbajúcich bodov alebo 0 na ich nahradenie nulou.' },
            aggregation: { name: 'Agregácia', detail: 'Voliteľné. Hodnota 1 až 7 určuje agregáciu duplicitných časových pečiatok.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Vracia štatistickú hodnotu pre predikciu ETS.',
        abstract: 'Vracia štatistickú hodnotu pre predikciu ETS',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Hodnoty', detail: 'Historické hodnoty použité na prognózu.' },
            timeline: { name: 'Časová os', detail: 'Nezávislý rozsah alebo pole číselných dátumov či časov s konštantným krokom.' },
            statisticType: { name: 'Typ štatistiky', detail: 'Hodnota 1 až 8 určuje vrátenú štatistiku prognózy.' },
            seasonality: { name: 'Sezónnosť', detail: 'Voliteľné. 1 pre automatické zistenie a 0 bez sezónnosti.' },
            dataCompletion: { name: 'Doplnenie údajov', detail: 'Voliteľné. Použite 1 na interpoláciu chýbajúcich bodov alebo 0 na ich nahradenie nulou.' },
            aggregation: { name: 'Agregácia', detail: 'Voliteľné. Hodnota 1 až 7 určuje agregáciu duplicitných časových pečiatok.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Vracia predpovedanú hodnotu na základe lineárneho trendu.',
        abstract: 'Vracia predpovedanú hodnotu na základe lineárneho trendu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota x, pre ktorú chcete predpoveď.' },
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    FREQUENCY: {
        description: 'Vracia frekvenčné rozdelenie ako vertikálne pole.',
        abstract: 'Vracia frekvenčné rozdelenie ako vertikálne pole',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'pole_údajov', detail: 'Pole alebo odkaz na súbor hodnôt, pre ktoré chcete vypočítať frekvencie.' },
            binsArray: { name: 'pole_tried', detail: 'Pole alebo odkaz na intervaly, do ktorých chcete hodnoty v data_array rozdeliť.' },
        },
    },
    GAMMA: {
        description: 'Vracia hodnotu funkcie gama.',
        abstract: 'Vracia hodnotu funkcie gama',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Vstupná hodnota pre funkciu gama.' },
        },
    },
    GAMMA_DIST: {
        description: 'Vracia rozdelenie gama.',
        abstract: 'Vracia rozdelenie gama',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, GAMMA.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    GAMMA_INV: {
        description: 'Vracia inverznú hodnotu kumulatívnej distribučnej funkcie pre rozdelenie gama.',
        abstract: 'Vracia inverznú hodnotu kumulatívnej distribučnej funkcie pre rozdelenie gama',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s rozdelením gama.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
        },
    },
    GAMMALN: {
        description: 'Vracia prirodzený logaritmus funkcie gama.',
        abstract: 'Vracia prirodzený logaritmus funkcie gama',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete prirodzený logaritmus funkcie gama.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Vracia prirodzený logaritmus funkcie gama, presný výpočet.',
        abstract: 'Vracia prirodzený logaritmus funkcie gama, presný výpočet',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete prirodzený logaritmus funkcie gama.' },
        },
    },
    GAUSS: {
        description: 'Vracia pravdepodobnosť, že náhodná premenná zo štandardného normálneho rozdelenia je menšia než zadaná hodnota.',
        abstract: 'Vracia pravdepodobnosť, že náhodná premenná zo štandardného normálneho rozdelenia je menšia než zadaná hodnota',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
        },
    },
    GEOMEAN: {
        description: 'Vracia geometrický priemer.',
        abstract: 'Vracia geometrický priemer',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete geometrický priemer.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete geometrický priemer, maximálne 255.' },
        },
    },
    GROWTH: {
        description: 'Vracia predpovedané hodnoty exponenciálneho trendu.',
        abstract: 'Vracia predpovedané hodnoty exponenciálneho trendu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
            newXs: { name: 'nové_x', detail: 'Nové hodnoty x, pre ktoré chcete vypočítať nové y.' },
            constb: { name: 'konštanta_b', detail: 'Logická hodnota určujúca, či vynútiť konštantu b na hodnotu 1. Ak je TRUE alebo vynechaná, b sa vypočíta normálne. Ak je FALSE, b sa nastaví na 1.' },
        },
    },
    HARMEAN: {
        description: 'Vracia harmonický priemer.',
        abstract: 'Vracia harmonický priemer',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete harmonický priemer.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete harmonický priemer, maximálne 255.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Vracia hypergeometrické rozdelenie.',
        abstract: 'Vracia hypergeometrické rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'vzorka_úspechov', detail: 'Počet úspechov vo vzorke.' },
            numberSample: { name: 'veľkosť_vzorky', detail: 'Veľkosť vzorky.' },
            populationS: { name: 'populácia_úspechov', detail: 'Počet úspechov v populácii.' },
            numberPop: { name: 'veľkosť_populácie', detail: 'Veľkosť populácie.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, HYPGEOM.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    INTERCEPT: {
        description: 'Vracia priesečník regresnej priamky.',
        abstract: 'Vracia priesečník regresnej priamky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    KURT: {
        description: 'Vracia špicatosť množiny údajov.',
        abstract: 'Vracia špicatosť množiny údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktoré chcete špicatosť.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete špicatosť, maximálne 255.' },
        },
    },
    LARGE: {
        description: 'Vracia k-tú najväčšiu hodnotu v množine údajov.',
        abstract: 'Vracia k-tú najväčšiu hodnotu v množine údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, z ktorého chcete získať najväčšiu hodnotu.' },
            k: { name: 'k', detail: 'Poradie hodnoty v množine údajov.' },
        },
    },
    LINEST: {
        description: 'Vracia štatistiky pre priamku podľa metódy najmenších štvorcov.',
        abstract: 'Vracia štatistiky pre priamku podľa metódy najmenších štvorcov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Sada závislých údajov (y) vo funkcii y = mx + b.' },
            knownXs: { name: 'známe_x', detail: 'Sada nezávislých údajov (x) vo funkcii y = mx + b.' },
            constb: { name: 'konštanta_b', detail: 'Logická hodnota, ktorá určuje, či sa má priamka pretínať s osou y v bode 0.' },
            stats: { name: 'štatistiky', detail: 'Logická hodnota, ktorá určuje, či majú byť vrátené doplnkové regresné štatistiky.' },
        },
    },
    LOGEST: {
        description: 'Vracia štatistiky pre exponenciálnu krivku podľa metódy najmenších štvorcov.',
        abstract: 'Vracia štatistiky pre exponenciálnu krivku podľa metódy najmenších štvorcov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Sada závislých údajov (y) v exponenciálnej krivke y = b*m^x.' },
            knownXs: { name: 'známe_x', detail: 'Sada nezávislých údajov (x) v exponenciálnej krivke y = b*m^x.' },
            constb: { name: 'konštanta_b', detail: 'Logická hodnota, ktorá určuje, či sa má b vynútiť na hodnotu 1. Ak je TRUE alebo vynechaná, b sa vypočíta normálne. Ak je FALSE, b sa nastaví na 1.' },
            stats: { name: 'štatistiky', detail: 'Logická hodnota, ktorá určuje, či majú byť vrátené doplnkové regresné štatistiky.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Vracia lognormálne rozdelenie.',
        abstract: 'Vracia lognormálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            mean: { name: 'priemer', detail: 'Priemer logaritmu.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka logaritmu.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, LOGNORM.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    LOGNORM_INV: {
        description: 'Vracia inverznú hodnotu lognormálneho rozdelenia.',
        abstract: 'Vracia inverznú hodnotu lognormálneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca lognormálnemu rozdeleniu.' },
            mean: { name: 'priemer', detail: 'Priemer logaritmu.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka logaritmu.' },
        },
    },
    MARGINOFERROR: {
        description: 'Vypočíta hranicu chyby z rozsahu hodnôt a úrovne spoľahlivosti.',
        abstract: 'Vypočíta hranicu chyby z rozsahu hodnôt a úrovne spoľahlivosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/12487850?hl=sk',
            },
        ],
        functionParameter: {
            range: { name: 'rozsah', detail: 'Rozsah hodnôt použitý na výpočet hranice chyby.' },
            confidence: { name: 'spoľahlivosť', detail: 'Požadovaná úroveň spoľahlivosti v intervale (0, 1).' },
        },
    },
    MAX: {
        description: 'Vracia najväčšie číslo v množine hodnôt.',
        abstract: 'Vracia najväčšie číslo v množine hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete maximum.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete maximum, maximálne 255.' },
        },
    },
    MAXA: {
        description: 'Vracia najväčšiu hodnotu v zozname argumentov vrátane logických hodnôt a textu.',
        abstract: 'Vracia najväčšiu hodnotu v zozname argumentov vrátane logických hodnôt a textu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete maximum.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete maximum, maximálne 255.' },
        },
    },
    MAXIFS: {
        description: 'Vracia maximálnu hodnotu medzi bunkami určenými zadanými kritériami.',
        abstract: 'Vracia maximálnu hodnotu medzi bunkami určenými zadanými kritériami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'rozsah_maxima', detail: 'Skutočný rozsah buniek, z ktorých sa má určiť maximum.' },
            criteriaRange1: { name: 'rozsah_kritéria1', detail: 'Prvý rozsah, v ktorom sa vyhodnotia kritériá.' },
            criteria1: { name: 'kritérium1', detail: 'Kritérium, ktoré určuje, ktoré bunky sa vyhodnocujú v rozsah_kritéria1.' },
            criteriaRange2: { name: 'rozsah_kritéria2', detail: 'Ďalšie rozsahy. Môžete zadať až 127 párov rozsahov.' },
            criteria2: { name: 'kritérium2', detail: 'Ďalšie súvisiace kritériá. Môžete zadať až 127 párov kritérií.' },
        },
    },
    MEDIAN: {
        description: 'Vracia medián daných čísel.',
        abstract: 'Vracia medián daných čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete medián.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete medián, maximálne 255.' },
        },
    },
    MIN: {
        description: 'Vracia najmenšie číslo v množine hodnôt.',
        abstract: 'Vracia najmenšie číslo v množine hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete minimum.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete minimum, maximálne 255.' },
        },
    },
    MINA: {
        description: 'Vracia najmenšiu hodnotu v zozname argumentov vrátane logických hodnôt a textu.',
        abstract: 'Vracia najmenšiu hodnotu v zozname argumentov vrátane logických hodnôt a textu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete minimum.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete minimum, maximálne 255.' },
        },
    },
    MINIFS: {
        description: 'Vracia minimálnu hodnotu medzi bunkami určenými zadanými kritériami.',
        abstract: 'Vracia minimálnu hodnotu medzi bunkami určenými zadanými kritériami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'rozsah_minima', detail: 'Skutočný rozsah buniek, z ktorých sa má určiť minimum.' },
            criteriaRange1: { name: 'rozsah_kritéria1', detail: 'Prvý rozsah, v ktorom sa vyhodnotia kritériá.' },
            criteria1: { name: 'kritérium1', detail: 'Kritérium, ktoré určuje, ktoré bunky sa vyhodnocujú v rozsah_kritéria1.' },
            criteriaRange2: { name: 'rozsah_kritéria2', detail: 'Ďalšie rozsahy. Môžete zadať až 127 párov rozsahov.' },
            criteria2: { name: 'kritérium2', detail: 'Ďalšie súvisiace kritériá. Môžete zadať až 127 párov kritérií.' },
        },
    },
    MODE_MULT: {
        description: 'Vracia vertikálne pole najčastejšie sa vyskytujúcich hodnôt v množine údajov.',
        abstract: 'Vracia vertikálne pole najčastejšie sa vyskytujúcich hodnôt v množine údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete najčastejšiu hodnotu.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete najčastejšiu hodnotu, maximálne 255.' },
        },
    },
    MODE_SNGL: {
        description: 'Vracia najčastejšie sa vyskytujúcu hodnotu v množine údajov.',
        abstract: 'Vracia najčastejšie sa vyskytujúcu hodnotu v množine údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete najčastejšiu hodnotu.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete najčastejšiu hodnotu, maximálne 255.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Vracia negatívne binomické rozdelenie.',
        abstract: 'Vracia negatívne binomické rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'počet_neúspechov', detail: 'Počet neúspechov.' },
            numberS: { name: 'počet_úspechov', detail: 'Hraničný počet úspechov.' },
            probabilityS: { name: 'pravdepodobnosť_úspechu', detail: 'Pravdepodobnosť úspechu.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, NEGBINOM.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    NORM_DIST: {
        description: 'Vracia normálne rozdelenie.',
        abstract: 'Vracia normálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, NORM.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    NORM_INV: {
        description: 'Vracia inverznú hodnotu normálneho kumulatívneho rozdelenia.',
        abstract: 'Vracia inverznú hodnotu normálneho kumulatívneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca normálnemu rozdeleniu.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
        },
    },
    NORM_S_DIST: {
        description: 'Vracia štandardné normálne rozdelenie.',
        abstract: 'Vracia štandardné normálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, NORM.S.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    NORM_S_INV: {
        description: 'Vracia inverznú hodnotu štandardného normálneho kumulatívneho rozdelenia.',
        abstract: 'Vracia inverznú hodnotu štandardného normálneho kumulatívneho rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť zodpovedajúca štandardnému normálnemu rozdeleniu.' },
        },
    },
    PEARSON: {
        description: 'Vracia Pearsonov korelačný koeficient.',
        abstract: 'Vracia Pearsonov korelačný koeficient',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvý rozsah hodnôt buniek.' },
            array2: { name: 'pole2', detail: 'Druhý rozsah hodnôt buniek.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Vracia k-tý percentil hodnôt v rozsahu (exkluzívne).',
        abstract: 'Vracia k-tý percentil hodnôt v rozsahu (exkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete percentil.' },
            k: { name: 'k', detail: 'Hodnota percentilu v rozsahu 0 až 1 (exkluzívne).' },
        },
    },
    PERCENTILE_INC: {
        description: 'Vracia k-tý percentil hodnôt v rozsahu (inkluzívne).',
        abstract: 'Vracia k-tý percentil hodnôt v rozsahu (inkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete percentil.' },
            k: { name: 'k', detail: 'Hodnota percentilu v rozsahu 0 až 1 (inkluzívne).' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Vracia percentilové poradie hodnoty v množine údajov (exkluzívne).',
        abstract: 'Vracia percentilové poradie hodnoty v množine údajov (exkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete percentilové poradie.' },
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete percentilové poradie.' },
            significance: { name: 'presnosť', detail: 'Voliteľná hodnota, ktorá určuje počet významných číslic výsledku.' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Vracia percentilové poradie hodnoty v množine údajov (inkluzívne).',
        abstract: 'Vracia percentilové poradie hodnoty v množine údajov (inkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete percentilové poradie.' },
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete percentilové poradie.' },
            significance: { name: 'presnosť', detail: 'Voliteľná hodnota, ktorá určuje počet významných číslic výsledku.' },
        },
    },
    PERMUT: {
        description: 'Vracia počet permutácií pre daný počet objektov.',
        abstract: 'Vracia počet permutácií pre daný počet objektov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'počet', detail: 'Celkový počet objektov.' },
            numberChosen: { name: 'počet_zvolených', detail: 'Počet objektov v každej permutácii.' },
        },
    },
    PERMUTATIONA: {
        description: 'Vracia počet permutácií s opakovaním pre daný počet objektov.',
        abstract: 'Vracia počet permutácií s opakovaním pre daný počet objektov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'počet', detail: 'Celkový počet objektov.' },
            numberChosen: { name: 'počet_zvolených', detail: 'Počet objektov v každej permutácii.' },
        },
    },
    PHI: {
        description: 'Vracia hodnotu hustoty pravdepodobnosti pre štandardné normálne rozdelenie.',
        abstract: 'Vracia hodnotu hustoty pravdepodobnosti pre štandardné normálne rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pre ktorú chcete vypočítať hustotu pravdepodobnosti.' },
        },
    },
    POISSON_DIST: {
        description: 'Vracia Poissonovo rozdelenie.',
        abstract: 'Vracia Poissonovo rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Počet udalostí.' },
            mean: { name: 'priemer', detail: 'Očakávaná hodnota.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, POISSON.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti pravdepodobnostnú hmotnostnú funkciu.' },
        },
    },
    PROB: {
        description: 'Vracia pravdepodobnosť, že hodnoty v rozsahu budú medzi dvoma limitmi.',
        abstract: 'Vracia pravdepodobnosť, že hodnoty v rozsahu budú medzi dvoma limitmi',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'rozsah_x', detail: 'Rozsah číselných hodnôt x.' },
            probRange: { name: 'rozsah_pravdepodobností', detail: 'Rozsah pravdepodobností priradených hodnotám v rozsah_x.' },
            lowerLimit: { name: 'dolná_hranica', detail: 'Dolná hranica hodnoty, pre ktorú chcete vypočítať pravdepodobnosť.' },
            upperLimit: { name: 'horná_hranica', detail: 'Horná hranica hodnoty, pre ktorú chcete vypočítať pravdepodobnosť. Ak je vynechaná, PROB vráti pravdepodobnosť, že x je rovné dolnej hranici.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Vracia kvartil množiny údajov (exkluzívne).',
        abstract: 'Vracia kvartil množiny údajov (exkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete kvartil.' },
            quart: { name: 'kvartil', detail: 'Hodnota, ktorá určuje, ktorý kvartil chcete vrátiť.' },
        },
    },
    QUARTILE_INC: {
        description: 'Vracia kvartil množiny údajov (inkluzívne).',
        abstract: 'Vracia kvartil množiny údajov (inkluzívne)',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, pre ktorý chcete kvartil.' },
            quart: { name: 'kvartil', detail: 'Hodnota, ktorá určuje, ktorý kvartil chcete vrátiť.' },
        },
    },
    RANK_AVG: {
        description: 'Vracia poradie čísla v zozname čísel s použitím priemeru rovnakých hodnôt.',
        abstract: 'Vracia poradie čísla v zozname čísel s použitím priemeru rovnakých hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktorého poradie chcete nájsť.' },
            ref: { name: 'odkaz', detail: 'Zoznam čísel, podľa ktorých sa určuje poradie čísla.' },
            order: { name: 'poradie', detail: 'Číslo určujúce, ako sa má číslo zoradiť. Ak je 0 alebo vynechané, zoradí sa zostupne; ak je nenulové, vzostupne.' },
        },
    },
    RANK_EQ: {
        description: 'Vracia poradie čísla v zozname čísel.',
        abstract: 'Vracia poradie čísla v zozname čísel',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Číslo, ktorého poradie chcete nájsť.' },
            ref: { name: 'odkaz', detail: 'Zoznam čísel, podľa ktorých sa určuje poradie čísla.' },
            order: { name: 'poradie', detail: 'Číslo určujúce, ako sa má číslo zoradiť. Ak je 0 alebo vynechané, zoradí sa zostupne; ak je nenulové, vzostupne.' },
        },
    },
    RSQ: {
        description: 'Vracia druhú mocninu Pearsonovho korelačného koeficientu.',
        abstract: 'Vracia druhú mocninu Pearsonovho korelačného koeficientu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    SKEW: {
        description: 'Vracia šikmosť rozdelenia.',
        abstract: 'Vracia šikmosť rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete šikmosť.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete šikmosť, maximálne 255.' },
        },
    },
    SKEW_P: {
        description: 'Vracia šikmosť populácie na základe celej populácie.',
        abstract: 'Vracia šikmosť populácie na základe celej populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete šikmosť.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete šikmosť, maximálne 255.' },
        },
    },
    SLOPE: {
        description: 'Vracia smernicu regresnej priamky.',
        abstract: 'Vracia smernicu regresnej priamky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    SMALL: {
        description: 'Vracia k-tú najmenšiu hodnotu v množine údajov.',
        abstract: 'Vracia k-tú najmenšiu hodnotu v množine údajov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, z ktorého chcete získať najmenšiu hodnotu.' },
            k: { name: 'k', detail: 'Poradie hodnoty v množine údajov.' },
        },
    },
    STANDARDIZE: {
        description: 'Vracia normalizovanú hodnotu z rozdelenia.',
        abstract: 'Vracia normalizovanú hodnotu z rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, ktorá sa má normalizovať.' },
            mean: { name: 'priemer', detail: 'Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Štandardná odchýlka rozdelenia.' },
        },
    },
    STDEV_P: {
        description: 'Vypočíta štandardnú odchýlku na základe celej populácie.',
        abstract: 'Vypočíta štandardnú odchýlku na základe celej populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete štandardnú odchýlku.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete štandardnú odchýlku, maximálne 255.' },
        },
    },
    STDEV_S: {
        description: 'Odhaduje štandardnú odchýlku na základe vzorky.',
        abstract: 'Odhaduje štandardnú odchýlku na základe vzorky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete štandardnú odchýlku.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete štandardnú odchýlku, maximálne 255.' },
        },
    },
    STDEVA: {
        description: 'Odhaduje štandardnú odchýlku na základe vzorky, vrátane čísel, textu a logických hodnôt.',
        abstract: 'Odhaduje štandardnú odchýlku na základe vzorky, vrátane čísel, textu a logických hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete štandardnú odchýlku.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete štandardnú odchýlku, maximálne 255.' },
        },
    },
    STDEVPA: {
        description: 'Vypočíta štandardnú odchýlku na základe celej populácie, vrátane čísel, textu a logických hodnôt.',
        abstract: 'Vypočíta štandardnú odchýlku na základe celej populácie, vrátane čísel, textu a logických hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete štandardnú odchýlku.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete štandardnú odchýlku, maximálne 255.' },
        },
    },
    STEYX: {
        description: 'Vracia štandardnú chybu predikcie pre y-hodnoty v regresii.',
        abstract: 'Vracia štandardnú chybu predikcie pre y-hodnoty v regresii',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
        },
    },
    T_DIST: {
        description: 'Vracia t-rozdelenie.',
        abstract: 'Vracia t-rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, T.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    T_DIST_2T: {
        description: 'Vracia obojstrannú pravdepodobnosť t-rozdelenia.',
        abstract: 'Vracia obojstrannú pravdepodobnosť t-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    T_DIST_RT: {
        description: 'Vracia pravostrannú pravdepodobnosť t-rozdelenia.',
        abstract: 'Vracia pravostrannú pravdepodobnosť t-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť rozdelenie.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    T_INV: {
        description: 'Vracia inverznú hodnotu t-rozdelenia.',
        abstract: 'Vracia inverznú hodnotu t-rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s t-rozdelením.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    T_INV_2T: {
        description: 'Vracia inverznú hodnotu obojstrannej t-distribúcie.',
        abstract: 'Vracia inverznú hodnotu obojstrannej t-distribúcie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Pravdepodobnosť spojená s t-rozdelením.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Počet stupňov voľnosti.' },
        },
    },
    T_TEST: {
        description: 'Vracia pravdepodobnosť spojenú so Studentovým t-testom.',
        abstract: 'Vracia pravdepodobnosť spojenú so Studentovým t-testom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Prvá množina údajov.' },
            array2: { name: 'pole2', detail: 'Druhá množina údajov.' },
            tails: { name: 'chvosty', detail: 'Určuje počet chvostov distribúcie. Ak tails = 1, ide o jednostranný test; ak tails = 2, ide o obojstranný test.' },
            type: { name: 'typ', detail: 'Číslo určujúce typ t-testu.' },
        },
    },
    TREND: {
        description: 'Vracia hodnoty pozdĺž lineárneho trendu.',
        abstract: 'Vracia hodnoty pozdĺž lineárneho trendu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'známe_y', detail: 'Závislé hodnoty vynesené v známom rozsahu.' },
            knownXs: { name: 'známe_x', detail: 'Nezávislé hodnoty vynesené v známom rozsahu.' },
            newXs: { name: 'nové_x', detail: 'Nové hodnoty x, pre ktoré chcete vypočítať nové y.' },
            constb: { name: 'konštanta_b', detail: 'Logická hodnota, ktorá určuje, či má byť priesečník nastavený na 0.' },
        },
    },
    TRIMMEAN: {
        description: 'Vracia priemer vylúčením percenta dátových bodov na oboch koncoch.',
        abstract: 'Vracia priemer vylúčením percenta dátových bodov na oboch koncoch',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, ktoré chcete spriemerovať.' },
            percent: { name: 'percento', detail: 'Percento dátových bodov, ktoré sa má vylúčiť z výpočtu.' },
        },
    },
    VAR_P: {
        description: 'Vypočíta rozptyl na základe celej populácie.',
        abstract: 'Vypočíta rozptyl na základe celej populácie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete rozptyl.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete rozptyl, maximálne 255.' },
        },
    },
    VAR_S: {
        description: 'Odhaduje rozptyl na základe vzorky.',
        abstract: 'Odhaduje rozptyl na základe vzorky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Prvé číslo, odkaz na bunku alebo rozsah, pre ktorý chcete rozptyl.' },
            number2: { name: 'číslo2', detail: 'Ďalšie čísla, odkazy na bunky alebo rozsahy, pre ktoré chcete rozptyl, maximálne 255.' },
        },
    },
    VARA: {
        description: 'Odhaduje rozptyl na základe vzorky vrátane čísel, textu a logických hodnôt.',
        abstract: 'Odhaduje rozptyl na základe vzorky vrátane čísel, textu a logických hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete rozptyl.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete rozptyl, maximálne 255.' },
        },
    },
    VARPA: {
        description: 'Vypočíta rozptyl na základe celej populácie vrátane čísel, textu a logických hodnôt.',
        abstract: 'Vypočíta rozptyl na základe celej populácie vrátane čísel, textu a logických hodnôt',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'hodnota1', detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete rozptyl.' },
            value2: { name: 'hodnota2', detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete rozptyl, maximálne 255.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Vracia Weibullovo rozdelenie.',
        abstract: 'Vracia Weibullovo rozdelenie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Hodnota, pri ktorej chcete vyhodnotiť funkciu.' },
            alpha: { name: 'alfa', detail: 'Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Logická hodnota, ktorá určuje formu funkcie. Ak je kumulatívne TRUE, WEIBULL.DIST vráti kumulatívnu distribučnú funkciu; ak FALSE, vráti hustotu pravdepodobnosti.' },
        },
    },
    Z_TEST: {
        description: 'Vracia obojstrannú P-hodnotu z-testu.',
        abstract: 'Vracia obojstrannú P-hodnotu z-testu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole alebo rozsah údajov, na ktoré sa z-test vzťahuje.' },
            x: { name: 'x', detail: 'Testovaná hodnota.' },
            sigma: { name: 'sigma', detail: 'Štandardná odchýlka populácie. Ak je vynechaná, použije sa štandardná odchýlka vzorky.' },
        },
    },
};

export default locale;
