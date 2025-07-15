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
        description: 'Retorna el valor absolut d\'un nombre. El valor absolut d\'un nombre és el nombre sense el seu signe.',
        abstract: 'Retorna el valor absolut d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/abs-function-3420200f-5628-4e8c-99da-c99d7c87713c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real del qual voleu obtenir el valor absolut.' },
        },
    },
    ACOS: {
        description: 'Retorna l\'arccosinus, o cosinus invers, d\'un nombre. L\'arccosinus és l\'angle el cosinus del qual és el nombre. L\'angle retornat es dóna en radians en el rang de 0 (zero) a pi.',
        abstract: 'Retorna l\'arccosinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/acos-function-cb73173f-d089-4582-afa1-76e5524b5d5b',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El cosinus de l\'angle que voleu i ha d\'estar entre -1 i 1.' },
        },
    },
    ACOSH: {
        description: 'Retorna el cosinus hiperbòlic invers d\'un nombre. El nombre ha de ser més gran o igual a 1. El cosinus hiperbòlic invers és el valor el cosinus hiperbòlic del qual és el nombre, de manera que ACOSH(COSH(nombre)) és igual a nombre.',
        abstract: 'Retorna el cosinus hiperbòlic invers d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/acosh-function-e3992cc1-103f-4e72-9f04-624b9ef5ebfe',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real igual o superior a 1.' },
        },
    },
    ACOT: {
        description: 'Retorna el valor principal de l\'arccotangent, o cotangent inversa, d\'un nombre.',
        abstract: 'Retorna l\'arccotangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/acot-function-dc7e5008-fe6b-402e-bdd6-2eea8383d905',
            },
        ],
        functionParameter: {
            number: {
                name: 'nombre',
                detail: 'El nombre és la cotangent de l\'angle que voleu. Ha de ser un nombre real.',
            },
        },
    },
    ACOTH: {
        description: 'Retorna l\'arccotangent hiperbòlica d\'un nombre',
        abstract: 'Retorna l\'arccotangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/acoth-function-cc49480f-f684-4171-9fc5-73e4e852300f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor absolut del Nombre ha de ser més gran que 1.' },
        },
    },
    AGGREGATE: {
        description: 'Retorna un agregat en una llista o base de dades',
        abstract: 'Retorna un agregat en una llista o base de dades',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/aggregate-function-43b9278e-6aa7-4f17-92b6-e19993fa26df',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    ARABIC: {
        description: 'Converteix un nombre romà a aràbic, com a nombre',
        abstract: 'Converteix un nombre romà a aràbic, com a nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/arabic-function-9a8da418-c17b-4ef9-a657-9370a30a674f',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Una cadena entre cometes, una cadena buida (""), o una referència a una cel·la que conté text.' },
        },
    },
    ASIN: {
        description: 'Retorna l\'arcsinus d\'un nombre.',
        abstract: 'Retorna l\'arcsinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/asin-function-81fb95e5-6d6f-48c4-bc45-58f955c6d347',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El sinus de l\'angle que voleu i ha d\'estar entre -1 i 1.' },
        },
    },
    ASINH: {
        description: 'Retorna el sinus hiperbòlic invers d\'un nombre.',
        abstract: 'Retorna el sinus hiperbòlic invers d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/asinh-function-4e00475a-067a-43cf-926a-765b0249717c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    ATAN: {
        description: 'Retorna l\'arctangent d\'un nombre.',
        abstract: 'Retorna l\'arctangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/atan-function-50746fa8-630a-406b-81d0-4a2aed395543',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'La tangent de l\'angle que voleu.' },
        },
    },
    ATAN2: {
        description: 'Retorna l\'arctangent de les coordenades x i y.',
        abstract: 'Retorna l\'arctangent de les coordenades x i y',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/atan2-function-c04592ab-b9e3-4908-b428-c96b3a565033',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_núm', detail: 'La coordenada x del punt.' },
            yNum: { name: 'y_núm', detail: 'La coordenada y del punt.' },
        },
    },
    ATANH: {
        description: 'Retorna la tangent hiperbòlica inversa d\'un nombre.',
        abstract: 'Retorna la tangent hiperbòlica inversa d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/atanh-function-3cd65768-0de7-4f1d-b312-d01c8c930d90',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real entre 1 i -1.' },
        },
    },
    BASE: {
        description: 'Converteix un nombre en una representació de text amb la base donada (arrel)',
        abstract: 'Converteix un nombre en una representació de text amb la base donada (arrel)',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/base-function-2ef61411-aee9-4f29-a811-1c42456c6342',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu convertir. Ha de ser un enter major o igual a 0 i menor que 2^53.' },
            radix: { name: 'base', detail: 'La base a la qual voleu convertir el nombre. Ha de ser un enter major o igual a 2 i menor o igual a 36.' },
            minLength: { name: 'longitud_mínima', detail: 'La longitud mínima de la cadena retornada. Ha de ser un enter major o igual a 0.' },
        },
    },
    CEILING: {
        description: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ceiling-function-0a5cd7c8-0720-4f0a-bd2c-c943e510899f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    CEILING_MATH: {
        description: 'Arrodoneix un nombre cap amunt, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre cap amunt, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ceiling-math-function-80f95d2f-b499-4eee-9f16-f795a8e306c8',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
            mode: { name: 'mode', detail: 'Per a nombres negatius, controla si el Nombre s\'arrodoneix cap a zero o en direcció contrària a zero.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap amunt.',
        abstract: 'Arrodoneix un nombre a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap amunt.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ceiling-precise-function-f366a774-527a-4c92-ba49-af0a196e66cb',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    COMBIN: {
        description: 'Retorna el nombre de combinacions per a un nombre donat d\'objectes',
        abstract: 'Retorna el nombre de combinacions per a un nombre donat d\'objectes',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/combin-function-12a3f276-0a21-423a-8de6-06990aaf638a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_triat', detail: 'El nombre d\'elements en cada combinació.' },
        },
    },
    COMBINA: {
        description: 'Retorna el nombre de combinacions amb repeticions per a un nombre donat d\'elements',
        abstract: 'Retorna el nombre de combinacions amb repeticions per a un nombre donat d\'elements',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/combina-function-efb49eaa-4f4c-4cd2-8179-0ddfcf9d035d',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre d\'elements.' },
            numberChosen: { name: 'nombre_triat', detail: 'El nombre d\'elements en cada combinació.' },
        },
    },
    COS: {
        description: 'Retorna el cosinus d\'un nombre.',
        abstract: 'Retorna el cosinus d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/cos-function-0fb808a5-95d6-4553-8148-22aebdce5f05',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu el cosinus.' },
        },
    },
    COSH: {
        description: 'Retorna el cosinus hiperbòlic d\'un nombre',
        abstract: 'Retorna el cosinus hiperbòlic d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/cosh-function-e460d426-c471-43e8-9540-a57ff3b70555',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real del qual vulgueu trobar el cosinus hiperbòlic.' },
        },
    },
    COT: {
        description: 'Retorna la cotangent d\'un angle',
        abstract: 'Retorna la cotangent d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/cot-function-c446f34d-6fe4-40dc-84f8-cf59e5f5e31a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cotangent.' },
        },
    },
    COTH: {
        description: 'Retorna la cotangent hiperbòlica d\'un nombre',
        abstract: 'Retorna la cotangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/coth-function-2e0b4cb6-0ba0-403e-aed4-deaa71b49df5',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real del qual vulgueu trobar la cotangent hiperbòlica.' },
        },
    },
    CSC: {
        description: 'Retorna la cosecant d\'un angle',
        abstract: 'Retorna la cosecant d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/csc-function-07379361-219a-4398-8675-07ddc4f135c1',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cosecant.' },
        },
    },
    CSCH: {
        description: 'Retorna la cosecant hiperbòlica d\'un angle',
        abstract: 'Retorna la cosecant hiperbòlica d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/csch-function-f58f2c22-eb75-4dd6-84f4-a503527f8eeb',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la cosecant hiperbòlica.' },
        },
    },
    DECIMAL: {
        description: 'Converteix una representació de text d\'un nombre en una base donada en un nombre decimal',
        abstract: 'Converteix una representació de text d\'un nombre en una base donada en un nombre decimal',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/decimal-function-ee554665-6176-46ef-82de-0a283658da2e',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'La longitud de la cadena de Text ha de ser menor o igual a 255 caràcters.' },
            radix: { name: 'base', detail: 'La base a la qual voleu convertir el nombre. Ha de ser un enter major o igual a 2 i menor o igual a 36.' },
        },
    },
    DEGREES: {
        description: 'Converteix radians a graus',
        abstract: 'Converteix radians a graus',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/degrees-function-4d6ec4db-e694-4b94-ace0-1cc3f61f9ba1',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'L\'angle en radians que voleu convertir.' },
        },
    },
    EVEN: {
        description: 'Arrodoneix un nombre cap amunt a l\'enter parell més proper',
        abstract: 'Arrodoneix un nombre cap amunt a l\'enter parell més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/even-function-197b5f06-c795-4c1e-8696-3c3b8a646cf9',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
        },
    },
    EXP: {
        description: 'Retorna e elevat a la potència d\'un nombre donat',
        abstract: 'Retorna e elevat a la potència d\'un nombre donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/exp-function-c578f034-2c45-4c37-bc8c-329660a63abe',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'exponent aplicat a la base e.' },
        },
    },
    FACT: {
        description: 'Retorna el factorial d\'un nombre',
        abstract: 'Retorna el factorial d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/fact-function-ca8588c2-15f2-41c0-8e8c-c11bd471a4f3',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre no negatiu del qual voleu el factorial. Si el nombre no és un enter, es trunca.' },
        },
    },
    FACTDOUBLE: {
        description: 'Retorna el doble factorial d\'un nombre',
        abstract: 'Retorna el doble factorial d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/factdouble-function-e67697ac-d214-48eb-b7b7-cce2589ecac8',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre no negatiu del qual voleu el doble factorial. Si el nombre no és un enter, es trunca.' },
        },
    },
    FLOOR: {
        description: 'Arrodoneix un nombre cap avall, cap a zero',
        abstract: 'Arrodoneix un nombre cap avall, cap a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/floor-function-14bb497c-24f2-4e04-b327-b0b4de5a8886',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    FLOOR_MATH: {
        description: 'Arrodoneix un nombre cap avall, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Arrodoneix un nombre cap avall, a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/floor-math-function-c302b599-fbdb-4177-ba19-2c2b1249a2f5',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
            mode: { name: 'mode', detail: 'Per a nombres negatius, controla si el Nombre s\'arrodoneix cap a zero o en direcció contrària a zero.' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Arrodoneix un nombre cap avall a l\'enter més proper o al múltiple més proper de la xifra significativa. Independentment del signe del nombre, el nombre s\'arrodoneix cap avall.',
        abstract: 'Arrodoneix un nombre cap avall a l\'enter més proper o al múltiple més proper de la xifra significativa.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/floor-precise-function-f769b468-1452-4617-8dc3-02f842a0702e',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que voleu arrodonir.' },
            significance: { name: 'xifra_significativa', detail: 'El múltiple al qual voleu arrodonir.' },
        },
    },
    GCD: {
        description: 'Retorna el màxim comú divisor',
        abstract: 'Retorna el màxim comú divisor',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/gcd-function-d5107a51-69e3-461f-8e4c-ddfc21b5073a',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per trobar el primer nombre del màxim comú divisor, també podeu utilitzar una sola matriu o una referència a una matriu en lloc dels paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre del qual s\'ha de trobar el màxim comú divisor. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    INT: {
        description: 'Arrodoneix un nombre cap avall a l\'enter més proper',
        abstract: 'Arrodoneix un nombre cap avall a l\'enter més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/int-function-a6c4af9e-356d-4369-ab6a-cb1fd9d343ef',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real que voleu arrodonir cap avall a un enter.' },
        },
    },
    ISO_CEILING: {
        description: 'Retorna un nombre que s\'arrodoneix cap amunt a l\'enter més proper o al múltiple més proper de la xifra significativa',
        abstract: 'Retorna un nombre que s\'arrodoneix cap amunt a l\'enter més proper o al múltiple més proper de la xifra significativa',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/iso-ceiling-function-e587bb73-6cc2-4113-b664-ff5b09859a83',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    LCM: {
        description: 'Retorna el mínim comú múltiple',
        abstract: 'Retorna el mínim comú múltiple',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/lcm-function-7152b67a-8bb5-4075-ae5c-06ede5563c94',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per trobar el primer nombre del mínim comú múltiple, també podeu utilitzar una sola matriu o una referència a una matriu en lloc dels paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre del qual s\'ha de trobar el mínim comú múltiple. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    LET: {
        description: 'Assigna noms als resultats dels càlculs per permetre emmagatzemar càlculs intermedis, valors o definir noms dins d\'una fórmula',
        abstract: 'Assigna noms als resultats dels càlculs per permetre emmagatzemar càlculs intermedis, valors o definir noms dins d\'una fórmula',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/let-function-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'primer' },
            number2: { name: 'nombre2', detail: 'segon' },
        },
    },
    LN: {
        description: 'Retorna el logaritme natural d\'un nombre',
        abstract: 'Retorna el logaritme natural d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/ln-function-81fe1ed7-dac9-4acd-ba1d-07a142c6118f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme natural.' },
        },
    },
    LOG: {
        description: 'Retorna el logaritme d\'un nombre en una base especificada',
        abstract: 'Retorna el logaritme d\'un nombre en una base especificada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/log-function-4e82f196-1ca9-4747-8fb0-6c4a3abb3280',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme.' },
            base: { name: 'base', detail: 'La base del logaritme. Si s\'omet la base, s\'assumeix que és 10.' },
        },
    },
    LOG10: {
        description: 'Retorna el logaritme en base 10 d\'un nombre',
        abstract: 'Retorna el logaritme en base 10 d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/log10-function-c75b881b-49dd-44fb-b6f4-37e3486a0211',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre real positiu del qual voleu el logaritme en base 10.' },
        },
    },
    MDETERM: {
        description: 'Retorna el determinant matricial d\'una matriu',
        abstract: 'Retorna el determinant matricial d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/mdeterm-function-e7bfa857-3834-422b-b871-0ffd03717020',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu numèrica amb un nombre igual de files i columnes.' },
        },
    },
    MINVERSE: {
        description: 'Retorna la matriu inversa d\'una matriu',
        abstract: 'Retorna la matriu inversa d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/minverse-function-11f55086-adde-4c9f-8eb9-59da2d72efc6',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu numèrica amb un nombre igual de files i columnes.' },
        },
    },
    MMULT: {
        description: 'Retorna el producte matricial de dues matrius',
        abstract: 'Retorna el producte matricial de dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/mmult-function-40593ed7-a3cd-4b6b-b9a3-e4ad3c7245eb',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu1', detail: 'Les matrius que voleu multiplicar.' },
            array2: { name: 'matriu2', detail: 'Les matrius que voleu multiplicar.' },
        },
    },
    MOD: {
        description: 'Retorna el residu després que el nombre es divideixi pel divisor. El resultat té el mateix signe que el divisor.',
        abstract: 'Retorna el residu de la divisió',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/mod-function-9b6cd169-b6ee-406a-a97b-edf2a9dc24f3',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu trobar el residu.' },
            divisor: { name: 'divisor', detail: 'El nombre pel qual voleu dividir el nombre.' },
        },
    },
    MROUND: {
        description: 'Retorna un nombre arrodonit al múltiple desitjat',
        abstract: 'Retorna un nombre arrodonit al múltiple desitjat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/mround-function-c299c3b0-15a5-426d-aa4b-d2d5b3baf427',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
            multiple: { name: 'múltiple', detail: 'El múltiple al qual voleu arrodonir el nombre.' },
        },
    },
    MULTINOMIAL: {
        description: 'Retorna el multinomial d\'un conjunt de nombres',
        abstract: 'Retorna el multinomial d\'un conjunt de nombres',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/multinomial-function-6fa6373c-6533-41a2-a45e-a56db1db1bf6',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer valor o rang a utilitzar en el càlcul.' },
            number2: { name: 'nombre2', detail: 'Valors o rangs addicionals a utilitzar en els càlculs.' },
        },
    },
    MUNIT: {
        description: 'Retorna la matriu unitària o la dimensió especificada',
        abstract: 'Retorna la matriu unitària o la dimensió especificada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/munit-function-c9fe916a-dc26-4105-997d-ba22799853a3',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimensió', detail: 'Dimensió és un enter que especifica la dimensió de la matriu unitària que voleu retornar. Retorna una matriu. La dimensió ha de ser més gran que zero.' },
        },
    },
    ODD: {
        description: 'Arrodoneix un nombre cap amunt a l\'enter senar més proper',
        abstract: 'Arrodoneix un nombre cap amunt a l\'enter senar més proper',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/odd-function-deae64eb-e08a-4c88-8b40-6d0b42575c98',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor a arrodonir.' },
        },
    },
    PI: {
        description: 'Retorna el valor de pi',
        abstract: 'Retorna el valor de pi',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/pi-function-264199d0-a3ba-46b8-975a-c4a04608989b',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Retorna el resultat d\'un nombre elevat a una potència.',
        abstract: 'Retorna el resultat d\'un nombre elevat a una potència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/power-function-d3f2908b-56f4-4c3f-895a-07fb519c362a',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre base. Pot ser qualsevol nombre real.' },
            power: { name: 'potència', detail: 'L\'exponent al qual s\'eleva el nombre base.' },
        },
    },
    PRODUCT: {
        description: 'Multiplica tots els nombres donats com a arguments i retorna el producte.',
        abstract: 'Multiplica els seus arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/product-function-8e6b5b24-90ee-4650-aeec-80982a0512ce',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre o rang que voleu multiplicar.' },
            number2: { name: 'nombre2', detail: 'Nombres o rangs addicionals que voleu multiplicar, fins a un màxim de 255 arguments.' },
        },
    },
    QUOTIENT: {
        description: 'Retorna la part entera d\'una divisió',
        abstract: 'Retorna la part entera d\'una divisió',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/quotient-function-9f7bf099-2a18-4282-8fa4-65290cc99dee',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerador', detail: 'El dividend.' },
            denominator: { name: 'denominador', detail: 'El divisor.' },
        },
    },
    RADIANS: {
        description: 'Converteix graus a radians',
        abstract: 'Converteix graus a radians',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/radians-function-ac409508-3d48-45f5-ac02-1497c92de5bf',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Un angle en graus que voleu convertir.' },
        },
    },
    RAND: {
        description: 'Retorna un nombre aleatori entre 0 i 1',
        abstract: 'Retorna un nombre aleatori entre 0 i 1',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/rand-function-4cbfa695-8869-4788-8d90-021ea9f5be73',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'Retorna una matriu de nombres aleatoris entre 0 i 1. Tanmateix, podeu especificar el nombre de files i columnes a omplir, els valors mínims i màxims, i si es retornen nombres enters o valors decimals.',
        abstract: 'Retorna una matriu de nombres aleatoris entre 0 i 1.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/randarray-function-21261e55-3bec-4885-86a6-8b0a47fd4d33',
            },
        ],
        functionParameter: {
            rows: { name: 'files', detail: 'El nombre de files que es retornaran' },
            columns: { name: 'columnes', detail: 'El nombre de columnes que es retornaran' },
            min: { name: 'min', detail: 'El nombre mínim que us agradaria que es retornés' },
            max: { name: 'max', detail: 'El nombre màxim que us agradaria que es retornés' },
            wholeNumber: { name: 'nombre_sencer', detail: 'Retornar un nombre sencer o un valor decimal' },
        },
    },
    RANDBETWEEN: {
        description: 'Retorna un nombre aleatori entre els nombres que especifiqueu',
        abstract: 'Retorna un nombre aleatori entre els nombres que especifiqueu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/randbetween-function-4cc7f0d1-87dc-4eb7-987f-a469ab381685',
            },
        ],
        functionParameter: {
            bottom: { name: 'inferior', detail: 'L\'enter més petit que retornarà RANDBETWEEN.' },
            top: { name: 'superior', detail: 'L\'enter més gran que retornarà RANDBETWEEN.' },
        },
    },
    ROMAN: {
        description: 'Converteix un nombre aràbic a romà, com a text',
        abstract: 'Converteix un nombre aràbic a romà, com a text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/roman-function-d6b0b99e-de46-4704-a518-b45a0f8b56f5',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre aràbic que voleu convertir.' },
            form: { name: 'forma', detail: 'Un nombre que especifica el tipus de nombre romà que voleu. L\'estil del nombre romà varia de Clàssic a Simplificat, tornant-se més concís a mesura que augmenta el valor de la forma.' },
        },
    },
    ROUND: {
        description: 'Arrodoneix un nombre a un nombre especificat de dígits',
        abstract: 'Arrodoneix un nombre a un nombre especificat de dígits',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    ROUNDBANK: {
        description: 'Arrodoneix un nombre amb arrodoniment bancari',
        abstract: 'Arrodoneix un nombre amb arrodoniment bancari',
        links: [
            {
                title: 'Instrucció',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir amb arrodoniment bancari.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir amb arrodoniment bancari.' },
        },
    },
    ROUNDDOWN: {
        description: 'Arrodoneix un nombre cap avall, cap a zero',
        abstract: 'Arrodoneix un nombre cap avall, cap a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/rounddown-function-2ec94c73-241f-4b01-8c6f-17e6d7968f53',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    ROUNDUP: {
        description: 'Arrodoneix un nombre cap amunt, en direcció contrària a zero',
        abstract: 'Arrodoneix un nombre cap amunt, en direcció contrària a zero',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/roundup-function-f8bc9b23-e795-47db-8703-db171d0c42a7',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu arrodonir.' },
            numDigits: { name: 'núm_dígits', detail: 'El nombre de dígits al qual voleu arrodonir l\'argument del nombre.' },
        },
    },
    SEC: {
        description: 'Retorna la secant d\'un angle',
        abstract: 'Retorna la secant d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sec-function-ff224717-9c87-4170-9b58-d069ced6d5f7',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre és l\'angle en radians del qual voleu la secant.' },
        },
    },
    SECH: {
        description: 'Retorna la secant hiperbòlica d\'un angle',
        abstract: 'Retorna la secant hiperbòlica d\'un angle',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sech-function-e05a789f-5ff7-4d7f-984a-5edb9b09556f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre és l\'angle en radians del qual voleu la secant hiperbòlica.' },
        },
    },
    SERIESSUM: {
        description: 'Retorna la suma d\'una sèrie de potències basada en la fórmula',
        abstract: 'Retorna la suma d\'una sèrie de potències basada en la fórmula',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/seriessum-function-a3ab25b5-1093-4f5b-b084-96c49087f637',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El valor d\'entrada a la sèrie de potències.' },
            n: { name: 'n', detail: 'La potència inicial a la qual voleu elevar x.' },
            m: { name: 'm', detail: 'El pas pel qual augmentar n per a cada terme de la sèrie.' },
            coefficients: { name: 'coeficients', detail: 'Un conjunt de coeficients pels quals es multiplica cada potència successiva de x.' },
        },
    },
    SEQUENCE: {
        description: 'Genera una llista de nombres seqüencials en una matriu, com 1, 2, 3, 4',
        abstract: 'Genera una llista de nombres seqüencials en una matriu, com 1, 2, 3, 4',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sequence-function-57467a98-57e0-4817-9f14-2eb78519ca90',
            },
        ],
        functionParameter: {
            rows: { name: 'files', detail: 'El nombre de files a retornar.' },
            columns: { name: 'columnes', detail: 'El nombre de columnes a retornar.' },
            start: { name: 'inici', detail: 'El primer nombre de la seqüència.' },
            step: { name: 'pas', detail: 'La quantitat a incrementar cada valor subsegüent a la matriu.' },
        },
    },
    SIGN: {
        description: 'Retorna el signe d\'un nombre',
        abstract: 'Retorna el signe d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sign-function-109c932d-fcdc-4023-91f1-2dd0e916a1d8',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    SIN: {
        description: 'Retorna el sinus de l\'angle donat',
        abstract: 'Retorna el sinus de l\'angle donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sin-function-cf0e3432-8b9e-483c-bc55-a76651c95602',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu el sinus.' },
        },
    },
    SINH: {
        description: 'Retorna el sinus hiperbòlic d\'un nombre',
        abstract: 'Retorna el sinus hiperbòlic d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sinh-function-1e4e8b9f-2b65-43fc-ab8a-0a37f4081fa7',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    SQRT: {
        description: 'Retorna una arrel quadrada positiva',
        abstract: 'Retorna una arrel quadrada positiva',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sqrt-function-654975c2-05c4-4831-9a24-2c65e4040fdf',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre del qual voleu l\'arrel quadrada.' },
        },
    },
    SQRTPI: {
        description: 'Retorna l\'arrel quadrada de (nombre * pi)',
        abstract: 'Retorna l\'arrel quadrada de (nombre * pi)',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sqrtpi-function-1fb4e63f-9b51-46d6-ad68-b3e7a8b519b4',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre pel qual es multiplica pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Retorna un subtotal en una llista o base de dades.',
        abstract: 'Retorna un subtotal en una llista o base de dades',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/subtotal-function-7b027003-f060-4ade-9040-e478765b9939',
            },
        ],
        functionParameter: {
            functionNum: { name: 'núm_funció', detail: 'El nombre 1-11 o 101-111 que especifica la funció a utilitzar per al subtotal. 1-11 inclou files ocultes manualment, mentre que 101-111 les exclou; les cel·les filtrades sempre s\'exclouen.' },
            ref1: { name: 'ref1', detail: 'El primer rang amb nom o referència per al qual voleu el subtotal.' },
            ref2: { name: 'ref2', detail: 'Rangs amb nom o referències de 2 a 254 per als quals voleu el subtotal.' },
        },
    },
    SUM: {
        description: 'Podeu sumar valors individuals, referències de cel·la o rangs, o una barreja de tots tres.',
        abstract: 'Suma els seus arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89',
            },
        ],
        functionParameter: {
            number1: {
                name: 'Nombre 1',
                detail: 'El primer nombre que voleu sumar. El nombre pot ser com 4, una referència de cel·la com B6, o un rang de cel·les com B2:B8.',
            },
            number2: {
                name: 'Nombre 2',
                detail: 'Aquest és el segon nombre que voleu sumar. Podeu especificar fins a 255 nombres d\'aquesta manera.',
            },
        },
    },
    SUMIF: {
        description: 'Suma els valors en un rang que compleixen els criteris que especifiqueu.',
        abstract: 'Suma les cel·les especificades per un criteri donat',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumif-function-169b8c99-c05c-4483-a712-1697a653039b',
            },
        ],
        functionParameter: {
            range: {
                name: 'rang',
                detail: 'El rang de cel·les que voleu avaluar per criteris.',
            },
            criteria: {
                name: 'criteri',
                detail: 'El criteri en forma de nombre, expressió, una referència de cel·la, text o una funció que defineix quines cel·les se sumaran. Es poden incloure caràcters comodí: un signe d\'interrogació (?) per coincidir amb qualsevol caràcter individual, un asterisc (*) per coincidir amb qualsevol seqüència de caràcters. Si voleu trobar un signe d\'interrogació o un asterisc real, escriviu una titlla (~) abans del caràcter.',
            },
            sumRange: {
                name: 'rang_suma',
                detail: 'Les cel·les reals a sumar, si voleu sumar cel·les diferents de les especificades a l\'argument de rang. Si s\'omet l\'argument rang_suma, l\'Excel suma les cel·les especificades a l\'argument de rang (les mateixes cel·les a les quals s\'aplica el criteri).',
            },
        },
    },
    SUMIFS: {
        description: 'Suma tots els seus arguments que compleixen múltiples criteris.',
        abstract: 'Suma tots els seus arguments que compleixen múltiples criteris.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumifs-function-c9e748f5-7ea7-455d-9406-611cebce642b',
            },
        ],
        functionParameter: {
            sumRange: { name: 'rang_suma', detail: 'El rang de cel·les a sumar.' },
            criteriaRange1: { name: 'rang_criteri1 ', detail: 'El rang que es prova utilitzant el criteri1. rang_criteri1 i criteri1 estableixen una parella de cerca mitjançant la qual es busca un rang per a criteris específics. Un cop es troben els elements al rang, se sumen els seus valors corresponents a rang_suma.' },
            criteria1: { name: 'criteri1', detail: 'El criteri que defineix quines cel·les de rang_criteri1 se sumaran. Per exemple, el criteri es pot introduir com a 32, ">32", B4, "pomes" o "32".' },
            criteriaRange2: { name: 'rang_criteri2', detail: 'Rangs addicionals. Podeu introduir fins a 127 parelles de rangs.' },
            criteria2: { name: 'criteri2', detail: 'Criteris associats addicionals. Podeu introduir fins a 127 parelles de criteris.' },
        },
    },
    SUMPRODUCT: {
        description: 'Retorna la suma dels productes dels components corresponents de la matriu',
        abstract: 'Retorna la suma dels productes dels components corresponents de la matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumproduct-function-16753e75-9f68-4874-94ac-4d2145a2fd2e',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu', detail: 'El primer argument de matriu els components del qual voleu multiplicar i després sumar.' },
            array2: { name: 'matriu', detail: 'Arguments de matriu de 2 a 255 els components del qual voleu multiplicar i després sumar.' },
        },
    },
    SUMSQ: {
        description: 'Retorna la suma dels quadrats dels arguments',
        abstract: 'Retorna la suma dels quadrats dels arguments',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumsq-function-e3313c02-51cc-4963-aae6-31442d9ec307',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Per elevar al quadrat i trobar el primer nombre, també podeu utilitzar una sola matriu o una referència a una matriu en lloc de paràmetres separats per comes.' },
            number2: { name: 'nombre2', detail: 'El segon nombre que s\'elevarà al quadrat i se sumarà. Es poden especificar fins a 255 nombres d\'aquesta manera.' },
        },
    },
    SUMX2MY2: {
        description: 'Retorna la suma de la diferència de quadrats dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma de la diferència de quadrats dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumx2my2-function-9e599cc5-5399-48e9-a5e0-e37812dfa3e9',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    SUMX2PY2: {
        description: 'Retorna la suma de la suma de quadrats dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma de la suma de quadrats dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumx2py2-function-826b60b4-0aa2-4e5e-81d2-be704d3d786f',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    SUMXMY2: {
        description: 'Retorna la suma dels quadrats de les diferències dels valors corresponents en dues matrius',
        abstract: 'Retorna la suma dels quadrats de les diferències dels valors corresponents en dues matrius',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/sumxmy2-function-9d144ac1-4d79-43de-b524-e2ecee23b299',
            },
        ],
        functionParameter: {
            arrayX: { name: 'matriu_x', detail: 'La primera matriu o rang de valors.' },
            arrayY: { name: 'matriu_y', detail: 'La segona matriu o rang de valors.' },
        },
    },
    TAN: {
        description: 'Retorna la tangent d\'un nombre.',
        abstract: 'Retorna la tangent d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/tan-function-08851a40-179f-4052-b789-d7f699447401',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'L\'angle en radians del qual voleu la tangent.' },
        },
    },
    TANH: {
        description: 'Retorna la tangent hiperbòlica d\'un nombre.',
        abstract: 'Retorna la tangent hiperbòlica d\'un nombre',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/tanh-function-017222f0-a0c3-4f69-9787-b3202295dc6c',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Qualsevol nombre real.' },
        },
    },
    TRUNC: {
        description: 'Trunca un nombre a un enter',
        abstract: 'Trunca un nombre a un enter',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/office/trunc-function-8b86a64c-3127-43db-ba14-aa5ceb292721',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre que voleu truncar.' },
            numDigits: { name: 'núm_dígits', detail: 'Un nombre que especifica la precisió del truncament. El valor per defecte per a núm_dígits és 0 (zero).' },
        },
    },
};

export default locale;
