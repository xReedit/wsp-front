<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { CanalConsumo } from '$root/types';

    export let listCanales: CanalConsumo[] = [];

    async function checkedCanalConsumo(item: CanalConsumo) {
        try {
            const _dataSend = {            
                habilitado_chatbot: item.checked ? '0' : '1'
            }
            await putData('', `update-canal-consumo/${item.idtipo_consumo}`, _dataSend)
            item.checked = !item.checked
            listCanales = [...listCanales];
        } catch (error) {
            showToastSwal('error', 'Error al actualizar canal de consumo', 3000)
        }
    }
</script>

<section class="card-1">
    <h5>Canales de Consumo</h5>
    <p class="text-sm text-gray-500">Seleccione los canales de consumo</p>                
    <table class="w-100 fs-12 mt-2">
        <thead>
            <th>Canal</th>
            <th align="center">Habilitado</th>
        </thead>
        <tbody>
            {#each listCanales as item}
                <tr>
                    <td>{item.descripcion}</td>
                    <td align="center">
                        <input class="cursor-pointer" type="checkbox" checked={item.checked} bind:value={item.habilitado_chatbot} on:change={() => checkedCanalConsumo(item)}>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>                
</section>
