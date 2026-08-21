<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { ConfigDelivery, ParametrosCostoDelivery } from '$root/types';

    // Reglas propias del local (una por sede) que el bot respeta al armar el
    // pedido. Se guardan en el mismo saco que el resto de la config
    // (sede_costo_delivery.parametros) y con el mismo endpoint.
    export let configDelivery: ConfigDelivery;
    export let parametrosCostoDelivery: ParametrosCostoDelivery;

    const MAX = 200;
    // El texto entra al prompt del bot: estas dos también se validan en el
    // backend (services/reglas-negocio.ts). Aquí solo es para avisar antes.
    const URL_RE = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|pe|io|xyz|link)\b/i;

    let guardando = false;

    $: texto = parametrosCostoDelivery?.reglas_negocio ?? '';
    $: restantes = MAX - texto.length;
    $: aviso = URL_RE.test(texto) ? 'No se permiten enlaces ni páginas web.' : '';

    function quitar() {
        texto = '';
        return guardar();
    }

    async function guardar() {
        if (aviso) return showToastSwal('error', aviso, 3000);
        guardando = true;
        try {
            parametrosCostoDelivery.reglas_negocio = texto.trim();
            configDelivery.parametros = parametrosCostoDelivery;
            await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery);
            showToastSwal('success', texto.trim() ? 'Reglas del local guardadas' : 'Reglas del local eliminadas', 2000);
        } catch (error: any) {
            showToastSwal('error', error?.response?.data?.error ?? 'Error al guardar las reglas', 3000);
        } finally {
            guardando = false;
        }
    }
</script>

<details class="card-1">
    <summary class="cursor-pointer select-none"><h4 class="inline">Reglas de tu local</h4></summary>
    <p class="text-sm text-gray-500 mt-2">
        Una condición propia de tu negocio que el bot respetará al tomar los pedidos. Escríbela como se la explicarías a un mozo nuevo.
        No cambia precios ni el resumen del pedido: eso lo sigue calculando el sistema.
    </p>
    <br>

    <textarea
        bind:value={texto}
        maxlength={MAX}
        rows="3"
        class="w-full border rounded-lg p-2 text-sm"
        placeholder="Ej: Máximo 2 presas iguales por pedido de pollo, el resto debe variar."
    ></textarea>

    <div class="flex items-center justify-between mt-2">
        <span class="text-xs" class:text-red-500={!!aviso} class:text-gray-500={!aviso}>
            {aviso || `${restantes} caracteres disponibles`}
        </span>
        <div class="flex gap-2">
            <button class="btn btn-danger btn-sm" on:click={quitar} disabled={guardando || !parametrosCostoDelivery?.reglas_negocio}>
                Quitar regla
            </button>
            <button class="btn btn-primary btn-sm" on:click={guardar} disabled={guardando || !!aviso}>
                {guardando ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    </div>

    <p class="text-xs text-gray-400 mt-2">
        Si un cliente pide algo que rompe la regla, el bot se lo explica y le propone una alternativa.
    </p>
</details>
