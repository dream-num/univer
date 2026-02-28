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
                url: 'https://support.microsoft.com/en-us/office/accrint-function-fe45d089-6722-4fb3-9379-e1f911d8dc74',
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
                url: 'https://support.microsoft.com/en-us/office/accrintm-function-f62f01f9-5754-4cc4-805b-0e70199328a7',
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
                url: 'https://support.microsoft.com/en-us/office/amordegrc-function-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'číslo1', detail: 'prvý' },
            number2: { name: 'číslo2', detail: 'druhý' },
        },
    },
    AMORLINC: {
        description: 'Vracia odpisy pre každé účtovné obdobie',
        abstract: 'Vracia odpisy pre každé účtovné obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/amorlinc-function-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaybs-function-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
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
                url: 'https://support.microsoft.com/en-us/office/coupdays-function-cc64380b-315b-4e7b-950c-b30b0a76f671',
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
                url: 'https://support.microsoft.com/en-us/office/coupdaysnc-function-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
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
                url: 'https://support.microsoft.com/en-us/office/coupncd-function-fd962fef-506b-4d9d-8590-16df5393691f',
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
                url: 'https://support.microsoft.com/en-us/office/coupnum-function-a90af57b-de53-4969-9c99-dd6139db2522',
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
                url: 'https://support.microsoft.com/en-us/office/couppcd-function-2eb50473-6ee9-4052-a206-77a9a385d5b3',
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
                url: 'https://support.microsoft.com/en-us/office/cumipmt-function-61067bb0-9016-427d-b95b-1a752af0e606',
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
                url: 'https://support.microsoft.com/en-us/office/cumprinc-function-94a4516d-bd65-41a1-bc16-053a6af4c04d',
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
                url: 'https://support.microsoft.com/en-us/office/db-function-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
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
                url: 'https://support.microsoft.com/en-us/office/ddb-function-519a7a37-8772-4c96-85c0-ed2c209717a5',
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
                url: 'https://support.microsoft.com/en-us/office/disc-function-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
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
                url: 'https://support.microsoft.com/en-us/office/dollarde-function-db85aab0-1677-428a-9dfd-a38476693427',
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
                url: 'https://support.microsoft.com/en-us/office/dollarfr-function-0835d163-3023-4a33-9824-3042c5d4f495',
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
                url: 'https://support.microsoft.com/en-us/office/duration-function-b254ea57-eadc-4602-a86a-c8e369334038',
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
                url: 'https://support.microsoft.com/en-us/office/effect-function-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominálna_sadzba', detail: 'Nominálna úroková sadzba.' },
            npery: { name: 'období_za_rok', detail: 'Počet kapitalizačných období za rok.' },
        },
    },
    FV: {
        description: 'Vracia budúcu hodnotu investície',
        abstract: 'Vracia budúcu hodnotu investície',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/fv-function-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
            },
        ],
        functionParameter: {
            rate: { name: 'sadzba', detail: 'Úroková sadzba na obdobie.' },
            nper: { name: 'počet_období', detail: 'Celkový počet platobných období v anuite.' },
            pmt: { name: 'splátka', detail: 'Platba vykonaná v každom období; počas životnosti anuity sa nemôže meniť.' },
            pv: { name: 'súčasná_hodnota', detail: 'Súčasná hodnota, alebo jednorazová suma, ktorú má séria budúcich platieb dnes.' },
            type: { name: 'typ', detail: 'Číslo 0 alebo 1 a určuje, kedy sú platby splatné.' },
        },
    },
    FVSCHEDULE: {
        description: 'Vracia budúcu hodnotu počiatočnej istiny po uplatnení série zložených úrokových sadzieb',
        abstract: 'Vracia budúcu hodnotu počiatočnej istiny po uplatnení série zložených úrokových sadzieb',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/fvschedule-function-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: 'istina', detail: 'Súčasná hodnota.' },
            schedule: { name: 'rozpis', detail: 'Pole úrokových sadzieb, ktoré sa majú použiť.' },
        },
    },
    INTRATE: {
        description: 'Vracia úrokovú sadzbu pre plne investovaný cenný papier',
        abstract: 'Vracia úrokovú sadzbu pre plne investovaný cenný papier',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/intrate-function-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: 'dátum_vysporiadania', detail: 'Dátum vysporiadania cenného papiera.' },
            maturity: { name: 'dátum_splatnosti', detail: 'Dátum splatnosti cenného papiera.' },
            investment: { name: 'investícia', detail: 'Suma investovaná do cenného papiera.' },
            redemption: { name: 'výkupná_hodnota', detail: 'Suma, ktorá sa má prijať pri splatnosti.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
    IPMT: {
        description: 'Vracia úrokovú platbu za investíciu pre zadané obdobie',
        abstract: 'Vracia úrokovú platbu za investíciu pre zadané obdobie',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/ipmt-function-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
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
    IRR: {
        description: 'Vracia vnútornú mieru návratnosti pre sériu peňažných tokov',
        abstract: 'Vracia vnútornú mieru návratnosti pre sériu peňažných tokov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/irr-function-64925eaa-9988-495b-b290-3ad0c163c1bc',
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
                url: 'https://support.microsoft.com/en-us/office/ispmt-function-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
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
                url: 'https://support.microsoft.com/en-us/office/mduration-function-b3786a69-4f20-469a-94ad-33e5b90a763c',
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
                url: 'https://support.microsoft.com/en-us/office/mirr-function-b020f038-7492-4fb4-93c1-35c345b53524',
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
                url: 'https://support.microsoft.com/en-us/office/nominal-function-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
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
                url: 'https://support.microsoft.com/en-us/office/nper-function-240535b5-6653-4d2d-bfcf-b6a38151d815',
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
                url: 'https://support.microsoft.com/en-us/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568',
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
                url: 'https://support.microsoft.com/en-us/office/oddfprice-function-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
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
                url: 'https://support.microsoft.com/en-us/office/oddfyield-function-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
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
                url: 'https://support.microsoft.com/en-us/office/oddlprice-function-fb657749-d200-4902-afaf-ed5445027fc4',
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
                url: 'https://support.microsoft.com/en-us/office/oddlyield-function-c873d088-cf40-435f-8d41-c8232fee9238',
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
                url: 'https://support.microsoft.com/en-us/office/pduration-function-44f33460-5be5-4c90-b857-22308892adaf',
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
                url: 'https://support.microsoft.com/en-us/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441',
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
                url: 'https://support.microsoft.com/en-us/office/ppmt-function-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
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
                url: 'https://support.microsoft.com/en-us/office/price-function-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
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
                url: 'https://support.microsoft.com/en-us/office/pricedisc-function-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
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
                url: 'https://support.microsoft.com/en-us/office/pricemat-function-52c3b4da-bc7e-476a-989f-a95f675cae77',
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
                url: 'https://support.microsoft.com/en-us/office/pv-function-23879d31-0e02-4321-be01-da16e8168cbd',
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
                url: 'https://support.microsoft.com/en-us/office/rate-function-9f665657-4a7e-4bb7-a030-83fc59e748ce',
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
                url: 'https://support.microsoft.com/en-us/office/received-function-7a3f8b93-6611-4f81-8576-828312c9b5e5',
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
                url: 'https://support.microsoft.com/en-us/office/rri-function-6f5822d8-7ef1-4233-944c-79e8172930f4',
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
                url: 'https://support.microsoft.com/en-us/office/sln-function-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
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
                url: 'https://support.microsoft.com/en-us/office/syd-function-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
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
                url: 'https://support.microsoft.com/en-us/office/tbilleq-function-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
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
                url: 'https://support.microsoft.com/en-us/office/tbillprice-function-eacca992-c29d-425a-9eb8-0513fe6035a2',
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
                url: 'https://support.microsoft.com/en-us/office/tbillyield-function-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
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
                url: 'https://support.microsoft.com/en-us/office/vdb-function-dde4e207-f3fa-488d-91d2-66d55e861d73',
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
                url: 'https://support.microsoft.com/en-us/office/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d',
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
                url: 'https://support.microsoft.com/en-us/office/xnpv-function-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
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
                url: 'https://support.microsoft.com/en-us/office/yield-function-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
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
                url: 'https://support.microsoft.com/en-us/office/yielddisc-function-a9dbdbae-7dae-46de-b995-615faffaaed7',
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
                url: 'https://support.microsoft.com/en-us/office/yieldmat-function-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
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
