<script lang="ts">
    import Fuse from 'fuse.js';
    import { URL_SERVER_SOCKET_PEDIDO } from "$root/config";
    import { GeolocationServices } from "$root/services/geolocation.service";

    
    import { getData, postDataPedidoBot } from "$root/services/httpClient.services";
    import { SocketClient } from "$root/services/socket.services";
    import { WebSocketIOClient } from "$root/services/webSocket.pedido.services";
    
    import { ClassEstructuraPedido } from "./estructura.pedido.class";
    import { getSubTotales } from "./getSubtotal";
    import { JsonPrintService } from "./json-print.services";
    import { Trie } from "./other.class";
    import { claim_html_tag } from 'svelte/internal';
    import { list } from 'postcss';
    // import { SoundEx, Metaphone } from 'natural'
    // import natural from 'natural';
        
    // import { soundex } from "./soundex";

interface Plato {
  idplato: number;
  nombre: string;
}


// default n=5
function soundex(word: string, n=6): string {
  const soundexMap: { [key: string]: string } = {
    A: "0", E: "0", I: "0", O: "0", U: "0", Y: "0",
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3",
    L: "4",
    M: "5", N: "5",
    R: "6"
  };

  const firstLetter = word.charAt(0).toUpperCase();
  const soundexCode = [firstLetter];

  for (let i = 1; i < word.length; i++) {
    const letter = word.charAt(i).toUpperCase();
    const soundexDigit = soundexMap[letter];
    if (soundexDigit && soundexDigit !== soundexCode[soundexCode.length - 1]) {
      soundexCode.push(soundexDigit);
    }
  }

  return soundexCode.join("").padEnd(n, "0").substring(0, n);
}

// Definir función para obtener el código NYSIIS de una palabra
// function getNysiisCode(word: string): string {
//   const nysiisMap: { [key: string]: string } = {
//     A: "A", E: "A", I: "A", O: "A", U: "A",
//     B: "B", V: "B",
//     C: "C", S: "C",
//     D: "D",
//     L: "L",
//     M: "M", N: "M",
//     R: "R"
//   };

//   const firstLetter = word.charAt(0).toUpperCase();
//   const nysiisCode = [firstLetter];

//   for (let i = 1; i < word.length; i++) {
//     const letter = word.charAt(i).toUpperCase();
//     const nysiisLetter = nysiisMap[letter];
//     if (nysiisLetter) {
//       nysiisCode.push(nysiisLetter);
//     }
//   }

//   return nysiisCode.join("");
// }

// function calcularCoeficienteJaccard(codigo1: string, codigo2: string): number {
//   const conjunto1 = new Set(codigo1.split(""));
//   const conjunto2 = new Set(codigo2.split(""));

//   const interseccion = new Set([...conjunto1].filter((x) => conjunto2.has(x)));
//   const union = new Set([...conjunto1, ...conjunto2]);

//   return interseccion.size / union.size;
// }

function getNGrams(word: string, n: number): string[] {
  const nGrams: string[] = [];
  const wordLength = word.length;

  for (let i = 0; i <= wordLength - n; i++) {
    const nGram = word.substr(i, n);
    nGrams.push(nGram);
  }

  return nGrams;
}

// Función para convertir una cantidad en su representación en palabras
function convertirCantidadEnPalabras(cantidad: string): string {
  const cantidadNumerica = parseInt(cantidad);

  if (!isNaN(cantidadNumerica)) {
    const numerosEnPalabras = [
      "cero", "", "dos", "tres", "cuatro",
      "cinco", "seis", "siete", "ocho", "nueve", "diez",
      "once", "doce", "trece", "catorce", "quince",
      "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"
    ];

    if (cantidadNumerica >= 0 && cantidadNumerica <= 20) {
      return numerosEnPalabras[cantidadNumerica] + '';
    }
  }

  return cantidad + '';
}

// Función para convertir una fracción numérica en su representación en palabras
function convertirFraccionEnPalabras(fraction: string): string | null {
  const numerador = parseInt(fraction.split("/")[0]);
  const denominador = parseInt(fraction.split("/")[1]);

  // Verificar si la fracción es válida
  if (!isNaN(numerador) && !isNaN(denominador) && denominador !== 0) {
    const fracciones = [
      "entero",
      "medio",
      "tercio",
      "cuarto",
      "quinto",
      "sexto",
      "séptimo",
      "octavo",
      "noveno",
      "décimo",
    ];

    // Verificar si el numerador es 1 y el denominador es mayor a 1
    if (numerador === 1 && denominador > 1) {
      return `${fracciones[denominador - 1]}`;
    }

    return `${numerador} ${fracciones[denominador]}`;
  }

  return null; // Devolver null si la fracción no es válida
}

// Función para detectar y convertir fracciones numéricas en palabras
function convertirFraccionesEnCadenas(cadena: string): string {
  const fraccionesRegex = /(\d+\/\d+)/g;
  const fracciones = cadena.match(fraccionesRegex);

  if (fracciones) {
    for (const fraccion of fracciones) {
      const fraccionEnPalabras = convertirFraccionEnPalabras(fraccion);

      if (fraccionEnPalabras) {
        cadena = cadena.replace(fraccion, fraccionEnPalabras);
      }
    }
  }

  const cantidadesRegex = /(\b\d+\b)\s/;
  const cantidades = cadena.match(cantidadesRegex);

  if (cantidades) {
    for (const cantidad of cantidades) {
      const cantidadEnPalabras = convertirCantidadEnPalabras(cantidad.trim());

    if (cantidadEnPalabras) {
        cadena = cadena.replace(cantidad, cantidadEnPalabras + ' ');
    }

    if ( cantidadEnPalabras === '' ) {
        cadena = cadena.replace(cantidad, '');
    }

    }
  }

  return cadena;
}


// Función para buscar coincidencias exactas utilizando include
function primeraBusqueda(platosBuscar: any[], lista: any[], encontrados: any): any[] {
  platosBuscar.forEach((plato) => {
    const platoEncontrado = lista.find((item) => item.des.toLowerCase() === plato.des.toLowerCase());
    if (platoEncontrado) {
      plato.encontrado = true;
      plato.iditem = platoEncontrado.iditem
      encontrados.push(platoEncontrado)
    }
  });

  return encontrados  
}

// busqueda fuse
function segundaBusqueda(platosBuscar: any[], lista: any[], encontrados: any) {  
  const nombresPlatos = lista.map((plato) => plato.des);

  const options = {
    shouldSort: true,
    includeScore : true,
    includeMatches : true,
    findAllMatches : true,
    ignoreLocation : true,
    useExtendedSearch : true,
    Location : 1,
    threshold: 0.4, // Umbral de similitud (puedes ajustarlo según tus necesidades)
    keys: ['des']
  };

  const fuse = new Fuse(nombresPlatos, options);

  platosBuscar.filter(x => !x.encontrado).forEach((plato) => {
    const result = fuse.search(plato.des);
    console.log('plato busco', plato);
    console.log('result fuse', result);
    if (result.length > 0) {
      plato.encontrado = true;
      const nomPlatoCartaEcontrado = result[0].item;
      const itemPlatoCartaEncontrado = lista.find(x => x.des === nomPlatoCartaEcontrado)  
      plato.iditem = itemPlatoCartaEncontrado.iditem
      encontrados.push(itemPlatoCartaEncontrado)
    }
  });

  console.log('segundaBusqueda', platosBuscar);
  return encontrados
  // return [platosBuscar, encontrados];
}

// Función para buscar coincidencias utilizando Soundex
function buscarCoincidenciasSoundex(listaPlatos: any[], pedidoCliente:any[]) {

    let encontrados: any[] = [];
    const noEncontrados: string[] = [];
    const cantidadesMayores: any[] = [];      

    listaPlatos.map(x => x.des = convertirFraccionesEnCadenas(x.des.toLowerCase())); // convertimos las fracciones en palabras
    console.log('listaPlatos', listaPlatos);

    let platosBuscar = pedidoCliente.map(plato => {
        const _plato = plato.toLowerCase().split('-')
        const _cantidad = _plato[0].trim()
        let _nomPlato = _plato[1].toLocaleLowerCase().trim()
        let _indicaciones = ''
        // verificamos si viene con indicaciones que estan entre parentesis ()
        if ( _nomPlato.includes('(') ) {
            _indicaciones = _nomPlato.split('(')[1].split(')')[0].trim()
            _nomPlato = _nomPlato.split('(')[0].trim()
        }


        return {
            des: convertirFraccionesEnCadenas(_nomPlato),
            cantidad: _cantidad,
            indicaciones: _indicaciones,
            encontrado: false,
            iditem: 0, // id encontrado
        }
    });

  primeraBusqueda(platosBuscar, listaPlatos, encontrados)
  // console.log('platosBuscar', platosBuscar);

  segundaBusqueda(platosBuscar, listaPlatos, encontrados)
  

  // de los platos encontrados verificamos la cantidad
  encontrados.forEach((plato) => {
    const platoBuscar = platosBuscar.find(x => x.iditem === plato.iditem)
    const cantidadSeleccionada = parseInt(platoBuscar.cantidad)
    const cantidadPlatoCarta = plato.cantidad === 'ND' ? 10000 :  parseInt(plato.cantidad)
    if (cantidadSeleccionada > cantidadPlatoCarta) {
        cantidadesMayores.push(`${plato.cantidad} ${plato.des.toLowerCase()}`)
    }
    else {
        // agregamos la cantidad, precio y las indicaciones        
        const _precioTotal = cantidadSeleccionada * parseFloat(plato.precio_unitario)
        plato.cantidad_seleccionada = cantidadSeleccionada
        plato.precio_print = _precioTotal.toFixed(2)
        plato.precio_total = _precioTotal
        if ( plato.indicaciones !== '' && plato.indicaciones !== undefined ) {
            plato.indicaciones = plato.indicaciones
        }        
    }
  });

  // platos no encontrados y sugerencias
  platosBuscar.filter(x => !x.encontrado).forEach((plato) => {
    noEncontrados.push(plato.des)    
  });


   
  // for (const plato of platosBuscar.filter(x => !x.encontrado)) {
  //   console.log('plato.des.length',plato.des.length);
  //   let n = plato.des.length / 2
  //   const nombrePlato: string = plato.des.toLowerCase();
  //   const soundexNombrePlatoBuscar: string = soundex(nombrePlato);
        
  //   const nombrePlatoNGrams: string[] = getNGrams(nombrePlato, n);

  //   let isPlatoEcontrado = false

  //       for (const platoCarta of listaPlatos) {
  //           const nomPlatoCarta = convertirFraccionesEnCadenas(platoCarta.des.toLocaleLowerCase())
  //           // n = nomPlatoCarta.length / 2
  //           const soundexPlatoCarta: string = soundex(nomPlatoCarta);
  //           const nomPlatoCartaNGrams: string[] = getNGrams(nomPlatoCarta, n);

  //           const isIncludedSoundex = soundexNombrePlatoBuscar.includes(soundexPlatoCarta);            

  //           const intersectionNGrams = nombrePlatoNGrams.filter((nGram) => nomPlatoCartaNGrams.includes(nGram));




  //           console.log(`plato Buscar: ${nombrePlato} - ${soundexNombrePlatoBuscar}
  //           plato carta: ${nomPlatoCarta} - ${soundexPlatoCarta}
  //           incluye Soundex: ${isIncludedSoundex}                        
  //           NGrams: ${intersectionNGrams}
  //           nombrePlatoNGrams: ${nombrePlatoNGrams}
  //           nomPlatoCartaNGrams: ${nomPlatoCartaNGrams}`);

  //           // soundexNatural: ${soundexNatural}
  //           // metaphoneNatural: ${metaphoneNatural}`);

  //           //   if (soundexNombrePlato.includes(soundexPlatoCarta)) {
  //           if ( isIncludedSoundex && intersectionNGrams.length > 0) {
  //               isPlatoEcontrado = true

  //               // vamos a comprar la cantidad
  //               const cantidadPlato = parseInt(plato.cantidad)
  //               const cantidadPlatoCarta = platoCarta.cantidad === 'ND' ? 10000 :  parseInt(platoCarta.cantidad)
  //               if (cantidadPlato > cantidadPlatoCarta) {
  //                   cantidadesMayores.push(`${platoCarta.cantidad} ${platoCarta.des.toLowerCase()}`)
  //               } else {
  //                   // agregamos la cantidad, precio y las indicaciones
  //                   const _precioTotal = plato.cantidad * parseFloat(platoCarta.precio_unitario)
  //                   platoCarta.cantidad_seleccionada = plato.cantidad
  //                   platoCarta.precio_print = _precioTotal.toFixed(2)
  //                   platoCarta.precio_total = _precioTotal
  //                   if ( plato.indicaciones !== '' ) {
  //                       platoCarta.indicaciones = plato.indicaciones
  //                   }
  //                   encontrados.push(platoCarta);
  //               }
  //               break;        
  //           }
  //       }

  //       if ( !isPlatoEcontrado ) {
  //           noEncontrados.push(nombrePlato);
  //       }
  //   }

  console.log('encontrados', encontrados);
  console.log('noEncontrados', noEncontrados);
  console.log('cantidadesMayores', cantidadesMayores);

  return [encontrados, noEncontrados, cantidadesMayores];
}

// funcion que inserta los platos encontrados en su respectiva seccion
function insertarPlatosEnSeccion(laCarta: any[], platosEcontrados: any[]) {
    let listSecciones = []

    // obtengo las secciones
    const _secciones = laCarta.flatMap(item => item.secciones)
    const _platos = platosEcontrados.map(plato => {
        // buscar seccion // si existe en listSecciones ya no la vueleve a crear        
        const _seccion = {..._secciones.find(seccion => seccion.idseccion === plato.idseccion)}
        const _seccionExits = listSecciones.find(seccion => seccion.idseccion === _seccion.idseccion)
        if ( !_seccionExits ) {
          _seccion.items = []
          _seccion.items.push(plato)
          listSecciones.push(_seccion)
        } else {
          _seccionExits.items.push(plato)
        }
    }) 

    console.log('listSecciones', listSecciones);
    return listSecciones
}


function cocinarPeticionCliente(pedidoCliente: any) {

    return pedidoCliente.map(plato => {
        const _plato = plato.toLowerCase().split('-')
        const _cantidad = _plato[0].trim()
        let _nomPlato = _plato[1].toLocaleLowerCase().trim()
        let _indicaciones = ''
        // verificamos si viene con indicaciones que estan entre parentesis ()
        if (_nomPlato.includes('(')) {
            _indicaciones = _nomPlato.split('(')[1].split(')')[0].trim()
            _nomPlato = _nomPlato.split('(')[0].trim()
        }


        return {
            des: convertirFraccionesEnCadenas(_nomPlato),
            cantidad: _cantidad,
            indicaciones: _indicaciones,
            encontrado: false,
            iditem: 0, // id encontrado
        }
    });

}

// consultar si hay un plato
export function consultarPlato(listaPlatos: any[], pedidoCliente: string) {
    let encontrados = []
    let platoEncontrado = null
    const _pedidoCliente = pedidoCliente.split(',')
    console.log('_pedidoCliente', _pedidoCliente);
    let platosBuscar = cocinarPeticionCliente(_pedidoCliente)
    primeraBusqueda(platosBuscar, listaPlatos, encontrados)
    segundaBusqueda(platosBuscar, listaPlatos, encontrados)

    if ( encontrados.length > 0 ) {
      platoEncontrado = listaPlatos.find((item) => item.iditem === encontrados[0].iditem);  
    }
    return platoEncontrado;
}

  // vamos a consultar lo que hay en la carta, traeremos los 5 primeros platos de la seccion mas pedida 
  async function consularLoQueHay() {
    let listSeccionMasPiden = await getData('', `get-seccion-mas-piden/13`)
    listSeccionMasPiden = listSeccionMasPiden;

    const laCarta = await getData('chat-bot', `get-carta-establecimiento/${13}`)
    const itemsCarta = laCarta.carta.flatMap(item => item.secciones.flatMap(seccion => seccion.items)) || []; 

    // seccion mas pedida
    const idSeccionMaPedida = listSeccionMasPiden[0].idseccion    

    // obtner los platos de la seccion mas pedida    
    const platosSeccionMasPedida = itemsCarta.filter(x => 
        x.idseccion === parseInt(idSeccionMaPedida)
        && (x.cantidad === 'ND' || parseInt(x.cantidad) > 0))

    // solo mostrar los 5 primeros platos
    platosSeccionMasPedida.splice(5, platosSeccionMasPedida.length - 5)
    platosSeccionMasPedida.map(x => x.des.toLowerCase())

    console.log('platosSeccionMasPedida', platosSeccionMasPedida.map(x => x.des.toLowerCase()));



  }

  async function consultar_plato() {

    const plato = 'tilapia frita'

    let rptConsulta = ''
        let platoConsular = `0-${plato}`
        const laCarta = await getData('chat-bot', `get-carta-establecimiento/${13}`)
        const itemsCarta = laCarta.carta.flatMap(item => item.secciones.flatMap(seccion => seccion.items)) || [];

        let platoEncontrado = consultarPlato(itemsCarta, platoConsular)
        console.log('platoEncontrado', platoEncontrado);
        if (platoEncontrado) {
            // informamos al cliente que si tenemos disponible este plato
            const stock = platoEncontrado.cantidad === 'ND' ? 100 : parseFloat(platoEncontrado.cantidad)
            const stockDisponible = stock > 0
            if ( stockDisponible ) {
              const strStock = stock > 10 ? 'tenemos disponible' : `aún nos quedan disponible ${stock}`
              rptConsulta = `Si, ${strStock} ${platoEncontrado.des.toLowerCase()}`
            } else {
              rptConsulta = `No, ya no tenemos disponible ${platoEncontrado.des.toLowerCase()}`
            }
        } else {
            // informamos al cliente que no tenemos disponible este plato
            rptConsulta = `No, no tenemos disponible ${plato}`
        }
        

        console.log('rptConsulta', rptConsulta);
        return rptConsulta;

  }

    async function actionLab1() {
      let infoPedido = new ClassEstructuraPedido()
      let subtotalCostoEntrega = null
        const laCarta = await getData('chat-bot', `get-carta-establecimiento/${13}`)
        let canalConsumoSeleted = { idtipo_consumo: 33, descripcion: 'DELIVERY', secciones: [] }

        // const itemsCarta = laCarta.carta.flatMap(item => item.secciones.filter(x => x.idseccion === 93).flatMap(seccion => seccion.items)) || [];
        const itemsCarta = laCarta.carta.flatMap(item => item.secciones.flatMap(seccion => seccion.items)) || [];
        console.log('itemsCarta', itemsCarta);
        const listPedido = ['2-octavos de pollo', '2-brocheta pollo', '1-aji de gallina']
        console.log('listPedido', listPedido);
        
        const [encontrados, noEncontrados, cantidadesMayores] = buscarCoincidenciasSoundex(itemsCarta, listPedido)
        

        return;

    }            
    



</script>


<div class="m-5">
    <button on:click={actionLab1}>Ejecutar lab1</button>
    <br><br>

    <button on:click={consultar_plato}>consultar plato</button>
    <br><br>

    <button on:click={consularLoQueHay}>Que hay</button>

    
</div>