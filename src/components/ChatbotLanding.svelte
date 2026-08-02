<script lang="ts">
    // Página de venta del chatbot: se muestra en lugar del panel cuando la sede
    // tiene show_chatbot='0'. Activación autoservicio: el dueño confirma el
    // cambio al plan full en un diálogo y la activación es inmediata (queda
    // registrada con fecha/hora en el dashboard del chatbot-go).
    import { createEventDispatcher } from 'svelte'
    import Modal from '$root/components/Modal.svelte'
    import { postData } from '$root/services/httpClient.services'
    import { showToastSwal } from '$root/services/mi.swal'

    export let idsede: number | string
    export let nombreSede = ''

    const PRECIO = 'S/ 149.90'
    const dispatch = createEventDispatcher()

    let modalOpen = false
    // confirmar → procesando → listo
    let paso: 'confirmar' | 'procesando' | 'listo' = 'confirmar'

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

    function abrirConfirmacion() {
        paso = 'confirmar'
        modalOpen = true
    }

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    async function confirmarActivacion() {
        paso = 'procesando'
        try {
            // La espera mínima le da peso a la acción: la activación real toma ms.
            const [resp] = await Promise.all([
                postData('', 'activar-chatbot', { idsede }),
                sleep(2500),
            ])
            const json = await (resp as Response).json()
            if (json?.success === false) throw new Error(json?.error || 'rechazado')
            paso = 'listo'
        } catch (e) {
            modalOpen = false
            paso = 'confirmar'
            showToastSwal('error', 'No se pudo activar el chatbot, intente nuevamente', 4000)
        }
    }

    function comenzar() {
        modalOpen = false
        dispatch('activado')
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

        <button class="btn btn-success text-base px-6 py-2" on:click={abrirConfirmacion}>
            🚀 Solicitar activación
        </button>
    </div>
</div>

<Modal open={modalOpen} title="Activar chatbot · Plan Full" on:close={() => { if (paso !== 'procesando') modalOpen = false }}>
    <div slot="body" class="w-96 max-w-full text-center">
        {#if paso === 'confirmar'}
            <p class="text-sm text-left mb-3">Está por activar el chatbot para <b>{nombreSede || 'su sede'}</b> con el cambio al <b>Plan Full</b>:</p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <p class="text-3xl font-bold">{PRECIO}<span class="text-sm font-normal text-gray-500"> /mes</span></p>
                <p class="text-xs text-gray-500 mt-1">Se sumará a su facturación mensual de Papaya a partir de hoy.</p>
            </div>
            <p class="text-xs text-gray-500 text-left mb-4">Al confirmar, acepta el cambio de plan y el cobro mensual indicado. El chatbot quedará activo de inmediato.</p>
            <div class="flex justify-end gap-2">
                <button class="btn btn-sm fs-10" on:click={() => (modalOpen = false)}>Cancelar</button>
                <button class="btn btn-sm btn-success fs-10" on:click={confirmarActivacion}>Confirmar y activar</button>
            </div>
        {:else if paso === 'procesando'}
            <div class="py-8">
                <i class="fa fa-spinner fa-spin text-3xl text-blue-500"></i>
                <p class="text-sm font-semibold mt-3">Procesando activación…</p>
                <p class="text-xs text-gray-500 mt-1">Estamos encendiendo su chatbot, un momento por favor.</p>
            </div>
        {:else}
            <div class="py-6">
                <p class="text-4xl mb-2">🎉</p>
                <p class="text-base font-bold text-green-700">¡Su chatbot está activo!</p>
                <p class="text-xs text-gray-500 mt-1 mb-4">Ya puede configurar su carta, horarios y delivery. Recuerde instalar y conectar WhatsApp para empezar a atender.</p>
                <button class="btn btn-success" on:click={comenzar}>Comenzar a configurar</button>
            </div>
        {/if}
    </div>
</Modal>
