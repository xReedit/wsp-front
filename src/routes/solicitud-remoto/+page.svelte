<script>
    import '$root/styles/micss.css';
    import { onMount } from "svelte";
    import { page } from '$app/stores'; 
    import { getData, postDataSolicitudPermiso, putData } from "$root/services/httpClient.services";
    import { getFechaLarga, primeraLetraMayuscula } from '$root/services/utils';
    import { showToastSwal } from '$root/services/mi.swal';
    import Preload from '$root/components/Preload.svelte';

    let isLoading = true;
    let countSolicitudes = 0;
    let listSolicitudes = []
    let procesandoId = null;
    
    // Obtener y validar el parámetro key de la URL
    let rawKey = $page.url.searchParams.get('key')
    let link = rawKey
    
    // Verificar si el key contiene una URL duplicada
    if (rawKey && rawKey.includes('chatbot.papaya.com.pe/solicitud-remoto?key=')) {
        const keyParts = rawKey.split('key=')
        if (keyParts.length > 1) {
            link = keyParts[keyParts.length - 1]
        }
    }

    onMount(async () => {
        try {
            const rpt = await getData('permiso-remoto', `permisos/${link}`, null, false)        
            if ( rpt.success ) {
                listSolicitudes = rpt.data
                countSolicitudes = rpt.data.length            
            } else {
                showToastSwal('warning', 'No se encontraron solicitudes', 3000)
            }
        } catch (error) {
            showToastSwal('error', 'Error al cargar las solicitudes', 3000)
        } finally {
            isLoading = false;
        }
    })

    const aceptarSolicitud = async (solicitud) => {    
        procesandoId = solicitud.idpermiso_remoto;

        try {
            const isArrayData = solicitud.data.data.length > 0 ? true : false   

            const _idpedido_detalle = isArrayData ? solicitud.data.data[0].idpedido_detalle: solicitud.data.data.idpedido_detalle;   
            const _idpedidos = isArrayData ? solicitud.data.data.flatMap(x => x.idpedidos).join(',') : solicitud.data.data.idpedido; 
            
            const dataSend = {
                tipo_permiso: solicitud.data.tipo_permiso,
                idpedido_detalle: _idpedido_detalle,
                idpedido: _idpedidos,
                solicitud: solicitud.data.solicitud,
                nomusuario_admin: solicitud.data.nomusuario_admin,
                data: solicitud.data
            }
            
            const dataSocketQuery = {
                idorg: solicitud.sede.idorg,
                idsede: solicitud.sede.idsede,
                idusuario: 0,            
                iscliente: false,
                isOutCarta: false,
                isCashAtm: false,
                isFromApp: 0,
                isFromBot: 1
            };

            const _payload = {
                query: dataSocketQuery,
                dataSend: dataSend
            }

            let _solicitudRow = listSolicitudes.find( item => item.idpermiso_remoto === solicitud.idpermiso_remoto )  
            _solicitudRow.atendido = '1'
            listSolicitudes = [...listSolicitudes]

            await putData('permiso-remoto', `update/${solicitud.idpermiso_remoto}`, null, false)         
            await postDataSolicitudPermiso('bot', 'send-bot-solicitud-permiso', _payload, false)

            showToastSwal('success', 'Solicitud aceptada correctamente', 2000)
        } catch (error) {
            showToastSwal('error', 'Error al procesar la solicitud', 3000)
        } finally {
            procesandoId = null;
        }
    }
</script>

<style>

</style>

<Preload isLoading={isLoading} />

<div style="max-width: 650px; margin: 0 auto;" >
    {#if !isLoading}
    <p class="fs-18 fw-600 p-2 font-bold text-center">{countSolicitudes} Solicitudes por antender 🔐</p>
    <!-- tabla de permisos por atender -->
    <table>
        <thead>
            <tr>
                <th>Fecha</th>                
                <th>Solicitud</th>                
                <th align="center">Accion</th>
            </tr>
        </thead>
        <tbody>
            {#each listSolicitudes as solicitud}
                <tr>
                    <td>
                        <p class="fs-12 font-bold">{solicitud.hora}</p>
                        <p class="fs-10 p-0" style="max-width: 40px;">{getFechaLarga(solicitud.fecha)}</p>
                    </td>
                    <td>
                        <p class="font-bold">{primeraLetraMayuscula(solicitud.data.nomusuario_solicita.toLowerCase())}</p>
                        <p class="mt-1"><strong>Solicita:</strong> {@html solicitud.data.solicitudHtml || solicitud.data.solicitud}</p>                        
                        <p class="mt-2"><strong>Motivo:</strong> <span class="text-gray-500">{solicitud.data.motivo}</span></p>
                    </td>                    
                    <td align="center">
                        {#if solicitud.atendido === '1'}
                            ✅
                        {:else if procesandoId === solicitud.idpermiso_remoto}
                            <i class="fa fa-spinner fa-spin"></i>
                        {:else}                            
                            <button class="btn btn-sm btn-primary" on:click={() => aceptarSolicitud(solicitud)}>Aceptar</button>
                        {/if}                        
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    {#if listSolicitudes.length === 0}
        <div class="text-center p-5 text-gray-400">
            <p>No hay solicitudes pendientes</p>
        </div>
    {/if}
    {/if}
    <br>
</div>