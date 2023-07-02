<script lang="ts">
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    import { SocketClient } from "../services/socket.services";
    
    // let socket = io("http://localhost:5624", { autoConnect: false, multiplex:false });

    let respondeSocket = ''
    let nom_session = ''
    let session_ini = {
        value: false,
        message: 'Incia Session escaneando el codigo QR'
    }

    const socket = SocketClient.getInstance();

    socket.on('message', (data) => {
            console.log(data);
            respondeSocket = data;
    }) 

    socket.on('image_qr_session', (data) => {
        const imgElement = document.getElementById("imgQR") as HTMLImageElement;
        imgElement.src = data;
    })

    socket.on('session_init', (value) => {
        console.log('session_init,', value);
        session_ini.value = value
        session_ini.message = value ? 'Session iniciada' : 'Incia Session escaneando el codigo QR'
    })

    onMount(async () => {                
        // initSocket()   
    })

    function initSocket() {
        console.log('aaaaa');        
    }

    function initBot() {
        const _data = {
            nameSession: nom_session,  //`session-${Math.floor(Math.random() * 1000)}`
            infoSede: {
                infoSede : {
                    idsede: 13,
                    nombre: 'El Asador',
                    telefono: '123456789',
                    direccion: 'Calle 123',
                    ciudad: 'Lima',
                    ruc: '123456789',
                },
                listCarta: [],
                listCanalConsumo: []
            }
        }
        
        

        socket.sendMessage('init_bot', _data)

    }

    

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<p>{respondeSocket}</p>
<button on:click={initSocket}>Conectar  </button>
<button on:click={initBot}>Iniciar Bot  </button>

<input type="text" placeholder="Nombre de session" bind:value={nom_session}>

<img id="imgQR" alt="img-qr" hidden={session_ini.value}>


<h2>{session_ini.message}</h2>
