<script>
    import '$root/styles/micss.css';
    import { onMount } from "svelte";
    import { page } from '$app/stores'; 
    import { getData, postDataSolicitudPermiso, putData } from "$root/services/httpClient.services";
    import { getFechaLarga, primeraLetraMayuscula } from '$root/services/utils';
    import { showToastSwal } from '$root/services/mi.swal';
    import Preload from '$root/components/Preload.svelte';

    let isLoading = true;
    let listSolicitudes = []
    let procesandoId = null;

    // El titulo cuenta SOLO las pendientes: las respondidas se muestran para
    // que el admin reconozca la suya, no para que las vuelva a tocar.
    $: pendientes = listSolicitudes.filter(s => s.atendido !== '1')
    $: respondidas = listSolicitudes.filter(s => s.atendido === '1')
    $: countSolicitudes = pendientes.length
    
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
    /* Las respondidas se ven apagadas: estan para reconocerlas, no para
       volver a tocarlas. */
    .fila-respondida { opacity: .55; }
    .fila-respondida td { background: #fafafa; }

    /* La que el admin vino a ver por SU link. */
    .fila-del-link td:first-child { border-left: 3px solid #2563eb; }

    .titulo-respondidas {
        border-top: 1px solid #e5e5e5;
        padding: 14px 8px 6px;
        font-size: 12px;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: .04em;
    }
</style>

<Preload isLoading={isLoading} />

<div style="max-width: 650px; margin: 0 auto;" >
    {#if !isLoading}
    <p class="fs-18 fw-600 p-2 font-bold text-center">
        {#if countSolicitudes}
            {countSolicitudes} {countSolicitudes === 1 ? 'Solicitud' : 'Solicitudes'} por atender 🔐
        {:else}
            No hay solicitudes por atender ✅
        {/if}
    </p>

    {#if countSolicitudes}
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Solicitud</th>
                <th align="center">Accion</th>
            </tr>
        </thead>
        <tbody>
            {#each pendientes as solicitud}
                <tr class:fila-del-link={solicitud.es_del_link}>
                    <td>
                        <p class="fs-12 font-bold">{solicitud.hora}</p>
                        <p class="fs-10 p-0" style="max-width: 40px;">{getFechaLarga(solicitud.fecha)}</p>
                    </td>
                    <td>
                        <p class="font-bold">{primeraLetraMayuscula(solicitud.data.nomusuario_solicita.toLowerCase())}</p>
                        <p class="mt-1"><strong>Solicita:</strong> {@html solicitud.data.solicitudHtml || solicitud.data.solicitud || '<span class="text-gray-400">(sin detalle)</span>'}</p>
                        <p class="mt-2"><strong>Motivo:</strong> <span class="text-gray-500">{solicitud.data.motivo}</span></p>
                    </td>
                    <td align="center">
                        {#if procesandoId === solicitud.idpermiso_remoto}
                            <i class="fa fa-spinner fa-spin"></i>
                        {:else}
                            <button class="btn btn-sm btn-primary" on:click={() => aceptarSolicitud(solicitud)}>Aceptar</button>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    {/if}

    <!-- Las ultimas respondidas. Sin boton: si el admin llego por un link que
         ya contesto, aca ve cual era y que paso con ella. -->
    {#if respondidas.length}
        <p class="titulo-respondidas">Ya respondidas</p>
        <table>
            <tbody>
                {#each respondidas as solicitud}
                    <tr class="fila-respondida" class:fila-del-link={solicitud.es_del_link}>
                        <td>
                            <p class="fs-12 font-bold">{solicitud.hora}</p>
                            <p class="fs-10 p-0" style="max-width: 40px;">{getFechaLarga(solicitud.fecha)}</p>
                        </td>
                        <td>
                            <p class="font-bold">{primeraLetraMayuscula(solicitud.data.nomusuario_solicita.toLowerCase())}</p>
                            <p class="mt-1"><strong>Solicita:</strong> {@html solicitud.data.solicitudHtml || solicitud.data.solicitud || '<span class="text-gray-400">(sin detalle)</span>'}</p>
                            <p class="mt-2"><strong>Motivo:</strong> <span class="text-gray-500">{solicitud.data.motivo}</span></p>
                        </td>
                        <td align="center">
                            <span class="fs-12">✅ Ya fue respondida</span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
    {/if}
    <br>
</div>