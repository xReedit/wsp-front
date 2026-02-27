<script lang="ts">
    import { putData } from "$root/services/httpClient.services";
    import { S3ImageUploader } from "$root/services/s3.connect.services";
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "./Button.svelte";
    import { showToastSwal } from "$root/services/mi.swal";
    import type { Carta } from "$root/types";

    export let itemCarta: Carta = {} as Carta
    let _loaderStatus = 0
    let urlImage = ''
    let imgCartaVisible = false;
    let s3ImageUploader = new S3ImageUploader();
    let isCategoriaHabilitada = false;
    let fileInput: FileList | undefined;

    const dispatch = createEventDispatcher()

    // cuando se carga el componente
    onMount(() => {        
        if ( itemCarta.url_carta !== 'null' && itemCarta.url_carta !== null && itemCarta.url_carta !== '' && itemCarta.url_carta !== undefined) {
            imgCartaVisible = true
            urlImage = s3ImageUploader.getImageUrl(itemCarta.url_carta)        
        }      
        
        isCategoriaHabilitada = itemCarta.visible_cliente === '1'
    });

    // funcion que sube la imagen al repositorio utilizando la clase S3ImageUploader
    async function subirImagen() {        
        const fileData = fileInput?.[0] || null;
        if ( fileData ) {
            const _nomCarta = itemCarta.descripcion.toLowerCase().trim().replace(/ /g, '_');
            const fileName = `${itemCarta.idsede}${itemCarta.idorg}_${_nomCarta}.jpg`;  
                        
            itemCarta.url_carta = fileName;
            try {
                await s3ImageUploader.uploadImage(fileName, fileData);
            } catch (error) {
                showToastSwal('error', 'Error al subir la imagen', 3000)
            }
        }
    }    

    // guardamos los datos de la carta
    async function guardarCarta() {        
        _loaderStatus = 1
        try {
            await subirImagen()

            delete itemCarta.nom_dias
            delete itemCarta.img_visible
            
            await putData('chat-bot',`update-carta/${itemCarta.idcategoria}`, itemCarta)        
            
            showToastSwal('success','Se guardo correctamente')
            dispatch('close')
        } catch (error) {
            showToastSwal('error', 'Error al guardar la carta', 3000)
        } finally {
            _loaderStatus = 0
        }
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
        <div class="flex items-center gap-2">
            <span class="text-xs {isCategoriaHabilitada ? 'text-green-600' : 'text-red-500'}">
                {isCategoriaHabilitada ? 'Habilitada' : 'Deshabilitada'}
            </span>
            <label class="toggle-switch">
                <input type="checkbox" bind:checked={isCategoriaHabilitada} on:change={() => itemCarta.visible_cliente = isCategoriaHabilitada ? '1' : '0'}>
                <span class="toggle-slider"></span>
            </label>            
        </div>
    </div>
    <p hidden={isCategoriaHabilitada} class="fs-10 text-red-500">Esta carta NO esta disponible para el cliente</p>
    <hr>
    <br>
    <div>
        <!-- subir imagen de la carta -->
        <div class="mt-5">
            <div class="flex justify-between">
                <div>
                    <h4>Imagen de la carta</h4>
                    <p class="fs-10 text-gray-500">Imagen que se compartirá con los clientes</p>
                </div>
                <div>
                    <img hidden={!imgCartaVisible} src={urlImage} alt="img-carta" width="30px">
                </div>
            </div>

            <input type="file" accept="image/png, image/jpeg" bind:files={fileInput}>
        </div>
        
        <Button icon="fa fa-save" color="primary" loader={_loaderStatus} on:click={guardarCarta}>Guardar Cambios</Button>    
    </div>

</div>

<style>
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 22px;
        flex-shrink: 0;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ef4444;
        transition: 0.3s;
        border-radius: 22px;
    }

    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
        background-color: #22c55e;
    }

    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(18px);
    }
</style>