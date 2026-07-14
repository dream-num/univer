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
        description: 'Vráti hodnotu funkcie kumulatívnej hustoty rozdelenia pravdepodobnosti beta. Rozdelenie beta sa používa na skúmanie zmeny percentuálnej časti určitého javu pre dané výbery, napríklad časti dňa, počas ktorej ľudia pozerajú televíziu.',
        abstract: 'Vráti hodnotu funkcie kumulatívnej hustoty rozdelenia pravdepodobnosti beta. Rozdelenie beta sa používa na skúmanie zmeny percentuálnej časti určitého javu pre dané výbery, napríklad časti dňa, počas ktorej ľudia pozerajú televíziu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Predstavuje hodnotu medzi hodnotami argumentov A a B, pre ktorú chcete zistiť hodnotu funkcie.' },
            alpha: { name: 'alfa', detail: 'Povinné. Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Povinné. Parameter rozdelenia.' },
            A: { name: 'A', detail: 'Dolná hranica pre interval hodnôt x.' },
            B: { name: 'B', detail: 'B Voliteľný argument. Horná hranica pre interval hodnôt x.' },
        },
    },
    BETAINV: {
        description: 'Vráti inverznú hodnotu kumulatívnej funkcie hustoty pravdepodobnosti beta pre zadané beta rozdelenie. To znamená, že ak pravdepodobnosť = BETADIST(x,...), potom BETAINV(pravdepodobnosť,...) = x. Rozdelenie beta možno použiť na plánovanie projektov pre modelovanie pravdepodobnej doby ukončenia, ak je zadaná očakávaná doba ukončenia a premenlivosť.',
        abstract: 'Vráti inverznú hodnotu kumulatívnej funkcie hustoty pravdepodobnosti beta pre zadané beta rozdelenie. To znamená, že ak pravdepodobnosť = BETADIST(x,...), potom BETAINV(pravdepodobnosť,...) = x. Rozdelenie beta možno použiť na plánovanie projektov pre modelovanie pravdepodobnej doby ukončenia, ak je zadaná očakávaná doba ukončenia a premenlivosť.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť spojená s rozdelením beta.' },
            alpha: { name: 'alfa', detail: 'Povinné. Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Povinné. Predstavuje parameter rozdelenia.' },
            A: { name: 'A', detail: 'Dolná hranica pre interval hodnôt x.' },
            B: { name: 'B', detail: 'B Voliteľný argument. Horná hranica pre interval hodnôt x.' },
        },
    },
    BINOMDIST: {
        description: 'Vráti hodnotu binomického rozdelenia pravdepodobnosti diskrétnych veličín. Funkcia BINOMDIST sa používa pri problémoch s pevným počtom testov alebo pokusov, keď výsledkom pokusu môže byť iba úspech alebo neúspech, pokusy sú nezávislé a pravdepodobnosť úspechu je počas trvania experimentu konštantná. Funkciou BINOMDIST napríklad môžete vypočítať, aká je pravdepodobnosť, že dve z ďalších troch narodených detí budú chlapci.',
        abstract: 'Vráti hodnotu binomického rozdelenia pravdepodobnosti diskrétnych veličín. Funkcia BINOMDIST sa používa pri problémoch s pevným počtom testov alebo pokusov, keď výsledkom pokusu môže byť iba úspech alebo neúspech, pokusy sú nezávislé a pravdepodobnosť úspechu je počas trvania experimentu konštantná. Funkciou BINOMDIST napríklad môžete vypočítať, aká je pravdepodobnosť, že dve z ďalších troch narodených detí budú chlapci.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'počet_uspechov', detail: 'Povinné. Počet úspešných pokusov.' },
            trials: { name: 'pokusy', detail: 'Povinné. Počet nezávislých pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Povinné. Pravdepodobnosť úspechu pre každý pokus.' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Logická hodnota, ktorá určuje tvar funkcie. Ak je hodnotou argumentu kumulatívne (súčet) logická hodnota TRUE, funkcia BINOMDIST vráti súčtovú distribučnú funkciu, teda pravdepodobnosť navyššej number_s úspešných pokusov. Ak má hodnotu FALSE, vráti hustotu pravdepodobnosti, teda pravdepodobnosť number_s úspechu.' },
        },
    },
    CHIDIST: {
        description: 'Vráti pravostrannú pravdepodobnosť pre rozdelenie chí-kvadrát. Rozdelenie ?2 je spojené s testom ?2. Test ?2 porovnáva pozorované a očakávané hodnoty. Pri genetickom experimente môžete napríklad predpokladať, že nasledujúca generácia rastlín bude mať určitú farbu kvetov. Porovnaním pozorovaných a očakávaných výsledkov môžete zistiť, či platí pôvodný predpoklad.',
        abstract: 'Vráti pravostrannú pravdepodobnosť pre rozdelenie chí-kvadrát. Rozdelenie ?2 je spojené s testom ?2. Test ?2 porovnáva pozorované a očakávané hodnoty. Pri genetickom experimente môžete napríklad predpokladať, že nasledujúca generácia rastlín bude mať určitú farbu kvetov. Porovnaním pozorovaných a očakávaných výsledkov môžete zistiť, či platí pôvodný predpoklad.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete zistiť hodnotu rozdelenia.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Povinné. Počet stupňov voľnosti.' },
        },
    },
    CHIINV: {
        description: 'Vráti inverznú hodnotu pravostrannej pravdepodobnosti rozdelenia chí-kvadrát. Ak pravdepodobnosť = CHIDIST(x,...), potom CHIINV(pravdepodobnosť,...) = x. Táto funkcia slúži na porovnávanie zaznamenaných a očakávaných výsledkov, na základe ktorého možno rozhodnúť, či platí pôvodný predpoklad.',
        abstract: 'Vráti inverznú hodnotu pravostrannej pravdepodobnosti rozdelenia chí-kvadrát. Ak pravdepodobnosť = CHIDIST(x,...), potom CHIINV(pravdepodobnosť,...) = x. Táto funkcia slúži na porovnávanie zaznamenaných a očakávaných výsledkov, na základe ktorého možno rozhodnúť, či platí pôvodný predpoklad.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť spojená s rozdelením chí-kvadrát.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Povinné. Počet stupňov voľnosti.' },
        },
    },
    CHITEST: {
        description: 'Počíta test nezávislosti. Funkcia CHITEST vráti hodnotu rozdelenia chí-kvadrát (χ2) pre štatistiku a príslušné stupne voľnosti. Testy χ2 umožňujú určiť, či sú očakávané výsledky potvrdené experimentom.',
        abstract: 'Počíta test nezávislosti. Funkcia CHITEST vráti hodnotu rozdelenia chí-kvadrát (χ2) pre štatistiku a príslušné stupne voľnosti. Testy χ2 umožňujú určiť, či sú očakávané výsledky potvrdené experimentom.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'skutočný_rozsah', detail: 'Povinné. Rozsah údajov obsahujúci pozorovania, ktoré chcete testovať a porovnávať s predpokladanými výsledkami.' },
            expectedRange: { name: 'očakávaný_rozsah', detail: 'Povinné. Rozsah údajov obsahujúci podiel súčinu súčtov riadkov a stĺpcov a celkového súčtu.' },
        },
    },
    CONFIDENCE: {
        description: 'Vráti interval spoľahlivosti pre strednú hodnotu populácie použitím normálneho rozdelenia.',
        abstract: 'Vráti interval spoľahlivosti pre strednú hodnotu populácie použitím normálneho rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alfa', detail: 'Povinné. Hladina významnosti, pomocou ktorej sa počíta koeficient spoľahlivosti. Koeficient spoľahlivosti sa rovná 100*(1 - alfa)%, čiže ak sa argument alfa rovná 0,05, tak koeficient spoľahlivosti je 95%.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Povinné. Smerodajná odchýlka základného súboru pre danú oblasť údajov a predpokladá sa že je známa.' },
            size: { name: 'veľkosť', detail: 'Povinné. Veľkosť vzorky.' },
        },
    },
    COVAR: {
        description: 'Vráti hodnotu kovariancie, priemernú hodnotu súčinu odchýlok pre všetky dvojice údajových bodov v dvoch množinách údajov.',
        abstract: 'Vráti hodnotu kovariancie, priemernú hodnotu súčinu odchýlok pre všetky dvojice údajových bodov v dvoch množinách údajov.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Povinné. Prvý rozsah buniek s celými číslami.' },
            array2: { name: 'pole2', detail: 'Povinné. Druhý rozsah buniek s celými číslami.' },
        },
    },
    CRITBINOM: {
        description: 'Vráti najmenšiu hodnotu, pre ktorú má distribučná funkcia binomického rozdelenia hodnotu väčšiu alebo rovnajúcu sa hodnote kritéria. Táto funkcia sa používa na kontrolu a zaisťovanie kvality. Funkciu CRITBINOM môžete napríklad použiť na určenie najväčšieho možného počtu chybných súčiastok, ktoré môžu opustiť výrobnú linku bez toho, aby bolo treba odmietnuť celú sériu.',
        abstract: 'Vráti najmenšiu hodnotu, pre ktorú má distribučná funkcia binomického rozdelenia hodnotu väčšiu alebo rovnajúcu sa hodnote kritéria. Táto funkcia sa používa na kontrolu a zaisťovanie kvality. Funkciu CRITBINOM môžete napríklad použiť na určenie najväčšieho možného počtu chybných súčiastok, ktoré môžu opustiť výrobnú linku bez toho, aby bolo treba odmietnuť celú sériu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'pokusy', detail: 'Povinné. Počet Bernoulliho pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Povinné. Pravdepodobnosť úspechu pre každý pokus.' },
            alpha: { name: 'alfa', detail: 'Povinné. Hodnota kritéria.' },
        },
    },
    EXPONDIST: {
        description: 'Vráti hodnotu distribučnej funkcie alebo hustoty exponenciálneho rozdelenia. Funkcia EXPONDIST sa používa na modelovanie času medzi udalosťami, napríklad doba, za ktorú bankomat vydá peniaze. Pomocou funkcie EXPONDIST napríklad môžete vypočítať pravdepodobnosť, že tento proces trvá najviac 1 minútu.',
        abstract: 'Vráti hodnotu distribučnej funkcie alebo hustoty exponenciálneho rozdelenia. Funkcia EXPONDIST sa používa na modelovanie času medzi udalosťami, napríklad doba, za ktorú bankomat vydá peniaze. Pomocou funkcie EXPONDIST napríklad môžete vypočítať pravdepodobnosť, že tento proces trvá najviac 1 minútu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota funkcie.' },
            lambda: { name: 'lambda', detail: 'Povinné. Hodnota parametra.' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Logická hodnota, ktorá určuje, aký typ funkcie sa má poskytnúť. Ak má argument kumulatívne hodnotu TRUE, funkcia EXPONDIST vráti súčtovú distribučnú funkciu. Ak má hodnotu FALSE, vráti funkciu hustoty rozdelenia pravdepodobnosti.' },
        },
    },
    FDIST: {
        description: 'Vráti hodnotu (pravostranného) rozdelenia pravdepodobnosti F (stupeň rozdielnosti) pre dve množiny údajov. Pomocou tejto funkcie možno určiť, či majú dve množiny údajov rôzne stupne odlišnosti. Môžete napríklad skúmať výsledky prijímacích skúšok na strednú školu u mužov a u žien a určiť, či existujú odlišnosti.',
        abstract: 'Vráti hodnotu (pravostranného) rozdelenia pravdepodobnosti F (stupeň rozdielnosti) pre dve množiny údajov. Pomocou tejto funkcie možno určiť, či majú dve množiny údajov rôzne stupne odlišnosti. Môžete napríklad skúmať výsledky prijímacích skúšok na strednú školu u mužov a u žien a určiť, či existujú odlišnosti.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete funkciu vyhodnotiť.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Povinné. Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Povinné. Počet stupňov voľnosti v menovateli.' },
        },
    },
    FINV: {
        description: 'Vráti inverznú hodnotu (sprava ohraničeného) rozdelenia pravdepodobnosti F. Ak p = F.DIST.RT(x,...), potom F.INV.RT(p,...) = x. Ak p = FDIST(x,...), potom FINV(p,...) = x.',
        abstract: 'Vráti inverznú hodnotu (sprava ohraničeného) rozdelenia pravdepodobnosti F. Ak p = F.DIST.RT(x,...), potom F.INV.RT(p,...) = x. Ak p = FDIST(x,...), potom FINV(p,...) = x.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Predstavuje pravdepodobnosť spojenú s kumulatívnym rozdelením F.' },
            degFreedom1: { name: 'stupne_voľnosti1', detail: 'Povinné. Počet stupňov voľnosti v čitateli.' },
            degFreedom2: { name: 'stupne_voľnosti2', detail: 'Povinné. Počet stupňov voľnosti v menovateli.' },
        },
    },
    FTEST: {
        description: 'Vráti výsledok F-testu. F-test vráti dvojstrannú pravdepodobnosť významnej odlišnosti rozptylov v argumentoch pole1 a pole2. Pomocou tejto funkcie možno zistiť, či sa rozptyly dvoch vzoriek líšia. Ak napríklad porovnáte výsledky testov z dvoch rozličných typov škôl (štátna a súkromná), môžete zistiť, či majú tieto školy rozdielny rozptyl výsledkov testov.',
        abstract: 'Vráti výsledok F-testu. F-test vráti dvojstrannú pravdepodobnosť významnej odlišnosti rozptylov v argumentoch pole1 a pole2. Pomocou tejto funkcie možno zistiť, či sa rozptyly dvoch vzoriek líšia. Ak napríklad porovnáte výsledky testov z dvoch rozličných typov škôl (štátna a súkromná), môžete zistiť, či majú tieto školy rozdielny rozptyl výsledkov testov.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Povinné. Prvé pole alebo rozsah údajov.' },
            array2: { name: 'pole2', detail: 'Povinné. Druhé pole alebo rozsah údajov.' },
        },
    },
    GAMMADIST: {
        description: 'Vráti hodnotu distribučnej funkcie alebo hustoty rozdelenia gama. Táto funkcia sa používa napríklad na skúmanie premenných, ktoré môžu mať zošikmené rozdelenie. Rozdelenie gama sa obvykle používa na analýzu radov.',
        abstract: 'Vráti hodnotu distribučnej funkcie alebo hustoty rozdelenia gama. Táto funkcia sa používa napríklad na skúmanie premenných, ktoré môžu mať zošikmené rozdelenie. Rozdelenie gama sa obvykle používa na analýzu radov.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete zistiť hodnotu rozdelenia.' },
            alpha: { name: 'alfa', detail: 'Povinné. Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Povinné. Parameter rozdelenia. Ak beta = 1, funkcia GAMMADIST vráti štandardné rozdelenie gama.' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Logická hodnota, ktorá určuje tvar funkcie. Ak má tento argument hodnotu TRUE, funkcia GAMMADIST vráti súčtovú distribučnú funkciu. Ak má hodnotu FALSE, vráti funkciu hustoty rozdelenia pravdepodobnosti.' },
        },
    },
    GAMMAINV: {
        description: 'Vráti inverznú funkciu ku (kumulatívnej) distribučnej funkcii rozdelenia gama. Ak p = GAMMADIST(x,...), potom GAMMAINV(p,...) = x. Táto funkcia sa používa na skúmanie premennej s možným asymetrickým (šikmým) rozdelením.',
        abstract: 'Vráti inverznú funkciu ku (kumulatívnej) distribučnej funkcii rozdelenia gama. Ak p = GAMMADIST(x,...), potom GAMMAINV(p,...) = x. Táto funkcia sa používa na skúmanie premennej s možným asymetrickým (šikmým) rozdelením.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť spojená s rozdelením gama.' },
            alpha: { name: 'alfa', detail: 'Povinné. Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Povinné. Parameter rozdelenia. Ak beta = 1, funkcia GAMMAINV vráti štandardné rozdelenie gama.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Vráti hodnotu funkcie hypergeometrického rozdelenia. Funkcia HYPGEOMDIST vráti pravdepodobnosť, že bude práve daný počet úspešných pozorovaní vo vzorke, ak je daná veľkosť vzorky, počet úspešných pozorovaní v základnom súbore a veľkosť základného súboru. Funkcia HYPGEOMDIST sa používa pri problémoch týkajúcich sa konečného základného súboru, pričom môžu byť jednotlivé pozorovania úspešné alebo neúspešné a kde je pravdepodobnosť vybratia každej podmnožiny danej veľkosti rovnaká.',
        abstract: 'Vráti hodnotu funkcie hypergeometrického rozdelenia. Funkcia HYPGEOMDIST vráti pravdepodobnosť, že bude práve daný počet úspešných pozorovaní vo vzorke, ak je daná veľkosť vzorky, počet úspešných pozorovaní v základnom súbore a veľkosť základného súboru. Funkcia HYPGEOMDIST sa používa pri problémoch týkajúcich sa konečného základného súboru, pričom môžu byť jednotlivé pozorovania úspešné alebo neúspešné a kde je pravdepodobnosť vybratia každej podmnožiny danej veľkosti rovnaká.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'úspechy_vzorka', detail: 'Povinné. Počet úspešných pozorovaní v základnom súbore.' },
            numberSample: { name: 'veľkosť_vzorky', detail: 'Povinné. Počet prvkov vo výberovom súbore.' },
            populationS: { name: 'úspechy_populácia', detail: 'Povinné. Počet úspešných pozorovaní vo vzorke.' },
            numberPop: { name: 'veľkosť_populácie', detail: 'Povinné. Počet prvkov základného súboru.' },
        },
    },
    LOGINV: {
        description: 'Vráti inverznú lognormálnu kumulatívnu distribučnú funkciu x, kde ln(x) má normálnu distribúciu s parametrami stredná_hodnota a smerodajná_odchýlka. Ak p = LOGNORMDIST(x;...), potom LOGINV(p;...) = x.',
        abstract: 'Vráti inverznú lognormálnu kumulatívnu distribučnú funkciu x, kde ln(x) má normálnu distribúciu s parametrami stredná_hodnota a smerodajná_odchýlka. Ak p = LOGNORMDIST(x;...), potom LOGINV(p;...) = x.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť spojená s lognormálnou distribúciou.' },
            mean: { name: 'priemer', detail: 'Povinné. Stredná hodnota hodnôt ln(x).' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Povinné. Smerodajná odchýlka hodnôt ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Vráti hodnotu distribučnej funkcie súčtového lognormálneho rozdelenia pre hodnotu x, kde ln(x) má normálne rozdelenie s parametrami stredná_hodnota a smerodajná_odchýlka. Táto funkcia sa používa na analýzu údajov, ktoré boli transformované logaritmickou funkciou.',
        abstract: 'Vráti hodnotu distribučnej funkcie súčtového lognormálneho rozdelenia pre hodnotu x, kde ln(x) má normálne rozdelenie s parametrami stredná_hodnota a smerodajná_odchýlka. Táto funkcia sa používa na analýzu údajov, ktoré boli transformované logaritmickou funkciou.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete funkciu vyhodnotiť.' },
            mean: { name: 'priemer', detail: 'Povinné. Stredná hodnota hodnôt ln(x).' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Povinné. Smerodajná odchýlka hodnôt ln(x).' },
        },
    },
    MODE: {
        description: 'Povedzme, že chcete zistiť najbežnejší počet druhov vtákov pozorovaných vo vzorke počtov vtákov v kritickej mokradi, za 30 rokov, alebo chcete zistiť najčastejšie sa vyskytujúci počet telefonických hovorov v centre telefonickej podpory mimo špičky. Ak chcete vypočítať modus skupiny čísel, použite funkciu MODE .',
        abstract: 'Povedzme, že chcete zistiť najbežnejší počet druhov vtákov pozorovaných vo vzorke počtov vtákov v kritickej mokradi, za 30 rokov, alebo chcete zistiť najčastejšie sa vyskytujúci počet telefonických hovorov v centre telefonickej podpory mimo špičky. Ak chcete vypočítať modus skupiny čísel, použite funkciu MODE .',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Prvý číselný argument, pre ktorý chcete vypočítať modus.' },
            number2: { name: 'číslo2', detail: 'Voliteľný argument. 2 až 255 číselných argumentov, pre ktoré chcete vypočítať modus. Namiesto argumentov oddelených čiarkami môžete použiť jedno pole alebo odkaz na pole.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Vráti hodnotu funkcie záporného binomického rozdelenia. Funkcia NEGBINOMDIST vráti pravdepodobnosť toho, že dôjde k číslo_f neúspechom, kým nastane číslo_s úspechov pri konštantnej pravdepodobnosti úspechu vyjadrenej hodnotou pravdepodobnosť_úspechu. Táto funkcia má podobný tvar aj význam ako binomické rozdelenie, s tým rozdielom, že počet úspešných pozorovaní je pevný a počet pokusov premenlivý. Podobne ako pri binomickom rozdelení, jednotlivé pokusy sa považujú za nezávislé.',
        abstract: 'Vráti hodnotu funkcie záporného binomického rozdelenia. Funkcia NEGBINOMDIST vráti pravdepodobnosť toho, že dôjde k číslo_f neúspechom, kým nastane číslo_s úspechov pri konštantnej pravdepodobnosti úspechu vyjadrenej hodnotou pravdepodobnosť_úspechu. Táto funkcia má podobný tvar aj význam ako binomické rozdelenie, s tým rozdielom, že počet úspešných pozorovaní je pevný a počet pokusov premenlivý. Podobne ako pri binomickom rozdelení, jednotlivé pokusy sa považujú za nezávislé.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'počet_neúspechov', detail: 'Povinné. Počet neúspešných pokusov.' },
            numberS: { name: 'počet_uspechov', detail: 'Povinné. Prahová hodnota počtu úspešných pokusov.' },
            probabilityS: { name: 'pravdepodobnosť_uspechu', detail: 'Povinné. Pravdepodobnosť úspechu.' },
        },
    },
    NORMDIST: {
        description: 'Funkcia NORMDIST vráti hodnotu distribučnej funkcie alebo hustoty normálneho rozdelenia pre zadanú strednú hodnotu a smerodajnú odchýlku. Táto funkcia má v štatistike široké použitie, vrátane testovania hypotéz.',
        abstract: 'Funkcia NORMDIST vráti hodnotu distribučnej funkcie alebo hustoty normálneho rozdelenia pre zadanú strednú hodnotu a smerodajnú odchýlku. Táto funkcia má v štatistike široké použitie, vrátane testovania hypotéz.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete vypočítať rozdelenie.' },
            mean: { name: 'priemer', detail: 'Povinné. Aritmetický priemer rozdelenia' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Povinné. Smerodajná odchýlka rozdelenia' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Logická hodnota, ktorá určuje tvar funkcie. Ak má tento argument hodnotu TRUE, funkcia NORMDIST vráti súčtovú distribučnú funkciu. ak má argument kumulatívne hodnotu FALSE, vráti hustotu rozdelenia pravdepodobnosti.' },
        },
    },
    NORMINV: {
        description: 'Vráti inverznú funkciu k distribučnej funkcii normálneho rozdelenia pre zadanú strednú hodnotu a smerodajnú odchýlku.',
        abstract: 'Vráti inverznú funkciu k distribučnej funkcii normálneho rozdelenia pre zadanú strednú hodnotu a smerodajnú odchýlku.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť zodpovedajúca normálnemu rozdeleniu.' },
            mean: { name: 'priemer', detail: 'Povinné. Aritmetický priemer rozdelenia.' },
            standardDev: { name: 'štandardná_odchýlka', detail: 'Povinné. Smerodajná odchýlka rozdelenia.' },
        },
    },
    NORMSDIST: {
        description: 'Vráti hodnotu distribučnej funkcie štandardného normálneho rozdelenia. Toto rozdelenie má strednú hodnotu 0 a smerodajnú odchýlku 1. Táto funkcia sa používa miesto tabuľky pre výpočet integrálu pod krivkou štandardného normálneho rozdelenia.',
        abstract: 'Vráti hodnotu distribučnej funkcie štandardného normálneho rozdelenia. Toto rozdelenie má strednú hodnotu 0 a smerodajnú odchýlku 1. Táto funkcia sa používa miesto tabuľky pre výpočet integrálu pod krivkou štandardného normálneho rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Povinný argument. Hodnota, pre ktorú chcete vypočítať rozdelenie.' },
        },
    },
    NORMSINV: {
        description: 'Vráti inverznú funkciu k distribučnej funkcii štandardného normálneho rozdelenia. Toto rozdelenie má strednú hodnotu 0 a smerodajnú odchýlku 1.',
        abstract: 'Vráti inverznú funkciu k distribučnej funkcii štandardného normálneho rozdelenia. Toto rozdelenie má strednú hodnotu 0 a smerodajnú odchýlku 1.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť zodpovedajúca normálnemu rozdeleniu.' },
        },
    },
    PERCENTILE: {
        description: 'Vráti K-ty percentil v rozsahu hodnôt. Táto funkcia sa používa na stanovenie prahových hodnôt. Umožňuje napríklad preskúmať kandidátov, ktorí dosiahli aspoň 90-ty percentil.',
        abstract: 'Vráti K-ty percentil v rozsahu hodnôt. Táto funkcia sa používa na stanovenie prahových hodnôt. Umožňuje napríklad preskúmať kandidátov, ktorí dosiahli aspoň 90-ty percentil.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Povinné. Pole alebo rozsah údajov, ktoré určujú relatívne umiestnenie.' },
            k: { name: 'k', detail: 'Povinný argument. Hodnota percentilu z uzavretého intervalu 0..1.' },
        },
    },
    PERCENTRANK: {
        description: 'Funkcia PERCENTRANK vráti poradie hodnoty v množine údajov, vyjadrené percentuálnou časťou množiny údajov – v podstate ide o relatívne umiestnenie hodnoty v rámci celej množiny údajov. Funkciu PERCENTRANK môžete použiť napríklad na určenie poradia výsledkov testu jednotlivca v poli všetkých výsledkov toho istého testu.',
        abstract: 'Funkcia PERCENTRANK vráti poradie hodnoty v množine údajov, vyjadrené percentuálnou časťou množiny údajov – v podstate ide o relatívne umiestnenie hodnoty v rámci celej množiny údajov. Funkciu PERCENTRANK môžete použiť napríklad na určenie poradia výsledkov testu jednotlivca v poli všetkých výsledkov toho istého testu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Povinné. Rozsah údajov (alebo preddefinované pole) číselných hodnôt, v ktorých sa určuje percentuálne poradie.' },
            x: { name: 'x', detail: 'Povinný argument. Hodnota, ktorej poradie v rámci poľa chcete zistiť.' },
            significance: { name: 'významnosť', detail: 'Voliteľný argument. Hodnota určujúca počet desatinných miest, na ktoré bude vracaná hodnota zaokrúhlená. Ak túto hodnotu nezadáte, funkcia PERCENTRANK použije 3 desatinné miesta (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Vráti hodnoty Poissonovho rozdelenia. Poissonovo rozdelenie sa obvykle používa na určenie pravdepodobného počtu prípadov za jednotku času, ako napríklad počet automobilov prichádzajúcich na colnicu za jednu minútu.',
        abstract: 'Vráti hodnoty Poissonovho rozdelenia. Poissonovo rozdelenie sa obvykle používa na určenie pravdepodobného počtu prípadov za jednotku času, ako napríklad počet automobilov prichádzajúcich na colnicu za jednu minútu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Počet prípadov.' },
            mean: { name: 'priemer', detail: 'Povinné. Očakávaná číselná hodnota.' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Logická hodnota určujúca formu vráteného rozdelenia pravdepodobnosti. Ak má tento argument hodnotu TRUE, vráti funkcia POISSON distribučnú funkciu Poissonovho rozdelenia pravdepodobnosti s tým, že počet náhodných prípadov bude v intervale nula až x. Ak má argument hodnotu FALSE, vráti sa pravdepodobnostná funkcia Poissonovho rozdelenia tak, že počet prípadov bude práve x.' },
        },
    },
    QUARTILE: {
        description: 'Vráti kvartil množiny údajov. Kvartily sa často používajú pri spracovaní údajov o predaji alebo prieskume na rozdelenie populácie do skupín. Funkciu QUARTILE môžete napríklad použiť na vyhľadanie najvyšších 25 percent príjmu v populácii.',
        abstract: 'Vráti kvartil množiny údajov. Kvartily sa často používajú pri spracovaní údajov o predaji alebo prieskume na rozdelenie populácie do skupín. Funkciu QUARTILE môžete napríklad použiť na vyhľadanie najvyšších 25 percent príjmu v populácii.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Povinné. Pole alebo rozsah buniek obsahujúcich číselné hodnoty, z ktorých chcete kvartil vypočítať.' },
            quart: { name: 'kvartil', detail: 'Povinné. Určuje vrátenú hodnotu.' },
        },
    },
    RANK: {
        description: 'Vráti relatívnu veľkosť čísla v zozname čísel. Relatívna veľkosť čísla je jeho veľkosť v porovnaní s ostatnými hodnotami v zozname. (Ak by ste zoznam zoradili, umiestnenie čísla by bola jeho relatívna veľkosť).',
        abstract: 'Vráti relatívnu veľkosť čísla v zozname čísel. Relatívna veľkosť čísla je jeho veľkosť v porovnaní s ostatnými hodnotami v zozname. (Ak by ste zoznam zoradili, umiestnenie čísla by bola jeho relatívna veľkosť).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'číslo', detail: 'Povinné. Číslo, ktorého relatívnu veľkosť chcete nájsť.' },
            ref: { name: 'odkaz', detail: 'Povinné. Odkaz na zoznam čísel. Hodnoty, ktoré nie sú čísla, sú v parametri odkaz ignorované.' },
            order: { name: 'poradie', detail: 'Voliteľný argument. Číslo určujúce spôsob zisťovania relatívnej veľkosti čísla. Ak je parameter poradie 0 (nula) alebo vynechaný, program Microsoft Excel určí relatívnu veľkosť čísla, ako keby bol zoznam v parametri odkaz zoradený zostupne. Ak má parameter poradie nenulovú hodnotu, program Microsoft Excel určí relatívnu veľkosť čísla, ako keby bol zoznam v parametri odkaz zoradený vzostupne.' },
        },
    },
    STDEV: {
        description: 'Odhadne smerodajnú odchýlku podľa výberového súboru. Smerodajná odchýlka vyjadruje, ako sa hodnoty líšia od priemernej hodnoty (strednej hodnoty).',
        abstract: 'Odhadne smerodajnú odchýlku podľa výberového súboru. Smerodajná odchýlka vyjadruje, ako sa hodnoty líšia od priemernej hodnoty (strednej hodnoty).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Číselný argument 1 zodpovedajúci výberovému súboru.' },
            number2: { name: 'číslo2', detail: 'Voliteľný argument. Číselné argumenty 2 až 255 zodpovedajúce výberovému súboru. Namiesto argumentov oddelených bodkočiarkami môžete použiť jedno pole alebo odkaz na pole.' },
        },
    },
    STDEVP: {
        description: 'Vypočíta smerodajnú odchýlku základného súboru, ktorý bol zadaný ako argument. Smerodajná odchýlka vyjadruje, ako sa hodnoty odlišujú od priemeru (strednej hodnoty).',
        abstract: 'Vypočíta smerodajnú odchýlku základného súboru, ktorý bol zadaný ako argument. Smerodajná odchýlka vyjadruje, ako sa hodnoty odlišujú od priemeru (strednej hodnoty).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Číselný argument 1 zodpovedajúci základnému súboru.' },
            number2: { name: 'číslo2', detail: 'Voliteľný argument. Číselné argumenty 2 až 255 zodpovedajúce základnému súboru. Namiesto argumentov oddelených bodkočiarkami môžete použiť jedno pole alebo odkaz na pole.' },
        },
    },
    TDIST: {
        description: 'Vracia hladinu významnosti (pravdepodobnosť) pre funkciu Studentovho t-rozdelenia, kde x je vypočítaná číselná hodnota parametra t, pre ktorú sa zisťuje hladina významnosti. T-rozdelenie sa používa pri testovaní hypotéz o malých vzorkách údajov. Funkcia sa používa namiesto tabuľky kritických hodnôt t-rozdelenia.',
        abstract: 'Vracia hladinu významnosti (pravdepodobnosť) pre funkciu Studentovho t-rozdelenia, kde x je vypočítaná číselná hodnota parametra t, pre ktorú sa zisťuje hladina významnosti. T-rozdelenie sa používa pri testovaní hypotéz o malých vzorkách údajov. Funkcia sa používa namiesto tabuľky kritických hodnôt t-rozdelenia.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Číselná hodnota, pre ktorú sa zisťuje hodnota rozdelenia.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Povinné. Celé číslo určujúce počet stupňov voľnosti.' },
            tails: { name: 'chvosty', detail: 'Povinné. Určuje, či ide o jednostranné alebo obojstranné rozdelenie. Ak strany = 1, funkcia TDIST vracia jednostranné rozdelenie. Ak strany = 2, funkcia TDIST vracia obojstranné rozdelenie.' },
        },
    },
    TINV: {
        description: 'Vráti obojstranné inverzné Studentovo t-rozdelenie.',
        abstract: 'Vráti obojstranné inverzné Studentovo t-rozdelenie.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'pravdepodobnosť', detail: 'Povinné. Pravdepodobnosť spojená s obojstranným Studentovým t-rozdelením.' },
            degFreedom: { name: 'stupne_voľnosti', detail: 'Povinné. Počet stupňov voľnosti, ktorými je možné rozdelenie charakterizovať.' },
        },
    },
    TTEST: {
        description: 'Vráti pravdepodobnosť súvisiacu so Studentovým t-testom. Funkcia TTEST sa používa na určenie pravdepodobnosti pôvodu dvoch vzoriek z dvoch základných súborov s rovnakou priemernou hodnotou.',
        abstract: 'Vráti pravdepodobnosť súvisiacu so Studentovým t-testom. Funkcia TTEST sa používa na určenie pravdepodobnosti pôvodu dvoch vzoriek z dvoch základných súborov s rovnakou priemernou hodnotou.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Povinné. Prvá množina údajov.' },
            array2: { name: 'pole2', detail: 'Povinné. Druhá množina údajov.' },
            tails: { name: 'chvosty', detail: 'Povinné. Určuje, či ide o jednostranné alebo obojstranné rozdelenie. Ak strany = 1, funkcia TTEST vracia jednostranné rozdelenie. Ak strany = 2, funkcia TTEST vracia obojstranné rozdelenie.' },
            type: { name: 'typ', detail: 'Povinné. Druh vykonaného t-testu.' },
        },
    },
    VAR: {
        description: 'Odhadne rozptyl na základe vzorky.',
        abstract: 'Odhadne rozptyl na základe vzorky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Číselný argument 1 zodpovedajúci výberovému súboru.' },
            number2: { name: 'číslo2', detail: 'Voliteľný argument. Číselné argumenty 2 až 255 zodpovedajúce výberovému súboru.' },
        },
    },
    VARP: {
        description: 'Vypočíta rozptyl na základe celého základného súboru.',
        abstract: 'Vypočíta rozptyl na základe celého základného súboru.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'Povinné. Číselný argument 1 zodpovedajúci základnému súboru.' },
            number2: { name: 'číslo2', detail: 'Voliteľný argument. Číselné argumenty 2 až 255 zodpovedajúce základnému súboru.' },
        },
    },
    WEIBULL: {
        description: 'Vráti hodnotu Weibullovho rozdelenia. Toto rozdelenie sa používa na analýzu spoľahlivosti, ako je napríklad výpočet stredného času medzi poruchami prístroja.',
        abstract: 'Vráti hodnotu Weibullovho rozdelenia. Toto rozdelenie sa používa na analýzu spoľahlivosti, ako je napríklad výpočet stredného času medzi poruchami prístroja.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Povinný argument. Hodnota, pre ktorú chcete funkciu vyhodnotiť.' },
            alpha: { name: 'alfa', detail: 'Povinné. Parameter rozdelenia.' },
            beta: { name: 'beta', detail: 'Povinné. Parameter rozdelenia.' },
            cumulative: { name: 'kumulatívne', detail: 'Povinné. Určuje tvar funkcie.' },
        },
    },
    ZTEST: {
        description: 'Vráti jednostrannú hodnotu pravdepodobnosti z-testu. Pre danú predpokladanú strednú hodnotu základného súboru μ0 funkcia ZTEST vráti pravdepodobnosť, s akou bude stredná hodnota vzorky väčšia ako priemerná hodnota pozorovaní v množine údajov (poli) — teda ako zistená stredná hodnota vzorky.',
        abstract: 'Vráti jednostrannú hodnotu pravdepodobnosti z-testu. Pre danú predpokladanú strednú hodnotu základného súboru μ0 funkcia ZTEST vráti pravdepodobnosť, s akou bude stredná hodnota vzorky väčšia ako priemerná hodnota pozorovaní v množine údajov (poli) — teda ako zistená stredná hodnota vzorky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Povinné. Pole alebo rozsah údajov, vzhľadom na ktoré sa bude testovať hodnota x.' },
            x: { name: 'x', detail: 'Povinný argument. Testovaná hodnota.' },
            sigma: { name: 'sigma', detail: 'Voliteľný argument. Smerodajná odchýlka (známa) základného súboru. Ak sa vynechá, použije sa smerodajná odchýlka vzorky.' },
        },
    },
};

export default locale;
