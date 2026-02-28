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
                url: 'https://support.microsoft.com/en-us/office/avedev-function-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
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
                url: 'https://support.microsoft.com/en-us/office/average-function-047bac88-d466-426c-a32b-8f33eb960cf6',
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
                url: 'https://support.google.com/docs/answer/9084098?hl=en&ref_topic=3105600&sjid=2155433538747546473-AP',
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
                url: 'https://support.microsoft.com/en-us/office/averagea-function-f5f84098-d453-4f4c-bbba-3d2c66356091',
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
                url: 'https://support.microsoft.com/en-us/office/averageif-function-faec8e2e-0dec-4308-af69-f5576d8ac642',
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
                url: 'https://support.microsoft.com/en-us/office/averageifs-function-48910c45-1fc0-4389-a028-f7c5c3001690',
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
                url: 'https://support.microsoft.com/en-us/office/beta-dist-function-11188c9c-780a-42c7-ba43-9ecb5a878d31',
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
                url: 'https://support.microsoft.com/en-us/office/beta-inv-function-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
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
                url: 'https://support.microsoft.com/en-us/office/binom-dist-function-c5ae37b6-f39c-4be2-94c2-509a1480770c',
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
                url: 'https://support.microsoft.com/en-us/office/binom-dist-range-function-17331329-74c7-4053-bb4c-6653a7421595',
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
                url: 'https://support.microsoft.com/en-us/office/binom-inv-function-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
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
                url: 'https://support.microsoft.com/en-us/office/chisq-dist-function-8486b05e-5c05-4942-a9ea-f6b341518732',
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
                url: 'https://support.microsoft.com/en-us/office/chisq-dist-rt-function-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
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
                url: 'https://support.microsoft.com/en-us/office/chisq-inv-function-400db556-62b3-472d-80b3-254723e7092f',
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
                url: 'https://support.microsoft.com/en-us/office/chisq-inv-rt-function-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
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
                url: 'https://support.microsoft.com/en-us/office/chisq-test-function-2e8a7861-b14a-4985-aa93-fb88de3f260f',
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
                url: 'https://support.microsoft.com/en-us/office/confidence-norm-function-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
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
                url: 'https://support.microsoft.com/en-us/office/confidence-t-function-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
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
                url: 'https://support.microsoft.com/en-us/office/correl-function-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
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
                url: 'https://support.microsoft.com/en-us/office/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c',
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
                url: 'https://support.microsoft.com/en-us/office/counta-function-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'hodnota1',
                detail: 'Prvá hodnota, odkaz na bunku alebo rozsah, pre ktorý chcete zistiť počet neprázdnych buniek.',
            },
            number2: {
                name: 'hodnota2',
                detail: 'Ďalšie hodnoty, odkazy na bunky alebo rozsahy, pre ktoré chcete zistiť počet neprázdnych buniek, maximálne 255.',
            },
        },
    },
    COUNTBLANK: {
        description: 'Počíta počet prázdnych buniek v zadanom rozsahu buniek.',
        abstract: 'Počíta počet prázdnych buniek v zadanom rozsahu buniek',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/countblank-function-6a92d772-675c-4bee-b346-24af6bd3ac22',
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
                url: 'https://support.microsoft.com/en-us/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34',
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
                url: 'https://support.microsoft.com/en-us/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
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
                url: 'https://support.microsoft.com/en-us/office/covariance-p-function-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
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
                url: 'https://support.microsoft.com/en-us/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977',
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
                url: 'https://support.microsoft.com/en-us/office/devsq-function-8b739616-8376-4df5-8bd0-cfe0a6caf444',
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
                url: 'https://support.microsoft.com/en-us/office/expon-dist-function-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
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
                url: 'https://support.microsoft.com/en-us/office/f-dist-function-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
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
                url: 'https://support.microsoft.com/en-us/office/f-dist-rt-function-d74cbb00-6017-4ac9-b7d7-6049badc0520',
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
                url: 'https://support.microsoft.com/en-us/office/f-inv-function-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
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
                url: 'https://support.microsoft.com/en-us/office/f-inv-rt-function-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
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
                url: 'https://support.microsoft.com/en-us/office/f-test-function-100a59e7-4108-46f8-8443-78ffacb6c0a7',
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
                url: 'https://support.microsoft.com/en-us/office/fisher-function-d656523c-5076-4f95-b87b-7741bf236c69',
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
                url: 'https://support.microsoft.com/en-us/office/fisherinv-function-62504b39-415a-4284-a285-19c8e82f86bb',
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
                url: 'https://support.microsoft.com/en-us/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
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
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Vracia interval spoľahlivosti pre predpovedanú hodnotu v zadanom cieľovom dátume.',
        abstract: 'Vracia interval spoľahlivosti pre predpovedanú hodnotu v zadanom cieľovom dátume',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Vracia dĺžku sezónneho vzoru pre zadané časové údaje.',
        abstract: 'Vracia dĺžku sezónneho vzoru pre zadané časové údaje',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Vracia štatistickú hodnotu pre predikciu ETS.',
        abstract: 'Vracia štatistickú hodnotu pre predikciu ETS',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Vracia predpovedanú hodnotu na základe lineárneho trendu.',
        abstract: 'Vracia predpovedanú hodnotu na základe lineárneho trendu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/forecast-and-forecast-linear-functions-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
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
                url: 'https://support.microsoft.com/en-us/office/frequency-function-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
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
                url: 'https://support.microsoft.com/en-us/office/gamma-function-ce1702b1-cf55-471d-8307-f83be0fc5297',
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
                url: 'https://support.microsoft.com/en-us/office/gamma-dist-function-9b6f1538-d11c-4d5f-8966-21f6a2201def',
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
                url: 'https://support.microsoft.com/en-us/office/gamma-inv-function-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
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
                url: 'https://support.microsoft.com/en-us/office/gammaln-function-b838c48b-c65f-484f-9e1d-141c55470eb9',
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
                url: 'https://support.microsoft.com/en-us/office/gammaln-precise-function-5cdfe601-4e1e-4189-9d74-241ef1caa599',
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
                url: 'https://support.microsoft.com/en-us/office/gauss-function-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
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
                url: 'https://support.microsoft.com/en-us/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
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
                url: 'https://support.microsoft.com/en-us/office/growth-function-541a91dc-3d5e-437d-b156-21324e68b80d',
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
                url: 'https://support.microsoft.com/en-us/office/harmean-function-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
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
                url: 'https://support.microsoft.com/en-us/office/hypgeom-dist-function-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
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
                url: 'https://support.microsoft.com/en-us/office/intercept-function-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
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
                url: 'https://support.microsoft.com/en-us/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
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
                url: 'https://support.microsoft.com/en-us/office/large-function-3af0af19-1190-42bb-bb8b-01672ec00a64',
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
                url: 'https://support.microsoft.com/en-us/office/linest-function-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
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
                url: 'https://support.microsoft.com/en-us/office/logest-function-f27462d8-3657-4030-866b-a272c1d18b4b',
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
                url: 'https://support.microsoft.com/en-us/office/lognorm-dist-function-eb60d00b-48a9-4217-be2b-6074aee6b070',
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
                url: 'https://support.microsoft.com/en-us/office/lognorm-inv-function-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
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
                url: 'https://support.google.com/docs/answer/12487850?hl=en&sjid=11250989209896695200-AP',
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
                url: 'https://support.microsoft.com/en-us/office/max-function-e0012414-9ac8-4b34-9a47-73e662c08098',
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
                url: 'https://support.microsoft.com/en-us/office/maxa-function-814bda1e-3840-4bff-9365-2f59ac2ee62d',
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
                url: 'https://support.microsoft.com/en-us/office/maxifs-function-dfd611e6-da2c-488a-919b-9b6376b28883',
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
                url: 'https://support.microsoft.com/en-us/office/median-function-d0916313-4753-414c-8537-ce85bdd967d2',
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
                url: 'https://support.microsoft.com/en-us/office/min-function-61635d12-920f-4ce2-a70f-96f202dcc152',
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
                url: 'https://support.microsoft.com/en-us/office/mina-function-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
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
                url: 'https://support.microsoft.com/en-us/office/minifs-function-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
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
                url: 'https://support.microsoft.com/en-us/office/mode-mult-function-50fd9464-b2ba-4191-b57a-39446689ae8c',
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
                url: 'https://support.microsoft.com/en-us/office/mode-sngl-function-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
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
                url: 'https://support.microsoft.com/en-us/office/negbinom-dist-function-c8239f89-c2d0-45bd-b6af-172e570f8599',
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
                url: 'https://support.microsoft.com/en-us/office/norm-dist-function-edb1cc14-a21c-4e53-839d-8082074c9f8d',
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
                url: 'https://support.microsoft.com/en-us/office/norm-inv-function-54b30935-fee7-493c-bedb-2278a9db7e13',
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
                url: 'https://support.microsoft.com/en-us/office/norm-s-dist-function-1e787282-3832-4520-a9ae-bd2a8d99ba88',
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
                url: 'https://support.microsoft.com/en-us/office/norm-s-inv-function-d6d556b4-ab7f-49cd-b526-5a20918452b1',
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
                url: 'https://support.microsoft.com/en-us/office/pearson-function-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
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
                url: 'https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
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
                url: 'https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
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
                url: 'https://support.microsoft.com/en-us/office/percentrank-exc-function-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
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
                url: 'https://support.microsoft.com/en-us/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a',
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
                url: 'https://support.microsoft.com/en-us/office/permut-function-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
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
                url: 'https://support.microsoft.com/en-us/office/permutationa-function-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
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
                url: 'https://support.microsoft.com/en-us/office/phi-function-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
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
                url: 'https://support.microsoft.com/en-us/office/poisson-dist-function-8fe148ff-39a2-46cb-abf3-7772695d9636',
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
                url: 'https://support.microsoft.com/en-us/office/prob-function-9ac30561-c81c-4259-8253-34f0a238fc49',
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
                url: 'https://support.microsoft.com/en-us/office/quartile-exc-function-5a355b7a-840b-4a01-b0f1-f538c2864cad',
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
                url: 'https://support.microsoft.com/en-us/office/quartile-inc-function-1bbacc80-5075-42f1-aed6-47d735c4819d',
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
                url: 'https://support.microsoft.com/en-us/office/rank-avg-function-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
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
                url: 'https://support.microsoft.com/en-us/office/rank-eq-function-284858ce-8ef6-450e-b662-26245be04a40',
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
                url: 'https://support.microsoft.com/en-us/office/rsq-function-d7161715-250d-4a01-b80d-a8364f2be08f',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Známe hodnoty y.' },
            array2: { name: 'pole2', detail: 'Známe hodnoty x.' },
        },
    },
    SKEW: {
        description: 'Vracia šikmosť rozdelenia.',
        abstract: 'Vracia šikmosť rozdelenia',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/skew-function-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
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
                url: 'https://support.microsoft.com/en-us/office/skew-p-function-76530a5c-99b9-48a1-8392-26632d542fcb',
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
                url: 'https://support.microsoft.com/en-us/office/slope-function-11fb8f97-3117-4813-98aa-61d7e01276b9',
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
                url: 'https://support.microsoft.com/en-us/office/small-function-17da8222-7c82-42b2-961b-14c45384df07',
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
                url: 'https://support.microsoft.com/en-us/office/standardize-function-81d66554-2d54-40ec-ba83-6437108ee775',
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
                url: 'https://support.microsoft.com/en-us/office/stdev-p-function-6e917c05-31a0-496f-ade7-4f4e7462f285',
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
                url: 'https://support.microsoft.com/en-us/office/stdev-s-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23',
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
                url: 'https://support.microsoft.com/en-us/office/stdeva-function-5ff38888-7ea5-48de-9a6d-11ed73b29e9d',
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
                url: 'https://support.microsoft.com/en-us/office/stdevpa-function-5578d4d6-455a-4308-9991-d405afe2c28c',
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
                url: 'https://support.microsoft.com/en-us/office/steyx-function-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
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
                url: 'https://support.microsoft.com/en-us/office/t-dist-function-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
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
                url: 'https://support.microsoft.com/en-us/office/t-dist-2t-function-198e9340-e360-4230-bd21-f52f22ff5c28',
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
                url: 'https://support.microsoft.com/en-us/office/t-dist-rt-function-20a30020-86f9-4b35-af1f-7ef6ae683eda',
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
                url: 'https://support.microsoft.com/en-us/office/t-inv-function-2908272b-4e61-4942-9df9-a25fec9b0e2e',
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
                url: 'https://support.microsoft.com/en-us/office/t-inv-2t-function-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
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
                url: 'https://support.microsoft.com/en-us/office/t-test-function-d4e08ec3-c545-485f-962e-276f7cbed055',
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
                url: 'https://support.microsoft.com/en-us/office/trend-function-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
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
                url: 'https://support.microsoft.com/en-us/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3',
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
                url: 'https://support.microsoft.com/en-us/office/var-p-function-73d1285c-108c-4843-ba5d-a51f90656f3a',
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
                url: 'https://support.microsoft.com/en-us/office/var-s-function-913633de-136b-449d-813e-65a00b2b990b',
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
                url: 'https://support.microsoft.com/en-us/office/vara-function-3de77469-fa3a-47b4-85fd-81758a1e1d07',
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
                url: 'https://support.microsoft.com/en-us/office/varpa-function-59a62635-4e89-4fad-88ac-ce4dc0513b96',
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
                url: 'https://support.microsoft.com/en-us/office/weibull-dist-function-4e783c39-9325-49be-bbc9-a83ef82b45db',
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
                url: 'https://support.microsoft.com/en-us/office/z-test-function-d633d5a3-2031-4614-a016-92180ad82bee',
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
