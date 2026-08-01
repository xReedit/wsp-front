<script lang="ts">
    // Modal de recarga: elige paquete → checkout Niubiz → confirmación
    // server-side. El monto mostrado viene del backend, nunca se calcula aquí.
    import { createEventDispatcher } from 'svelte'
    import Modal from '$root/components/Modal.svelte'
    import {
        confirmarPagoChatbot,
        getPacksChatbot,
        iniciarPagoChatbot,
        type Pack,
        type Saldo,
    } from '$root/services/billing.services'
    import { abrirCheckoutNiubiz } from '$root/services/niubiz.checkout'
    import { showAlertSwalDecision, showToastSwal } from '$root/services/mi.swal'

    export let open = false
    export let idsede: number | string
    export let sedeNombre = ''

    const dispatch = createEventDispatcher<{ close: void; recargado: Saldo | null }>()

    let packs: Pack[] = []
    let cargandoPacks = false
    let pagando = false
    // Evita el loop infinito: sin esta bandera, si el fetch falla o devuelve
    // [] el bloque reactivo se vuelve a disparar en cada toggle de cargandoPacks.
    let intentado = false

    $: if (open && !intentado && !cargandoPacks) {
        cargarPacks()
    }

    // Al cerrar el modal se resetea para que, si se reabre, se reintente una vez.
    $: if (!open) intentado = false

    const cargarPacks = async () => {
        intentado = true
        cargandoPacks = true
        packs = await getPacksChatbot()
        cargandoPacks = false
    }

    /** Reintenta la confirmación (el backend es idempotente: nunca duplica). */
    const confirmarConReintento = async (purchaseNumber: string, transactionToken: string) => {
        for (;;) {
            const conf = await confirmarPagoChatbot(purchaseNumber, transactionToken)
            if (conf.ok && conf.acreditado) {
                showToastSwal('success', 'Recarga acreditada 🎉')
                dispatch('recargado', conf.saldo ?? null)
                dispatch('close')
                return
            }
            if (conf.ok && !conf.acreditado) {
                // Pago cobrado, acreditación pendiente: reintentar es seguro.
                const de = await showAlertSwalDecision({
                    title: 'Pago recibido',
                    text: 'Tu pago se procesó pero la acreditación está pendiente. ¿Reintentar ahora?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Reintentar',
                    cancelButtonText: 'Cerrar',
                })
                if (de?.isConfirmed) continue
                dispatch('close')
                return
            }
            if (conf.retryable) {
                const de = await showAlertSwalDecision({
                    title: 'Pasarela ocupada',
                    text: 'No pudimos verificar el pago todavía. ¿Reintentar?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Reintentar',
                    cancelButtonText: 'Cancelar',
                })
                if (de?.isConfirmed) continue
                dispatch('close')
                return
            }
            // Rechazo definitivo (402) u otro error no reintentable.
            showToastSwal('error', conf.error || 'El pago no fue aprobado', 5000)
            return
        }
    }

    const comprar = async (pack: Pack) => {
        if (pagando) return
        pagando = true
        try {
            const inicio = await iniciarPagoChatbot(idsede, pack.id)
            if (inicio.ok === false) {
                showToastSwal('error', inicio.error, 5000)
                return
            }
            let transactionToken: string
            try {
                transactionToken = await abrirCheckoutNiubiz({
                    checkoutJsUrl: inicio.data.checkoutJsUrl,
                    merchantId: inicio.data.merchantId,
                    sessionKey: inicio.data.sessionKey,
                    purchaseNumber: inicio.data.purchaseNumber,
                    amount: inicio.data.amount,
                    sedeNombre,
                    logoUrl: inicio.data.logoUrl,
                })
            } catch {
                // Cerró el checkout sin pagar: sin drama, puede volver a intentar.
                return
            }
            await confirmarConReintento(inicio.data.purchaseNumber, transactionToken)
        } finally {
            pagando = false
        }
    }
</script>

<Modal {open} title="Recargar conversaciones" on:close={() => dispatch('close')}>
    <div slot="body" class="space-y-3">
        {#if cargandoPacks}
            <p class="text-sm text-gray-500"><i class="fa fa-spinner fa-spin"></i> Cargando paquetes...</p>
        {:else if !packs.length}
            <p class="text-sm text-gray-500">No hay paquetes disponibles por ahora.</p>
        {:else}
            {#each packs as pack (pack.id)}
                <button
                    class="btn btn-primary w-full flex items-center justify-between"
                    disabled={pagando}
                    on:click={() => comprar(pack)}
                >
                    <span>{pack.conversaciones} conversaciones</span>
                    <span class="font-bold">S/ {Number(pack.precio_soles).toFixed(2)}</span>
                </button>
            {/each}
            <p class="text-xs text-gray-400">
                Pago seguro con Niubiz. Las conversaciones se acreditan al instante y no vencen.
            </p>
        {/if}
    </div>
</Modal>
