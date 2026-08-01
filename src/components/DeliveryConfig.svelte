<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { ConfigDelivery, LatLng, ParametrosCostoDelivery } from '$root/types';
    import CityAutocomplete from './CityAutocomplete.svelte';
    import ZonasDeliveryConfig from './ZonasDeliveryConfig.svelte';

    export let configDelivery: ConfigDelivery;
    export let parametrosCostoDelivery: ParametrosCostoDelivery;
    // Coordenadas de la sede: centro inicial del mapa de zonas.
    export let sedeCoords: LatLng | null = null;

    async function guardarCambiosDelivery() {
        try {
            configDelivery.parametros = parametrosCostoDelivery
            await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery)
        } catch (error) {
            showToastSwal('error', 'Error al guardar configuración de delivery', 3000)
        }
    }

    function onChangeModo() {
        // bind:group ya escribió parametrosCostoDelivery.modo.
        // Coherencia legacy: el backend viejo decide fijo/variable con esta clave
        // (necesaria durante la ventana de deploy backend/panel).
        parametrosCostoDelivery.obtener_coordenadas_del_cliente = parametrosCostoDelivery.modo === 'fijo' ? 'NO' : 'SI'
        if (parametrosCostoDelivery.modo !== 'fijo') parametrosCostoDelivery.costo_fijo = 0
        guardarCambiosDelivery()
    }
</script>

<section class="card-1">
    <h4>Costo de entrega -Delivery-</h4>

    <div class="flex items-center mb-2 mt-2 flex-wrap gap-4">
        <label class="flex items-center text-sm font-medium text-gray-900 gap-2">
            <input type="radio" bind:group={parametrosCostoDelivery.modo} value="variable" on:change={onChangeModo} name="modo-delivery" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2">
            Costo Variable
        </label>
        <label class="flex items-center text-sm font-medium text-gray-900 gap-2">
            <input type="radio" bind:group={parametrosCostoDelivery.modo} value="fijo" on:change={onChangeModo} name="modo-delivery" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2">
            Costo Fijo
        </label>
        <label class="flex items-center text-sm font-medium text-gray-900 gap-2">
            <input type="radio" bind:group={parametrosCostoDelivery.modo} value="zonas" on:change={onChangeModo} name="modo-delivery" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2">
            Por Zonas (mapa)
        </label>
    </div>
    <hr>
    <br>

    {#if parametrosCostoDelivery.modo === 'fijo'}
    <!-- costo fijo -->
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
                <tr>
                    <td>
                        <p class="font-bold">Tiempo aproximado de entrega</p>
                        <p class="fs-11 text-gray-500">Tiempo estimado en minutos que tarda la entrega del pedido.</p>
                    </td>
                    <td>
                        <input type="number" bind:value={parametrosCostoDelivery.tiempo_aprox_entrega} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    {:else if parametrosCostoDelivery.modo === 'zonas'}
    <!-- costo por zonas dibujadas en el mapa -->
    <div>
        <ZonasDeliveryConfig bind:parametrosCostoDelivery centroSede={sedeCoords} on:change={guardarCambiosDelivery} />

        <table class="w-100 fs-12 mt-3">
            <tbody>
                <tr>
                    <td>
                        <p class="font-bold">Tiempo aproximado de entrega</p>
                        <p class="fs-11 text-gray-500">Se usa para las zonas que no tienen su propio tiempo.</p>
                    </td>
                    <td style="width: 70px;">
                        <input type="number" bind:value={parametrosCostoDelivery.tiempo_aprox_entrega} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
            </tbody>
        </table>
        <br>
        <h4>Ciudades que atiende -Delivery-</h4>
        <p class="text-sm text-gray-500 mb-2">Ayudan a ubicar direcciones escritas por el cliente (cuando no comparte su ubicación GPS).</p>
        <CityAutocomplete bind:ciudades={configDelivery.ciudades} on:change={guardarCambiosDelivery} />
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
                <tr>
                    <td>
                        <p class="font-bold">Tiempo aproximado de entrega</p>
                        <p class="fs-11 text-gray-500">Tiempo estimado en minutos que tarda la entrega del pedido. Se utiliza para informar al cliente el tiempo aproximado de espera.</p>
                    </td>
                    <td>
                        <input type="number" bind:value={parametrosCostoDelivery.tiempo_aprox_entrega} on:change="{guardarCambiosDelivery}">
                    </td>
                </tr>
            </tbody>
        </table>
        <br>
        <h4>Ciudades que atiende -Delivery-</h4>
        <p class="text-sm text-gray-500 mb-2">Busque y seleccione las ciudades o distritos donde está disponible el servicio de delivery. El código postal se agrega automáticamente.</p>
        <CityAutocomplete bind:ciudades={configDelivery.ciudades} on:change={guardarCambiosDelivery} />
    </div>

    {/if}

</section>
