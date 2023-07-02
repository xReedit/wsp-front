<script lang="ts">
    import { getData } from "$root/services/httpClient.services";

    // Función para obtener los N-Gramas de una palabra
function getNGrams(word: string, n: number): string[] {
  const nGrams: string[] = [];
  const wordLength = word.length;

  for (let i = 0; i <= wordLength - n; i++) {
    const nGram = word.substr(i, n);
    nGrams.push(nGram);
  }

  return nGrams;
}

// Función para calcular el índice de Jaccard entre dos conjuntos
function calculateJaccardIndex(setA: Set<string>, setB: Set<string>): number {
  const intersectionSize = [...setA].filter((element) => setB.has(element)).length;
  const unionSize = setA.size + setB.size - intersectionSize;
  return intersectionSize / unionSize;
}

// Función para buscar coincidencias utilizando el algoritmo mejorado de N-Gramas
function buscarCoincidenciasNGramasMejorado(
  listaPlatos: any[],
  pedidoCliente: any[],
  n: number,
  threshold: number
): number[] {
//   const palabrasPedido: string[] = pedidoCliente.toLowerCase().split(" ");
  const coincidencias: number[] = [];

  const platosBuscar = pedidoCliente.map(plato => {
        const _plato = plato.toLowerCase().split('-')
        return {
            des: _plato[1].toLocaleLowerCase().trim(),
            cantidad: _plato[0].toLocaleLowerCase().trim()
        }
    });

  for (const plato of listaPlatos) {
    const nombrePlato: string = plato.des.toLowerCase();
    const platoNGrams: Set<string> = new Set(getNGrams(nombrePlato, n));

    for (const palabra of platosBuscar) {
     const nombrePlatoPedido: string = palabra.des.toLowerCase();
      const palabraNGrams: Set<string> = new Set(getNGrams(nombrePlatoPedido, n));

      const jaccardIndex = calculateJaccardIndex(platoNGrams, palabraNGrams);

      if (jaccardIndex >= threshold) {
        coincidencias.push(plato);
        break;
      }
    }
  }

  console.log('coincidencias', coincidencias);

  return coincidencias;
}


async function actionLab2() {
        const laCarta = await getData('chat-bot', `get-carta-establecimiento/${13}`)
        const itemsCarta = laCarta.carta.flatMap(item => item.secciones.flatMap(seccion => seccion.items)) || [];
        const listPedido = ['1-lomo saltado', '2-aji de gallina']
        
        buscarCoincidenciasNGramasMejorado(itemsCarta, listPedido,2,0.5)


        // buscarCoincidenciasPartialString(itemsCarta, listPedido)
    }
</script>

<div class="m-5">
    <button on:click={actionLab2}>Ejecutar lab 2</button>
</div>