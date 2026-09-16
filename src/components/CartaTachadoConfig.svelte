<script lang="ts">
    import { onMount } from 'svelte';
    import { getData, putData, postDataJSON } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { ConfigDelivery, ParametrosCostoDelivery } from '$root/types';

    // Vive en el mismo saco que el resto de la config del bot
    // (sede_costo_delivery.parametros) y se guarda con el mismo PUT completo:
    // sin DDL ni tabla aparte, igual que resumen_formato / personalidad_chatbot.
    export let configDelivery: ConfigDelivery;
    export let parametrosCostoDelivery: ParametrosCostoDelivery;
    // El panel la trae como string desde el API; el backend valida/castea.
    export let idsede: number | string;

    // Espejo del índice que vive en S3 (backend: carta.indice.service.ts).
    // `texto` es la clave del contrato con el backend: se compara por string
    // EXACTO, así que se round-tripea tal cual llegó (sin trim ni normalizar).
    type LineaIndice = { texto: string; iditem: number | null; agotado: boolean };
    type IndiceCarta = { lineas: LineaIndice[]; actualizado?: string };

    let indice: IndiceCarta | null = null;
    let cargando = false;
    let guardando = false;
    let previewUrl = '';

    // Sedes configuradas antes de esta opción (o cambio de sede en caliente):
    // arrancar en 'off' (comportamiento histórico: se envía el link de la carta).
    $: if (parametrosCostoDelivery && !parametrosCostoDelivery.carta_tachado) {
        parametrosCostoDelivery.carta_tachado = 'off'
    }
    $: modoActivo = !!parametrosCostoDelivery?.carta_tachado && parametrosCostoDelivery.carta_tachado !== 'off'
    $: agotadosMarcados = indice ? indice.lineas.filter((l) => l.agotado).length : 0
    $: lineasEnlazadas = indice ? indice.lineas.filter((l) => l.iditem !== null).length : 0

    // Al abrir el panel con el tachado ya encendido: leer el índice guardado.
    // Es un GET barato (no dispara OCR ni regenera imagen).
    onMount(() => {
        if (modoActivo) cargarIndice()
    })

    // El httpClient lanza Error('Error <status>: ...') sin tocar el body, así que
    // un 401 (cuerpo en texto plano 'Autentificacion Incorrecta') nunca se parsea
    // como JSON. Acá solo se traduce a un mensaje entendible.
    function avisarError(error: any, mensaje: string) {
        if (/\b401\b/.test(String(error?.message ?? ''))) {
            showToastSwal('error', 'Tu sesión expiró, vuelve a ingresar al panel', 4000)
            return
        }
        showToastSwal('error', mensaje, 3000)
    }

    async function guardarFlag() {
        try {
            configDelivery.parametros = parametrosCostoDelivery
            await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery)
            previewUrl = ''
            // Al encender por primera vez: leer la carta (OCR) para tener el listado.
            if (modoActivo && !indice) await indexar()
        } catch (error) {
            avisarError(error, 'Error al guardar la configuración de la carta')
        }
    }

    // GET del índice vigente: barato y sin efectos (no regenera la imagen).
    async function cargarIndice() {
        cargando = true
        try {
            const r: any = await getData('', `carta-indice/${idsede}`)
            indice = r?.indice ?? null
        } catch (error) {
            indice = null
            avisarError(error, 'No se pudo leer el índice de la carta')
        }
        cargando = false
    }

    // POST: OCR de la imagen actual. Idempotente en el backend (por ETag de S3),
    // así que es seguro llamarlo al encender el flag o tras subir una carta nueva.
    async function indexar() {
        cargando = true
        try {
            const r: any = await postDataJSON('', `carta-indexar/${idsede}`, {})
            indice = r?.indice ?? null
            // 200 con success:false / indice null = falla-abierto del backend
            // (sin imagen de carta, sin key de Vision o S3 caído).
            if (!indice) showToastSwal('error', 'No se pudo leer la carta. ¿Ya subiste la imagen de la carta?', 4000)
            else previewUrl = ''
        } catch (error) {
            avisarError(error, 'Error al leer la carta')
        }
        cargando = false
    }

    async function toggleAgotado(texto: string) {
        if (!indice || guardando) return
        const lineasPrevias = indice.lineas
        // Inmutable: nueva lista, nuevo objeto de línea (nada se muta en sitio).
        const lineas = lineasPrevias.map((l) => (l.texto === texto ? { ...l, agotado: !l.agotado } : l))
        indice = { ...indice, lineas }
        guardando = true
        try {
            // Textos verbatim: el backend matchea por string exacto.
            const textos = lineas.filter((l) => l.agotado).map((l) => l.texto)
            const res: any = await putData('', `carta-agotados/${idsede}`, { textos })
            // putData devuelve el Response crudo: recién con 200 se lee el body.
            if (res?.status !== 200) throw new Error(`Error ${res?.status}`)
            const body = await leerJson(res)
            if (body && body.success === false) throw new Error('El servidor no pudo guardar los agotados')
            previewUrl = ''
        } catch (error) {
            indice = { ...indice, lineas: lineasPrevias } // la UI no debe mentir
            avisarError(error, 'Error al guardar los platos agotados')
        }
        guardando = false
    }

    async function leerJson(res: Response) {
        try {
            return await res.json()
        } catch {
            return null // 200 sin JSON: se trata como "no sé", no como error
        }
    }

    // OJO: este GET invalida la ventana de 5 min y regenera la imagen en el
    // servidor. Se llama SOLO desde el botón, nunca de forma reactiva.
    async function verPreview() {
        cargando = true
        try {
            const r: any = await getData('', `carta-preview/${idsede}`)
            // tipo 'link' = el backend cayó al fallback (sin índice o sin imagen).
            previewUrl = r?.tipo === 'imagen' ? (r?.imagen_url || '') : ''
            if (!previewUrl) showToastSwal('error', 'No se pudo generar la vista previa de la carta', 3000)
        } catch (error) {
            previewUrl = ''
            avisarError(error, 'Error al generar la vista previa')
        }
        cargando = false
    }
</script>

<section class="card-1">
    <h4>Platos agotados en la carta</h4>
    <p class="text-sm text-gray-500 mb-2">
        El bot envía la imagen de tu carta con los platos sin stock tachados en rojo (se actualiza como máximo cada 5 minutos).
    </p>

    <label class="flex items-center gap-2 mb-1">
        <input type="radio" bind:group={parametrosCostoDelivery.carta_tachado} value="off" on:change={guardarFlag} name="carta-tachado" class="w-4 h-4">
        <span class="text-sm">Desactivado (enviar el link de la carta, como siempre)</span>
    </label>
    <label class="flex items-center gap-2 mb-1">
        <input type="radio" bind:group={parametrosCostoDelivery.carta_tachado} value="manual" on:change={guardarFlag} name="carta-tachado" class="w-4 h-4">
        <span class="text-sm">Manual (yo marco acá los platos agotados)</span>
    </label>
    <label class="flex items-center gap-2">
        <input type="radio" bind:group={parametrosCostoDelivery.carta_tachado} value="auto" on:change={guardarFlag} name="carta-tachado" class="w-4 h-4">
        <span class="text-sm">Automático (según el stock del día en el sistema)</span>
    </label>

    {#if modoActivo}
        <div class="mt-3 border-t pt-2">
            {#if cargando}
                <p class="fs-12 text-gray-500">Leyendo la carta…</p>
            {:else if indice}
                {#if parametrosCostoDelivery.carta_tachado === 'manual'}
                    <p class="fs-12 text-gray-500 mb-1">
                        Toca un plato para marcarlo como agotado ({agotadosMarcados} marcados):
                    </p>
                    <div class="flex flex-wrap gap-1">
                        {#each indice.lineas as l}
                            <button
                                type="button"
                                disabled={guardando}
                                class="fs-12 px-2 py-1 rounded border {l.agotado ? 'bg-red-100 line-through text-red-700 border-red-300' : 'bg-gray-50'}"
                                on:click={() => toggleAgotado(l.texto)}>{l.texto}</button>
                        {/each}
                    </div>
                {:else}
                    <p class="fs-12 text-gray-500">
                        {lineasEnlazadas} de {indice.lineas.length} líneas de la carta están enlazadas al stock del sistema.
                    </p>
                {/if}

                <div class="flex flex-wrap gap-2 mt-2">
                    <button class="btn btn-sm btn-primary" on:click={verPreview} disabled={cargando || guardando}>Ver cómo la verá el cliente</button>
                    <button class="btn btn-sm btn-secondary" on:click={indexar} disabled={cargando || guardando}>Volver a leer la carta</button>
                </div>

                {#if previewUrl}
                    <img src={previewUrl} alt="Vista previa de la carta con los agotados tachados" class="mt-2 max-w-full rounded border">
                {/if}
            {:else}
                <p class="fs-12 text-gray-500 mb-1">Todavía no se ha leído la imagen de tu carta.</p>
                <button class="btn btn-sm btn-primary" on:click={indexar} disabled={cargando}>Leer carta</button>
            {/if}
        </div>
    {/if}
</section>
