<script lang="ts">
    // Página de venta del chatbot: se muestra en lugar del panel cuando la sede
    // tiene show_chatbot='0'. El botón registra la solicitud en api-restobar y
    // ésta aparece en el dashboard del chatbot-go, desde donde se activa.
    import { onMount } from 'svelte'
    import { getData, postData } from '$root/services/httpClient.services'
    import { showToastSwal } from '$root/services/mi.swal'

    export let idsede: number | string
    export let nombreSede = ''

    const PRECIO = 'S/ 149.90'

    let solicitado = false
    let enviando = false

    const FEATURES = [
        { icon: '💬', titulo: 'Atiende WhatsApp 24/7', detalle: 'Responde al instante, toma pedidos completos y nunca deja un cliente en visto, ni de madrugada.' },
        { icon: '🎙️', titulo: 'Entiende audios', detalle: 'Sus clientes pueden hablar en lugar de escribir: el bot transcribe y entiende los mensajes de voz.' },
        { icon: '📖', titulo: 'Envía su carta', detalle: 'Comparte la carta actualizada de su restaurante y resuelve dudas sobre platos y precios.' },
        { icon: '🛵', titulo: 'Delivery con costo automático', detalle: 'Calcula el costo de entrega por distancia o por zonas que usted dibuja en un mapa.' },
        { icon: '💳', titulo: 'Cobra como usted prefiera', detalle: 'Efectivo, Yape, Plin o tarjeta: el bot indica el método de pago y el número de billetera de su sede.' },
        { icon: '📅', titulo: 'Reservas y pedidos programados', detalle: '"Me lo llevan a la 1pm" o "mesa para 6 el sábado": el bot agenda la hora y lo registra.' },
        { icon: '🔔', titulo: 'Recupera ventas', detalle: 'Si un cliente dejó el pedido a medias, el bot le envía un recordatorio para cerrarlo.' },
        { icon: '🧾', titulo: 'Pedidos directo a su sistema', detalle: 'Cada pedido confirmado entra a su sistema Papaya como cualquier otro: cocina, caja y reparto.' },
    ]

    onMount(async () => {
        try {
            const r = await getData('', `solicitud-chatbot/${idsede}`)
            solicitado = Boolean(r?.solicitado)
        } catch (e) {
            // sin estado previo: el botón queda disponible
        }
    })

    async function solicitar() {
        if (enviando || solicitado) return
        enviando = true
        try {
            await postData('', 'solicitar-chatbot', { idsede })
            solicitado = true
            showToastSwal('success', '¡Solicitud enviada! Nos pondremos en contacto para activar su chatbot.', 5000)
        } catch (e) {
            showToastSwal('error', 'No se pudo enviar la solicitud, intente nuevamente', 4000)
        } finally {
            enviando = false
        }
    }
</script>

<div class="max-w-3xl mx-auto text-center py-6 px-4">
    <h2 class="text-2xl font-bold mb-1">🍤 Piter, el chatbot de {nombreSede || 'su restaurante'}</h2>
    <p class="text-gray-500 mb-6">Un vendedor que atiende su WhatsApp las 24 horas, toma pedidos sin errores y no pide días libres.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
        {#each FEATURES as f}
            <div class="border rounded-lg p-3 flex gap-3 items-start">
                <span class="text-2xl">{f.icon}</span>
                <div>
                    <p class="font-semibold text-sm">{f.titulo}</p>
                    <p class="text-xs text-gray-500">{f.detalle}</p>
                </div>
            </div>
        {/each}
    </div>

    <div class="border-2 border-blue-500 rounded-xl p-6 inline-block bg-blue-50">
        <p class="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Plan Full</p>
        <p class="text-4xl font-bold mb-1">{PRECIO}<span class="text-base font-normal text-gray-500"> /mes</span></p>
        <p class="text-xs text-gray-500 mb-4">Todas las funciones incluidas. Sin instalación adicional: funciona con su sistema Papaya.</p>

        {#if solicitado}
            <div class="bg-green-100 border border-green-300 rounded-lg px-4 py-3 text-green-700 text-sm font-semibold">
                ✓ Solicitud enviada — nos pondremos en contacto para la activación
            </div>
        {:else}
            <button class="btn btn-success text-base px-6 py-2" disabled={enviando} on:click={solicitar}>
                {#if enviando}
                    <i class="fa fa-spinner fa-spin"></i> Enviando...
                {:else}
                    🚀 Solicitar activación
                {/if}
            </button>
        {/if}
    </div>
</div>
