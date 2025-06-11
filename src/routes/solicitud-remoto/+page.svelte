<script>
    import '$root/styles/micss.css';
    import { onMount } from "svelte";
    import { page } from '$app/stores'; 
    import { getData, postDataSolicitudPermiso, putData } from "$root/services/httpClient.services";
    import { getFechaLarga, primeraLetraMayuscula } from '$root/services/utils';
    
    // colocar el titulo de la pagina    
    



    
    let countSolicitudes = 0;
    let titulo = 'Solicitudes por atender';
    let listSolicitudes = []
    
    // Obtener y validar el parámetro key de la URL
    let rawKey = $page.url.searchParams.get('key')
    let link = rawKey
    
    // Verificar si el key contiene una URL duplicada
    if (rawKey && rawKey.includes('chatbot.papaya.com.pe/solicitud-remoto?key=')) {
        // Extraer el valor real del key (el último valor después del último '=')
        const keyParts = rawKey.split('key=')
        if (keyParts.length > 1) {
            link = keyParts[keyParts.length - 1]
            console.log('Se corrigió un key duplicado:', link)
        }
    }
    onMount(async () => {
        const rpt = await getData('permiso-remoto', `permisos/${link}`, null, false)        
        if ( rpt.success ) {
            listSolicitudes = rpt.data
            console.log('listSolicitudes', listSolicitudes);
            countSolicitudes = rpt.data.length            
        } else {
            console.log('rpt');
        }        
    })

    const aceptarSolicitud = async (solicitud) => {    
        
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

        console.log('solicitud', solicitud);
        const rpt = await putData('permiso-remoto', `update/${solicitud.idpermiso_remoto}`, null, false)         

        console.log('_payload', _payload);

        postDataSolicitudPermiso('bot', 'send-bot-solicitud-permiso', _payload, false)

    }
</script>

<style>

</style>

<div style="max-width: 650px; margin: 0 auto;" >
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
                        {:else}                            
                            <button class="btn btn-sm btn-primary" on:click={() => aceptarSolicitud(solicitud)}>Aceptar</button>
                        {/if}                        
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    <br>
</div>