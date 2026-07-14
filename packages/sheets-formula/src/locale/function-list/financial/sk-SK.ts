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
    ACCRINT: {
        description: 'Vracia nahromadený úrok pre cenný papier s periodickým úročením',
        abstract: 'Vracia nahromadený úrok pre cenný papier s periodickým úročením',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            firstInterest: { name: 'prvý_úrokový_dátum', detail: 'Dátum prvej úrokovej platby cenného papiera.' },
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum splatnosti cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Ročná kupónová sadzba cenného papiera.' },
            par: { name: 'menovitá_hodnota', detail: 'Menovitá hodnota cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
            calcMethod: { name: 'metóda_výpočtu', detail: 'Logická hodnota: úrok sa počíta od dátumu emisie = TRUE alebo sa ignoruje; úrok sa počíta od dátumu poslednej kupónovej platby = FALSE.' },
        },
    },
    ACCRINTM: {
        description: 'Vracia nahromadený úrok pre cenný papier, ktorý vypláca úrok pri splatnosti',
        abstract: 'Vracia nahromadený úrok pre cenný papier, ktorý vypláca úrok pri splatnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum splatnosti cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Ročná kupónová sadzba cenného papiera.' },
            par: { name: 'menovitá_hodnota', detail: 'Menovitá hodnota cenného papiera.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    AMORDEGRC: {
        description: 'Vracia odpisy pre každé účtovné obdobie pomocou odpisového koeficientu',
        abstract: 'Vracia odpisy pre každé účtovné obdobie pomocou odpisového koeficientu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Obstarávacia cena majetku.' },
            datePurchased: { name: 'dátum_nákupu', detail: 'Dátum nákupu majetku.' },
            firstPeriod: { name: 'prvé_obdobie', detail: 'Dátum konca prvého obdobia.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Zostatková hodnota na konci životnosti majetku.' },
            period: { name: 'obdobie', detail: 'Obdobie.' },
            rate: { name: 'sadzba', detail: 'Sadzba odpisovania.' },
            basis: { name: 'základ', detail: 'Základ roka, ktorý sa má použiť.' },
        },
    },
    AMORLINC: {
        description: 'Vracia odpisy pre každé účtovné obdobie',
        abstract: 'Vracia odpisy pre každé účtovné obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Obstarávacia cena majetku.' },
            datePurchased: { name: 'dátum_nákupu', detail: 'Dátum nákupu majetku.' },
            firstPeriod: { name: 'prvé_obdobie', detail: 'Dátum konca prvého obdobia.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Zostatková hodnota na konci životnosti majetku.' },
            period: { name: 'obdobie', detail: 'Obdobie.' },
            rate: { name: 'sadzba', detail: 'Sadzba odpisovania.' },
            basis: { name: 'základ', detail: 'Základ roka, ktorý sa má použiť.' },
        },
    },
    COUPDAYBS: {
        description: 'Vracia počet dní od začiatku kupónového obdobia po dátum vysporiadania',
        abstract: 'Vracia počet dní od začiatku kupónového obdobia po dátum vysporiadania',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    COUPDAYS: {
        description: 'Vracia počet dní v kupónovom období, ktoré obsahuje dátum vysporiadania',
        abstract: 'Vracia počet dní v kupónovom období, ktoré obsahuje dátum vysporiadania',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    COUPDAYSNC: {
        description: 'Vracia počet dní od dátumu vysporiadania do ďalšieho kupónového dátumu',
        abstract: 'Vracia počet dní od dátumu vysporiadania do ďalšieho kupónového dátumu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    COUPNCD: {
        description: 'Vracia nasledujúci kupónový dátum po dátume vysporiadania',
        abstract: 'Vracia nasledujúci kupónový dátum po dátume vysporiadania',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    COUPNUM: {
        description: 'Vracia počet kupónov splatných medzi dátumom vysporiadania a dátumom splatnosti',
        abstract: 'Vracia počet kupónov splatných medzi dátumom vysporiadania a dátumom splatnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    COUPPCD: {
        description: 'Vracia predchádzajúci kupónový dátum pred dátumom vysporiadania',
        abstract: 'Vracia predchádzajúci kupónový dátum pred dátumom vysporiadania',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    CUMIPMT: {
        description: 'Vracia kumulatívny zaplatený úrok medzi dvoma obdobiami',
        abstract: 'Vracia kumulatívny zaplatený úrok medzi dvoma obdobiami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota.' },
            startPeriod: { name: 'začiatočné_obdobie', detail: 'Prvé obdobie vo výpočte. Platobné obdobia sú očíslované od 1.' },
            endPeriod: { name: 'koncové_obdobie', detail: 'Posledné obdobie vo výpočte.' },
            type: { name: 'typ', detail: 'Časovanie platby.' },
        },
    },
    CUMPRINC: {
        description: 'Vracia kumulatívnu istinu zaplatenú na úvere medzi dvoma obdobiami',
        abstract: 'Vracia kumulatívnu istinu zaplatenú na úvere medzi dvoma obdobiami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota.' },
            startPeriod: { name: 'začiatočné_obdobie', detail: 'Prvé obdobie vo výpočte. Platobné obdobia sú očíslované od 1.' },
            endPeriod: { name: 'koncové_obdobie', detail: 'Posledné obdobie vo výpočte.' },
            type: { name: 'typ', detail: 'Časovanie platby.' },
        },
    },
    DB: {
        description: 'Vracia odpisy majetku za zadané obdobie pomocou metódy pevne klesajúceho zostatku',
        abstract: 'Vracia odpisy majetku za zadané obdobie pomocou metódy pevne klesajúceho zostatku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Počiatočná cena majetku.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Hodnota na konci odpisovania (niekedy nazývaná zostatková hodnota majetku).' },
            life: { name: 'životnosť', detail: 'Počet období, počas ktorých sa majetok odpisuje (užitočná životnosť majetku).' },
            period: { name: 'obdobie', detail: 'Obdobie, za ktoré chcete vypočítať odpisy.' },
            month: { name: 'mesiac', detail: 'Počet mesiacov v prvom roku. Ak sa mesiac vynechá, predpokladá sa 12.' },
        },
    },
    DDB: {
        description: 'Vracia odpisy majetku za zadané obdobie pomocou metódy dvojnásobne klesajúceho zostatku alebo inej metódy, ktorú zadáte',
        abstract: 'Vracia odpisy majetku za zadané obdobie pomocou metódy dvojnásobne klesajúceho zostatku alebo inej metódy, ktorú zadáte',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Počiatočná cena majetku.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Hodnota na konci odpisovania (niekedy nazývaná zostatková hodnota majetku).' },
            life: { name: 'životnosť', detail: 'Počet období, počas ktorých sa majetok odpisuje (užitočná životnosť majetku).' },
            period: { name: 'obdobie', detail: 'Obdobie, za ktoré chcete vypočítať odpisy.' },
            factor: { name: 'faktor', detail: 'Sadzba, akou zostatok klesá. Ak je faktor vynechaný, predpokladá sa 2 (metóda dvojnásobne klesajúceho zostatku).' },
        },
    },
    DISC: {
        description: 'Vracia diskontnú sadzbu pre cenný papier',
        abstract: 'Vracia diskontnú sadzbu pre cenný papier',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera na 100 $ menovitej hodnoty.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    DOLLARDE: {
        description: 'Konvertuje dolárovú cenu vyjadrenú ako zlomok na dolárovú cenu vyjadrenú ako desatinné číslo',
        abstract: 'Konvertuje dolárovú cenu vyjadrenú ako zlomok na dolárovú cenu vyjadrenú ako desatinné číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'zlomkový_dolár', detail: 'Číslo vyjadrené ako celá časť a zlomková časť, oddelené desatinným symbolom.' },
            fraction: { name: 'zlomok', detail: 'Celé číslo použité v menovateli zlomku.' },
        },
    },
    DOLLARFR: {
        description: 'Konvertuje dolárovú cenu vyjadrenú ako desatinné číslo na dolárovú cenu vyjadrenú ako zlomok',
        abstract: 'Konvertuje dolárovú cenu vyjadrenú ako desatinné číslo na dolárovú cenu vyjadrenú ako zlomok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'desatinný_dolár', detail: 'Desatinné číslo.' },
            fraction: { name: 'zlomok', detail: 'Celé číslo použité v menovateli zlomku.' },
        },
    },
    DURATION: {
        description: 'Vracia ročnú duráciu cenného papiera s periodickými úrokovými platbami',
        abstract: 'Vracia ročnú duráciu cenného papiera s periodickými úrokovými platbami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            coupon: { name: 'kupón', detail: 'Ročná kupónová sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    EFFECT: {
        description: 'Vracia efektívnu ročnú úrokovú sadzbu',
        abstract: 'Vracia efektívnu ročnú úrokovú sadzbu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominálna_sadzba', detail: 'Nominálna úroková sadzba.' },
            npery: { name: 'období_za_rok', detail: 'Počet kapitalizačných období za rok.' },
        },
    },
    FV: {
        description: 'Funkcia FV , jedna z finančných funkcií , vypočíta budúcu hodnotu investície na základe konštantnej úrokovej sadzby. Funkciu FV môžete použiť pri pravidelných konštantných platbách alebo pri jednorazovej platbe.',
        abstract: 'Funkcia FV , jedna z finančných funkcií , vypočíta budúcu hodnotu investície na základe konštantnej úrokovej sadzby. Funkciu FV môžete použiť pri pravidelných konštantných platbách alebo pri jednorazovej platbe.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Povinné. Úroková sadzba za dané obdobie.' },
            nper: { name: 'počet_období', detail: 'Povinné. Celkový počet platobných období v danom intervale.' },
            pmt: { name: 'splátka', detail: 'Povinné. Platba (splátka) uskutočnená v jednotlivých obdobiach, ktorá sa nemení počas daného intervalu. V typickom prípade splátka obsahuje hodnotu istiny a úrokov, ale neobsahuje iné poplatky ani dane. Ak sa argument plt vynechá, musíte zadať argument sh.' },
            pv: { name: 'súčasná_hodnota', detail: 'Voliteľný argument. Súčasná hodnota, čiže celková čiastka, určujúca súčasnú hodnotu budúcich platieb. Ak sa tento argument vynechá, predpokladá sa, že má hodnotu 0 (nula) a musíte zadať argument plt.' },
            type: { name: 'typ', detail: 'Voliteľný argument. Číslo 0 alebo 1, ktoré vyjadruje, kedy sú sumy splatné. Ak sa tento argument vynechá, predpokladá sa, že má hodnotu 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Vráti budúcu hodnotu začiatočnej istiny po priradení série zložených úrokových sadzieb. Funkcia FVSCHEDULE sa používa na výpočet budúcej hodnoty investície s premennou alebo nastaviteľnou sadzbou.',
        abstract: 'Vráti budúcu hodnotu začiatočnej istiny po priradení série zložených úrokových sadzieb. Funkcia FVSCHEDULE sa používa na výpočet budúcej hodnoty investície s premennou alebo nastaviteľnou sadzbou.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'istina', detail: 'Povinné. Súčasná hodnota.' },
            schedule: { name: 'rozpis', detail: 'Povinné. Séria zložených úrokových sadzieb.' },
        },
    },
    INTRATE: {
        description: 'Vráti úrokovú sadzbu plne investovaného cenného papiera.',
        abstract: 'Vráti úrokovú sadzbu plne investovaného cenného papiera.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Povinné. Dátum vyrovnania cenného papiera. Dátum vyrovnania cenného papiera je dátum predaja cenného papiera klientovi. Musí byť neskorší než dátum emisie.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Povinné. Dátum splatnosti cenného papiera. Je to dátum, keď sa končí platnosť cenného papiera.' },
            investment: { name: 'investícia', detail: 'Povinné. Suma investovaná do cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Povinné. Zaručená cena cenného papiera pri splatnosti.' },
            basis: { name: 'základ', detail: 'Voliteľný argument. Typ denného základu, ktorý chcete použiť.' },
        },
    },
    IPMT: {
        description: 'Vypočíta výšku platby úroku v určitom úrokovom období pri pravidelných konštantných splátkach a konštantnej úrokovej sadzbe.',
        abstract: 'Vypočíta výšku platby úroku v určitom úrokovom období pri pravidelných konštantných splátkach a konštantnej úrokovej sadzbe.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Povinné. Úroková sadzba za dané obdobie.' },
            per: { name: 'obdobie', detail: 'Povinné. Obdobie, pre ktoré chcete vypočítať úrok. Musí byť v intervale od 1 do hodnoty argumentu pobd.' },
            nper: { name: 'počet_období', detail: 'Povinné. Celkový počet platobných období v danom intervale.' },
            pv: { name: 'súčasná_hodnota', detail: 'Povinné. Súčasná hodnota, čiže celková čiastka určujúca súčasnú hodnotu budúcich platieb.' },
            fv: { name: 'budúca_hodnota', detail: 'Voliteľný argument. Budúca hodnota alebo hotovostný zostatok, ktorý chcete dosiahnuť po zaplatení poslednej platby. Ak je tento argument vynechaný, predpokladá sa, že má hodnotu 0 (budúca hodnota pôžičky pre uvedený príklad je 0).' },
            type: { name: 'typ', detail: 'Voliteľný argument. Číslo 0 alebo 1, ktoré vyjadruje, kedy sú sumy splatné. Ak sa tento argument vynechá, predpokladá sa, že má hodnotu 0.' },
        },
    },
    IRR: {
        description: 'Vracia vnútornú mieru návratnosti pre sériu peňažných tokov',
        abstract: 'Vracia vnútornú mieru návratnosti pre sériu peňažných tokov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'hodnoty', detail: 'Pole alebo odkaz na bunky, ktoré obsahujú čísla, pre ktoré chcete vypočítať vnútornú mieru návratnosti.\n1.Hodnoty musia obsahovať aspoň jednu kladnú a jednu zápornú hodnotu, aby sa dala vypočítať vnútorná miera návratnosti.\n2.IRR používa poradie hodnôt na interpretáciu poradia peňažných tokov. Uistite sa, že zadáte hodnoty platieb a príjmov v požadovanom poradí.\n3.Ak pole alebo argument odkazu obsahuje text, logické hodnoty alebo prázdne bunky, tieto hodnoty sa ignorujú.' },
            guess: { name: 'odhad', detail: 'Číslo, ktoré odhadujete ako blízke výsledku IRR.' },
        },
    },
    ISPMT: {
        description: 'Vypočíta úrok zaplatený počas konkrétneho obdobia investície',
        abstract: 'Vypočíta úrok zaplatený počas konkrétneho obdobia investície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba investície.' },
            per: { name: 'obdobie', detail: 'Obdobie, pre ktoré chcete zistiť úrok, a musí byť medzi 1 a nper.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období investície.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota investície. Pri úvere je pv výška úveru.' },
        },
    },
    MDURATION: {
        description: 'Vracia modifikovanú Macaulayho duráciu pre cenný papier s predpokladanou menovitou hodnotou 100 $',
        abstract: 'Vracia modifikovanú Macaulayho duráciu pre cenný papier s predpokladanou menovitou hodnotou 100 $',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            coupon: { name: 'kupón', detail: 'Ročná kupónová sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    MIRR: {
        description: 'Vracia vnútornú mieru návratnosti, pri ktorej sú kladné a záporné peňažné toky financované rôznymi sadzbami',
        abstract: 'Vracia vnútornú mieru návratnosti, pri ktorej sú kladné a záporné peňažné toky financované rôznymi sadzbami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'hodnoty', detail: 'Pole alebo odkaz na bunky, ktoré obsahujú čísla. Tieto čísla predstavujú sériu platieb (záporné hodnoty) a príjmov (kladné hodnoty) v pravidelných obdobiach.\n1.Hodnoty musia obsahovať aspoň jednu kladnú a jednu zápornú hodnotu, aby sa dala vypočítať modifikovaná vnútorná miera návratnosti. Inak MIRR vráti chybu #DIV/0!.\n2.Ak pole alebo argument odkazu obsahuje text, logické hodnoty alebo prázdne bunky, tieto hodnoty sa ignorujú; bunky s hodnotou nula sa však zahrnú.' },
            financeRate: { name: 'finančná_sadzba', detail: 'Úroková sadzba, ktorú platíte za peniaze použité v peňažných tokoch.' },
            reinvestRate: { name: 'reinvestičná_sadzba', detail: 'Úroková sadzba, ktorú získate z peňažných tokov pri ich reinvestovaní.' },
        },
    },
    NOMINAL: {
        description: 'Vracia ročnú nominálnu úrokovú sadzbu',
        abstract: 'Vracia ročnú nominálnu úrokovú sadzbu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'efektívna_sadzba', detail: 'Efektívna úroková sadzba.' },
            npery: { name: 'období_za_rok', detail: 'Počet kapitalizačných období za rok.' },
        },
    },
    NPER: {
        description: 'Vracia počet období pre investíciu',
        abstract: 'Vracia počet období pre investíciu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba na obdobie.' },
            pmt: { name: 'splátka', detail: 'Platba vykonaná v každom období; počas životnosti anuity sa nemôže meniť.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota, alebo jednorazová suma, ktorú má séria budúcich platieb dnes.' },
            fv: { name: 'budúca_hodnota', detail: 'Budúca hodnota, alebo hotovostný zostatok, ktorý chcete dosiahnuť po poslednej platbe.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
        },
    },
    NPV: {
        description: 'Vracia čistú súčasnú hodnotu investície na základe série periodických peňažných tokov a diskontnej sadzby',
        abstract: 'Vracia čistú súčasnú hodnotu investície na základe série periodických peňažných tokov a diskontnej sadzby',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Diskontná sadzba počas jedného obdobia.' },
            value1: { name: 'hodnota1', detail: '1 až 254 argumentov predstavujúcich platby a príjmy.' },
            value2: { name: 'hodnota2', detail: '1 až 254 argumentov predstavujúcich platby a príjmy.' },
        },
    },
    ODDFPRICE: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera s nepravidelným prvým obdobím',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera s nepravidelným prvým obdobím',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            firstCoupon: { name: 'prvý_kupón', detail: 'Dátum prvého kupónu cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    ODDFYIELD: {
        description: 'Vracia výnos cenného papiera s nepravidelným prvým obdobím',
        abstract: 'Vracia výnos cenného papiera s nepravidelným prvým obdobím',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            firstCoupon: { name: 'prvý_kupón', detail: 'Dátum prvého kupónu cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    ODDLPRICE: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera s nepravidelným posledným obdobím',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera s nepravidelným posledným obdobím',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            lastInterest: { name: 'posledný_kupón', detail: 'Dátum posledného kupónu cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    ODDLYIELD: {
        description: 'Vracia výnos cenného papiera s nepravidelným posledným obdobím',
        abstract: 'Vracia výnos cenného papiera s nepravidelným posledným obdobím',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            lastInterest: { name: 'posledný_kupón', detail: 'Dátum posledného kupónu cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    PDURATION: {
        description: 'Vracia počet období potrebných, aby investícia dosiahla zadanú hodnotu',
        abstract: 'Vracia počet období potrebných, aby investícia dosiahla zadanú hodnotu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Sadzba je úroková sadzba na obdobie.' },
            pv: { name: 'súčasná_hodnota', detail: 'Pv je súčasná hodnota investície.' },
            fv: { name: 'budúca_hodnota', detail: 'Fv je požadovaná budúca hodnota investície.' },
        },
    },
    PMT: {
        description: 'Vracia periodickú platbu pre anuitu',
        abstract: 'Vracia periodickú platbu pre anuitu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba na obdobie.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období v anuite.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota, alebo jednorazová suma, ktorú má séria budúcich platieb dnes.' },
            fv: { name: 'budúca_hodnota', detail: 'Budúca hodnota, alebo hotovostný zostatok, ktorý chcete dosiahnuť po poslednej platbe.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
        },
    },
    PPMT: {
        description: 'Vracia platbu na istinu za investíciu pre zadané obdobie',
        abstract: 'Vracia platbu na istinu za investíciu pre zadané obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba na obdobie.' },
            per: { name: 'obdobie', detail: 'Obdobie, pre ktoré chcete zistiť úrok, a musí byť v rozsahu 1 až nper.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období v anuite.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota, alebo jednorazová suma, ktorú má séria budúcich platieb dnes.' },
            fv: { name: 'budúca_hodnota', detail: 'Budúca hodnota, alebo hotovostný zostatok, ktorý chcete dosiahnuť po poslednej platbe.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
        },
    },
    PRICE: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera, ktorý vypláca periodický úrok',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera, ktorý vypláca periodický úrok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    PRICEDISC: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty diskontovaného cenného papiera',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty diskontovaného cenného papiera',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            discount: { name: 'diskont', detail: 'Diskontná sadzba cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    PRICEMAT: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera, ktorý vypláca úrok pri splatnosti',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty cenného papiera, ktorý vypláca úrok pri splatnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            yld: { name: 'výnos', detail: 'Ročný výnos cenného papiera.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    PV: {
        description: 'Vracia súčasnú hodnotu investície',
        abstract: 'Vracia súčasnú hodnotu investície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba na obdobie.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období v anuite.' },
            pmt: { name: 'splátka', detail: 'Platba vykonaná v každom období; počas životnosti anuity sa nemôže meniť.' },
            fv: { name: 'budúca_hodnota', detail: 'Budúca hodnota, alebo hotovostný zostatok, ktorý chcete dosiahnuť po poslednej platbe.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
        },
    },
    RATE: {
        description: 'Vracia úrokovú sadzbu na obdobie anuity',
        abstract: 'Vracia úrokovú sadzbu na obdobie anuity',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období v anuite.' },
            pmt: { name: 'splátka', detail: 'Platba vykonaná v každom období; počas životnosti anuity sa nemôže meniť.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota, alebo jednorazová suma, ktorú má séria budúcich platieb dnes.' },
            fv: { name: 'budúca_hodnota', detail: 'Budúca hodnota, alebo hotovostný zostatok, ktorý chcete dosiahnuť po poslednej platbe.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
            guess: { name: 'odhad', detail: 'Váš odhad, aká bude sadzba.' },
        },
    },
    RECEIVED: {
        description: 'Vracia sumu prijatú pri splatnosti pre plne investovaný cenný papier',
        abstract: 'Vracia sumu prijatú pri splatnosti pre plne investovaný cenný papier',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            investment: { name: 'investícia', detail: 'Suma investovaná do cenného papiera.' },
            discount: { name: 'diskont', detail: 'Diskontná sadzba cenného papiera.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    RRI: {
        description: 'Vracia ekvivalentnú úrokovú sadzbu pre rast investície',
        abstract: 'Vracia ekvivalentnú úrokovú sadzbu pre rast investície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'počet_období', detail: 'Nper je počet období investície.' },
            pv: { name: 'súčasná_hodnota', detail: 'Pv je súčasná hodnota investície.' },
            fv: { name: 'budúca_hodnota', detail: 'Fv je budúca hodnota investície.' },
        },
    },
    SLN: {
        description: 'Vracia lineárny odpis majetku za jedno obdobie',
        abstract: 'Vracia lineárny odpis majetku za jedno obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Počiatočná cena majetku.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Hodnota na konci odpisovania (niekedy nazývaná zostatková hodnota majetku).' },
            life: { name: 'životnosť', detail: 'Počet období, počas ktorých sa majetok odpisuje (užitočná životnosť majetku).' },
        },
    },
    SYD: {
        description: 'Vracia odpis podľa súčtu číslic rokov majetku za zadané obdobie',
        abstract: 'Vracia odpis podľa súčtu číslic rokov majetku za zadané obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Počiatočná cena majetku.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Hodnota na konci odpisovania (niekedy nazývaná zostatková hodnota majetku).' },
            life: { name: 'životnosť', detail: 'Počet období, počas ktorých sa majetok odpisuje (užitočná životnosť majetku).' },
            per: { name: 'obdobie', detail: 'Obdobie a musí používať rovnaké jednotky ako životnosť.' },
        },
    },
    TBILLEQ: {
        description: 'Vracia výnos ekvivalentný dlhopisu pre pokladničnú poukážku',
        abstract: 'Vracia výnos ekvivalentný dlhopisu pre pokladničnú poukážku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania pokladničnej poukážky.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti pokladničnej poukážky.' },
            discount: { name: 'diskont', detail: 'Diskontná sadzba pokladničnej poukážky.' },
        },
    },
    TBILLPRICE: {
        description: 'Vracia cenu na 100 $ menovitej hodnoty pre pokladničnú poukážku',
        abstract: 'Vracia cenu na 100 $ menovitej hodnoty pre pokladničnú poukážku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania pokladničnej poukážky.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti pokladničnej poukážky.' },
            discount: { name: 'diskont', detail: 'Diskontná sadzba pokladničnej poukážky.' },
        },
    },
    TBILLYIELD: {
        description: 'Vracia výnos pre pokladničnú poukážku',
        abstract: 'Vracia výnos pre pokladničnú poukážku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania pokladničnej poukážky.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti pokladničnej poukážky.' },
            pr: { name: 'cena', detail: 'Cena pokladničnej poukážky na 100 $ menovitej hodnoty.' },
        },
    },
    VDB: {
        description: 'Vracia odpisy majetku za zadané alebo čiastočné obdobie pomocou metódy klesajúceho zostatku',
        abstract: 'Vracia odpisy majetku za zadané alebo čiastočné obdobie pomocou metódy klesajúceho zostatku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'obstarávacia_cena', detail: 'Počiatočná cena majetku.' },
            salvage: { name: 'zostatková_hodnota', detail: 'Hodnota na konci odpisovania (niekedy nazývaná zostatková hodnota majetku).' },
            life: { name: 'životnosť', detail: 'Počet období, počas ktorých sa majetok odpisuje (užitočná životnosť majetku).' },
            startPeriod: { name: 'začiatočné_obdobie', detail: 'Začiatočné obdobie, pre ktoré chcete vypočítať odpisy.' },
            endPeriod: { name: 'koncové_obdobie', detail: 'Koncové obdobie, pre ktoré chcete vypočítať odpisy.' },
            factor: { name: 'faktor', detail: 'Sadzba, akou zostatok klesá. Ak je faktor vynechaný, predpokladá sa 2 (metóda dvojnásobne klesajúceho zostatku).' },
            noSwitch: { name: 'neprepínať', detail: 'Logická hodnota určujúca, či sa má prepnúť na lineárne odpisovanie, keď je odpis vyšší ako výpočet metódou klesajúceho zostatku.' },
        },
    },
    XIRR: {
        description: 'Vracia vnútornú mieru návratnosti pre rozvrh peňažných tokov, ktorý nemusí byť periodický',
        abstract: 'Vracia vnútornú mieru návratnosti pre rozvrh peňažných tokov, ktorý nemusí byť periodický',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'hodnoty', detail: 'Séria peňažných tokov, ktorá zodpovedá rozvrhu platieb podľa dátumov. Prvá platba je voliteľná a zodpovedá nákladu alebo platbe na začiatku investície. Ak je prvá hodnota náklad alebo platba, musí byť záporná. Všetky nasledujúce platby sú diskontované na základe 365-dňového roka. Séria hodnôt musí obsahovať aspoň jednu kladnú a jednu zápornú hodnotu.' },
            dates: { name: 'dátumy', detail: 'Rozvrh dátumov platieb, ktorý zodpovedá peňažným tokom. Dátumy môžu byť v ľubovoľnom poradí.' },
            guess: { name: 'odhad', detail: 'Číslo, ktoré odhadujete ako blízke výsledku XIRR.' },
        },
    },
    XNPV: {
        description: 'Vracia čistú súčasnú hodnotu pre rozvrh peňažných tokov, ktorý nemusí byť periodický',
        abstract: 'Vracia čistú súčasnú hodnotu pre rozvrh peňažných tokov, ktorý nemusí byť periodický',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Diskontná sadzba, ktorá sa má použiť na peňažné toky.' },
            values: { name: 'hodnoty', detail: 'Séria peňažných tokov, ktorá zodpovedá rozvrhu platieb podľa dátumov. Prvá platba je voliteľná a zodpovedá nákladu alebo platbe na začiatku investície. Ak je prvá hodnota náklad alebo platba, musí byť záporná. Všetky nasledujúce platby sú diskontované na základe 365-dňového roka. Séria hodnôt musí obsahovať aspoň jednu kladnú a jednu zápornú hodnotu.' },
            dates: { name: 'dátumy', detail: 'Rozvrh dátumov platieb, ktorý zodpovedá peňažným tokom. Dátumy môžu byť v ľubovoľnom poradí.' },
        },
    },
    YIELD: {
        description: 'Vracia výnos cenného papiera, ktorý vypláca periodický úrok',
        abstract: 'Vracia výnos cenného papiera, ktorý vypláca periodický úrok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera na 100 $ menovitej hodnoty.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            frequency: { name: 'frekvencia', detail: 'Počet kupónových platieb za rok. Pre ročné platby frekvencia = 1; pre polročné frekvencia = 2; pre štvrťročné frekvencia = 4.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    YIELDDISC: {
        description: 'Vracia ročný výnos pre diskontovaný cenný papier; napríklad pokladničnú poukážku',
        abstract: 'Vracia ročný výnos pre diskontovaný cenný papier; napríklad pokladničnú poukážku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera na 100 $ menovitej hodnoty.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Výkupná hodnota cenného papiera na 100 $ menovitej hodnoty.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    YIELDMAT: {
        description: 'Vracia ročný výnos cenného papiera, ktorý vypláca úrok pri splatnosti',
        abstract: 'Vracia ročný výnos cenného papiera, ktorý vypláca úrok pri splatnosti',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            issue: { name: 'dátum_emisie', detail: 'Dátum emisie cenného papiera.' },
            rate: { name: 'sadzba', detail: 'Úroková sadzba cenného papiera.' },
            pr: { name: 'cena', detail: 'Cena cenného papiera na 100 $ menovitej hodnoty.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
};

export default locale;
