<script lang="ts">
    // Zonas de reparto con precio fijo por zona: lista + modal con editor de
    // mapa. Las zonas viven en parametros.zonas (JSON de sede_costo_delivery);
    // el padre (DeliveryConfig) guarda con el endpoint de siempre al recibir
    // `change`. El ORDEN de la lista es la prioridad: en solape gana la de
    // más arriba (mismo criterio que el backend).
    import { createEventDispatcher } from 'svelte'
    import type { GeometriaZona, LatLng, ParametrosCostoDelivery, ZonaDelivery } from '$root/types'
    import { showAlertSwalDecision } from '$root/services/mi.swal'
    import MapaZonaEditor from './MapaZonaEditor.svelte'

    export let parametrosCostoDelivery: ParametrosCostoDelivery
    export let centroSede: LatLng | null = null

    const dispatch = createEventDispatcher()

    const PALETA = ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#795548']
    const colorDe = (i: number) => PALETA[i % PALETA.length]

    $: zonas = parametrosCostoDelivery.zonas || []

    // ── Estado del modal ──
    let modalOpen = false
    let editIndex: number | null = null // null = zona nueva
    let nombre = ''
    let costo: number | null = null
    let tiempo: number | null = null
    let tipoZona: 'poligono' | 'circulo' = 'poligono'
    let geometria: GeometriaZona | null = null
    let mapaRef: MapaZonaEditor

    function abrirNueva() {
        editIndex = null
        nombre = ''
        costo = null
        tiempo = null
        tipoZona = 'poligono'
        geometria = null
        modalOpen = true
    }

    function abrirEditar(i: number) {
        const z = zonas[i]
        editIndex = i
        nombre = z.nombre
        costo = z.costo
        tiempo = z.tiempo_aprox_entrega ?? null
        tipoZona = z.tipo
        geometria = { tipo: z.tipo, puntos: z.puntos, centro: z.centro, radio_km: z.radio_km }
        modalOpen = true
    }

    function cambiarTipo(nuevo: 'poligono' | 'circulo') {
        if (tipoZona === nuevo) return
        tipoZona = nuevo
        geometria = null
        mapaRef?.limpiar()
    }

    function guardar() {
        if (!geometria || !nombre.trim() || costo === null || costo < 0) return
        const zona: ZonaDelivery = {
            nombre: nombre.trim(),
            costo: Number(costo),
            tiempo_aprox_entrega: tiempo && tiempo > 0 ? Number(tiempo) : null,
            tipo: geometria.tipo,
            puntos: geometria.puntos,
            centro: geometria.centro,
            radio_km: geometria.radio_km,
        }
        const nuevas = [...zonas]
        if (editIndex === null) nuevas.push(zona)
        else nuevas[editIndex] = zona
        parametrosCostoDelivery.zonas = nuevas // reasignar para reactividad
        modalOpen = false
        dispatch('change')
    }

    async function eliminar(i: number) {
        const r = await showAlertSwalDecision({
            title: `¿Eliminar la zona "${zonas[i].nombre}"?`,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
        })
        if (!r?.isConfirmed) return
        parametrosCostoDelivery.zonas = zonas.filter((_, idx) => idx !== i)
        dispatch('change')
    }

    function mover(i: number, delta: number) {
        const j = i + delta
        if (j < 0 || j >= zonas.length) return
        const nuevas = [...zonas]
        ;[nuevas[i], nuevas[j]] = [nuevas[j], nuevas[i]]
        parametrosCostoDelivery.zonas = nuevas
        dispatch('change')
    }

    // Zonas de contexto en el mapa (todas menos la que se edita).
    $: zonasExistentes = zonas
        .map((z, i) => ({ nombre: z.nombre, color: colorDe(i), geometria: { tipo: z.tipo, puntos: z.puntos, centro: z.centro, radio_km: z.radio_km } as GeometriaZona }))
        .filter((_, i) => i !== editIndex)
</script>

<div>
    <p class="text-sm text-gray-500 mb-2">
        Dibuja zonas en el mapa y asigna un costo de entrega fijo a cada una.
        Fuera de las zonas no hay cobertura de delivery.
    </p>

    {#if zonas.length === 0}
        <p class="text-sm text-gray-400 text-center py-3">Aún no hay zonas. Agrega la primera.</p>
    {:else}
        <table class="w-100 fs-12 mt-2 w-full">
            <thead>
                <tr class="text-gray-500 text-left">
                    <th>Zona</th>
                    <th>Tipo</th>
                    <th align="center">Costo S/</th>
                    <th align="center">Tiempo</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each zonas as z, i}
                    <tr class="border-b">
                        <td class="py-1">
                            <span class="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style="background:{colorDe(i)}"></span>
                            <span class="font-bold">{z.nombre}</span>
                        </td>
                        <td class="text-gray-500">{z.tipo === 'poligono' ? 'Polígono' : 'Círculo'}</td>
                        <td align="center">{z.costo}</td>
                        <td align="center" class="text-gray-500">{z.tiempo_aprox_entrega ? `${z.tiempo_aprox_entrega} min` : '—'}</td>
                        <td align="right" class="whitespace-nowrap">
                            <button class="btn btn-sm fs-10" title="Subir prioridad" disabled={i === 0} on:click={() => mover(i, -1)}>▲</button>
                            <button class="btn btn-sm fs-10" title="Bajar prioridad" disabled={i === zonas.length - 1} on:click={() => mover(i, 1)}>▼</button>
                            <button class="btn btn-sm fs-10" on:click={() => abrirEditar(i)}>Editar</button>
                            <button class="btn btn-sm btn-danger fs-10" on:click={() => eliminar(i)}>Eliminar</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {#if zonas.length > 1}
            <p class="text-[11px] text-gray-400 mt-1">Si dos zonas se superponen, se aplica la que esté más arriba.</p>
        {/if}
    {/if}

    <button class="btn btn-sm fs-10 mt-2" on:click={abrirNueva}>+ Agregar zona</button>
</div>

{#if modalOpen}
    <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-4 w-full max-w-2xl max-h-full overflow-y-auto">
            <h4 class="font-bold mb-3">{editIndex === null ? 'Nueva zona de reparto' : `Editar zona "${nombre}"`}</h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <label class="text-xs text-gray-600">
                    Nombre
                    <input type="text" bind:value={nombre} placeholder="Ej: Centro" class="w-full border rounded px-2 py-1 text-sm mt-1" />
                </label>
                <label class="text-xs text-gray-600">
                    Costo de entrega S/
                    <input type="number" min="0" step="0.5" bind:value={costo} class="w-full border rounded px-2 py-1 text-sm mt-1" />
                </label>
                <label class="text-xs text-gray-600">
                    Tiempo aprox. (min, opcional)
                    <input type="number" min="0" step="5" bind:value={tiempo} class="w-full border rounded px-2 py-1 text-sm mt-1" />
                </label>
            </div>

            <div class="flex items-center gap-4 mb-2 text-sm">
                <label class="inline-flex items-center gap-1">
                    <input type="radio" checked={tipoZona === 'poligono'} on:change={() => cambiarTipo('poligono')} name="tipo-zona" />
                    Polígono
                </label>
                <label class="inline-flex items-center gap-1">
                    <input type="radio" checked={tipoZona === 'circulo'} on:change={() => cambiarTipo('circulo')} name="tipo-zona" />
                    Círculo
                </label>
            </div>

            {#key tipoZona}
                <MapaZonaEditor
                    bind:this={mapaRef}
                    tipo={tipoZona}
                    bind:geometria
                    color={colorDe(editIndex === null ? zonas.length : editIndex)}
                    {zonasExistentes}
                    centroInicial={centroSede}
                />
            {/key}

            <div class="flex justify-end gap-2 mt-3">
                <button class="btn btn-sm fs-10" on:click={() => (modalOpen = false)}>Cancelar</button>
                <button
                    class="btn btn-sm btn-success fs-10"
                    disabled={!geometria || !nombre.trim() || costo === null || costo < 0}
                    on:click={guardar}
                >
                    Guardar zona
                </button>
            </div>
        </div>
    </div>
{/if}
