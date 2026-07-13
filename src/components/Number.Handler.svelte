<script lang="ts">  
  import { getListNumeroTelefonoBloqueado, guardarReferenciaCliente, getReferenciaCliente } from '$root/services/api.restobar';
  import { formatearFecha } from '$root/services/utils';
  import { showToastSwal } from '$root/services/mi.swal';
  import Modal from '$root/components/Modal.svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  interface Conversacion {
    telefono: string;
    push_name: string;
    request_human_attention?: boolean;
    fecha_pausa?: string;
  }

  export let new_conversacion: any = {}
  export let idsede: string = ''
  const dispatch = createEventDispatcher();

  $: if (new_conversacion) {
    if ( new_conversacion.telefono ) {
        agregarConversacion(new_conversacion);
    }
  }

  let conversaciones: Conversacion[] = [];
  let numerosBloqueados: Conversacion[] = [];
  let activeTab: 'conversaciones' | 'bloqueados' = 'conversaciones';

  // Función para agregar una nueva conversación
  function agregarConversacion(nuevaConversacion: Conversacion) {
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
  function bloquearNumero(telefono: string) {
    const index = conversaciones.findIndex(conversacion => conversacion.telefono === telefono);
    if (index !== -1) {
      const [bloqueado] = conversaciones.splice(index, 1);
      numerosBloqueados = [...numerosBloqueados, bloqueado];
      conversaciones = [...conversaciones]; 
      
      dispatch('bloquear-telefono', { telefono, bloqueado });
    }
  }

  // Función para mover un número de la lista de números bloqueados a la lista de conversaciones
  function desbloquearNumero(telefono: string) {
    const index = numerosBloqueados.findIndex(bloqueado => bloqueado.telefono === telefono);
    if (index !== -1) {
      const [desbloqueado] = numerosBloqueados.splice(index, 1);
      conversaciones = [...conversaciones, desbloqueado];
      numerosBloqueados = [...numerosBloqueados]; 

      dispatch('desbloquear-telefono', { telefono });
    }
  }

  onMount(() => {
    setTimeout(() => {
        getListBloqueados();      
    }, 3000);
  });

  // lista de telefonos bloqueados
  async function getListBloqueados() {
    try {
      const list = await getListNumeroTelefonoBloqueado(idsede)
      numerosBloqueados = list.map((item: any) => {
        return {
          telefono: item.info.telefono,
          push_name: item.info.push_name,
          fecha_pausa: formatearFecha(item.fecha_bloqueo)
        }
      });
    } catch (error) {
      showToastSwal('error', 'Error al cargar teléfonos bloqueados', 3000)
    }
  }

  function setActiveTab(tab: 'conversaciones' | 'bloqueados') {
    activeTab = tab;
  }

  // ── Referencia (nota manual) por cliente ──────────────────────────────────
  let modalRefOpen = false;
  let refTelefono = '';
  let refNombre = '';
  let refTexto = '';
  let loadingRef = false;
  let savingRef = false;
  let buscarTel = '';

  async function abrirReferencia(telefono: string, nombre: string) {
    if (!telefono) return;
    refTelefono = telefono;
    refNombre = nombre || '';
    refTexto = '';
    loadingRef = true;
    modalRefOpen = true;
    try {
      const r = await getReferenciaCliente(idsede, telefono);
      refTexto = r?.referencia || '';
    } catch (e) {
      // el toast de error ya lo muestra el httpClient
    } finally {
      loadingRef = false;
    }
  }

  function abrirReferenciaDesdeBusqueda() {
    const tel = buscarTel.trim();
    if (!tel) { showToastSwal('error', 'Escribe un número de teléfono', 2500); return; }
    abrirReferencia(tel, '');
  }

  async function guardarReferencia() {
    if (!refTelefono) return;
    savingRef = true;
    try {
      await guardarReferenciaCliente(idsede, refTelefono, refTexto);
      showToastSwal('success', refTexto.trim() ? 'Referencia guardada' : 'Referencia eliminada', 2500);
      modalRefOpen = false;
    } catch (e) {
      // toast ya mostrado
    } finally {
      savingRef = false;
    }
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
      Clientes activos 
      <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{conversaciones.length}</span>
    </div>
    <div class="cursor-pointer py-2 px-2" class:active-tab={activeTab === 'bloqueados'} on:click={() => setActiveTab('bloqueados')}>
      Pausados       
      <span class="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10">{numerosBloqueados.length}</span>      
    </div>
  </div>
</nav>
<hr>

<div class="p-4">
  {#if activeTab === 'conversaciones'}
    <!-- Buscar por teléfono: permite ponerle referencia a un cliente aunque no esté activo ahora -->
    <div class="flex gap-2 mb-3">
      <input
        type="text"
        bind:value={buscarTel}
        placeholder="Teléfono para agregar/editar referencia"
        class="flex-1 border rounded px-2 py-1 text-sm"
        on:keydown={(e) => e.key === 'Enter' && abrirReferenciaDesdeBusqueda()}
      />
      <button class="btn btn-sm fs-10" on:click={abrirReferenciaDesdeBusqueda} title="Escribe una nota que el chatbot respetará para este cliente">📝 Referencia</button>
    </div>

    {#if conversaciones.length === 0}
      <p class="text-sm text-gray-400 text-center py-4">Aún no hay clientes interactuando con el chatbot.</p>
    {:else}
      <ul class="space-y-1">
        {#each conversaciones as conversacion}
          <li class="flex justify-between items-center p-2 border-b-2 text-sm">
            <div class="text-left">
              <p class="font-medium">{conversacion.push_name}</p>
              <p class="text-gray-500">{conversacion.telefono}</p>
              {#if conversacion.request_human_attention}
                <span class="text-red-500 text-xs font-semibold">Solicita atención humana</span>
              {/if}
            </div>
            <div class="text-right flex gap-1">
              <button class="btn btn-sm fs-10" on:click={() => abrirReferencia(conversacion.telefono, conversacion.push_name)} title="Nota que el chatbot respetará para este cliente (ej. 'vecino: para llevar = consume en local, sin táper')">📝</button>
              <button class="btn btn-sm btn-danger fs-10" on:click={() => bloquearNumero(conversacion.telefono)} title="Pausar: el chatbot dejará de responder a este número temporalmente">Pausar</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}

  {#if activeTab === 'bloqueados'}
    {#if numerosBloqueados.length === 0}
      <p class="text-sm text-gray-400 text-center py-4">No hay números pausados.</p>
    {:else}
      <ul class="space-y-2">
        {#each numerosBloqueados as bloqueado}
          <li class="flex justify-between items-center p-2 border-b-2 text-sm">
            <div class="text-left">
              <p class="font-medium">{bloqueado.push_name}</p>
              <p class="text-gray-500">{bloqueado.telefono}</p>            
              {#if bloqueado.fecha_pausa}
                <span class="text-xs text-red-500">Pausado desde {bloqueado.fecha_pausa}</span>
              {/if}
            </div>
            <div class="text-right">
              <button class="btn btn-sm btn-success fs-10" on:click={() => desbloquearNumero(bloqueado.telefono)} title="Habilitar: el chatbot volverá a responder a este número">Habilitar</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<Modal open={modalRefOpen} title="Referencia del cliente" on:close={() => (modalRefOpen = false)}>
  <div slot="body" class="w-80 max-w-full">
    {#if refNombre}
      <p class="font-medium text-sm">{refNombre}</p>
    {/if}
    <p class="text-gray-500 text-xs mb-2">{refTelefono}</p>

    {#if loadingRef}
      <p class="text-sm text-gray-400 py-4 text-center">Cargando…</p>
    {:else}
      <label class="text-xs text-gray-600" for="ref-textarea">
        Nota que el chatbot respetará como regla fija de este cliente:
      </label>
      <textarea
        id="ref-textarea"
        bind:value={refTexto}
        rows="4"
        placeholder="Ej: vecino del frente. Cuando pide 'para llevar' en realidad consume en el local (le llevamos servido en plato a su casa). No cobrar táper ni delivery."
        class="w-full border rounded px-2 py-1 text-sm mt-1"
      ></textarea>
      <p class="text-[11px] text-gray-400 mt-1">Vacío = borrar la referencia.</p>

      <div class="flex justify-end gap-2 mt-3">
        <button class="btn btn-sm fs-10" on:click={() => (modalRefOpen = false)} disabled={savingRef}>Cancelar</button>
        <button class="btn btn-sm btn-success fs-10" on:click={guardarReferencia} disabled={savingRef}>
          {savingRef ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    {/if}
  </div>
</Modal>