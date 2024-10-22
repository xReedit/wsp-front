<script>  
  import { getListNumeroTelefonoBloqueado } from '$root/services/api.restobar';
  import { formatearFecha } from '$root/services/utils';
  import { createEventDispatcher, onMount,  } from 'svelte';

  export let new_conversacion = {}
  export let idsede = ''
  const dispatch = createEventDispatcher();

  $: if (new_conversacion) {
    console.log('El new_conversacion ha cambiado:', new_conversacion);
    if ( new_conversacion.telefono ) {
        agregarConversacion(new_conversacion);
    }
  }

  let conversaciones = [];
  let numerosBloqueados = [];
  let activeTab = 'conversaciones'; // Tab activa por defecto  

  

  // Función para agregar una nueva conversación
  function agregarConversacion(nuevaConversacion) {
    const index = conversaciones.findIndex(conversacion => conversacion.telefono === nuevaConversacion.telefono);
    if (index === -1) {
      conversaciones = [...conversaciones, nuevaConversacion];
    } else {
      // Actualiza la conversación existente si cambia request_human_attention
      if (conversaciones[index].request_human_attention !== nuevaConversacion.request_human_attention) {
        conversaciones[index].request_human_attention = nuevaConversacion.request_human_attention;
        conversaciones = [...conversaciones]; // Forzar reactividad
      }
    }    
    
  }

  // Función para mover un número a la lista de números bloqueados
  function bloquearNumero(telefono) {
    const index = conversaciones.findIndex(conversacion => conversacion.telefono === telefono);
    if (index !== -1) {
      const [bloqueado] = conversaciones.splice(index, 1);
      numerosBloqueados = [...numerosBloqueados, bloqueado];
      conversaciones = [...conversaciones]; 
      
      dispatch('bloquear-telefono', { telefono,  bloqueado});
    }
  }

  // Función para mover un número de la lista de números bloqueados a la lista de conversaciones
  function desbloquearNumero(telefono) {
    const index = numerosBloqueados.findIndex(bloqueado => bloqueado.telefono === telefono);
    if (index !== -1) {
      const [desbloqueado] = numerosBloqueados.splice(index, 1);
      conversaciones = [...conversaciones, desbloqueado];
      numerosBloqueados = [...numerosBloqueados]; 

      dispatch('desbloquear-telefono', { telefono });
    }
  }

  // Ejemplo de uso
  onMount(() => {
    // agregarConversacion({
    //   "push_name": "Papaya.com.pe",
    //   "telefono": "51934746830",
    //   "request_human_attention": false
    // });
    setTimeout(() => {
        getListBloqueados();      
    }, 3000);
  });

  // lista de telefonos bloqueados
  async function getListBloqueados() {
    console.log('idsede', idsede);
    const list = await getListNumeroTelefonoBloqueado(idsede)
    numerosBloqueados = list.map(item => {
      return {
        telefono: item.info.telefono,
        push_name: item.info.push_name,
        fecha_pausa: formatearFecha(item.fecha_bloqueo)
      }
    });    
    
  }

  function setActiveTab(tab) {
    activeTab = tab;
  }
</script>

<style>
  .active-tab {
    @apply font-bold border-b-2 border-blue-500;
  }
</style>

<nav>
  <div class="flex space-x-4 text-sm">
    <div class="cursor-pointer py-2 px-2" class:active-tab={activeTab === 'conversaciones'} on:click={() => setActiveTab('conversaciones')}>
      Conversaciones 
      <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{conversaciones.length}</span>
    </div>
    <div class="cursor-pointer py-2 px-2" class:active-tab={activeTab === 'bloqueados'} on:click={() => setActiveTab('bloqueados')}>
      Telefonos Pausados       
      <span class="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10">{numerosBloqueados.length}</span>      
    </div>
  </div>
</nav>
<hr>

<div class="p-4">
  {#if activeTab === 'conversaciones'}    
    <ul class="space-y-1">
      {#each conversaciones as conversacion}        
        <li class="flex justify-between items-center p-2 border-b-2 text-sm">
          <div class="text-left">
            <p class="font-medium">{conversacion.push_name}</p>
            <p>{conversacion.telefono}</p>
            {#if conversacion.request_human_attention}
              <span class="text-red-500">Solicita Atención</span>
            {/if}
          </div>
          <button class="btn btn-sm btn-danger fs-10" on:click={() => bloquearNumero(conversacion.telefono)}>Pausar</button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if activeTab === 'bloqueados'}    
    <ul class="space-y-2">
      {#each numerosBloqueados as bloqueado}
        <li class="flex justify-between items-center p-2 border-b-2 text-sm">
          <div class="text-left">
            <p class="font-medium">{bloqueado.push_name}</p>
            <p>{bloqueado.telefono}</p>            
            {#if bloqueado.fecha_pausa}
              <span class="text-red-500">Pausado desde {bloqueado.fecha_pausa}</span>
            {/if}
          </div>
          <button class="btn btn-sm btn-success fs-10" on:click={() => desbloquearNumero(bloqueado.telefono)}>Habilitar</button>
        </li>
        <!-- <li class="flex justify-between items-center p-2 border rounded">
          <div>
            <span class="font-medium">{bloqueado.push_name}</span> - {bloqueado.telefono}
          </div>
          <button class="bg-green-500 text-white px-2 py-1 rounded" on:click={() => desbloquearNumero(bloqueado.telefono)}>Habilitar</button>
        </li> -->
      {/each}
    </ul>
  {/if}
</div>