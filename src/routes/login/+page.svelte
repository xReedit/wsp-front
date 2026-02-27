<script>        
    import { onMount } from "svelte";
	  import { goto } from "$app/navigation";   
    import { page } from '$app/stores'; 
    import { loginRestobarBot } from '$root/services/login.services'
    import { showToastSwal } from '$root/services/mi.swal'
    import Preload from '$root/components/Preload.svelte'

    let isLoading = true;
    let errorMsg = '';

    const rawUser = $page.url.searchParams.get('us')    

    onMount(async () => {
      if (!rawUser) {
        errorMsg = 'No se proporcionaron credenciales';
        showToastSwal('error', errorMsg, 3000);
        isLoading = false;
        setTimeout(() => goto('./'), 2000);
        return;
      }

      try {
        // @ts-ignore
        const user = atob(rawUser)
        const rpt = await loginRestobarBot(user)            
        if (rpt.status === 200) {          
              const { token } = await rpt.json();
              localStorage.setItem('token', token);
              goto(`./panel`)
        } else {
          errorMsg = 'Credenciales inválidas';
          showToastSwal('error', errorMsg, 3000);
          setTimeout(() => goto('./'), 2000);
        }
      } catch (error) {
        errorMsg = 'Error al iniciar sesión';
        showToastSwal('error', errorMsg, 3000);
        setTimeout(() => goto('./'), 2000);
      } finally {
        isLoading = false;
      }
    })  
</script>

<Preload isLoading={isLoading} />

{#if !isLoading && errorMsg}
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <p class="text-red-500 text-lg font-medium">{errorMsg}</p>
      <p class="text-gray-500 text-sm mt-2">Redirigiendo...</p>
    </div>
  </div>
{:else if isLoading}
  <div class="flex items-center justify-center h-screen">
    <p class="text-gray-500">Autenticando...</p>
  </div>
{/if}