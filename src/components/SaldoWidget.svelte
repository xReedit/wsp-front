<script lang="ts">
    // Widget de saldo de conversaciones. Solo aparece si la sede está en modo
    // 'limitado'; en 'ilimitado' (todas las sedes actuales) no renderiza nada.
    import { onMount } from 'svelte'
    import RecargaModal from '$root/components/RecargaModal.svelte'
    import { getSaldoChatbot, type Saldo } from '$root/services/billing.services'

    export let idsede: number | string
    export let sedeNombre = ''

    let saldo: Saldo | null = null
    let modalAbierto = false

    onMount(() => {
        refrescar()
    })

    export const refrescar = async () => {
        saldo = await getSaldoChatbot(idsede)
    }

    // Disponibles del mes + bolsa; la gracia no se muestra como disponible.
    $: disponibles = saldo ? Math.max(0, saldo.incluidas - saldo.usadas) + saldo.bolsa : 0
    $: porcentajeUsado = saldo && saldo.incluidas > 0 ? Math.min(100, Math.round((saldo.usadas / saldo.incluidas) * 100)) : 0
    $: critico = saldo ? saldo.estado === 'corte' || saldo.estado === 'gracia' : false
    $: advertencia = saldo ? !critico && disponibles > 0 && porcentajeUsado >= 80 : false
</script>

{#if saldo && saldo.modo === 'limitado'}
    <div class="rounded-lg border p-4 space-y-2 {critico ? 'border-red-400 bg-red-50' : advertencia ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}">
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">💬 Conversaciones del bot</h3>
            <button class="btn btn-primary text-sm" on:click={() => (modalAbierto = true)}>Recargar</button>
        </div>

        {#if critico}
            <p class="text-sm text-red-700 font-medium">
                {#if saldo.estado === 'corte'}
                    Tu saldo se agotó: el bot dejó de responder a clientes nuevos. Recarga para reactivarlo.
                {:else}
                    Saldo agotado — el bot atiende {saldo.graciaMax - saldo.graciaUsadas} conversaciones de cortesía más y luego se detiene.
                {/if}
            </p>
        {:else if advertencia}
            <p class="text-sm text-amber-700">Te quedan {disponibles} conversaciones este mes.</p>
        {/if}

        <div class="w-full bg-gray-200 rounded-full h-2">
            <div
                class="h-2 rounded-full {critico ? 'bg-red-500' : advertencia ? 'bg-amber-500' : 'bg-green-500'}"
                style="width: {porcentajeUsado}%"
            ></div>
        </div>
        <p class="text-xs text-gray-500">
            {saldo.usadas} de {saldo.incluidas} usadas este mes
            {#if saldo.bolsa > 0}· bolsa extra: {saldo.bolsa}{/if}
        </p>
    </div>

    <RecargaModal
        open={modalAbierto}
        {idsede}
        {sedeNombre}
        on:close={() => (modalAbierto = false)}
        on:recargado={(e) => { if (e.detail) saldo = e.detail; else refrescar() }}
    />
{/if}
