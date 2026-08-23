<script lang="ts">
    import { putData } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import type { ConfigDelivery, ParametrosCostoDelivery, Personalidad } from '$root/types';

    // Guarda en el mismo saco que el resto de la config del bot
    // (sede_costo_delivery.parametros) y con el mismo endpoint: no hay tabla
    // aparte a propósito, así no hace falta un ALTER en producción.
    export let configDelivery: ConfigDelivery;
    export let parametrosCostoDelivery: ParametrosCostoDelivery;

    const VOCES: { valor: Personalidad; titulo: string; ayuda: string }[] = [
        { valor: 'amigable',    titulo: 'Amigable',     ayuda: 'Cálido y cercano, como el mozo de confianza. Es la voz de siempre.' },
        { valor: 'profesional', titulo: 'Profesional',  ayuda: 'Trata de usted, correcto y sobrio. Sin bromas ni jerga.' },
        { valor: 'directo',     titulo: 'Directo',      ayuda: 'Al grano, respuestas cortas, sin cháchara.' },
        { valor: 'achorado',    titulo: 'Achorado',     ayuda: 'Con jerga peruana y chispa de barrio ("ya pe", "bacán").' },
        { valor: 'divertido',   titulo: 'Divertido',    ayuda: 'Con humor y bromas cortas sobre la comida.' },
        { valor: 'diplomatico', titulo: 'Diplomático',  ayuda: 'Conciliador: suaviza las negativas y nunca confronta.' }
    ];

    // Sedes configuradas antes de esta opción (o cambio de sede en caliente):
    // arrancar en la voz histórica antes de renderizar.
    $: if (parametrosCostoDelivery && !parametrosCostoDelivery.personalidad_chatbot) {
        parametrosCostoDelivery.personalidad_chatbot = 'amigable'
    }

    $: ayudaActual = VOCES.find(v => v.valor === parametrosCostoDelivery?.personalidad_chatbot)?.ayuda ?? ''

    async function guardar() {
        try {
            configDelivery.parametros = parametrosCostoDelivery
            await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery)
            showToastSwal('success', 'Personalidad del bot actualizada', 2000)
        } catch (error) {
            showToastSwal('error', 'Error al guardar la personalidad del bot', 3000)
        }
    }
</script>

<div class="mt-3">
    <h4>Personalidad</h4>
    <p class="text-xs text-gray-500 mt-1">Cómo habla tu bot con los clientes de esta sede. Solo cambia el tono y las palabras.</p>

    <div class="flex flex-wrap gap-2 justify-center mt-3">
        {#each VOCES as voz}
            <label class="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm"
                   class:border-blue-500={parametrosCostoDelivery?.personalidad_chatbot === voz.valor}>
                <input type="radio" bind:group={parametrosCostoDelivery.personalidad_chatbot}
                       value={voz.valor} on:change={guardar} name="personalidad-bot" class="w-4 h-4">
                <span>{voz.titulo}</span>
            </label>
        {/each}
    </div>

    <p class="text-xs text-gray-500 mt-3">{ayudaActual}</p>
</div>
