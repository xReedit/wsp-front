import {PUBLIC_URL_VIEW_BUCKET} from '$env/static/public'
import { showToastSwal } from './mi.swal'

export const inputConMayusculas = (field: any) => { 
    field.target.value = field.target.value.toUpperCase()
}

export const conMayusculas = (field: string) => {
    return field.toUpperCase()
}

export const convertValuesUpperCase = (obj: any): object => {
    for (let x in obj) {
        obj[x] = obj[x].toUpperCase();
    }

    return obj;
}

export function formatCurrency(numStr: string, currencyCode: string = "PEN"): string {
    const num = parseFloat(numStr);
    if (isNaN(num)) {
        return "0.00";
    }
    const formatter = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });
    return formatter.format(num)
}

export function removeComaNum(numeroStr: string): number {
    // Reemplaza la coma por una cadena vacía
    const numeroSinComa = numeroStr.replace(",", "");

    // Convierte la cadena en un número de punto flotante
    const numero = parseFloat(numeroSinComa);

    // Devuelve el número
    return numero;
}

export function primeraLetraMayuscula(cadena: string): string {
    // Si la cadena está vacía, devuelve una cadena vacía
    if (!cadena) {return ""}
    if (cadena.length === 0) {
        return "";
    }

    // Convierte la primera letra a mayúscula y devuelve la cadena modificada
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}

export function getNomPerido(periodo): string {
    const mm = periodo.split('-')
    return `${getNomMes(mm[1])} ${mm[0]}`
}


function getNomMes(mm): string {
    const _listMes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return _listMes[mm - 1]
}

export function imprimirHTML(html: string): void {
    const ventana = window.open('', '', 'width=800,height=600');
    if (ventana) {
        ventana.document.open();
        ventana.document.write(html);
        ventana.document.close();
        ventana.print();
    } else {
        console.error('No se pudo abrir la ventana de impresión.');
    }
}


export function getImageUrl(fileName: string): string {
    return `${PUBLIC_URL_VIEW_BUCKET}${fileName}`;
} 

export function copiarAlPortapapeles(texto: string): Promise<void> {
    showToastSwal('success', 'Link tienda virtual copiado.')
    return navigator.clipboard.writeText(texto);    
}