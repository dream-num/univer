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
        description: 'Retorna CERT si tots els seus arguments són CERT',
        abstract: 'Retorna CERT si tots els seus arguments són CERT',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/and-function-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            logical1: { name: 'lògic1', detail: 'La primera condició que voleu comprovar i que pot avaluar-se com a CERT o FALS.' },
            logical2: { name: 'lògic2', detail: 'Condicions addicionals que voleu comprovar i que poden avaluar-se com a CERT o FALS, fins a un màxim de 255 condicions.' },
        },
    },
    BYCOL: {
        description: 'Aplica una funció LAMBDA a cada columna i retorna una matriu dels resultats',
        abstract: 'Aplica una funció LAMBDA a cada columna i retorna una matriu dels resultats',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/bycol-function-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu que s\'ha de separar per columnes.' },
            lambda: { name: 'lambda', detail: 'Una funció LAMBDA que pren una columna com a paràmetre únic i calcula un resultat. La funció LAMBDA pren un únic paràmetre: una columna de la matriu.' },
        },
    },
    BYROW: {
        description: 'Aplica una funció LAMBDA a cada fila i retorna una matriu dels resultats',
        abstract: 'Aplica una funció LAMBDA a cada fila i retorna una matriu dels resultats',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/byrow-function-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu que s\'ha de separar per files.' },
            lambda: { name: 'lambda', detail: 'Una funció LAMBDA que pren una fila com a paràmetre únic i calcula un resultat. La funció LAMBDA pren un únic paràmetre: una fila de la matriu.' },
        },
    },
    FALSE: {
        description: 'Retorna el valor lògic FALS.',
        abstract: 'Retorna el valor lògic FALS.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/false-function-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: 'Especifica una prova lògica que cal realitzar',
        abstract: 'Especifica una prova lògica que cal realitzar',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/if-function-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'prova_lògica', detail: 'La condició que voleu comprovar.' },
            valueIfTrue: {
                name: 'valor_si_cert',
                detail: 'El valor que voleu que es retorni si el resultat de la prova_lògica és CERT.',
            },
            valueIfFalse: {
                name: 'valor_si_fals',
                detail: 'El valor que voleu que es retorni si el resultat de la prova_lògica és FALS.',
            },
        },
    },
    IFERROR: {
        description: 'Retorna un valor que especifiqueu si una fórmula avalua un error; en cas contrari, retorna el resultat de la fórmula',
        abstract: 'Retorna un valor que especifiqueu si una fórmula avalua un error; en cas contrari, retorna el resultat de la fórmula',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/iferror-function-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'L\'argument que es comprova si hi ha un error.' },
            valueIfError: { name: 'valor_si_error', detail: 'El valor a retornar si la fórmula avalua un error. S\'avaluen els tipus d\'error següents: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, o #NULL!.' },
        },
    },
    IFNA: {
        description: 'Retorna el valor que especifiqueu si l\'expressió es resol a #N/A, altrament retorna el resultat de l\'expressió',
        abstract: 'Retorna el valor que especifiqueu si l\'expressió es resol a #N/A, altrament retorna el resultat de l\'expressió',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ifna-function-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'L\'argument que es comprova per al valor d\'error #N/A.' },
            valueIfNa: { name: 'valor_si_na', detail: 'El valor a retornar si la fórmula s\'avalua amb el valor d\'error #N/A.' },
        },
    },
    IFS: {
        description: 'Comprova si es compleixen una o més condicions i retorna un valor que correspon a la primera condició CERT.',
        abstract: 'Comprova si es compleixen una o més condicions i retorna un valor que correspon a la primera condició CERT.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ifs-function-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'prova_lògica1', detail: 'Condició que s\'avalua com a CERT o FALS.' },
            valueIfTrue1: { name: 'valor_si_cert1', detail: 'Resultat a retornar si prova_lògica1 s\'avalua com a CERT. Pot ser buit.' },
            logicalTest2: { name: 'prova_lògica2', detail: 'Condició que s\'avalua com a CERT o FALS.' },
            valueIfTrue2: { name: 'valor_si_cert2', detail: 'Resultat a retornar si prova_lògicaN s\'avalua com a CERT. Cada valor_si_certN correspon a una condició prova_lògicaN. Pot ser buit.' },
        },
    },
    LAMBDA: {
        description: 'Utilitzeu una funció LAMBDA per crear funcions personalitzades i reutilitzables i crideu-les per un nom amigable. La nova funció està disponible a tot el llibre i es crida com les funcions natives d\'Excel.',
        abstract: 'Creeu funcions personalitzades i reutilitzables i crideu-les per un nom amigable',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/lambda-function-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'paràmetre',
                detail: 'Un valor que voleu passar a la funció, com ara una referència de cel·la, una cadena o un número. Podeu introduir fins a 253 paràmetres. Aquest argument és opcional.',
            },
            calculation: {
                name: 'càlcul',
                detail: 'La fórmula que voleu executar i retornar com a resultat de la funció. Ha de ser l\'últim argument i ha de retornar un resultat. Aquest argument és obligatori.',
            },
        },
    },
    LET: {
        description: 'Assigna noms als resultats dels càlculs',
        abstract: 'Assigna noms als resultats dels càlculs',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: 'nom1', detail: 'El primer nom a assignar. Ha de començar per una lletra. No pot ser el resultat d\'una fórmula ni entrar en conflicte amb la sintaxi de rang.' },
            nameValue1: { name: 'valor_nom1', detail: 'El valor que s\'assigna a nom1.' },
            calculationOrName2: { name: 'càlcul_o_nom2', detail: 'Un dels següents:\n1.Un càlcul que utilitza tots els noms dins de la funció LET. Aquest ha de ser l\'últim argument de la funció LET.\n2.Un segon nom per assignar a un segon valor_nom. Si s\'especifica un nom, valor_nom2 i càlcul_o_nom3 esdevenen obligatoris.' },
            nameValue2: { name: 'valor_nom2', detail: 'El valor que s\'assigna a càlcul_o_nom2.' },
            calculationOrName3: { name: 'càlcul_o_nom3', detail: 'Un dels següents:\n1.Un càlcul que utilitza tots els noms dins de la funció LET. L\'últim argument de la funció LET ha de ser un càlcul.\n2.Un tercer nom per assignar a un tercer valor_nom. Si s\'especifica un nom, valor_nom3 i càlcul_o_nom4 esdevenen obligatoris.' },
        },
    },
    MAKEARRAY: {
        description: 'Retorna una matriu calculada d\'una mida de fila i columna especificada, aplicant una LAMBDA',
        abstract: 'Retorna una matriu calculada d\'una mida de fila i columna especificada, aplicant una LAMBDA',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/makearray-function-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: 'files', detail: 'El nombre de files de la matriu. Ha de ser superior a zero.' },
            number2: { name: 'cols', detail: 'El nombre de columnes de la matriu. Ha de ser superior a zero.' },
            value3: {
                name: 'lambda',
                detail: 'Una LAMBDA que es crida per crear la matriu. La LAMBDA pren dos paràmetres: fila (l\'índex de fila de la matriu), col (l\'índex de columna de la matriu).',
            },
        },
    },
    MAP: {
        description: 'Retorna una matriu formada mapejant cada valor de la(les) matriu(s) a un nou valor aplicant una LAMBDA per crear un nou valor.',
        abstract: 'Retorna una matriu formada mapejant cada valor de la(les) matriu(s) a un nou valor aplicant una LAMBDA per crear un nou valor.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/map-function-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Una matriu1 per ser mapejada.' },
            array2: { name: 'matriu2', detail: 'Una matriu2 per ser mapejada.' },
            lambda: { name: 'lambda', detail: 'Una LAMBDA que ha de ser l\'últim argument i que ha de tenir un paràmetre per a cada matriu passada.' },
        },
    },
    NOT: {
        description: 'Inverteix la lògica del seu argument.',
        abstract: 'Inverteix la lògica del seu argument.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/not-function-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            logical: { name: 'lògic', detail: 'La condició per a la qual voleu invertir la lògica, que pot avaluar-se com a CERT o FALS.' },
        },
    },
    OR: {
        description: 'Retorna CERT si algun dels seus arguments s\'avalua com a CERT, i retorna FALS si tots els seus arguments s\'avaluen com a FALS.',
        abstract: 'Retorna CERT si algun argument és CERT',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/or-function-7d17ad14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            logical1: { name: 'lògic1', detail: 'La primera condició que voleu comprovar i que pot avaluar-se com a CERT o FALS.' },
            logical2: { name: 'lògic2', detail: 'Condicions addicionals que voleu comprovar i que poden avaluar-se com a CERT o FALS, fins a un màxim de 255 condicions.' },
        },
    },
    REDUCE: {
        description: 'Redueix una matriu a un valor acumulat aplicant una LAMBDA a cada valor i retornant el valor total a l\'acumulador.',
        abstract: 'Redueix una matriu a un valor acumulat aplicant una LAMBDA a cada valor i retornant el valor total a l\'acumulador.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/reduce-function-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            initialValue: { name: 'valor_inicial', detail: 'Estableix el valor inicial de l\'acumulador.' },
            array: { name: 'matriu', detail: 'Una matriu a reduir.' },
            lambda: { name: 'lambda', detail: 'Una LAMBDA que es crida per reduir la matriu. La LAMBDA pren tres paràmetres: 1.El valor totalitzat i retornat com a resultat final. 2.El valor actual de la matriu. 3.El càlcul aplicat a cada element de la matriu.' },
        },
    },
    SCAN: {
        description: 'Escaneja una matriu aplicant una LAMBDA a cada valor i retorna una matriu que té cada valor intermedi.',
        abstract: 'Escaneja una matriu aplicant una LAMBDA a cada valor i retorna una matriu que té cada valor intermedi.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/scan-function-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            initialValue: { name: 'valor_inicial', detail: 'Estableix el valor inicial de l\'acumulador.' },
            array: { name: 'matriu', detail: 'Una matriu a escanejar.' },
            lambda: { name: 'lambda', detail: 'Una LAMBDA que es crida per escanejar la matriu. La LAMBDA pren tres paràmetres: 1.El valor totalitzat i retornat com a resultat final. 2.El valor actual de la matriu. 3.El càlcul aplicat a cada element de la matriu.' },
        },
    },
    SWITCH: {
        description: 'Avalua una expressió enfront d\'una llista de valors i retorna el resultat corresponent al primer valor coincident. Si no hi ha cap coincidència, es pot retornar un valor per defecte opcional.',
        abstract: 'Avalua una expressió enfront d\'una llista de valors i retorna el resultat corresponent al primer valor coincident. Si no hi ha cap coincidència, es pot retornar un valor per defecte opcional.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/switch-function-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            expression: { name: 'expressió', detail: 'L\'expressió és el valor (com ara un número, una data o text) que es compararà amb valor1...valor126.' },
            value1: { name: 'valor1', detail: 'ValorN és un valor que es compararà amb l\'expressió.' },
            result1: { name: 'resultat1', detail: 'ResultatN és el valor a retornar quan l\'argument valorN corresponent coincideixi amb l\'expressió. S\'ha de proporcionar ResultatN per a cada argument valorN corresponent.' },
            defaultOrValue2: { name: 'per_defecte_o_valor2', detail: 'Per defecte és el valor a retornar en cas que no es trobin coincidències a les expressions valorN. L\'argument Per defecte s\'identifica per no tenir una expressió resultatN corresponent (vegeu exemples). Per defecte ha de ser l\'últim argument de la funció.' },
            result2: { name: 'resultat2', detail: 'ResultatN és el valor a retornar quan l\'argument valorN corresponent coincideixi amb l\'expressió. S\'ha de proporcionar ResultatN per a cada argument valorN corresponent.' },
        },
    },
    TRUE: {
        description: 'Retorna el valor lògic CERT.',
        abstract: 'Retorna el valor lògic CERT.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/true-function-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: 'Retorna CERT si un nombre senar dels seus arguments s\'avalua com a CERT, i FALS si un nombre parell dels seus arguments s\'avalua com a CERT.',
        abstract: 'Retorna CERT si un nombre senar d\'arguments són CERT',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/xor-function-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: 'lògic1', detail: 'La primera condició que voleu comprovar i que pot avaluar-se com a CERT o FALS.' },
            logical2: { name: 'lògic2', detail: 'Condicions addicionals que voleu comprovar i que poden avaluar-se com a CERT o FALS, fins a un màxim de 255 condicions.' },
        },
    },
};

export default locale;
