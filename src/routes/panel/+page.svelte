<script lang="ts">
    import { onMount } from 'svelte';
    import { getValueTokenSys } from '$root/services/login.services'    
    import { fade } from 'svelte/transition'
    import Preload from '$root/components/Preload.svelte';
    import { getData } from '$root/services/httpClient.services';
    import Modal from '$root/components/Modal.svelte';
    import ModificarCarta from '$root/components/Modificar.Carta.svelte';
    import { copiarAlPortapapeles } from '$root/services/utils';
    import { paramsSwalAlert, showAlertSwalHtmlDecision, showToastSwal } from '$root/services/mi.swal';
    import imgBot from '$root/static/images/001-robot.png';
    import beep from '$root/static/sound/beep.mp3';
    import { bloquearNumeroTelefono, desbloquearNumeroTelefono } from '$root/services/api.restobar';
    import NumberHandler from '$root/components/Number.Handler.svelte';

    // Componentes extraídos
    import CartaConfig from '$root/components/CartaConfig.svelte';
    import ChannelConfig from '$root/components/ChannelConfig.svelte';
    import PaymentConfig from '$root/components/PaymentConfig.svelte';
    import DeliveryConfig from '$root/components/DeliveryConfig.svelte';
    import HorarioConfig from '$root/components/HorarioConfig.svelte';

    // Store del bot
    import {
        sessionState, sessionIniciada, sessionVerify, iniciandoSession,
        countPedidosRealizadosBot, newConversation,
        initSocketListeners, sendInitBot, sendUpdateInfoSede, sendStopBot,
        sendUpdateNumberBlocked,
        mensajeriaInstalada, mensajeriaConectada, mensajeriaVerificando, pingMensajeria
    } from '$root/stores/bot.store';

    // Types
    import type { InfoSede, SedeApi, Carta, CanalConsumo, TipoPago, ConfigDelivery, ParametrosCostoDelivery, UserBot } from '$root/types';

    let imagenBot = imgBot
    let isPreloadShow = true;
    let isDataLoaded = false;
    let infoSede: InfoSede = {
        idsede_restobar: '',
        nombre: '',
        idesede: ''
    };
    let listCarta: Carta[] = []
    let listCanales: CanalConsumo[] = []
    let listTiposPago: TipoPago[] = []
    let listImpresoras: any[] = []
    let listHorariosAtencion: any[] = []
    let listReglasCarta: any[] = []
    let listSeccionMasPiden: any[] = []
    let configDelivery: ConfigDelivery = {} as ConfigDelivery
    let parametrosCostoDelivery: ParametrosCostoDelivery = {} as ParametrosCostoDelivery
    let nom_session = 'demo01'
    let sedeApi: SedeApi = {} as SedeApi
    let userBot: UserBot = {} as UserBot
    let isShowCostoFijo = false;

    let showModalCarta = false
    let cartaModificarSeleted: Carta

    function handleToggleModalCarta() {
        showModalCarta = !showModalCarta
        if (!showModalCarta) {
            getCartegorias()            
        }
    }    

    onMount(async () => {        
        infoSede = getValueTokenSys('sede');
        if (!infoSede) {
            showToastSwal('error', 'No se pudo obtener información de la sede', 3000)
            isPreloadShow = false;
            return;
        }

        initSocketListeners(infoSede, beep);
        
        try {
            await getAllData()
            pingMensajeria(sedeApi.idorg, sedeApi.idsede)
        } catch (error) {
            showToastSwal('error', 'Error al cargar los datos del panel', 3000)
        } finally {
            isPreloadShow = false;
            isDataLoaded = true;
        }
    })

    async function getCartegorias() {        
        const _listHorarios: any[] = await getData('', `horarios/${infoSede.idsede_restobar}`)
        listCarta = _listHorarios;

        listCarta.map(x => {
            const _urlCarta = x.url_carta || ''
            let nomDias = x.dia_disponible
            x.img_visible = _urlCarta !== ''            

            const numdias = nomDias.split(',')
            const abreviaturaDias = ['Dom','Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
            const listNomDias: string[] = []
            numdias.map((d: string) => {
                const dia = abreviaturaDias[Number(d)-1]
                listNomDias.push(dia)
            })

            x.nom_dias = listNomDias.join(',')
            return x
        })
    }

    async function loadTipoPago() {
        const _listTipoPago: any[] = await getData('', `tipos-pago`)
        listTiposPago = _listTipoPago;        

        let idtipoPago_Sede: any = sedeApi.metodo_pago_aceptados_chatbot
        if (!idtipoPago_Sede) {
            idtipoPago_Sede = listTiposPago.flatMap(x => x.idtipo_pago) 
        } else {
            idtipoPago_Sede = idtipoPago_Sede.split(',')
        }
        
        sedeApi.metodo_pago_aceptados_chatbot = idtipoPago_Sede.join(',')
                
        listTiposPago = listTiposPago.map(x => {
            idtipoPago_Sede.map((y: any) => {
                if (x.idtipo_pago.toString() === y.toString()) {
                    x.checked = true
                }
            })
            return x;
        });
    }

    async function getCostosDelivery() {
        const _confgDelivery: any[] = await getData('', `get-config-delivery/${sedeApi.idsede}`)        
        configDelivery = _confgDelivery[0]
        parametrosCostoDelivery = configDelivery.parametros      
        isShowCostoFijo = parametrosCostoDelivery.obtener_coordenadas_del_cliente === 'NO' ? true : false   
    }

    async function getUserBot() {
        const _userBot: any[] = await getData('', `get-user-bot/${sedeApi.idsede}`)
        userBot = _userBot[0]  
    }

    async function getAllData() {        
        const _sedeResult: any[] = await getData('', `get-sede/${infoSede.idsede_restobar}`)
        sedeApi = _sedeResult[0]        
        
        await getCartegorias()

        const _listCanales: any[] = await getData('', `canales/${infoSede.idsede_restobar}`)        
        listCanales = _listCanales.map(x => {
            x.checked = x.habilitado_chatbot === '1'
            if ( x.titulo.toUpperCase() === 'LOCAL' ) {
                x.descripcion = 'RESERVAR'
            }
            return x;
        });

        await Promise.all([
            loadTipoPago(),
            getCostosDelivery(),
            getUserBot()
        ])

        listImpresoras = await getData('', `get-impresoras/${infoSede.idsede_restobar}`)
        listHorariosAtencion = await getData('', `horarios/${infoSede.idsede_restobar}`)
        listReglasCarta = await getData('chat-bot', `get-reglas-carta/${sedeApi.idsede}/${sedeApi.idorg}`)
        listSeccionMasPiden = await getData('', `get-seccion-mas-piden/${sedeApi.idsede}`)
        
        try {            
            if (configDelivery.ciudades === '') {
                configDelivery.ciudades = `${sedeApi.ciudad.toLowerCase()} ${sedeApi.codigo_postal}`;
            } 
        } catch (error) {
            // ciudad no configurada aún
        }
    }

    function updateDataBot() {
        const _data = cocinarDataSend();
        if (_data) {
            sendUpdateInfoSede(_data)
        }
    }

    async function stopBot() {
        let paramsSwal = paramsSwalAlert; 
        paramsSwal.title = 'Esta seguro de detener el chat bot? 🤖'        
        paramsSwal.content = `Al cerrar se detendra el chat bot y se cerraran todas las conversaciones automatizadas`
        paramsSwal.confirmButtonText = 'Si, Detener'
        const rpt = await showAlertSwalHtmlDecision(paramsSwal) 

        if (rpt.isConfirmed) {
            sendStopBot(nom_session)
        }
    }

    function cocinarDataSend() {
        const rptVerificacion = verificarAntesEmpezar()
        if ( !rptVerificacion ) { return false }

        const _listCartaPasar = listCarta.filter(x => x.visible_cliente === '1' && x.img_visible === true)
        const _listCanalesPasar = listCanales.filter(x => x.checked === true)

        _listCanalesPasar.map(x => {
            if (x.descripcion.toUpperCase() === 'PARA LLEVAR') {
                x.descripcion = 'RECOGER'
            }
        })

        const _listTiposPagoPasar = listTiposPago.filter(x => x.checked === true)                

        nom_session = `${sedeApi.idorg}-${sedeApi.idsede}-session-01`

        const _paramtrosSedeDelivery = {
            obtener_coordenadas_del_cliente: 'SI',
            coordenadas_sede: {
                latitude: sedeApi.latitude,
                longitude: sedeApi.longitude
            },
            ciudades_disponible: configDelivery.ciudades,
            distancia_maxima_en_kilometros: parametrosCostoDelivery.km_limite
        }

        sedeApi.idusuario = userBot.idusuario

        const _data = {
            nameSession: nom_session,
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
        
        return _data
    }

    async function initBot() {  
        const _data = cocinarDataSend();
        if (_data) {
            sendInitBot(_data)
        }
    }

    function handleModificarCarta(event: CustomEvent<Carta>) {
        cartaModificarSeleted = event.detail        
        showModalCarta = true
    }

    function verificarAntesEmpezar() {
        const _cartaHabilitada = listCarta.filter(x => x.visible_cliente === '1')
        if (_cartaHabilitada.length === 0) {
            showToastSwal('warning', 'Debe tener al menos una carta habilitada', 3000)
            return false
        }

        const _cartaImagen = listCarta.filter(x => x.img_visible === true)
        if (_cartaImagen.length === 0) {
            showToastSwal('warning', 'Debe tener al menos una carta con una imagen', 3000)
            return false
        }

        if (listHorariosAtencion.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un horario de atencion configurado', 3000)
            return false
        }

        const _canalesHabilitados = listCanales.filter(x => x.checked === true)
        if (_canalesHabilitados.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un canal de consumo habilitado', 3000)
            return false
        }

        const _metodosPagoHabilitados = listTiposPago.filter(x => x.checked === true)
        if (_metodosPagoHabilitados.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un metodo de pago habilitado', 3000)
            return false
        }

        if (!configDelivery.ciudades || configDelivery.ciudades === '') {
            showToastSwal('warning', 'Debe tener al menos una ciudad configurada', 3000)
            return false
        }

        if (parametrosCostoDelivery.km_base === null || parametrosCostoDelivery.km_base_costo === null || parametrosCostoDelivery.km_adicional_costo === null || parametrosCostoDelivery.km_limite === null) {
            showToastSwal('warning', 'Debe tener los parametros de costo de delivery configurados', 3000)
            return false
        }

        if (sedeApi.link_carta === null || sedeApi.link_carta === '') {
            showToastSwal('warning', 'Debe tener el link de la carta configurado', 3000)
            return false
        }

        return true
    }

    function handleBloquearTelefono(event: CustomEvent) {
        bloquearNumeroTelefono(infoSede.idsede_restobar, event.detail.telefono, event.detail.bloqueado);
        sendUpdateNumberBlocked(event.detail.telefono, true, sedeApi.idorg, sedeApi.idsede);
    }

    function handleDesBloquearTelefono(event: CustomEvent) {
        desbloquearNumeroTelefono(infoSede.idsede_restobar, event.detail.telefono);
        sendUpdateNumberBlocked(event.detail.telefono, false, sedeApi.idorg, sedeApi.idsede);
    }

</script>

<style>
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
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
        grid-template-columns: 1fr;
    }
    
    .column2 {
        border-left: 0px;  
        border-top: 1px solid #ccc;  
        margin-top: 10px;
    }
}

</style>

<div in:fade|global class="m-auto p-5">    
    <Preload isLoading={isPreloadShow}/>    

    {#if isDataLoaded}
    <section class="grid-container">
        <section class="column1">
            <h4>Chat Bot - {infoSede.nombre}</h4>
            <p class="text-sm text-gray-500">El chatbot automatiza la atención al cliente por WhatsApp, ofreciendo respuestas rápidas y precisas las 24/7, mejorando la experiencia del cliente y optimizando el servicio.</p>
            <br>                        

            <!-- Carta -->
            <CartaConfig {listCarta} on:modificar-carta={handleModificarCarta} />

            <!-- Horarios de atención -->
            <br>
            <HorarioConfig idsede={sedeApi.idsede} />
            
            <!-- Canales de consumo -->
            <br>                        
            <ChannelConfig bind:listCanales />

            <!-- Tipos de pago -->
            <br>            
            <PaymentConfig bind:listTiposPago {sedeApi} />

            <!-- Configuración delivery -->
            <br> 
            <DeliveryConfig bind:configDelivery bind:parametrosCostoDelivery bind:isShowCostoFijo />
            
            <!-- Link tienda virtual -->
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

                <div class="bg-yellow-100 rounded-lg p-3 mt-5 ml-3">
                    <h4>Consejos antes de empezar</h4>
                    <p class="fs-12 text-gray-600">Optimize su carta, verifique que, los nombres de los platos esten sin fallas ortograficas y que no se repitan. Al menos una carta debe estar habilitada y con una imagen para poder compartir.</p>
                </div>
                <br>

                <!-- Estado de mensajería -->
                <div class="ml-3 mt-2">
                    {#if $mensajeriaVerificando}
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                            <i class="fa fa-spinner fa-spin text-blue-500"></i>
                            <p class="text-sm text-blue-700">Verificando conexión con WhatsApp...</p>
                        </div>
                    {:else if !$mensajeriaInstalada}
                        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="fa fa-exclamation-triangle text-red-500"></i>
                                <p class="text-sm font-semibold text-red-700">WhatsApp no disponible</p>
                            </div>
                            <p class="text-xs text-red-600">Para que el chatbot pueda atender a sus clientes, necesita conectar WhatsApp. Instale el servicio de mensajería para comenzar a operar.</p>
                            <button class="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                <i class="fa fa-download"></i> Descargar instalador
                            </button>
                        </div>
                    {:else if !$mensajeriaConectada}
                        <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <i class="fa fa-plug text-yellow-600"></i>
                                <div>
                                    <p class="text-sm font-semibold text-yellow-700">WhatsApp desconectado</p>
                                    <p class="text-xs text-yellow-600">El servicio está instalado pero WhatsApp no está conectado. Conecte WhatsApp para que el chatbot pueda empezar a recibir y responder mensajes.</p>
                                </div>
                            </div>
                            <a href="http://localhost:7543/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                <i class="fa fa-external-link"></i> Conectar WhatsApp
                            </a>
                        </div>
                    {:else}
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div class="flex items-center gap-2">
                                <i class="fa fa-check-circle text-green-600"></i>
                                <p class="text-sm font-semibold text-green-700">WhatsApp conectado y operando</p>
                            </div>
                            <p class="text-xs text-green-600 mt-1">El chatbot está atendiendo mensajes de sus clientes automáticamente.</p>
                        </div>
                    {/if}
                </div>
    
            </section>

            <!-- {#if !$sessionIniciada }    
                <div hidden={!$sessionState.scanqr}>
                    <div style="display: flex; justify-content: center;">
                        <img id="imgQR" alt="img-qr" hidden={$sessionState.value}>
                    </div>

                    <div class="bg-blue-200 rounded-lg p-3 mt-5 ml-3">
                        <p>{$sessionState.message}</p>
                    </div>
                </div>

            {:else if $sessionIniciada}
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
            {/if} -->


            <!-- {#if $sessionVerify && !$sessionIniciada && !$sessionState.scanqr}
                <div class="bg-yellow-100 rounded-lg p-3 mt-5 ml-3">
                    <p>Verificando Session, un momento por favor. 
                        <i class="fa fa-spinner fa-spin"></i>
                    </p>
                </div>
            {/if} -->
            
            {#if $countPedidosRealizadosBot > 0}
                <div class="bg-green-100 rounded-lg p-3 mt-5 ml-3">
                    <p>Pedidos confirmados por el chat bot: <span class="font-bold fs-20">{$countPedidosRealizadosBot}</span></p>
                </div>
            {/if}


            <br>
            <hr>
            <br>
            <!-- manejador de numeros -->
            <section class="card-1 ml-3">
                <p class="text-bold text-xl mb-2">Interacciones con clientes</p>
                <p class="text-xs text-gray-500 mb-3">Aquí se muestran los clientes que están interactuando con el chatbot por WhatsApp. Puede pausar un número para que el chatbot deje de responderle temporalmente, y habilitarlo cuando desee reanudar la atención automática.</p>
                <hr>
                <NumberHandler 
                idsede={infoSede.idsede_restobar}
                new_conversacion={$newConversation}
                on:bloquear-telefono={handleBloquearTelefono}
                on:desbloquear-telefono={handleDesBloquearTelefono}
                ></NumberHandler>
            </section>


        </section>
        
        
    </section>
    {/if}
    

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