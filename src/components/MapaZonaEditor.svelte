<script lang="ts">
    /**
     * Editor de una zona de reparto sobre Leaflet + OSM (portado de
     * restobar-2026 MapaZonaEditor.svelte, Svelte 5 → Svelte 4).
     *
     * - tipo='poligono': clic agrega vértice; vértices arrastrables; botón
     *   "Limpiar". Emite { tipo:'poligono', puntos:[{lat,lng}] } (>= 3 puntos).
     * - tipo='circulo': clic fija el centro; el radio se controla con un input
     *   (km). Emite { tipo:'circulo', centro:{lat,lng}, radio_km }.
     * - zonasExistentes: se pintan tenues para ubicarse respecto al resto.
     *
     * Leaflet es solo-cliente: import dinámico en onMount (SSR-safe).
     * Sin leaflet-draw: dibujo a mano.
     */
    import { onDestroy, onMount } from 'svelte'
    import 'leaflet/dist/leaflet.css'
    import type { GeometriaZona, LatLng as Punto } from '$root/types'

    export let tipo: 'poligono' | 'circulo' = 'poligono'
    export let geometria: GeometriaZona | null = null
    export let color = '#2196f3'
    export let zonasExistentes: { nombre: string; geometria: GeometriaZona; color?: string }[] = []
    // Centro inicial del mapa: coordenadas de la sede (fallback Lima).
    export let centroInicial: Punto | null = null

    const DEFAULT_CENTER: [number, number] = [-12.0464, -77.0428] // Lima

    let el: HTMLDivElement
    let L: any = null
    let map: any = null
    let capaActiva: any = null // L.Polygon | L.Circle en edición
    let vertices: any[] = [] // markers de vértice (polígono)
    let puntos: Punto[] = []
    let radioKm = 1
    let centro: Punto | null = null

    const round = (n: number) => Number(n.toFixed(7))

    function emitir(): void {
        if (tipo === 'poligono') {
            geometria = puntos.length >= 3 ? { tipo: 'poligono', puntos: [...puntos] } : null
        } else {
            geometria = centro ? { tipo: 'circulo', centro, radio_km: radioKm } : null
        }
    }

    function redibujarPoligono(): void {
        if (!map || !L) return
        if (capaActiva) {
            map.removeLayer(capaActiva)
            capaActiva = null
        }
        for (const v of vertices) map.removeLayer(v)
        vertices = []
        if (puntos.length > 0) {
            capaActiva = L.polygon(
                puntos.map((p) => [p.lat, p.lng]),
                { color, weight: 2, fillOpacity: 0.2 },
            ).addTo(map)
            puntos.forEach((p, i) => {
                const vm = L.circleMarker([p.lat, p.lng], {
                    radius: 6,
                    color: '#fff',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 1,
                }).addTo(map)
                vm.on('mousedown', () => {
                    map.dragging.disable()
                    const move = (e: { latlng: Punto }) => {
                        puntos[i] = { lat: round(e.latlng.lat), lng: round(e.latlng.lng) }
                        redibujarPoligono()
                    }
                    const up = () => {
                        map.off('mousemove', move)
                        map.off('mouseup', up)
                        map.dragging.enable()
                        emitir()
                    }
                    map.on('mousemove', move)
                    map.on('mouseup', up)
                })
                vertices.push(vm)
            })
        }
    }

    function redibujarCirculo(): void {
        if (!map || !L) return
        if (capaActiva) {
            map.removeLayer(capaActiva)
            capaActiva = null
        }
        if (centro) {
            capaActiva = L.circle([centro.lat, centro.lng], {
                radius: radioKm * 1000,
                color,
                weight: 2,
                fillOpacity: 0.2,
            }).addTo(map)
        }
    }

    export function limpiar(): void {
        puntos = []
        centro = null
        redibujarPoligono()
        redibujarCirculo()
        emitir()
    }

    onMount(async () => {
        const mod = await import('leaflet')
        L = (mod as any).default ?? mod

        const vista: [number, number] =
            centroInicial && Number.isFinite(centroInicial.lat) && Number.isFinite(centroInicial.lng) && centroInicial.lat !== 0
                ? [centroInicial.lat, centroInicial.lng]
                : DEFAULT_CENTER

        map = L.map(el, { zoomControl: true }).setView(vista, 14)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        // Pintar zonas existentes (tenues).
        for (const z of zonasExistentes) {
            const col = z.color || '#94a3b8'
            if (z.geometria.tipo === 'poligono' && z.geometria.puntos) {
                L.polygon(
                    z.geometria.puntos.map((p) => [p.lat, p.lng]),
                    { color: col, weight: 1, fillOpacity: 0.08, dashArray: '4' },
                ).addTo(map)
            } else if (z.geometria.tipo === 'circulo' && z.geometria.centro) {
                L.circle([z.geometria.centro.lat, z.geometria.centro.lng], {
                    radius: (z.geometria.radio_km || 0) * 1000,
                    color: col,
                    weight: 1,
                    fillOpacity: 0.08,
                    dashArray: '4',
                }).addTo(map)
            }
        }

        // Hidratar desde geometria inicial (editar zona existente).
        if (geometria?.tipo === 'poligono' && geometria.puntos) {
            puntos = geometria.puntos.map((p) => ({ ...p }))
            redibujarPoligono()
            if (puntos[0]) map.setView([puntos[0].lat, puntos[0].lng], 14)
        } else if (geometria?.tipo === 'circulo' && geometria.centro) {
            centro = { ...geometria.centro }
            radioKm = geometria.radio_km || 1
            redibujarCirculo()
            map.setView([centro.lat, centro.lng], 14)
        }

        map.on('click', (e: { latlng: Punto }) => {
            const p = { lat: round(e.latlng.lat), lng: round(e.latlng.lng) }
            if (tipo === 'poligono') {
                puntos = [...puntos, p]
                redibujarPoligono()
            } else {
                centro = p
                redibujarCirculo()
            }
            emitir()
        })

        // El mapa suele nacer dentro de un modal: recalcular tamaño al montar.
        setTimeout(() => map?.invalidateSize(), 0)
    })

    // Cambiar radio en vivo (modo círculo). Guard `map`: no correr antes de onMount.
    $: if (radioKm && tipo === 'circulo' && centro && map) {
        redibujarCirculo()
        emitir()
    }

    onDestroy(() => {
        map?.remove()
        map = null
    })
</script>

<div class="flex flex-col gap-2">
    <div class="flex items-center justify-between gap-2 flex-wrap">
        {#if tipo === 'poligono'}
            <span class="text-xs text-gray-500">Toca el mapa para marcar los límites de la zona ({puntos.length} puntos).</span>
        {:else}
            <label class="text-sm inline-flex items-center gap-1">
                Radio: <input type="number" min="0.1" step="0.1" bind:value={radioKm} class="w-20 border rounded px-2 py-1 text-sm" /> km
            </label>
        {/if}
        <button type="button" class="btn btn-sm fs-10" on:click={limpiar}>Limpiar mapa</button>
    </div>
    <div bind:this={el} class="w-full rounded border overflow-hidden" style="height: 320px;" role="application" aria-label="Mapa para dibujar la zona de reparto"></div>
</div>
