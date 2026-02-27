<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { ConfigDelivery, ParametrosCostoDelivery } from '$root/types';

    export let configDelivery: ConfigDelivery;
    export let parametrosCostoDelivery: ParametrosCostoDelivery;
    export let isShowCostoFijo: boolean = false;

    async function guardarCambiosDelivery() {
        try {
            configDelivery.parametros = parametrosCostoDelivery                            
            await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery)
        } catch (error) {
            showToastSwal('error', 'Error al guardar configuración de delivery', 3000)
        }
    }

    function onChangeCosto() {        
        isShowCostoFijo = !isShowCostoFijo
        parametrosCostoDelivery.costo_fijo = isShowCostoFijo ? parametrosCostoDelivery.costo_fijo : 0
        parametrosCostoDelivery.obtener_coordenadas_del_cliente = isShowCostoFijo ? 'NO' : 'SI'
        guardarCambiosDelivery()
    }
</script>

<section class="card-1">
    <h4>Costo de entrega -Delivery-</h4>

    <div class="flex items-center mb-2 mt-2">
        <div class="flex items-center mr-4">
            <input id="default-radio-1" checked={!isShowCostoFijo} type="radio" on:change={onChangeCosto} value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            <label for="default-radio-1" class="ms-2 text-sm font-medium text-gray-900">Costo Variable</label>                                                
        </div>
        <div class="flex items-center">
            <input id="default-radio-2" checked={isShowCostoFijo} type="radio" on:change={onChangeCosto} value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            <label for="default-radio-2" class="ms-2 text-sm font-medium text-gray-900">Costo Fijo</label>                        
        </div>
    </div>
    <hr>
    <br>

    <!-- costo fijo -->
    {#if isShowCostoFijo}
    <div>
        <p class="text-sm text-gray-500">El costo de entrega será el mismo sin importar la distancia:</p>
        <table class="w-100 fs-12 mt-2">
            <thead>
                <th></th>
                <th align="center" style="width: 70px;">Importe</th>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p class="font-bold">Costo Fijo</p>
                        <p class="fs-11 text-gray-500">Costo fijo que se cobrara por la entrega</p>
                    </td>
                    <td>
                        <input type="number" bind:value={parametrosCostoDelivery.costo_fijo} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
            </tbody>
        </table>                    
    </div>

    {:else}
    <!-- costo variable -->
    <div>
        <p class="text-sm text-gray-500">El costo de entrega se calcula según a la distancia. Las variables son las siguientes:</p>
        <table class="w-100 fs-12 mt-2">
            <thead>
                <th>Variable</th>
                <th align="center" style="width: 70px;">Valor</th>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p class="font-bold">Kilometros Base</p>
                        <p class="fs-11 text-gray-500">Kilometros a la redonda que se cobrara el costo básico</p>
                    </td>
                    <td>
                        <input type="number" bind:value="{parametrosCostoDelivery.km_base}" on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="font-bold">Costo Básico</p>
                        <p class="fs-11 text-gray-500">Costo básico que se cobrara si esta dentro de <strong>Kilometros Base</strong></p>
                    </td>
                    <td>
                        <input type="number" bind:value="{parametrosCostoDelivery.km_base_costo}" on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>                        
                <tr>
                    <td>
                        <p class="font-bold">Costo por kilometro adicional</p>
                        <p class="fs-11 text-gray-500">Si la distancia pasa de <strong>Kilometros Base</strong> a la redonda, cuanto se cobrara por kilometro adicional.</p>
                    </td>
                    <td>
                        <input type="number" bind:value={parametrosCostoDelivery.km_adicional_costo} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
                <tr>
                    <td>
                        <p class="font-bold">Distancia Limite</p>
                        <p class="fs-11 text-gray-500">Distancia limite en Kilometros a la redonda.</p>
                    </td>
                    <td>
                        <input type="number" bind:value={parametrosCostoDelivery.km_limite} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
            </tbody>
        </table>
        <br>
        <h4>Ciudades que atiende -Delivery-</h4>
        <p class="text-sm text-gray-500 mb-2">Para encontrar la direccion que el cliente proporciona, se requiere la ciudad y el codigo postal de la ciudades o zonas que esta disponible el servicio, separadas por comas. <strong>Ejemplo: Magadalena del Mar 15086, Jesús María 15072</strong></p>                                
        <input type="text" bind:value={configDelivery.ciudades} on:blur="{guardarCambiosDelivery}">
        <p class="mt-3 text-sm text-gray-500">Puede encontrar el codigo postal de su ciudad <a href="http://www.codigopostal.gob.pe/pages/invitado/consulta.jsf" target="_blank"><span class="text-blue-500 font-bold">Aqui</span></a></p>                
    </div>

    {/if}

</section>
