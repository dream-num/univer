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
    sheets: {
        tabs: {
            sheetCopy: '(Cópia{0})',
            sheet: 'Planilha',
        },
        info: {
            overlappingSelections: 'Não é possível usar esse comando em seleções sobrepostas',
            acrossMergedCell: 'Através de uma célula mesclada',
            partOfCell: 'Apenas parte de uma célula mesclada está selecionada',
            hideSheet: 'Nenhuma planilha visível após ocultar esta',
        },
        definedName: {
            nameEmpty: 'O nome não pode estar vazio',
            nameDuplicate: 'O nome já existe',
            nameInvalid: 'O nome é inválido',
            nameSheetConflict: 'O nome entra em conflito com o nome da planilha',
            formulaOrRefStringEmpty: 'A fórmula ou a string de referência não pode estar vazia',
            nameConflict: 'O nome entra em conflito com o nome da função',
            defaultName: 'NomeDefinido',
        },
        permission: {
            dialog: {
                autoFillErr: 'O intervalo está protegido e você não tem permissão para preenchimento automático. Para usar o preenchimento automático, entre em contato com o criador.',
                editErr: 'O intervalo está protegido e você não tem permissão de edição. Para editar, entre em contato com o criador.',
                formulaErr: 'O intervalo ou o intervalo referenciado está protegido e você não tem permissão de edição. Para editar, entre em contato com o criador.',
                insertOrDeleteMoveRangeErr: 'O intervalo inserido ou excluído intersecta com o intervalo protegido, e esta operação não é suportada por enquanto.',
                insertRowColErr: 'O intervalo está protegido e você não tem permissão para inserir linhas e colunas. Para inserir linhas e colunas, entre em contato com o criador.',
                moveRangeErr: 'O intervalo está protegido e você não tem permissão para mover a seleção. Para mover a seleção, entre em contato com o criador.',
                moveRowColErr: 'O intervalo está protegido e você não tem permissão para mover linhas e colunas. Para mover linhas e colunas, entre em contato com o criador.',
                operatorSheetErr: 'A planilha está protegida e você não tem permissão para operar a planilha. Para operar a planilha, entre em contato com o criador.',
                removeRowColErr: 'O intervalo está protegido e você não tem permissão para excluir linhas e colunas. Para excluir linhas e colunas, entre em contato com o criador.',
                setRowColStyleErr: 'O intervalo está protegido e você não tem permissão para definir estilos de linhas e colunas. Para definir estilos de linhas e colunas, entre em contato com o criador.',
                setStyleErr: 'O intervalo está protegido e você não tem permissão para definir estilos. Para definir estilos, entre em contato com o criador.',
            },
        },
        autoFill: {
            copy: 'Copiar Célula',
            series: 'Preencher Série',
            formatOnly: 'Apenas Formato',
            noFormat: 'Sem Formato',
        },
        merge: {
            confirm: {
                title: 'Continuar a mesclagem manterá apenas o valor da célula superior esquerda, descartando os outros valores. Tem certeza de que deseja continuar?',
                cancel: 'Cancelar mesclagem',
                confirm: 'Continuar mesclagem',
                warning: 'Aviso',
                dismantleMergeCellWarning: 'Isso fará com que algumas células mescladas sejam divididas. Deseja continuar?',
            },
        },
    },
};

export default locale;
