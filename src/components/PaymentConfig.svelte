<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { TipoPago, SedeApi } from '$root/types';

    export let listTiposPago: TipoPago[] = [];
    export let sedeApi: SedeApi;

    let _metodo_pago_aceptados_chatbot = sedeApi?.metodo_pago_aceptados_chatbot || ''

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
</section>
