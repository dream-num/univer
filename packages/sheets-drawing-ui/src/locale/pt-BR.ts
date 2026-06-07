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
    'sheets-drawing-ui': {
        title: 'Imagem',
        uploadLoading: {
            loading: 'Carregando..., restante',
        },

        upload: {
            float: 'Imagem flutuante',
            cell: 'Imagem de célula',
        },

        panel: {
            title: 'Editar imagem',
        },

        save: {
            title: 'Salvar imagens de célula',
            menuLabel: 'Salvar imagens de célula',
            imageCount: 'Contagem de imagens',
            fileNameConfig: 'Nome do arquivo',
            useRowCol: 'Usar endereço da célula (A1, B2...)',
            useColumnValue: 'Usar valor da coluna',
            selectColumn: 'Selecionar coluna',
            cancel: 'Cancelar',
            confirm: 'Salvar',
            saving: 'Salvando...',
            error: 'Falha ao salvar imagens de célula',
        },
        'image-popup': {
            replace: 'Substituir',
            delete: 'Excluir',
            edit: 'Editar',
            crop: 'Cortar',
            reset: 'Redefinir tamanho',
            flipH: 'Inverter horizontalmente',
            flipV: 'Inverter verticalmente',
        },
        'update-status': {
            exceedMaxSize: 'O tamanho da imagem excede o limite, o limite é {0}M',
            invalidImageType: 'Tipo de imagem inválido',
            exceedMaxCount: 'Apenas {0} imagens podem ser enviadas de cada vez',
            invalidImage: 'Imagem inválida',
        },
        'drawing-anchor': {
            title: 'Propriedades da âncora',
            both: 'Mover e dimensionar com as células',
            position: 'Mover, mas não dimensionar com as células',
            none: 'Não mover nem dimensionar com as células',
        },
        'cell-image': {
            pasteTitle: 'Colar como imagem de célula',
            pasteContent: 'Colar uma imagem de célula substituirá o conteúdo existente da célula, continuar colando',
            pasteError: 'Copiar e colar imagem de célula da planilha não é suportado nesta unidade',
        },
        permission: {
            dialog: {
                editErr: 'O intervalo está protegido e você não tem permissão de edição. Para editar, entre em contato com o criador.',
            },
        },
        shortcut: {
            'drawing-view': 'Visualização do desenho',
            'drawing-move-down': 'Mover desenho para baixo',
            'drawing-move-up': 'Mover desenho para cima',
            'drawing-move-left': 'Mover desenho para esquerda',
            'drawing-move-right': 'Mover desenho para direita',
            'drawing-delete': 'Excluir desenho',
        },
    },
};

export default locale;
