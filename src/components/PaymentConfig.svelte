<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { TipoPago, SedeApi } from '$root/types';

    export let listTiposPago: TipoPago[] = [];
    export let sedeApi: SedeApi;

    let _metodo_pago_aceptados_chatbot = sedeApi?.metodo_pago_aceptados_chatbot || ''
    let guardandoBilletera = false;

    // Número de Yape/Plin que el bot da cuando el cliente pregunta a dónde yapear.
    async function guardarNumeroBilletera() {
        guardandoBilletera = true;
        try {
            const numero = (sedeApi.numero_billetera_chatbot || '').trim();
            await putData('', `update-tipo-pago-sede/${sedeApi.idsede}`, {
                numero_billetera_chatbot: numero || null
            })
            showToastSwal('success', 'Número de billetera guardado', 2000)
        } catch (error) {
            showToastSwal('error', 'Error al guardar el número', 3000)
        }
        guardandoBilletera = false;
    }

    async function checkTipoPagoSeleted(e: any) {
        try {
            let idtp = e.target.value;                
            if (e.target.checked) {
                _metodo_pago_aceptados_chatbot += ','+idtp + ',';
            } else {
                _metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot.replace(idtp, '');
            }

            // eliminar las comas sin valor
            _metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot.split(',').filter(x => x !== '').join(',')            

            sedeApi.metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot;        

            const _dataSend = {            
                metodo_pago_aceptados_chatbot: sedeApi.metodo_pago_aceptados_chatbot
            }

            await putData('', `update-tipo-pago-sede/${sedeApi.idsede}`, _dataSend)
        } catch (error) {
            showToastSwal('error', 'Error al actualizar método de pago', 3000)
        }
    }
</script>

<section class="card-1">
    <h4>Metodo de Pagos</h4>
    <p class="text-sm text-gray-500">Seleccione los metodos de pago aceptados</p>                
    <table class="w-100 fs-12 mt-2">
        <thead>
            <th>Metodo de Pago</th>
            <th align="center">Habilitado</th>
        </thead>
        <tbody>
            {#each listTiposPago as item}
                <tr>
                    <td>{item.descripcion}</td>
                    <td align="center">
                        <input class="cursor-pointer" type="checkbox" checked={item.checked} value="{item.idtipo_pago}" on:change={checkTipoPagoSeleted}>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="mt-4">
        <h4 class="text-sm font-semibold">Billetera digital (Yape / Plin)</h4>
        <p class="text-sm text-gray-500">Número que el chatbot dará al cliente cuando pregunte a qué número yapear o plinear.</p>
        <div class="flex gap-2 mt-1">
            <input
                type="tel"
                maxlength="30"
                placeholder="Ej: 987 654 321"
                bind:value={sedeApi.numero_billetera_chatbot}
            >
            <button class="btn btn-primary" disabled={guardandoBilletera} on:click={guardarNumeroBilletera}>
                {#if guardandoBilletera}<i class="fa fa-spinner fa-spin"></i>{:else}<i class="fa fa-save"></i>{/if}
                Guardar
            </button>
        </div>
    </div>
</section>
