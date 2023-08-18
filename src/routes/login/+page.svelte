<script>        
    import { onMount } from "svelte";
	  import { goto } from "$app/navigation";   
    import { page } from '$app/stores'; 
    import { login, loginRestobarBot } from '$root/services/login.services'

    let user = $page.url.searchParams.get('us')    
    // const idSedeRestobar = JSON.parse(user).sede.idsede_restobar
    // @ts-ignore
    user = atob(user)
    // console.log(user.toString())

    onMount(async () => {            
      const rpt = await loginRestobarBot(user)            
      if (rpt.status === 200) {          
            const { token } = await rpt.json();
            localStorage.setItem('token', token);
            goto(`./panel`) // opciones
      } else {
        // bno tiene credenciales
        goto(`./`) // opciones

      }

    })  
</script>

<h1>
    Cargando
</h1>