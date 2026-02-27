<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getImageUrl } from '$root/services/utils';
    import type { Carta } from '$root/types';

    export let listCarta: Carta[] = [];

    const dispatch = createEventDispatcher();

    function modificarCarta(item: Carta) {
        dispatch('modificar-carta', item);
    }
</script>

<section class="card-1">
    <h5>Carta</h5>
    <p class="text-sm text-gray-500">Habilite o deshabilite cartas y suba la imagen que se compartirá con los clientes</p>                
    <table class="table-info fs-12 mt-2">
        <thead>
            <th>Nombre</th>
            <th>Imagen</th>
            <th></th>
        </thead>
        <tbody>
            {#each listCarta as item}
                <tr class="fs-12">
                    <td>
                        {item.descripcion}
                        {#if item.visible_cliente === '0'}
                            <p class="badge danger fs-10">Deshabilitada</p>
                        {:else if item.visible_cliente === '1'}
                            <p class="badge primary fs-10">Habilitada</p>
                        {/if}                                    
                    </td>
                    <td>
                        {#if item.img_visible}                                        
                            <a href="{getImageUrl(item.url_carta || '')}" class="cursor-pointer" target='_blank'>🖼️</a>
                        {:else if !item.img_visible}                                        
                            <p>🚫</p>
                        {/if}                                    
                    </td>
                    <td align="right">
                        <button class="btn btn-sm btn-primary fs-10" on:click={() => modificarCarta(item)}>Cambiar</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
