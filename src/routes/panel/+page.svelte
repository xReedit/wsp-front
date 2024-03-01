<script lang="ts">
    import { onMount } from 'svelte';
    import { getValueTokenSys } from '$root/services/login.services'    
    import { fade } from 'svelte/transition'
    import Preload from '$root/components/Preload.svelte';
    import { getData, putData } from '$root/services/httpClient.services';
    import { SocketClient } from '$root/services/socket.services';
    import Modal from '$root/components/Modal.svelte';
    import ModificarCarta from '$root/components/Modificar.Carta.svelte';
    import { copiarAlPortapapeles, getImageUrl } from '$root/services/utils';
    import { paramsSwalAlert, showAlertSwalHtmlDecision, showToastSwal } from '$root/services/mi.swal';
    import  imgBot  from '$root/static/images/001-robot.png';
    import beep from '$root/static/sound/beep.mp3';
    import { getCountPedidosBot } from '$root/services/api.restobar';


    let imagenBot = imgBot
    let isPreloadShow = true;
    let infoSede = {
        idsede_restobar: '',
        nombre: '',
        idesede: ''
    };
    let listCarta = []
    let listCanales = []
    let listTiposPago = []
    let listImpresoras = []
    let listHorariosAtencion = []
    let listReglasCarta = []
    let listSeccionMasPiden = []
    let configDelivery: any = {}
    let parametrosCostoDelivery: any = {}
    let idtipoPago_Sede
    let _metodo_pago_aceptados_chatbot = ''
    let _loaderStatus = 0
    let sessionInciada = false
    let sessionVerify = false
    let iniciandoSession = false
    let ciudadAtiende = ''
    let userBot: any = {}
    let isShowCostoFijo = false;
    let countPedidosRealizadosBot = 0
    

    let respondeSocket = ''
    let nom_session = 'demo01'
    let session_ini = {
        value: false,
        scanqr: false,
        message: 'Incia Session escaneando el codigo QR'
    }

    let sedeApi: any = {}
    
    

    let showModalCarta = false
    let cartaModificarSeleted: any

    function handleToggleModalCarta() {
        showModalCarta = !showModalCarta
        if (!showModalCarta) {
            getCartegorias()            
        }
    }

    const socket = SocketClient.getInstance();
    
    socket.on('message', (data) => {            
            respondeSocket = data;
    }) 

    socket.on('image_qr_session', (data) => {
        session_ini.scanqr = true
        const imgElement = document.getElementById("imgQR") as HTMLImageElement;
        imgElement.src = data;
    })

    socket.on('session_verify', (data) => {
        sessionVerify = true
        setTimeout(() => {
            sessionVerify = false
        }, 70000);
    })

    socket.on('session_init', (value) => {        
        session_ini.value = value   
        sessionInciada = value     
        session_ini.message = value ? 'Session iniciada' : 'Vincule su whatsapp escaneando el codigo QR'    
    })

    socket.on('pedidoRealizado', async (value) => {
        this.countPedidosRealizadosBot = await getCountPedidosBot(infoSede)
        // emitir un sonido beep
        const audio = new Audio(beep);
        audio.play();                
    })

    onMount(async () => {        
        // await isLogin()
        isPreloadShow = false;  
        infoSede = getValueTokenSys('sede');
        
        await getAllData()
    })

    async function getCartegorias() {        
        const _listHorarios = await getData('', `horarios/${infoSede.idsede_restobar}`)
        listCarta = _listHorarios;        

        listCarta.map(x => {
            const _urlCarta = x.url_carta || ''
            let nomDias = x.dia_disponible
            x.img_visible = _urlCarta !== ''            

            // reemplazar numero de dias por abreviatura del nombre del dia, de la lista numdias
            const numdias = nomDias.split(',')
            const abreviaturaDias = ['Dom','Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
            const listNomDias = []
            numdias.map(x => {
                const dia = abreviaturaDias[x-1]
                listNomDias.push(dia)
            })

            x.nom_dias = listNomDias.join(',')


            return x
        })
    }

    async function loadTipoPago() {
        const _listTipoPago = await getData('', `tipos-pago`)
        listTiposPago = _listTipoPago;        

        idtipoPago_Sede = sedeApi.metodo_pago_aceptados_chatbot
        if (!idtipoPago_Sede) {
            idtipoPago_Sede = listTiposPago.flatMap(x => x.idtipo_pago) 
        } else {
            idtipoPago_Sede = idtipoPago_Sede.split(',')
        }
        
        sedeApi.metodo_pago_aceptados_chatbot = idtipoPago_Sede.join(',')
        _metodo_pago_aceptados_chatbot = sedeApi.metodo_pago_aceptados_chatbot
                
        listTiposPago = listTiposPago.map(x => {
            idtipoPago_Sede.map(y => {
                if (x.idtipo_pago.toString() === y.toString()) {
                    x.checked = true
                }
            })

            return x;
        });
    }

    async function getCostosDelivery() {
        // obtener la configuracion de delivery de la sede        
        const _confgDelivery = await getData('', `get-config-delivery/${sedeApi.idsede}`)        
        configDelivery = _confgDelivery[0]
        parametrosCostoDelivery = configDelivery.parametros      
        
        isShowCostoFijo = parametrosCostoDelivery.obtener_coordenadas_del_cliente === 'NO' ? true : false   
        // parametrosCostoDelivery.costo_fijo = parametrosCostoDelivery.costo_fijo || 0
    }

    async function getUserBot() {
        const _userBot = await getData('', `get-user-bot/${sedeApi.idsede}`)
        userBot = _userBot[0]  
    }

    

    async function getAllData() {        
        sedeApi = await getData('', `get-sede/${infoSede.idsede_restobar}`)
        sedeApi = sedeApi[0]        
        
        await getCartegorias()

        const _listCanales = await getData('', `canales/${infoSede.idsede_restobar}`)        
        // listCanales = _listCanales
        listCanales = _listCanales.map(x => {
            x.checked = x.habilitado_chatbot === '1'
            if ( x.titulo.toUpperCase() === 'LOCAL' ) {
                x.descripcion = 'RESERVAR'
            }
            return x;
        });
        // listCanales.push({idtipo_consumo: 0, descripcion: 'RESERVAR', estado: 1})       
                

        
        

        loadTipoPago()

        getCostosDelivery()

        getUserBot()

        // impresoras
        listImpresoras = await getData('', `get-impresoras/${infoSede.idsede_restobar}`)  
        listImpresoras = listImpresoras

        // obtener horarios y dias de atencion
        listHorariosAtencion = await getData('', `horarios/${infoSede.idsede_restobar}`)    
        listHorariosAtencion = listHorariosAtencion

        listReglasCarta = await getData('chat-bot', `get-reglas-carta/${sedeApi.idsede}/${sedeApi.idorg}`)

        // seccion que mas piden, para recomendar
        listSeccionMasPiden = await getData('', `get-seccion-mas-piden/${sedeApi.idsede}`)
        listSeccionMasPiden = listSeccionMasPiden;
        
        try {            
            if (configDelivery.ciudades === '') {
                ciudadAtiende = `${sedeApi.ciudad.toLowerCase()} ${sedeApi.codigo_postal}`
                configDelivery.ciudades = ciudadAtiende;
            } 
        } catch (error) {
            
        }

        
    }

    function updateDataBot() {
        const _data = cocinarDataSend();
        socket.sendMessage('update-info-sede',_data)
        showToastSwal('success', 'Se actualizo correctamente', 3000)
    }

    function test() {
        let paramsSwal = paramsSwalAlert; 
        paramsSwal.title = 'Esta seguro de detener el chat bot? 🤖'        
        paramsSwal.content = `Al cerrar se detendra el chat bot y se cerraran todas las conversaciones automatizadas`
        paramsSwal.confirmButtonText = 'Si, Detener'
        showAlertSwalHtmlDecision(paramsSwal) 


        // const _params = {
        //     title: 'Esta seguro de detener el chat bot?',
        //     content: 'Se detendra el chat bot y se cerraran todas las conversaciones automatizadas',
        //     confirmButtonText: 'Si, Detener'
        // }
        
    }

    async function stopBot() {

        // preguntar si esta seguro de detener el chat bot
        
        let paramsSwal = paramsSwalAlert; 
        paramsSwal.title = 'Esta seguro de detener el chat bot? 🤖'        
        paramsSwal.content = `Al cerrar se detendra el chat bot y se cerraran todas las conversaciones automatizadas`
        paramsSwal.confirmButtonText = 'Si, Detener'
        const rpt = await showAlertSwalHtmlDecision(paramsSwal) 

        if (rpt.isConfirmed) {
            iniciandoSession = false
    
            socket.sendMessage('stop-chat-bot', nom_session)
            sessionInciada = false;
            sessionVerify = false
    
            // cerrar socket
            socket.disconnect()        
    
            showToastSwal('success', 'Se detuvo correctamente', 3000)
        }
        
    }

    function cocinarDataSend() {
        const rptVerificacion = verificarAntesEmpezar()

        if ( !rptVerificacion ) { return false }



        // solo le pasaremos las cartas que esten habilitadas y que tengan una imagen
        const _listCartaPasar = listCarta.filter(x => x.visible_cliente === '1' && x.img_visible === true)

        // solo horarios de atencion que esten habilitados
        const _listHorariosAtencionPasar = listHorariosAtencion.filter(x => x.visible_cliente === '1' && (x.url_carta !== '' || x.url_carta !== null))        

        // solo le pasaremos los canales de consumo que esten habilitados
        const _listCanalesPasar = listCanales.filter(x => x.checked === true)

        // si la descripcion es "para llevar" que lo cambia a: "Recoger"
        _listCanalesPasar.map(x => {
            if (x.descripcion.toUpperCase() === 'PARA LLEVAR') {
                x.descripcion = 'RECOGER'
            }
        })
        

        // solo le pasaremos los tipos de pago que esten habilitados
        const _listTiposPagoPasar = listTiposPago.filter(x => x.checked === true)                

        nom_session = `${sedeApi.idorg}-${sedeApi.idsede}-session-01`
        // return

        const _paramtrosSedeDelivery = {
            obtener_coordenadas_del_cliente: 'SI',
            coordenadas_sede: {
                latitude: sedeApi.latitude,
                longitude: sedeApi.longitude
            },
            ciudades_disponible: configDelivery.ciudades,
            distancia_maxima_en_kilometros: parametrosCostoDelivery.km_limite
        }

        // el idusuario es el id del bot
        sedeApi.idusuario = userBot.idusuario

        const _data = {
            nameSession: nom_session,  //`session-${Math.floor(Math.random() * 1000)}`
            infoSede: {
                sede : sedeApi,
                configDelivery: configDelivery,
                listCarta: _listCartaPasar,
                listCanalConsumo: _listCanalesPasar,
                listTipoPago: _listTiposPagoPasar,
                listImpresoras: listImpresoras,
                listHorariosAtencion: _listCartaPasar,
                listReglasCarta: listReglasCarta,
                listSeccionMasPiden: listSeccionMasPiden,
                parametrosSedeDelivery: _paramtrosSedeDelivery
            }
        }
        
        console.log('_data', _data);
        
        return _data
    }

    function cancelarInicio() {
        iniciandoSession = false

    }

    async function initBot() {  
        const _data = cocinarDataSend();
        if (_data) {
            iniciandoSession =  true
            session_ini.scanqr = false
            if ( !socket.isConnected() ) {
                socket.connect()
            }

            setTimeout(() => {            
                socket.sendMessage('init_bot', _data)
            }, 1000);
        }
    }

    // modificar carta
    function modificarCarta(item) {
        cartaModificarSeleted = item        
        showModalCarta = true
    }

    async function checkedCanalConsumo(item) {                
        const _dataSend = {            
            habilitado_chatbot: item.checked ? '0' : '1'
        }

        await putData('', `update-canal-consumo/${item.idtipo_consumo}`, _dataSend)
        item.checked = !item.checked    
    }

    async function checkTipoPagoSeleted(e: any) {
        let idtp = e.target.value;                
        if (e.target.checked) {
            _metodo_pago_aceptados_chatbot += ','+idtp + ',';
        } else {
            _metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot.replace(idtp, '');
        }

        // eliminar las comas sin valor
        _metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot.split(',').filter(x => x !== '').join(',')            

        sedeApi.metodo_pago_aceptados_chatbot = _metodo_pago_aceptados_chatbot;        

        
        const _dataSend = {            
            metodo_pago_aceptados_chatbot: sedeApi.metodo_pago_aceptados_chatbot
        }

        await putData('', `update-tipo-pago-sede/${sedeApi.idsede}`, _dataSend)
        
    }

    async function guardarCambiosDelivery() {         
        configDelivery.parametros = parametrosCostoDelivery                            
        await putData('', `update-config-delivery/${configDelivery.idsede_costo_delivery}`, configDelivery)        
    }

    function verificarAntesEmpezar() {
        // verificar que la carta este habilitada
        const _cartaHabilitada = listCarta.filter(x => x.visible_cliente === '1')
        if (_cartaHabilitada.length === 0) {
            showToastSwal('warning', 'Debe tener al menos una carta habilitada', 3000)
            return false
        }

        // verificar que la carta tenga una imagen
        const _cartaImagen = listCarta.filter(x => x.img_visible === true)
        if (_cartaImagen.length === 0) {
            showToastSwal('warning', 'Debe tener al menos una carta con una imagen', 3000)
            return false
        }

        // verificar que los dias y horarios de atencion esten configurados
        if (listHorariosAtencion.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un horario de atencion configurado', 3000)
            return false
        }

        // verificar que los canales de consumo esten habilitados
        const _canalesHabilitados = listCanales.filter(x => x.checked === true)
        if (_canalesHabilitados.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un canal de consumo habilitado', 3000)
            return false
        }

        // verificar que los metodos de pago esten habilitados
        const _metodosPagoHabilitados = listTiposPago.filter(x => x.checked === true)
        if (_metodosPagoHabilitados.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un metodo de pago habilitado', 3000)
            return false
        }

        // verificar que la ciudad este configurada
        if ( configDelivery.ciudades ) {
            if (!configDelivery.ciudades || configDelivery.ciudades === '' || configDelivery.ciudades === null || configDelivery.ciudades === undefined) {
                showToastSwal('warning', 'Debe tener al menos una ciudad configurada', 3000)
                return false
            }
        } else {
            showToastSwal('warning', 'Debe tener al menos una ciudad configurada', 3000)
            return false
        }

        // verificar que los parametros de costo de delivery esten configurados
        if (parametrosCostoDelivery.km_base === null || parametrosCostoDelivery.km_base_costo === null || parametrosCostoDelivery.km_adicional_costo === null || parametrosCostoDelivery.km_limite === null) {
            showToastSwal('warning', 'Debe tener los parametros de costo de delivery configurados', 3000)
            return false
        }

        // verificar si tiene link de la carta
        if (sedeApi.link_carta === null || sedeApi.link_carta === '') {
            showToastSwal('warning', 'Debe tener el link de la carta configurado', 3000)
            return false
        }

        return true
    }

    function onChangeCosto(e) {        
        isShowCostoFijo = !isShowCostoFijo

        parametrosCostoDelivery.costo_fijo = isShowCostoFijo ? parametrosCostoDelivery.costo_fijo : 0
        parametrosCostoDelivery.obtener_coordenadas_del_cliente = isShowCostoFijo ? 'NO' : 'SI'
        guardarCambiosDelivery()
    }
    

</script>

<style>
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr; /* La primera columna tiene un ancho mínimo de 0 y máximo de 400px, la segunda columna ocupa el espacio restante */
        gap: 10px; /* Espacio entre las columnas */
    }

    .column1 {        
        padding: 5px;
        }

    .column2 {
        border-left: 1px solid #ccc;                
        padding: 5px;
        }

    @media (max-width: 767px) {
    .grid-container {
        grid-template-columns: 1fr; /* Las columnas ocupan todo el ancho */
    }
    
    .column2 {
        border-left: 0px;  
        border-top: 1px solid #ccc;  
        margin-top: 10px; /* Espacio entre las columnas en dispositivos móviles */
    }

    .table-info {
        font-size: 12px;
    }
}

</style>

<div in:fade|global class="m-auto p-5">    
    <Preload isLoading = {isPreloadShow}/>

    <section class="grid-container">
        <section class="column1">
            <h4>Chat Bot - {infoSede.nombre}</h4>
            <p class="text-sm text-gray-500">El chatbot automatiza la atención al cliente por WhatsApp, ofreciendo respuestas rápidas y precisas las 24/7, mejorando la experiencia del cliente y optimizando el servicio.</p>
            <br>                        

            <!-- cartas, dias y horario de atencion, subir imagen o pdf de la carta -->
            <section class="card-1">
                <h5>Carta</h5>
                <p class="text-sm text-gray-500">Configure los dias, horarios de atención. La carta que se compartira <strong>debe ser una imagen </strong></p>                
                <table class="table-info fs-12 mt-2">
                    <thead>
                        <th>Nombre</th>
                        <th>Horarios</th>
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
                                    <p>{item.hora_ini} - {item.hora_fin}</p>
                                    <!-- <p>{item.dia_disponible}</p> -->
                                    <p class="fs-10">{item.nom_dias}</p>
                                </td>
                                <td>
                                    {#if item.img_visible}                                        
                                        <a href="{getImageUrl(item.url_carta)}" class="cursor-pointer" target= '_blank'>🖼️</a>
                                    {:else if !item.img_visible}                                        
                                        <p>🚫</p>
                                    {/if }                                    
                                </td>
                                <td align="right">
                                    <button class="btn btn-sm btn-primary fs-10" on:click={modificarCarta(item)}>Cambiar</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>
            
            <!-- canales de consumo -->
            <br>                        
            <section class="card-1">
                <h5>Canales de Consumo</h5>
                <p class="text-sm text-gray-500">Seleccione los canales de consumo</p>                
                <table class="w-100 fs-12 mt-2">
                    <thead>
                        <th>Canal</th>
                        <th align="center">Habilitado</th>
                    </thead>
                    <tbody>
                        {#each listCanales as item}
                            <tr>
                                <td>{item.descripcion}</td>
                                <td align="center">
                                    <input class="cursor-pointer" type="checkbox" name="" id="" checked={item.checked} bind:value={item.habilitado_chatbot} on:change={() => checkedCanalConsumo(item)}>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>                

            </section>


            <!-- tipos de pago -->
            <br>            
            <section class="card-1">
                <h4>Metodo de Pagos</h4>
                <p class="text-sm text-gray-500">Seleccione los metodos de pago aceptados</p>                
                <table class="w-100 fs-12 mt-2">
                    <thead>
                        <th>Metodo de Pago</th>
                        <th align="center">Habilitado</th>
                    </thead>
                    <tbody>
                        {#each listTiposPago as item}
                            <tr>
                                <td>{item.descripcion}</td>
                                <td align="center">
                                    <input class="cursor-pointer" type="checkbox" checked={item.checked} value="{item.idtipo_pago}" on:change={checkTipoPagoSeleted}>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>

            <!-- configuracion del costo de entraga y ciudades que atiendo -->
            <br> 
            <section class="card-1">
                <h4>Costo de entrega -Delivery-</h4>
            
                <div class="flex items-center mb-2 mt-2">
                    <div class="flex items-center mr-4">
                        <input id="default-radio-1" checked={!isShowCostoFijo} type="radio" on:change={onChangeCosto} value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="default-radio-1" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Costo Variable</label>                                                
                    </div>
                    <div class="flex items-center">
                        <input id="default-radio-2" checked={isShowCostoFijo} type="radio" on:change={onChangeCosto} value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="default-radio-2" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Costo Fijo</label>                        
                    </div>
                </div>
                <hr>
                <br>

                <!-- costo fijo -->
                {#if isShowCostoFijo}
                <div>
                    <p class="text-sm text-gray-500">El costo de entrega será el mismo sin importar la distancia:</p>
                    <table class="w-100 fs-12 mt-2">
                        <thead>
                            <th></th>
                            <th align="center" style="width: 70px;">Importe</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <p class="font-bold">Costo Fijo</p>
                                    <p class="fs-11 text-gray-500">Costo fijo que se cobrara por la entrega</p>
                                </td>
                                <td>
                                    <input type="number" bind:value={parametrosCostoDelivery.costo_fijo} on:change="{guardarCambiosDelivery}">
                                </td>
                            </tr>
                        </tbody>
                    </table>                    
                                                                
                </div>

                {:else}
                <!-- costo variable -->
                <div>
                    <p class="text-sm text-gray-500">El costo de entrega se calcula según a la distancia. Las variables son las siguientes:</p>
                    <table class="w-100 fs-12 mt-2">
                        <thead>
                            <th>Variable</th>
                            <th align="center" style="width: 70px;">Valor</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <p class="font-bold">Kilometros Base</p>
                                    <p class="fs-11 text-gray-500">Kilometros a la redonda que se cobrara el costo básico</p>
                                </td>
                                <td>
                                    <input type="number" bind:value="{parametrosCostoDelivery.km_base}" on:change="{guardarCambiosDelivery}">
                                </td>
                                <!-- <td align="center">{configDelivery.parametros.km_base}</td> -->
                            </tr>
                            <tr>
                                <td>
                                    <p class="font-bold">Costo Básico</p>
                                    <p class="fs-11 text-gray-500">Costo básico que se cobrara si esta dentro de <strong>Kilometros Base</strong></p>
                                </td>
                                <td>
                                    <input type="number" bind:value="{parametrosCostoDelivery.km_base_costo}" on:change="{guardarCambiosDelivery}">
                                </td>
                            </tr>                        
                            <tr>
                                <td>
                                    <p class="font-bold">Costo por kilometro adicional</p>
                                    <p class="fs-11 text-gray-500">Si la distancia pasa de <strong>Kilometros Base</strong> a la redonda, cuanto se cobrara por kilometro adicional.</p>
                                </td>
                                <td>
                                    <input type="number" bind:value={parametrosCostoDelivery.km_adicional_costo} on:change="{guardarCambiosDelivery}">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p class="font-bold">Distancia Limite</p>
                                    <p class="fs-11 text-gray-500">Distancia limite en Kilometros a la redonda.</p>
                                </td>
                                <td>
                                    <input type="number" bind:value={parametrosCostoDelivery.km_limite} on:change="{guardarCambiosDelivery}">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br>
                    <h4>Ciudades que atiende -Delivery-</h4>
                    <p class="text-sm text-gray-500 mb-2">Para encontrar la direccion que el cliente proporciona, se requiere la ciudad y el codigo postal de la ciudades o zonas que esta disponible el servicio, separadas por comas. <strong>Ejemplo: Magadalena del Mar 15086, Jesús María 15072</strong></p>                                
                    <input type="text" bind:value={configDelivery.ciudades} on:blur="{guardarCambiosDelivery}">
                    <p class="mt-3 text-sm text-gray-500">Puede encontrar el codigo postal de su ciudad <a href="http://www.codigopostal.gob.pe/pages/invitado/consulta.jsf" target="_blank"><span class="text-blue-500 font-bold">Aqui</span></a></p>                
                </div>

                {/if}

            </section>  
            
            
            <!-- link tienda virtual -->
            <br>            
            <section class="card-1">
                <h4>Link Tienda Virtual</h4>
                <p class="text-sm text-gray-500">El chatbot tendrá varios intentos para entender el pedido del cliente, sino lo consigue lo enviará a su tienda en línea</p>
                <div class="relative">
                    <input type="text" readonly value="https://express.papaya.com.pe/carta/{sedeApi.link_carta}">
                    <div class="absolute flex right-1 top-0.5">
                        <button class="btn btn-sm btn-secondary" on:click={() => copiarAlPortapapeles(`https://express.papaya.com.pe/carta/${sedeApi.link_carta}`)}><i class="fa fa-copy"></i></button>                        
                    </div>
                </div>
            </section>

        </section>


        <!-- el chat bot -->
        <section class="column2 w-full p-4 text-center">
            <section>

                <div style="display: flex; justify-content: center;">
                    <img src="{imagenBot}" alt="img-bot">            
                </div>
                <!-- <p>{respondeSocket}</p> -->
                
    
                {#if !sessionInciada && !sessionVerify}
                    {#if iniciandoSession}
                        <div class="mt-4">
                            <i class="fa fa-spinner fa-spin"></i>
                            <p class="font-bold text-lg">Iniciando Piter ChatBot...</p>
                            <br>
                            <!-- <button class="btn btn-secondary" on:click={cancelarInicio}>Cancelar</button> -->
                        </div>                        
                    {:else}
                        <div class="mt-4" hidden={session_ini.scanqr}>
                            <button class="btn btn-primary" on:click={initBot}>                    
                                <i class="fa fa-play" aria-hidden="true"></i>
                                Iniciar ChatBot
                            </button>

                            <div class="bg-yellow-100 rounded-lg p-3 mt-5 ml-3">
                                <h4>Consejos antes de empezar</h4>
                                <p class="fs-12 text-gray-600">Optimize su carta, verifique que, los nombres de los platos esten sin fallas ortograficas y que no se repitan. Al menos una carta debe estar habilitada y con una imagen para poder compartir.</p>
                            </div>
                        </div>
                    {/if}
                {/if}
            </section>
            

            <!-- <input type="text" placeholder="Nombre de session" bind:value={nom_session}> -->



            {#if !sessionInciada }    
                <div hidden={!session_ini.scanqr}>
                    <div style="display: flex; justify-content: center;">
                        <img id="imgQR" alt="img-qr" hidden={session_ini.value}>
                    </div>

                    <div class="bg-blue-200 rounded-lg p-3 mt-5 ml-3">
                        <p>{session_ini.message}</p>
                    </div>
                </div>

            {:else if sessionInciada}
                <div class="bg-green-200 rounded-lg p-3 mt-5 ml-3">
                        <p>Estamos en Linea!</p>
                </div>
                
                <button class="btn btn-danger mt-4" on:click={stopBot}>
                    <i class="fa fa-stop"></i>
                    Detener
                </button>

                <button class="btn btn-primary mt-4" on:click={updateDataBot}>
                    <i class="fa fa-paper-plane"></i>
                    Actualizar Información
                </button>
            {/if}


            {#if sessionVerify && !sessionInciada && !session_ini.scanqr}
                <div class="bg-yellow-100 rounded-lg p-3 mt-5 ml-3">
                    <p>Verificando Session, un momento por favor. 
                        <i class="fa fa-spinner fa-spin"></i>
                    </p>
                </div>
            {/if}
            
            {#if countPedidosRealizadosBot > 0}
                <div class="bg-green-100 rounded-lg p-3 mt-5 ml-3">
                    <p>Pedidos confirmados por el chat bot: <span class="font-bold fs-20">{countPedidosRealizadosBot}</span></p>
                </div>
            {/if}


        </section>
        
        
    </section>
    
    


    <Modal
        title="Configurar Carta"
        open={showModalCarta}
        on:close={() => handleToggleModalCarta()}
        >
        <svelte:fragment slot="body">
            <div class="p-2">
                <ModificarCarta 
                    itemCarta = {cartaModificarSeleted}
                    on:close={() => handleToggleModalCarta()}
                    ></ModificarCarta>                            
            </div>
        </svelte:fragment>
    </Modal>

</div>