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
    design: {
        Accessibility: {
            closeBadge: 'Fechar selo',
            imageGallery: 'Galeria de imagens',
            image: 'Imagem {0} de {1}',
            zoomIn: 'Ampliar',
            zoomOut: 'Reduzir',
            resetZoom: 'Redefinir zoom',
            increment: 'Incrementar',
            decrement: 'Diminuir',
        },
        Confirm: {
            cancel: 'cancelar',
            confirm: 'ok',
        },
        CascaderList: {
            empty: 'Nenhum',
        },
        Calendar: {
            year: '',
            weekDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            months: [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ],
            ariaLabels: {
                previousMonth: 'Mês anterior',
                nextMonth: 'Próximo mês',
                selectYear: 'Selecionar ano',
                selectMonth: 'Selecionar mês',
            },
        },
        Select: {
            empty: 'Nenhum',
        },
        ColorPicker: {
            more: 'Mais Cores',
            cancel: 'cancelar',
            confirm: 'ok',
        },
        GradientColorPicker: {
            linear: 'Linear',
            radial: 'Radial',
            angular: 'Angular',
            diamond: 'Diamante',
            offset: 'Deslocamento',
            angle: 'Ângulo',
            flip: 'Inverter',
            delete: 'Excluir',
            transparency: 'Transparência',
        },
    },
};

export default locale;
