// ==========================================
// Interfaces principales del sistema
// ==========================================

export interface InfoSede {
    idsede_restobar: string
    nombre: string
    idesede: string
}

export interface SedeApi {
    idsede: string
    idorg: string
    nombre: string
    ciudad: string
    codigo_postal: string
    latitude: string
    longitude: string
    link_carta: string
    metodo_pago_aceptados_chatbot: string
    idusuario: string
    [key: string]: any
}

export interface Carta {
    idcategoria: string
    idsede: string
    idorg: string
    descripcion: string
    hora_ini: string
    hora_fin: string
    dia_disponible: string
    visible_cliente: string
    url_carta: string | null
    img_visible: boolean
    nom_dias: string
    [key: string]: any
}

export interface CanalConsumo {
    idtipo_consumo: number
    descripcion: string
    titulo: string
    estado: number
    habilitado_chatbot: string
    checked: boolean
}

export interface TipoPago {
    idtipo_pago: number
    descripcion: string
    checked: boolean
}

export interface ConfigDelivery {
    idsede_costo_delivery: string
    ciudades: string
    parametros: ParametrosCostoDelivery
    [key: string]: any
}

export interface ParametrosCostoDelivery {
    km_base: number | null
    km_base_costo: number | null
    km_adicional_costo: number | null
    km_limite: number | null
    costo_fijo: number
    obtener_coordenadas_del_cliente: 'SI' | 'NO'
}

export interface UserBot {
    idusuario: string
    [key: string]: any
}

export interface Conversacion {
    id?: number
    telefono: string
    push_name: string
    request_human_attention: boolean
    fecha_pausa?: string
}

export interface SessionState {
    value: boolean
    scanqr: boolean
    message: string
}

export interface Impresora {
    [key: string]: any
}

export interface ReglaCarta {
    [key: string]: any
}

export interface SeccionMasPiden {
    [key: string]: any
}

export interface SolicitudPermiso {
    idpermiso_remoto: string
    hora: string
    fecha: string
    atendido: string
    sede: {
        idorg: string
        idsede: string
    }
    data: {
        tipo_permiso: string
        solicitud: string
        solicitudHtml?: string
        motivo: string
        nomusuario_admin: string
        nomusuario_solicita: string
        data: any
    }
}

export interface DiaSemana {
    numdia: number
    nomdia: string
    checked?: boolean
}

export interface HorarioDia {
    idsede_horario_trabajo?: number
    idsede: number
    de: string
    a: string
    estado: number
    numdia: string
    desdia: string | null
}

// ==========================================
// Tipos para HTTP Client
// ==========================================

export interface HttpRequestOptions {
    controller: string
    event: string
    payload?: any
    withToken?: boolean
}

export interface HttpResponse<T = any> {
    success: boolean
    data: T
    error?: string
}
