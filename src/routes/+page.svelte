<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getValueToken } from "$root/services/login.services";
    import Preload from "$root/components/Preload.svelte";

    let isLoading = true;

    onMount(() => {
        const token = getValueToken('idusuario');
        if (token) {
            goto('./panel');
        } else {
            isLoading = false;
        }
    })
</script>

<Preload isLoading={isLoading} />

{#if !isLoading}
<div class="flex items-center justify-center h-screen">
    <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">Piter ChatBot</h1>
        <p class="text-gray-500">Panel de administración del chatbot</p>
        <p class="text-gray-400 text-sm mt-2">Inicie sesión desde el sistema Restobar para acceder</p>
    </div>
</div>
{/if}
