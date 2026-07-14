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
    DATE: {
        description: 'La fonction DATE renvoie le numéro de série séquentiel qui représente une date particulière.',
        abstract: 'La fonction DATE renvoie le numéro de série séquentiel qui représente une date particulière.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'La valeur de l’argument year peut comporter de un à quatre chiffres. Excel interprète year selon le système de dates utilisé par votre ordinateur. Par défaut, Univer utilise le système de dates 1900, dont la première date est le 1er janvier 1900.' },
            month: { name: 'month', detail: 'Un entier positif ou négatif représentant le mois de l’année de 1 à 12 (janvier à décembre).' },
            day: { name: 'day', detail: 'Un entier positif ou négatif représentant le jour du mois de 1 à 31.' },
        },
    },
    DATEDIF: {
        description: 'Calcule le nombre de jours, de mois ou d’années qui séparent deux dates.',
        abstract: 'Calcule le nombre de jours, de mois ou d’années qui séparent deux dates.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Date qui représente la première ou la date de début d’une période donnée. Les dates doivent être entrées sous forme de chaînes de texte placées entre guillemets (par exemple, « 30/01/2001 »), comme numéros de série (par exemple, 36921, qui représente le 30 janvier 2001, si vous utilisez le calendrier depuis 1900) ou sous forme de résultat d’autres formules ou fonctions (par exemple, DATEVAL("30/01/2001")).' },
            endDate: { name: 'end_date', detail: 'Date qui représente la dernière date ou la date de fin de la période.' },
            unit: { name: 'unité', detail: 'Type d’informations que vous souhaitez renvoyer, où : Unit****Returns " Y "Le nombre d’années complètes dans la période. » M « Nombre de mois complets dans la période . » D « Nombre de jours de la période ». MD : différence entre les jours en start_date et en end_date. Les mois et les années des dates sont ignorés. Important: Nous vous déconseillons d’utiliser l’argument « MD », car il comporte des limitations connues. Consultez la section problèmes connus ci-dessous. » YM "Différence entre les mois en start_date et end_date. Les jours et les années des dates sont ignorés" YD "Différence entre les jours de start_date et end_date. Les années des dates sont ignorées.' },
        },
    },
    DATEVALUE: {
        description: 'La fonction DATEVAL convertit une date stockée sous forme de texte en numéro de série reconnu par Excel comme une date. Par exemple, la formule =DATEVAL("1/1/2008") renvoie 39448, le numéro de série de la date 1/1/2008. Souvenez-vous toutefois que le paramètre de date système de votre ordinateur peut faire en sorte que les résultats d’une fonction DATEVAL diffèrent de cet exemple.',
        abstract: 'La fonction DATEVAL convertit une date stockée sous forme de texte en numéro de série reconnu par Excel comme une date. Par exemple, la formule =DATEVAL("1/1/2008") renvoie 39448, le numéro de série de la date 1/1/2008. Souvenez-vous toutefois que le paramètre de date système de votre ordinateur peut faire en sorte que les résultats d’une fonction DATEVAL diffèrent de cet exemple.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Obligatoire. Texte qui correspond à une date dans un format de date Excel, ou une référence à une cellule contenant du texte qui correspond à une date dans un format de date Excel. Par exemple, « 1/30/2008 » et « 30-Jan-2008 » sont des chaînes de texte entre guillemets qui correspondent à des dates. À l’aide du système de date par défaut dans Microsoft Excel pour Windows, l’argument date_text doit représenter une date comprise entre le 1er janvier 1900 et le 31 décembre 9999. La fonction DATEVAL renvoie la valeur d’erreur #VALEUR! valeur d’erreur si la valeur de l’argument date_text est en dehors de cette plage. Si la partie année de l’argument date_text est omise, la fonction DATEVALUE utilise l’année en cours à partir de l’horloge intégrée de votre ordinateur. Les informations de temps dans l’argument date_text sont ignorées.' },
        },
    },
    DAY: {
        description: 'Renvoie le jour du mois correspondant à l’argument numéro_de_série. Ce jour est représenté sous la forme d’un nombre entier compris entre 1 et 31.',
        abstract: 'Renvoie le jour du mois correspondant à l’argument numéro_de_série. Ce jour est représenté sous la forme d’un nombre entier compris entre 1 et 31.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de date du jour que vous voulez rechercher. Les dates doivent être entrées à l’aide de la fonction DATE ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008,5,23) pour le 23e jour du mois de mai 2008. Certains problèmes peuvent survenir si les dates sont entrées sous forme de texte .' },
        },
    },
    DAYS: {
        description: 'Renvoie le nombre de jours entre deux dates.',
        abstract: 'Renvoie le nombre de jours entre deux dates.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Obligatoire. Date_début et Date_fin sont deux dates dont vous voulez connaître le nombre de jours qui les séparent.' },
            startDate: { name: 'start_date', detail: 'Obligatoire. Date_début et Date_fin sont deux dates dont vous voulez connaître le nombre de jours qui les séparent.' },
        },
    },
    DAYS360: {
        description: 'La fonction JOURS360 renvoie le nombre de jours compris entre deux dates sur la base d’une année de 360 jours (12 mois de 30 jours), qui est utilisée dans certains calculs comptables. Utilisez cette fonction pour le calcul des paiements si votre système comptable est basé sur 12 mois de 30 jours.',
        abstract: 'La fonction JOURS360 renvoie le nombre de jours compris entre deux dates sur la base d’une année de 360 jours (12 mois de 30 jours), qui est utilisée dans certains calculs comptables. Utilisez cette fonction pour le calcul des paiements si votre système comptable est basé sur 12 mois de 30 jours.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'start_date et end_date sont les deux dates entre lesquelles vous souhaitez connaître le nombre de jours.' },
            endDate: { name: 'end_date', detail: 'start_date et end_date sont les deux dates entre lesquelles vous souhaitez connaître le nombre de jours.' },
            method: { name: 'method', detail: 'Valeur logique indiquant si la méthode américaine ou européenne doit être utilisée pour le calcul.' },
        },
    },
    EDATE: {
        description: 'Renvoie le numéro de série qui représente la date correspondant à une date spécifiée (l’argument date_départ), corrigée en plus ou en moins du nombre de mois indiqué. Utilisez la fonction MOIS.DECALER pour calculer des dates d’échéance ou de coupon tombant le même jour du mois que la date d’émission.',
        abstract: 'Renvoie le numéro de série qui représente la date correspondant à une date spécifiée (l’argument date_départ), corrigée en plus ou en moins du nombre de mois indiqué. Utilisez la fonction MOIS.DECALER pour calculer des dates d’échéance ou de coupon tombant le même jour du mois que la date d’émission.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Il s’agit d’une date qui représente la date de début. Les dates doivent être entrées en utilisant la fonction DATE, ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008,5,23) pour le 23e jour du mois de mai 2008. Certains problèmes peuvent survenir si les dates sont entrées sous forme de texte .' },
            months: { name: 'months', detail: 'Obligatoire. Représente le nombre de mois avant ou après date_départ. Une valeur de mois positive donne une date future, tandis qu’une valeur négative donne une date passée.' },
        },
    },
    EOMONTH: {
        description: 'Renvoie le numéro de série du dernier jour du mois précédant ou suivant date_départ du nombre de mois indiqué. Utilisez FIN.MOIS pour calculer des dates d’échéance ou des dates d’échéance tombant le dernier jour du mois.',
        abstract: 'Renvoie le numéro de série du dernier jour du mois précédant ou suivant date_départ du nombre de mois indiqué. Utilisez FIN.MOIS pour calculer des dates d’échéance ou des dates d’échéance tombant le dernier jour du mois.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Il s’agit d’une date qui représente la date de début. Les dates doivent être entrées en utilisant la fonction DATE, ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008,5,23) pour le 23e jour du mois de mai 2008. Certains problèmes peuvent survenir si les dates sont entrées sous forme de texte .' },
            months: { name: 'months', detail: 'Obligatoire. Représente le nombre de mois avant ou après date_départ. Une valeur de mois positive donne une date future, tandis qu’une valeur négative donne une date passée. Remarque Si mois n’est pas un nombre entier, il est tronqué à sa partie entière.' },
        },
    },
    EPOCHTODATE: {
        description: 'Convertit un code temporel d\'époque Unix en secondes, millisecondes ou microsecondes en date et heure UTC (temps universel coordonné).',
        abstract: 'Convertit un code temporel d\'époque Unix en secondes, millisecondes ou microsecondes en date et heure UTC (temps universel coordonné).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=fr',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'code temporel d\'epoch Unix en secondes, millisecondes ou microsecondes.' },
            unit: { name: 'unit', detail: '[FACULTATIF – 1 par défaut] : unité de temps dans laquelle le code temporel est exprimé.' },
        },
    },
    HOUR: {
        description: 'Renvoie l’heure correspondant à la valeur de l’heure. L’heure est un nombre entier compris entre 0 (12:00 AM) et 23 (11:00 PM).',
        abstract: 'Renvoie l’heure correspondant à la valeur de l’heure. L’heure est un nombre entier compris entre 0 (12:00 AM) et 23 (11:00 PM).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de temps contenant l’heure que vous voulez trouver. Les codes de temps peuvent être entrés sous la forme de chaînes de texte entre guillemets (par exemple, "18:45"), de caractères décimaux (par exemple, 0,78125, qui représente 18:45), ou de résultats d’autres formules ou fonctions (par exemple, TEMPSVAL("18:45")).' },
        },
    },
    ISOWEEKNUM: {
        description: 'Renvoie le numéro de la semaine ISO de l’année pour une date donnée.',
        abstract: 'Renvoie le numéro de la semaine ISO de l’année pour une date donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Obligatoire. Date est le code de date et d’heure utilisé par Excel pour le calcul de date et d’heure.' },
        },
    },
    MINUTE: {
        description: 'Renvoie les minutes correspondant à une valeur d’heure. La minute est donnée sous la forme d’un nombre entier compris entre 0 et 59.',
        abstract: 'Renvoie les minutes correspondant à une valeur d’heure. La minute est donnée sous la forme d’un nombre entier compris entre 0 et 59.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de temps contenant la minute que vous voulez trouver. Les codes de temps peuvent être entrés sous la forme de chaînes de texte entre guillemets (par exemple, "18:45"), de caractères décimaux (par exemple, 0,78125, qui représente 18:45), ou de résultats d’autres formules ou fonctions (par exemple, TEMPSVAL("18:45")).' },
        },
    },
    MONTH: {
        description: 'Renvoie le mois d’une date représentée par un numéro de série. Le mois est donné sous la forme d’un nombre entier compris entre 1 (janvier) et 12 (décembre).',
        abstract: 'Renvoie le mois d’une date représentée par un numéro de série. Le mois est donné sous la forme d’un nombre entier compris entre 1 (janvier) et 12 (décembre).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de date du mois que vous recherchez. Les dates doivent être entrées à l’aide de la fonction DATE ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008,5,23) pour le 23e jour du mois de mai 2008. Certains problèmes peuvent survenir si les dates sont entrées sous forme de texte .' },
        },
    },
    NETWORKDAYS: {
        description: 'Renvoie le nombre de jours ouvrés entiers compris entre date_début et date_fin. Les jours ouvrés excluent les fins de semaine et toutes les dates identifiées comme étant des jours fériés. Utilisez NB.JOURS.OUVRES pour calculer les charges salariales au prorata du nombre de jours ouvrés pendant une période donnée.',
        abstract: 'Renvoie le nombre de jours ouvrés entiers compris entre date_début et date_fin. Les jours ouvrés excluent les fins de semaine et toutes les dates identifiées comme étant des jours fériés. Utilisez NB.JOURS.OUVRES pour calculer les charges salariales au prorata du nombre de jours ouvrés pendant une période donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Date qui représente la date de début.' },
            endDate: { name: 'end_date', detail: 'Obligatoire. Date qui représente la date de fin.' },
            holidays: { name: 'holidays', detail: 'Optionnel. Représente une plage facultative d’une ou de plusieurs dates à exclure du calendrier des jours ouvrés, comme les jours fériés ou d’autres jours contractuellement chômés. La liste peut être soit une plage de cellules contenant les dates, soit une constante de matrice des numéros de série qui représentent les dates.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Renvoie le nombre de jours ouvrés entiers compris entre deux dates à l’aide de paramètres identifiant les jours du week-end et leur nombre. Les jours du week-end et ceux qui sont désignés comme des jours fériés ne sont pas considérés comme des jours ouvrés.',
        abstract: 'Renvoie le nombre de jours ouvrés entiers compris entre deux dates à l’aide de paramètres identifiant les jours du week-end et leur nombre. Les jours du week-end et ceux qui sont désignés comme des jours fériés ne sont pas considérés comme des jours ouvrés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Date représentant la date de début.' },
            endDate: { name: 'end_date', detail: 'Date représentant la date de fin.' },
            weekend: { name: 'weekend', detail: 'Nombre ou chaîne de caractères indiquant quand les week-ends surviennent.' },
            holidays: { name: 'holidays', detail: 'Plage facultative d’une ou plusieurs dates à exclure du calendrier de travail, par exemple les jours fériés nationaux, régionaux ou mobiles.' },
        },
    },
    NOW: {
        description: 'Donne le numéro de série de la date et de l’heure en cours. Si le format de cellule était Général avant l’application de la fonction, Excel modifie le format de cellule pour qu’il corresponde au format de date et heure des paramètres régionaux. Vous pouvez modifier le format de date et heure d’une cellule à l’aide des commandes du groupe Nombre de l’onglet Accueil du ruban.',
        abstract: 'Donne le numéro de série de la date et de l’heure en cours. Si le format de cellule était Général avant l’application de la fonction, Excel modifie le format de cellule pour qu’il corresponde au format de date et heure des paramètres régionaux. Vous pouvez modifier le format de date et heure d’une cellule à l’aide des commandes du groupe Nombre de l’onglet Accueil du ruban.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Renvoie les secondes d’une valeur de temps. Les secondes sont représentées par un nombre entier compris entre 0 (zéro) et 59.',
        abstract: 'Renvoie les secondes d’une valeur de temps. Les secondes sont représentées par un nombre entier compris entre 0 (zéro) et 59.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de temps contenant l’heure que vous voulez trouver. Les codes de temps peuvent être entrés sous la forme de chaînes de texte entre guillemets (par exemple, "18:45"), de caractères décimaux (par exemple, 0,78125, qui représente 18:45) ou de résultats d’autres formules ou fonctions (par exemple, TEMPSVAL("18:45")).' },
        },
    },
    TIME: {
        description: 'Renvoie le nombre décimal d’une heure précise. Si le format de cellule était Standard avant que la fonction ne soit entrée, le résultat est mis en forme en tant que date.',
        abstract: 'Renvoie le nombre décimal d’une heure précise. Si le format de cellule était Standard avant que la fonction ne soit entrée, le résultat est mis en forme en tant que date.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Obligatoire. Représente un nombre compris entre 0 (zéro) et 32767 indiquant l’heure. Toute valeur supérieure à 23 sera divisée par 24 et le reste sera traité comme la valeur horaire. Par exemple, TEMPS(27;0;0) = TEMPS(3;0;0) = 0,125 ou 03:00 (03:00 AM).' },
            minute: { name: 'minute', detail: 'Obligatoire. Représente un nombre compris entre 0 et 32767 indiquant les minutes. Toute valeur supérieure à 59 sera convertie en heures et en minutes. Par exemple, TEMPS(0;750;0) = TEMPS (12;30;0) = 0,520833 ou 12:30 (12:30 PM).' },
            second: { name: 'second', detail: 'Obligatoire. Représente un nombre compris entre 0 et 32767 indiquant les secondes. Toute valeur supérieure à 59 sera convertie en heures, minutes et secondes. Par exemple, TEMPS(0;0;2000) = TEMPS(0;33;22) = 0,023148 ou 00:33:20 (12:33:20 AM)' },
        },
    },
    TIMEVALUE: {
        description: 'Renvoie le nombre décimal de l’heure représentée par une chaîne de texte. Ce nombre décimal est une valeur comprise entre 0 (zéro) et 0,99988426, qui représente l’heure, de 0:00:00 (12:00:00 AM) à 23:59:59 (11:59:59 PM).',
        abstract: 'Renvoie le nombre décimal de l’heure représentée par une chaîne de texte. Ce nombre décimal est une valeur comprise entre 0 (zéro) et 0,99988426, qui représente l’heure, de 0:00:00 (12:00:00 AM) à 23:59:59 (11:59:59 PM).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Obligatoire. Représente une chaîne de texte qui indique une heure dans l’un des formats d’heure de Microsoft Excel, telle que les chaînes de texte "6:45 PM" et "18:45" entre guillemets.' },
        },
    },
    TO_DATE: {
        description: 'Convertit un nombre en date.',
        abstract: 'Convertit un nombre en date.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=fr',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: 'La fonction AUJOURDHUI retourne le numéro de série de la date actuelle. Le numéro de série est le code de date et d’heure utilisé par Microsoft Excel pour les calculs de date et d’heure. Si le format de la cellule était Standard avant que la fonction ne soit entrée, Excel modifie le format de la cellule en Date . Pour afficher le numéro de série, changez le format de la cellule en Standard ou Nombre .',
        abstract: 'La fonction AUJOURDHUI retourne le numéro de série de la date actuelle. Le numéro de série est le code de date et d’heure utilisé par Microsoft Excel pour les calculs de date et d’heure. Si le format de la cellule était Standard avant que la fonction ne soit entrée, Excel modifie le format de la cellule en Date . Pour afficher le numéro de série, changez le format de la cellule en Standard ou Nombre .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Renvoie le jour de la semaine correspondant à une date. Par défaut, le jour est donné sous forme d’un nombre entier compris entre 0 et 7.',
        abstract: 'Renvoie le jour de la semaine correspondant à une date. Par défaut, le jour est donné sous forme d’un nombre entier compris entre 0 et 7.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente un numéro séquentiel représentant la date du jour que vous cherchez. Les dates doivent être entrées en utilisant la fonction DATE, ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008;5;23) pour le 23e jour du mois de mai 2008. Des problèmes peuvent survenir si les dates sont entrées sous forme de texte.' },
            returnType: { name: 'return_type', detail: 'Optionnel. Représente le chiffre qui détermine le type d’information que la fonction renvoie.' },
        },
    },
    WEEKNUM: {
        description: 'Renvoie le numéro de semaine d’une date spécifique. Par exemple, la semaine contenant le 1er janvier est la première semaine de l’année ; elle est numérotée semaine 1.',
        abstract: 'Renvoie le numéro de semaine d’une date spécifique. Par exemple, la semaine contenant le 1er janvier est la première semaine de l’année ; elle est numérotée semaine 1.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente une date de la semaine. Les dates doivent être entrées en utilisant la fonction DATE, ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2008;5;23) pour le 23e jour du mois de mai 2008. Des problèmes peuvent survenir si les dates sont entrées sous forme de texte.' },
            returnType: { name: 'return_type', detail: 'Optionnel. Détermine quel jour est considéré comme le début de la semaine. La valeur par défaut est 1.' },
        },
    },
    WORKDAY: {
        description: 'Renvoie un nombre qui représente une date correspondant à une date (date de début) plus ou moins le nombre de jours ouvrés spécifié. Les jours ouvrés excluent les fins de semaine et toutes les dates identifiées comme étant des jours fériés. Utilisez la fonction SERIE.JOUR.OUVRE pour exclure les fins de semaine et les jours fériés lorsque vous calculez des échéances de factures, des heures de livraisons attendues ou le nombre de jours de travail effectués.',
        abstract: 'Renvoie un nombre qui représente une date correspondant à une date (date de début) plus ou moins le nombre de jours ouvrés spécifié. Les jours ouvrés excluent les fins de semaine et toutes les dates identifiées comme étant des jours fériés. Utilisez la fonction SERIE.JOUR.OUVRE pour exclure les fins de semaine et les jours fériés lorsque vous calculez des échéances de factures, des heures de livraisons attendues ou le nombre de jours de travail effectués.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Date qui représente la date de début.' },
            days: { name: 'days', detail: 'Obligatoire. Nombre de jours non hebdomadaires et non-hebdomadaires avant ou après start_date. Une valeur positive pour les jours donne une date future ; une valeur négative génère une date passée.' },
            holidays: { name: 'holidays', detail: 'Optionnel. Représente une liste facultative d\'une ou plusieurs dates à exclure du calendrier des jours de travail, comme les jours fériés ou d\'autres jours contractuellement chômés. Cette liste peut être soit une plage de cellules contenant les dates, soit une constante de matrice des numéros de série qui représentent les dates.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Cette fonction retourne le numéro de série de la date avant ou après un nombre spécifié de jours ouvrés avec des paramètres de week-end personnalisés. Les paramètres week-end facultatifs peuvent indiquer les jours de week-end et le nombre de jours. Notez que les jours de week-end et tous les jours spécifiés comme jours fériés ne sont pas considérés comme des jours ouvrés.',
        abstract: 'Cette fonction retourne le numéro de série de la date avant ou après un nombre spécifié de jours ouvrés avec des paramètres de week-end personnalisés. Les paramètres week-end facultatifs peuvent indiquer les jours de week-end et le nombre de jours. Notez que les jours de week-end et tous les jours spécifiés comme jours fériés ne sont pas considérés comme des jours ouvrés.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Date de départ, tronquée à sa partie entière.' },
            days: { name: 'days', detail: 'Obligatoire. Nombre de jours ouvrés avant ou après la date_départ. Une valeur positive donne une date future ; une valeur négative génère une date passée ; une valeur zéro produit le start_date déjà spécifié . L’offset de jour est tronqué en entier.' },
            weekend: { name: 'weekend', detail: 'Optionnel. S’il est utilisé, cela indique les jours de la semaine qui sont des jours de week-end et qui ne sont pas considérés comme des jours ouvrés. L’argument week-end est un nombre ou une chaîne de week-end qui spécifie quand les week-ends se produisent. Les valeurs du nombre de week-ends indiquent les jours du week-end comme indiqué ci-dessous.' },
            holidays: { name: 'holidays', detail: 'Il s’agit d’un argument facultatif à la fin de la syntaxe. Il spécifie un ensemble facultatif d’une ou plusieurs dates qui doivent être exclues du calendrier des jours ouvrés. Les jours fériés doivent être une plage de cellules qui contiennent les dates ou une constante de tableau des valeurs de série qui représentent ces dates. Le tri des dates ou des valeurs sérielles de l’argument jours_fériés peut être arbitraire.' },
        },
    },
    YEAR: {
        description: 'Renvoie l’année correspondant à une date. L’année est renvoyée sous la forme d’un nombre entier dans la plage 1900-9999.',
        abstract: 'Renvoie l’année correspondant à une date. L’année est renvoyée sous la forme d’un nombre entier dans la plage 1900-9999.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obligatoire. Représente le code de date de l’année que vous voulez trouver. Les dates doivent être entrées en utilisant la fonction DATE ou sous la forme de résultats d’autres formules ou fonctions. Par exemple, utilisez DATE(2025,5,23) pour le 23e jour de mai 2025. Des problèmes peuvent survenir si les dates sont entrées sous forme de texte.' },
        },
    },
    YEARFRAC: {
        description: 'FRACTION.ANNEE calcule la fraction de l’année représentée par le nombre de jours entre deux dates (la date_ début et la date_ fin ). Par exemple, vous pouvez utiliser la fonction de feuille de calcul FRACTION.ANNEE pour déterminer la proportion des profits ou des engagements d’une année entière correspondant à un terme donné.',
        abstract: 'FRACTION.ANNEE calcule la fraction de l’année représentée par le nombre de jours entre deux dates (la date_ début et la date_ fin ). Par exemple, vous pouvez utiliser la fonction de feuille de calcul FRACTION.ANNEE pour déterminer la proportion des profits ou des engagements d’une année entière correspondant à un terme donné.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/fr-fr/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obligatoire. Date qui représente la date de début.' },
            endDate: { name: 'end_date', detail: 'Obligatoire. Date qui représente la date de fin.' },
            basis: { name: 'basis', detail: 'Optionnel. Représente le type de la base de comptage des jours à utiliser.' },
        },
    },
};

export default locale;
