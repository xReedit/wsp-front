<script lang="ts">
    import { putData } from "$root/services/httpClient.services";
    import { S3ImageUploader } from "$root/services/s3.connect.services";
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "./Button.svelte";
    import { showToastSwal } from "$root/services/mi.swal";
    import { get } from "svelte/store";

    export let itemCarta: any = {}
    let _loaderStatus = 0
    let urlImage = ''
    let s3ImageUploader = new S3ImageUploader();
    let isCategoriaHabilitada = false;

    const dispatch = createEventDispatcher()

    let diasTrabaja = '';

    let dias_semana = [ 
        {numdia: 1, nomdia: 'Domingo'},
        {numdia: 2, nomdia: 'Lunes'},
        {numdia: 3, nomdia: 'Martes'},
        {numdia: 4, nomdia: 'Miercoles'},
        {numdia: 5, nomdia: 'Jueves'},
        {numdia: 6, nomdia: 'Viernes'},
        {numdia: 7, nomdia: 'Sabado'},
    ]

    // cuando se carga el componente
    onMount(() => {
        diasTrabaja = itemCarta.dia_disponible
        if ( itemCarta.url_carta !== '' ) {
            urlImage = s3ImageUploader.getImageUrl(itemCarta.url_carta)        
        }      
        
        isCategoriaHabilitada = itemCarta.visible_cliente === '1'
        marcarDias();
    });
    

    // function que chequea los dias que trabaja el restaurante
    function checkDiaList(e: any) {
        let dia = e.target.value;
        itemCarta.dia_disponible
        if (e.target.checked) {
            diasTrabaja += dia + ',';
        } else {
            diasTrabaja = diasTrabaja.replace(dia, '');
        }
        itemCarta.dia_disponible = diasTrabaja;        
    }

    // marcar los dias que trabaja el restaurante
    function marcarDias() {
        let dias = itemCarta.dia_disponible.split(',');
        dias.forEach(dia => {
            let check = document.getElementById('checkdia'+dia);
            if (check) {
                check.checked = true;
            }
        });
    }

    // funcion que sube la imagen al repositorio utilizando la clase S3ImageUploader
    async function subirImagen() {        
        let img_carta = document.getElementById('img_carta');  
        const fileData = img_carta.files[0] || null;
        if ( fileData ) {
            const _nomCarta = itemCarta.descripcion.toLowerCase().trim().replace(/ /g, '_');
            const fileName = `${itemCarta.idsede}${itemCarta.idorg}_${_nomCarta}.jpg`;  
                        
            itemCarta.url_carta = fileName;
            await s3ImageUploader.uploadImage(fileName, fileData);
        }
    }    

    // guarmaos los datos de la carta
    async function guardarCarta() {        
        _loaderStatus = 1
        await subirImagen()

        delete itemCarta.nom_dias
        delete itemCarta.img_visible
        
        const rpt = await putData('chat-bot',`update-carta/${itemCarta.idcategoria}`, itemCarta)        
        
        showToastSwal('success','Se guardo correctamente')
        dispatch('close')
    }


    function habilitarCategoria() {
        isCategoriaHabilitada = !isCategoriaHabilitada;
        itemCarta.visible_cliente = isCategoriaHabilitada ? '1' : '0';
    }

</script>

<div style="max-width: 350px;">
    <div class="flex justify-between">
        <div>
            <h3>{itemCarta.descripcion}</h3>
        </div>
        <div>
            {#if isCategoriaHabilitada}
                <p on:click={habilitarCategoria} class="badge primary fs-10 cursor-pointer">Habilitada</p>                
            {:else}
                <p on:click={habilitarCategoria} class="badge danger fs-10 cursor-pointer">Deshabilitada</p>
            {/if}
        </div>
    </div>
    <p hidden={isCategoriaHabilitada} class="fs-10 text-red-500">Esta carta NO esta disponible para el cliente</p>
    <hr>
    <br>
    <div>
        <!-- horario -->
        <div>
            <h4>Horario de atención</h4>
            <p class="fs-10 text-gray-500">La hora debe ser en formato 24 horas</p>            
            <div style="display: flex" class="mt-2">
                <div class="pr-5">
                    <p >Hora Abre</p>
                    <input type="time" id="h_ini" name="h_ini" bind:value={itemCarta.hora_ini} required>
                </div>
                <div>
                    <p>Hora Cierra</p>
                    <input type="time" id="h_fin" name="h_fin" bind:value={itemCarta.hora_fin} required>
                </div>
            </div>
        </div>

        <hr>
        <!-- dias de atencion -->
        <div class="mt-5">
            <h4>Dias de atención</h4>
            <div class="d-flex">
                {#each dias_semana as dia}
                    <div style="display: inline-flex; padding:5px">
                        <input  type="checkbox" id="checkdia{dia.numdia}" name="dia{dia.numdia}" value="{dia.numdia}" on:change={checkDiaList}>
                        <label class="pl-1" for="dia{dia.numdia}">{dia.nomdia}</label>
                    </div>
                {/each}
            </div>
        </div>

        <hr>
        <!-- subir imagen de la carta -->
        <div class="mt-5">
            <div class="flex justify-between">
                <div>
                    <h4>Imagen de la carta</h4>
                    <p class="fs-10 text-gray-500">Imagen que se compartirá con los clientes</p>
                </div>
                <div>
                    <img hidden={urlImage === ''} src={urlImage} alt="img-carta" width="30px">
                </div>
            </div>

            <input type="file" id="img_carta" name="img_carta" accept="image/png, image/jpeg">
        </div>
        
        <Button icon="fa fa-save" color="primary" loader={_loaderStatus} on:click={guardarCarta}>Guardar Cambios</Button>    
    </div>

</div>