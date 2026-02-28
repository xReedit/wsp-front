<script lang="ts">
    import { onMount } from 'svelte';
    import { getData, postDataJSON } from '$root/services/httpClient.services';
    import { showToastSwal } from '$root/services/mi.swal';
    import Button from './Button.svelte';
    import type { HorarioDia } from '$root/types';

    export let idsede: string = '';

    let horarios: HorarioDia[] = [];
    let _loaderStatus = 0;
    let isLoading = true;

    // Formulario inline
    let inputDesde = '';
    let inputHasta = '';
    let diasSeleccionados: number[] = [2, 3, 4, 5, 6, 7];

    const DIAS_SEMANA = [
        { num: 2, nombre: 'Lunes' },
        { num: 3, nombre: 'Martes' },
        { num: 4, nombre: 'Miercoles' },
        { num: 5, nombre: 'Jueves' },
        { num: 6, nombre: 'Viernes' },
        { num: 7, nombre: 'Sabado' },
        { num: 1, nombre: 'Domingo' },
    ];

    onMount(async () => {
        await cargarHorarios();
    });

    async function cargarHorarios() {
        isLoading = true;
        try {
            const data: HorarioDia[] = await getData('chat-bot', `get-horario-dias/${idsede}`);
            horarios = data || [];
        } catch (error) {
            showToastSwal('error', 'Error al cargar los horarios', 3000);
            horarios = [];
        } finally {
            isLoading = false;
        }
    }

    function toggleDia(numDia: number) {
        if (diasSeleccionados.includes(numDia)) {
            diasSeleccionados = diasSeleccionados.filter(d => d !== numDia);
        } else {
            diasSeleccionados = [...diasSeleccionados, numDia];
        }
    }

    function agregarHorario() {
        if (!inputDesde || !inputHasta) {
            showToastSwal('warning', 'Ingrese hora desde y hasta', 3000);
            return;
        }
        if (diasSeleccionados.length === 0) {
            showToastSwal('warning', 'Seleccione al menos un día', 3000);
            return;
        }

        const diasOrdenados = [...diasSeleccionados].sort((a, b) => a - b);
        const nuevoHorario: HorarioDia = {
            idsede: Number(idsede),
            de: inputDesde,
            a: inputHasta,
            estado: 0,
            numdia: diasOrdenados.join(',') + ',',
            desdia: null
        };

        horarios = [...horarios, nuevoHorario];
        inputDesde = '';
        inputHasta = '';
    }

    function eliminarHorario(index: number) {
        horarios = horarios.filter((_, i) => i !== index);
    }

    function getNombreDias(numdia: string): string {
        const dias = numdia.split(',').filter(d => d !== '');
        return dias.map(d => {
            const found = DIAS_SEMANA.find(ds => ds.num === Number(d));
            return found ? found.nombre : '';
        }).filter(d => d !== '').join(', ');
    }

    async function guardarHorarios() {
        if (horarios.length === 0) {
            showToastSwal('warning', 'Debe tener al menos un horario configurado', 3000);
            return;
        }

        _loaderStatus = 1;
        try {
            await postDataJSON('chat-bot', `set-horario-dias`, {
                idsede: Number(idsede),
                horarios: horarios
            });
            showToastSwal('success', 'Horarios guardados correctamente');
            await cargarHorarios();
        } catch (error) {
            showToastSwal('error', 'Error al guardar los horarios', 3000);
        } finally {
            _loaderStatus = 0;
        }
    }
</script>

<section class="card-1">
    <h5>Horarios de Atención</h5>
    <p class="text-sm text-gray-500">Configure los horarios y días de atención del establecimiento</p>

    {#if isLoading}
        <div class="text-center py-4">
            <i class="fa fa-spinner fa-spin"></i>
            <p class="text-sm text-gray-500">Cargando horarios...</p>
        </div>
    {:else}
        <!-- Atención al público: checkboxes de días -->
        <div class="mt-3">
            <p class="text-sm font-medium text-gray-600 mb-1">Atención al público:</p>
            <div class="flex flex-wrap gap-x-3 gap-y-1">
                {#each DIAS_SEMANA as dia}
                    <label class="inline-flex items-center cursor-pointer text-sm">
                        <input 
                            type="checkbox" 
                            class="cursor-pointer mr-1"
                            checked={diasSeleccionados.includes(dia.num)}
                            on:change={() => toggleDia(dia.num)}
                        >
                        {dia.nombre}
                    </label>
                {/each}
            </div>
        </div>

        <hr class="my-3">

        <!-- Horario de trabajo: inputs + botón agregar -->
        <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Horario de trabajo: <span class="font-normal text-gray-400">Ingrese en formato 24hrs</span></p>
            <div class="flex items-baseline gap-2 mt-1">
                <input 
                    type="time" 
                    bind:value={inputDesde} 
                    placeholder="desde"
                    class="border rounded px-2 py-1 text-sm"
                >
                <input 
                    type="time" 
                    bind:value={inputHasta} 
                    placeholder="hasta"
                    class="border rounded px-2 py-1 text-sm"
                >
                <button 
                    class="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-1 text-sm font-medium"
                    on:click={agregarHorario}
                >
                    Agregar
                </button>
            </div>
        </div>

        <!-- Lista de horarios agregados -->
        {#if horarios.length > 0}
            <table class="w-full fs-12 mt-3">
                <tbody>
                    {#each horarios as horario, index}
                        <tr class="border-b">
                            <td class="py-2 text-sm text-gray-600" style="max-width: 180px;">
                                {getNombreDias(horario.numdia)}
                            </td>
                            <td class="py-2 text-sm text-center">{horario.de}</td>
                            <td class="py-2 text-sm text-center">{horario.a}</td>
                            <td class="py-2 text-right">
                                <button 
                                    class="text-red-500 hover:text-red-700 text-sm px-2"
                                    on:click={() => eliminarHorario(index)}
                                    title="Eliminar"
                                >
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}

        <!-- Guardar -->
        <div class="mt-3">
            <Button icon="fa fa-save" color="primary" loader={_loaderStatus} on:click={guardarHorarios}>
                Guardar Horarios
            </Button>
        </div>
    {/if}
</section>
