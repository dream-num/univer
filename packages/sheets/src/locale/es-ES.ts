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
            sheetCopy: '(Copia{0})',
            sheet: 'Hoja',
        },
        info: {
            overlappingSelections: 'No se puede usar ese comando en selecciones superpuestas',
            acrossMergedCell: 'A través de una celda combinada',
            partOfCell: 'Solo una parte de una celda combinada está seleccionada',
            hideSheet: 'No hay hojas visibles después de ocultar esta',
        },
        definedName: {
            nameEmpty: 'El nombre no puede estar vacío',
            nameDuplicate: 'El nombre ya existe',
            nameInvalid: 'El nombre no es válido',
            nameSheetConflict: 'El nombre entra en conflicto con el nombre de la hoja',
            formulaOrRefStringEmpty: 'La fórmula o la cadena de referencia no pueden estar vacías',
            nameConflict: 'El nombre entra en conflicto con el nombre de la función',
            defaultName: 'NombreDefinido',
        },
        permission: {
            dialog: {
                autoFillErr: 'El rango está protegido y no tienes permiso para autorrellenar. Para usar el autorrellenado, contacta al creador.',
                editErr: 'El rango está protegido y no tienes permiso de edición. Para editar, contacta al creador.',
                formulaErr: 'El rango o el rango referenciado está protegido, y no tienes permiso de edición. Para editar, contacta al creador.',
                insertOrDeleteMoveRangeErr: 'El rango insertado o eliminado se cruza con el rango protegido, y esta operación no es compatible por ahora.',
                insertRowColErr: 'El rango está protegido y no tienes permiso para insertar filas y columnas. Para insertar filas y columnas, contacta al creador.',
                moveRangeErr: 'El rango está protegido y no tienes permiso para mover la selección. Para mover la selección, contacta al creador.',
                moveRowColErr: 'El rango está protegido y no tienes permiso para mover filas y columnas. Para mover filas y columnas, contacta al creador.',
                operatorSheetErr: 'La hoja de cálculo está protegida y no tienes permiso para operar en ella. Para operar en la hoja de cálculo, contacta al creador.',
                removeRowColErr: 'El rango está protegido y no tienes permiso para eliminar filas y columnas. Para eliminar filas y columnas, contacta al creador.',
                setRowColStyleErr: 'El rango está protegido y no tienes permiso para establecer estilos de fila y columna. Para establecer estilos de fila y columna, contacta al creador.',
                setStyleErr: 'El rango está protegido y no tienes permiso para establecer estilos. Para establecer estilos, contacta al creador.',
            },
        },
        autoFill: {
            copy: 'Copiar celda',
            series: 'Rellenar serie',
            formatOnly: 'Solo formato',
            noFormat: 'Sin formato',
        },
        merge: {
            confirm: {
                title: 'Continuar la fusión solo conservará el valor de la celda superior izquierda, descartando los otros valores. ¿Estás seguro de continuar?',
                cancel: 'Cancelar fusión',
                confirm: 'Continuar fusión',
                warning: 'Advertencia',
                dismantleMergeCellWarning: 'Esto dividirá algunas celdas fusionadas. ¿Quieres continuar?',
            },
        },
    },
};

export default locale;
