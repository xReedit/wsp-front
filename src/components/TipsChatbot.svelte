<script lang="ts">
    // Tips estáticos para el dueño: cómo cargar los datos para que el bot
    // atienda mejor. Nacen de conversaciones reales donde el bot falló por
    // datos incompletos (ej: cliente pidió "hamburguesa con papas" y el bot
    // cobró una porción aparte porque la carta no decía qué incluye el plato).
    const VIDEOS = 'https://papaya-comercio-files.s3.us-east-2.amazonaws.com/files-bot/capacitacion';

    const tips = [
        {
            titulo: 'Describe qué incluye cada plato',
            detalle:
                'El bot solo sabe lo que tu carta dice. Si tu hamburguesa trae papas o tu pollo viene con ensalada, escríbelo en la descripción del plato. Si no, cuando un cliente pida "hamburguesa con papas" el bot puede cobrarle una porción aparte.',
            ejemplo: 'Hamburguesa clásica — incluye papas fritas y cremas.',
            video: `${VIDEOS}/descripcion-plato.mp4`,
        },
        {
            titulo: 'Carga las opciones de cada plato',
            detalle:
                'Si un plato se elige por tamaño, presa, sabor o bebida, regístralo como opciones del plato (con su costo extra si lo tiene). Así el bot pregunta lo justo, en un solo mensaje, y cobra bien los extras.',
            ejemplo: 'Pizza: personal / mediana (+S/10) / familiar (+S/20).',
            video: `${VIDEOS}/agregar-seleccionables.mp4`,
        },
        {
            titulo: 'Usa nombres de platos como los pide la gente',
            detalle:
                'El bot busca por cómo escribe el cliente. Si tu carta dice "Burger Royal Deluxe" pero todos piden "la doble", agrega ese nombre en la descripción para que el bot haga match.',
            ejemplo: 'Burger Royal Deluxe (la doble).',
        },
        {
            titulo: 'Escribe tu regla del local como a un mozo nuevo',
            detalle:
                'La sección "Reglas de tu local" acepta una condición propia de tu negocio. Escríbela simple y directa; el bot la respeta al armar el pedido.',
            ejemplo: 'Máximo 2 presas iguales por pedido de pollo.',
        },
        {
            titulo: 'Revisa las conversaciones de vez en cuando',
            detalle:
                'Si ves que el bot entendió mal un pedido, casi siempre es un dato que falta en la carta (descripción, opción o precio). Corrígelo aquí y el bot mejora al instante, sin esperar actualizaciones.',
            ejemplo: '',
        },
    ];

    // Video abierto inline (uno a la vez); preload="none" para no bajar los
    // MP4 con solo abrir el diálogo.
    let videoAbierto: number | null = null;
</script>

<div class="max-w-xl text-left">
    <p class="text-sm text-gray-500">
        El bot atiende con los datos que tú cargas. Estos consejos salen de pedidos reales y evitan los malentendidos más comunes.
    </p>

    <ul class="mt-3 space-y-3">
        {#each tips as tip, i}
            <li class="border-l-2 border-amber-400 pl-3">
                <p class="text-sm font-semibold">{tip.titulo}</p>
                <p class="text-sm text-gray-500">{tip.detalle}</p>
                {#if tip.ejemplo}
                    <p class="text-xs text-gray-400 mt-1">Ej: {tip.ejemplo}</p>
                {/if}
                {#if tip.video}
                    <button class="text-xs text-blue-600 hover:underline mt-1"
                            on:click={() => videoAbierto = videoAbierto === i ? null : i}>
                        {videoAbierto === i ? '✕ Cerrar video' : '▶ Mira cómo'}
                    </button>
                    {#if videoAbierto === i}
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video src={tip.video} controls autoplay preload="none"
                               class="w-full rounded-lg border mt-2"></video>
                    {/if}
                {/if}
            </li>
        {/each}
    </ul>
</div>
