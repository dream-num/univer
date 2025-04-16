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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    toolbar: {
        heading: {
            normal: 'Обычный текст',
            title: 'Заголовок',
            subTitle: 'Подзаголовок',
            1: 'Заголовок 1',
            2: 'Заголовок 2',
            3: 'Заголовок 3',
            4: 'Заголовок 4',
            5: 'Заголовок 5',
            6: 'Заголовок 6',
            tooltip: 'Установить заголовок',
        },
    },
    ribbon: {
        start: 'Начало',
        insert: 'Вставка',
        formulas: 'Формулы',
        data: 'Данные',
        view: 'Вид',
        others: 'Другие',
        more: 'Больше',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'Ярлыки',
    },
    shortcut: {
        undo: 'Отменить',
        redo: 'Повторить',
        cut: 'Вырезать',
        copy: 'Копировать',
        paste: 'Вставить',
        'shortcut-panel': 'Переключить панель ярлыков',
    },
    'common-edit': 'Общие команды редактирования',
    'toggle-shortcut-panel': 'Переключить панель ярлыков',
    clipboard: {
        authentication: {
            title: 'Доступ запрещен',
            content: 'Пожалуйста, разрешите Univer доступ к вашему буферу обмена.',
        },
    },
    textEditor: {
        formulaError: 'Пожалуйста, введите корректную формулу, например =SUM(A1)',
        rangeError: 'Пожалуйста, введите корректный диапазон, например A1:B10',
    },
    rangeSelector: {
        title: 'Выберите диапазон данных',
        addAnotherRange: 'Добавить диапазон',
        buttonTooltip: 'Выбрать диапазон данных',
        placeHolder: 'Выберите диапазон или введите.',
        confirm: 'Подтвердить',
        cancel: 'Отменить',
    },
    'global-shortcut': 'Глобальные ярлыки',
    'zoom-slider': {
        resetTo: 'Сбросить до',
    },
};

export default locale;
