export interface UbigeoItem {
    codigo_postal: string
    distrito: string
    provincia: string
    departamento: string
    label: string // "distrito codigo_postal - provincia, departamento"
}

// Dataset de ubigeo peruano con códigos postales
// Fuente: Serpost - Códigos postales del Perú
const rawData: [string, string, string, string][] = [
    // LIMA - Lima
    ["15001", "Lima", "Lima", "Lima"],
    ["15002", "Ancón", "Lima", "Lima"],
    ["15003", "Ate", "Lima", "Lima"],
    ["15004", "Barranco", "Lima", "Lima"],
    ["15005", "Breña", "Lima", "Lima"],
    ["15006", "Carabayllo", "Lima", "Lima"],
    ["15007", "Chaclacayo", "Lima", "Lima"],
    ["15008", "Chorrillos", "Lima", "Lima"],
    ["15009", "Cieneguilla", "Lima", "Lima"],
    ["15010", "Comas", "Lima", "Lima"],
    ["15011", "El Agustino", "Lima", "Lima"],
    ["15012", "Independencia", "Lima", "Lima"],
    ["15013", "Jesús María", "Lima", "Lima"],
    ["15014", "La Molina", "Lima", "Lima"],
    ["15015", "La Victoria", "Lima", "Lima"],
    ["15016", "Lince", "Lima", "Lima"],
    ["15017", "Los Olivos", "Lima", "Lima"],
    ["15018", "Lurigancho", "Lima", "Lima"],
    ["15019", "Lurín", "Lima", "Lima"],
    ["15020", "Magdalena del Mar", "Lima", "Lima"],
    ["15021", "Pueblo Libre", "Lima", "Lima"],
    ["15022", "Miraflores", "Lima", "Lima"],
    ["15023", "Pachacámac", "Lima", "Lima"],
    ["15024", "Pucusana", "Lima", "Lima"],
    ["15025", "Puente Piedra", "Lima", "Lima"],
    ["15026", "Punta Hermosa", "Lima", "Lima"],
    ["15027", "Punta Negra", "Lima", "Lima"],
    ["15028", "Rímac", "Lima", "Lima"],
    ["15029", "San Bartolo", "Lima", "Lima"],
    ["15030", "San Borja", "Lima", "Lima"],
    ["15031", "San Isidro", "Lima", "Lima"],
    ["15032", "San Juan de Lurigancho", "Lima", "Lima"],
    ["15033", "San Juan de Miraflores", "Lima", "Lima"],
    ["15034", "San Luis", "Lima", "Lima"],
    ["15035", "San Martín de Porres", "Lima", "Lima"],
    ["15036", "San Miguel", "Lima", "Lima"],
    ["15037", "Santa Anita", "Lima", "Lima"],
    ["15038", "Santa María del Mar", "Lima", "Lima"],
    ["15039", "Santa Rosa", "Lima", "Lima"],
    ["15040", "Santiago de Surco", "Lima", "Lima"],
    ["15041", "Surquillo", "Lima", "Lima"],
    ["15042", "Villa El Salvador", "Lima", "Lima"],
    ["15043", "Villa María del Triunfo", "Lima", "Lima"],
    // LIMA - Barranca
    ["15100", "Barranca", "Barranca", "Lima"],
    ["15101", "Paramonga", "Barranca", "Lima"],
    ["15102", "Pativilca", "Barranca", "Lima"],
    ["15103", "Supe", "Barranca", "Lima"],
    ["15104", "Supe Puerto", "Barranca", "Lima"],
    // LIMA - Cajatambo
    ["15200", "Cajatambo", "Cajatambo", "Lima"],
    // LIMA - Canta
    ["15300", "Canta", "Canta", "Lima"],
    // LIMA - Cañete
    ["15400", "San Vicente de Cañete", "Cañete", "Lima"],
    ["15401", "Asia", "Cañete", "Lima"],
    ["15402", "Calango", "Cañete", "Lima"],
    ["15403", "Cerro Azul", "Cañete", "Lima"],
    ["15404", "Chilca", "Cañete", "Lima"],
    ["15405", "Coayllo", "Cañete", "Lima"],
    ["15406", "Imperial", "Cañete", "Lima"],
    ["15407", "Lunahuaná", "Cañete", "Lima"],
    ["15408", "Mala", "Cañete", "Lima"],
    ["15409", "Nuevo Imperial", "Cañete", "Lima"],
    ["15410", "Pacarán", "Cañete", "Lima"],
    ["15411", "Quilmaná", "Cañete", "Lima"],
    ["15412", "San Antonio", "Cañete", "Lima"],
    ["15413", "Santa Cruz de Flores", "Cañete", "Lima"],
    ["15414", "Zúñiga", "Cañete", "Lima"],
    // LIMA - Huaral
    ["15500", "Huaral", "Huaral", "Lima"],
    ["15501", "Atavillos Alto", "Huaral", "Lima"],
    ["15502", "Atavillos Bajo", "Huaral", "Lima"],
    ["15503", "Aucallama", "Huaral", "Lima"],
    ["15504", "Chancay", "Huaral", "Lima"],
    ["15505", "Ihuarí", "Huaral", "Lima"],
    ["15506", "Lampián", "Huaral", "Lima"],
    ["15507", "Pacaraos", "Huaral", "Lima"],
    ["15508", "San Miguel de Acos", "Huaral", "Lima"],
    ["15509", "Santa Cruz de Andamarca", "Huaral", "Lima"],
    ["15510", "Sumbilca", "Huaral", "Lima"],
    ["15511", "Veintisiete de Noviembre", "Huaral", "Lima"],
    // LIMA - Huarochirí
    ["15600", "Matucana", "Huarochirí", "Lima"],
    ["15601", "Antioquía", "Huarochirí", "Lima"],
    ["15602", "Callahuanca", "Huarochirí", "Lima"],
    ["15603", "Carampoma", "Huarochirí", "Lima"],
    ["15604", "Chicla", "Huarochirí", "Lima"],
    ["15605", "Ricardo Palma", "Huarochirí", "Lima"],
    ["15606", "San Mateo", "Huarochirí", "Lima"],
    ["15607", "Santa Eulalia", "Huarochirí", "Lima"],
    ["15608", "Santiago de Tuna", "Huarochirí", "Lima"],
    // LIMA - Huaura
    ["15700", "Huacho", "Huaura", "Lima"],
    ["15701", "Ámbar", "Huaura", "Lima"],
    ["15702", "Caleta de Carquín", "Huaura", "Lima"],
    ["15703", "Checras", "Huaura", "Lima"],
    ["15704", "Hualmay", "Huaura", "Lima"],
    ["15705", "Huaura", "Huaura", "Lima"],
    ["15706", "Leoncio Prado", "Huaura", "Lima"],
    ["15707", "Paccho", "Huaura", "Lima"],
    ["15708", "Santa Leonor", "Huaura", "Lima"],
    ["15709", "Santa María", "Huaura", "Lima"],
    ["15710", "Sayán", "Huaura", "Lima"],
    ["15711", "Végueta", "Huaura", "Lima"],
    // LIMA - Oyón
    ["15800", "Oyón", "Oyón", "Lima"],
    // LIMA - Yauyos
    ["15900", "Yauyos", "Yauyos", "Lima"],
    
    // CALLAO
    ["07001", "Callao", "Callao", "Callao"],
    ["07006", "Bellavista", "Callao", "Callao"],
    ["07007", "Carmen de La Legua Reynoso", "Callao", "Callao"],
    ["07016", "La Perla", "Callao", "Callao"],
    ["07021", "La Punta", "Callao", "Callao"],
    ["07036", "Ventanilla", "Callao", "Callao"],
    ["07041", "Mi Perú", "Callao", "Callao"],

    // AREQUIPA
    ["04001", "Arequipa", "Arequipa", "Arequipa"],
    ["04002", "Alto Selva Alegre", "Arequipa", "Arequipa"],
    ["04003", "Cayma", "Arequipa", "Arequipa"],
    ["04004", "Cerro Colorado", "Arequipa", "Arequipa"],
    ["04005", "Characato", "Arequipa", "Arequipa"],
    ["04006", "Chiguata", "Arequipa", "Arequipa"],
    ["04007", "Jacobo Hunter", "Arequipa", "Arequipa"],
    ["04008", "José Luis Bustamante y Rivero", "Arequipa", "Arequipa"],
    ["04009", "La Joya", "Arequipa", "Arequipa"],
    ["04010", "Mariano Melgar", "Arequipa", "Arequipa"],
    ["04011", "Miraflores", "Arequipa", "Arequipa"],
    ["04012", "Mollebaya", "Arequipa", "Arequipa"],
    ["04013", "Paucarpata", "Arequipa", "Arequipa"],
    ["04014", "Pocsi", "Arequipa", "Arequipa"],
    ["04015", "Polobaya", "Arequipa", "Arequipa"],
    ["04016", "Quequeña", "Arequipa", "Arequipa"],
    ["04017", "Sabandía", "Arequipa", "Arequipa"],
    ["04018", "Sachaca", "Arequipa", "Arequipa"],
    ["04019", "San Juan de Siguas", "Arequipa", "Arequipa"],
    ["04020", "San Juan de Tarucani", "Arequipa", "Arequipa"],
    ["04021", "Santa Isabel de Siguas", "Arequipa", "Arequipa"],
    ["04022", "Santa Rita de Siguas", "Arequipa", "Arequipa"],
    ["04023", "Socabaya", "Arequipa", "Arequipa"],
    ["04024", "Tiabaya", "Arequipa", "Arequipa"],
    ["04025", "Uchumayo", "Arequipa", "Arequipa"],
    ["04026", "Vítor", "Arequipa", "Arequipa"],
    ["04027", "Yanahuara", "Arequipa", "Arequipa"],
    ["04028", "Yarabamba", "Arequipa", "Arequipa"],
    ["04029", "Yura", "Arequipa", "Arequipa"],
    // Arequipa - Camaná
    ["04100", "Camaná", "Camaná", "Arequipa"],
    ["04101", "José María Quimper", "Camaná", "Arequipa"],
    ["04102", "Mariscal Cáceres", "Camaná", "Arequipa"],
    ["04103", "Nicolás de Piérola", "Camaná", "Arequipa"],
    ["04104", "Ocoña", "Camaná", "Arequipa"],
    ["04105", "Quilca", "Camaná", "Arequipa"],
    ["04106", "Samuel Pastor", "Camaná", "Arequipa"],
    // Arequipa - Caravelí
    ["04200", "Caravelí", "Caravelí", "Arequipa"],
    ["04201", "Acarí", "Caravelí", "Arequipa"],
    ["04202", "Atico", "Caravelí", "Arequipa"],
    ["04203", "Atiquipa", "Caravelí", "Arequipa"],
    ["04204", "Bella Unión", "Caravelí", "Arequipa"],
    ["04205", "Cahuacho", "Caravelí", "Arequipa"],
    ["04206", "Chala", "Caravelí", "Arequipa"],
    ["04207", "Chaparra", "Caravelí", "Arequipa"],
    ["04208", "Huanuhuanu", "Caravelí", "Arequipa"],
    ["04209", "Jaqui", "Caravelí", "Arequipa"],
    ["04210", "Lomas", "Caravelí", "Arequipa"],
    ["04211", "Quicacha", "Caravelí", "Arequipa"],
    ["04212", "Yauca", "Caravelí", "Arequipa"],
    // Arequipa - Castilla
    ["04300", "Aplao", "Castilla", "Arequipa"],
    // Arequipa - Caylloma
    ["04400", "Chivay", "Caylloma", "Arequipa"],
    ["04401", "Achoma", "Caylloma", "Arequipa"],
    ["04402", "Cabanaconde", "Caylloma", "Arequipa"],
    ["04403", "Callalli", "Caylloma", "Arequipa"],
    ["04404", "Coporaque", "Caylloma", "Arequipa"],
    ["04405", "Huambo", "Caylloma", "Arequipa"],
    ["04406", "Huanca", "Caylloma", "Arequipa"],
    ["04407", "Ichupampa", "Caylloma", "Arequipa"],
    ["04408", "Lari", "Caylloma", "Arequipa"],
    ["04409", "Lluta", "Caylloma", "Arequipa"],
    ["04410", "Maca", "Caylloma", "Arequipa"],
    ["04411", "Madrigal", "Caylloma", "Arequipa"],
    ["04412", "Majes", "Caylloma", "Arequipa"],
    ["04413", "San Antonio de Chuca", "Caylloma", "Arequipa"],
    ["04414", "Sibayo", "Caylloma", "Arequipa"],
    ["04415", "Tapay", "Caylloma", "Arequipa"],
    ["04416", "Tisco", "Caylloma", "Arequipa"],
    ["04417", "Tuti", "Caylloma", "Arequipa"],
    ["04418", "Yanque", "Caylloma", "Arequipa"],
    // Arequipa - Islay
    ["04500", "Mollendo", "Islay", "Arequipa"],
    ["04501", "Cocachacra", "Islay", "Arequipa"],
    ["04502", "Dean Valdivia", "Islay", "Arequipa"],
    ["04503", "Islay", "Islay", "Arequipa"],
    ["04504", "Mejía", "Islay", "Arequipa"],
    ["04505", "Punta de Bombón", "Islay", "Arequipa"],

    // CUSCO
    ["08001", "Cusco", "Cusco", "Cusco"],
    ["08002", "Ccorca", "Cusco", "Cusco"],
    ["08003", "Poroy", "Cusco", "Cusco"],
    ["08004", "San Jerónimo", "Cusco", "Cusco"],
    ["08005", "San Sebastián", "Cusco", "Cusco"],
    ["08006", "Santiago", "Cusco", "Cusco"],
    ["08007", "Saylla", "Cusco", "Cusco"],
    ["08008", "Wanchaq", "Cusco", "Cusco"],
    // Cusco - Anta
    ["08100", "Anta", "Anta", "Cusco"],
    // Cusco - Calca
    ["08200", "Calca", "Calca", "Cusco"],
    // Cusco - Canchis
    ["08300", "Sicuani", "Canchis", "Cusco"],
    // Cusco - La Convención
    ["08400", "Santa Ana (Quillabamba)", "La Convención", "Cusco"],
    // Cusco - Urubamba
    ["08500", "Urubamba", "Urubamba", "Cusco"],
    ["08501", "Chinchero", "Urubamba", "Cusco"],
    ["08502", "Machupicchu", "Urubamba", "Cusco"],
    ["08503", "Maras", "Urubamba", "Cusco"],
    ["08504", "Ollantaytambo", "Urubamba", "Cusco"],
    ["08505", "Yucay", "Urubamba", "Cusco"],

    // TRUJILLO - La Libertad
    ["13001", "Trujillo", "Trujillo", "La Libertad"],
    ["13002", "El Porvenir", "Trujillo", "La Libertad"],
    ["13003", "Florencia de Mora", "Trujillo", "La Libertad"],
    ["13004", "Huanchaco", "Trujillo", "La Libertad"],
    ["13005", "La Esperanza", "Trujillo", "La Libertad"],
    ["13006", "Laredo", "Trujillo", "La Libertad"],
    ["13007", "Moche", "Trujillo", "La Libertad"],
    ["13008", "Poroto", "Trujillo", "La Libertad"],
    ["13009", "Salaverry", "Trujillo", "La Libertad"],
    ["13010", "Simbal", "Trujillo", "La Libertad"],
    ["13011", "Víctor Larco Herrera", "Trujillo", "La Libertad"],
    // La Libertad - Ascope
    ["13100", "Ascope", "Ascope", "La Libertad"],
    ["13101", "Chicama", "Ascope", "La Libertad"],
    ["13102", "Chocope", "Ascope", "La Libertad"],
    ["13103", "Santiago de Cao", "Ascope", "La Libertad"],
    ["13104", "Magdalena de Cao", "Ascope", "La Libertad"],
    ["13105", "Paiján", "Ascope", "La Libertad"],
    ["13106", "Rázuri", "Ascope", "La Libertad"],
    ["13107", "Casa Grande", "Ascope", "La Libertad"],
    // La Libertad - Pacasmayo
    ["13200", "San Pedro de Lloc", "Pacasmayo", "La Libertad"],
    ["13201", "Guadalupe", "Pacasmayo", "La Libertad"],
    ["13202", "Jequetepeque", "Pacasmayo", "La Libertad"],
    ["13203", "Pacasmayo", "Pacasmayo", "La Libertad"],
    ["13204", "San José", "Pacasmayo", "La Libertad"],

    // CHICLAYO - Lambayeque
    ["14001", "Chiclayo", "Chiclayo", "Lambayeque"],
    ["14002", "Chongoyape", "Chiclayo", "Lambayeque"],
    ["14003", "Eten", "Chiclayo", "Lambayeque"],
    ["14004", "Puerto Eten", "Chiclayo", "Lambayeque"],
    ["14005", "José Leonardo Ortiz", "Chiclayo", "Lambayeque"],
    ["14006", "La Victoria", "Chiclayo", "Lambayeque"],
    ["14007", "Lagunas", "Chiclayo", "Lambayeque"],
    ["14008", "Monsefú", "Chiclayo", "Lambayeque"],
    ["14009", "Nueva Arica", "Chiclayo", "Lambayeque"],
    ["14010", "Oyotún", "Chiclayo", "Lambayeque"],
    ["14011", "Picsi", "Chiclayo", "Lambayeque"],
    ["14012", "Pimentel", "Chiclayo", "Lambayeque"],
    ["14013", "Reque", "Chiclayo", "Lambayeque"],
    ["14014", "Santa Rosa", "Chiclayo", "Lambayeque"],
    ["14015", "Saña", "Chiclayo", "Lambayeque"],
    ["14016", "Cayaltí", "Chiclayo", "Lambayeque"],
    ["14017", "Pátapo", "Chiclayo", "Lambayeque"],
    ["14018", "Pomalca", "Chiclayo", "Lambayeque"],
    ["14019", "Pucalá", "Chiclayo", "Lambayeque"],
    ["14020", "Tumán", "Chiclayo", "Lambayeque"],
    // Lambayeque - Ferreñafe
    ["14100", "Ferreñafe", "Ferreñafe", "Lambayeque"],
    ["14101", "Cañaris", "Ferreñafe", "Lambayeque"],
    ["14102", "Incahuasi", "Ferreñafe", "Lambayeque"],
    ["14103", "Manuel Antonio Mesones Muro", "Ferreñafe", "Lambayeque"],
    ["14104", "Pítipo", "Ferreñafe", "Lambayeque"],
    ["14105", "Pueblo Nuevo", "Ferreñafe", "Lambayeque"],
    // Lambayeque - Lambayeque
    ["14200", "Lambayeque", "Lambayeque", "Lambayeque"],
    ["14201", "Chóchope", "Lambayeque", "Lambayeque"],
    ["14202", "Íllimo", "Lambayeque", "Lambayeque"],
    ["14203", "Jayanca", "Lambayeque", "Lambayeque"],
    ["14204", "Mochumí", "Lambayeque", "Lambayeque"],
    ["14205", "Mórrope", "Lambayeque", "Lambayeque"],
    ["14206", "Motupe", "Lambayeque", "Lambayeque"],
    ["14207", "Olmos", "Lambayeque", "Lambayeque"],
    ["14208", "Pacora", "Lambayeque", "Lambayeque"],
    ["14209", "Salas", "Lambayeque", "Lambayeque"],
    ["14210", "San José", "Lambayeque", "Lambayeque"],
    ["14211", "Túcume", "Lambayeque", "Lambayeque"],

    // PIURA
    ["20001", "Piura", "Piura", "Piura"],
    ["20002", "Castilla", "Piura", "Piura"],
    ["20003", "Catacaos", "Piura", "Piura"],
    ["20004", "Cura Mori", "Piura", "Piura"],
    ["20005", "El Tallán", "Piura", "Piura"],
    ["20006", "La Arena", "Piura", "Piura"],
    ["20007", "La Unión", "Piura", "Piura"],
    ["20008", "Las Lomas", "Piura", "Piura"],
    ["20009", "Tambo Grande", "Piura", "Piura"],
    ["20010", "Veintiséis de Octubre", "Piura", "Piura"],
    // Piura - Sullana
    ["20100", "Sullana", "Sullana", "Piura"],
    ["20101", "Bellavista", "Sullana", "Piura"],
    ["20102", "Ignacio Escudero", "Sullana", "Piura"],
    ["20103", "Lancones", "Sullana", "Piura"],
    ["20104", "Marcavelica", "Sullana", "Piura"],
    ["20105", "Miguel Checa", "Sullana", "Piura"],
    ["20106", "Querecotillo", "Sullana", "Piura"],
    ["20107", "Salitral", "Sullana", "Piura"],
    // Piura - Talara
    ["20200", "Pariñas", "Talara", "Piura"],
    ["20201", "El Alto", "Talara", "Piura"],
    ["20202", "La Brea", "Talara", "Piura"],
    ["20203", "Lobitos", "Talara", "Piura"],
    ["20204", "Los Órganos", "Talara", "Piura"],
    ["20205", "Máncora", "Talara", "Piura"],
    // Piura - Paita
    ["20300", "Paita", "Paita", "Piura"],
    ["20301", "Amotape", "Paita", "Piura"],
    ["20302", "Arenal", "Paita", "Piura"],
    ["20303", "Colán", "Paita", "Piura"],
    ["20304", "La Huaca", "Paita", "Piura"],
    ["20305", "Tamarindo", "Paita", "Piura"],
    ["20306", "Vichayal", "Paita", "Piura"],
    // Piura - Sechura
    ["20400", "Sechura", "Sechura", "Piura"],

    // CAJAMARCA
    ["06001", "Cajamarca", "Cajamarca", "Cajamarca"],
    ["06002", "Asunción", "Cajamarca", "Cajamarca"],
    ["06003", "Chetilla", "Cajamarca", "Cajamarca"],
    ["06004", "Cosspán", "Cajamarca", "Cajamarca"],
    ["06005", "Encañada", "Cajamarca", "Cajamarca"],
    ["06006", "Jesús", "Cajamarca", "Cajamarca"],
    ["06007", "Llacanora", "Cajamarca", "Cajamarca"],
    ["06008", "Los Baños del Inca", "Cajamarca", "Cajamarca"],
    ["06009", "Magdalena", "Cajamarca", "Cajamarca"],
    ["06010", "Matara", "Cajamarca", "Cajamarca"],
    ["06011", "Namora", "Cajamarca", "Cajamarca"],
    ["06012", "San Juan", "Cajamarca", "Cajamarca"],
    // Cajamarca - Jaén
    ["06100", "Jaén", "Jaén", "Cajamarca"],
    ["06101", "Bellavista", "Jaén", "Cajamarca"],
    ["06102", "Chontali", "Jaén", "Cajamarca"],
    ["06103", "Colasay", "Jaén", "Cajamarca"],
    ["06104", "Huabal", "Jaén", "Cajamarca"],
    ["06105", "Las Pirias", "Jaén", "Cajamarca"],
    ["06106", "Pomahuaca", "Jaén", "Cajamarca"],
    ["06107", "Pucará", "Jaén", "Cajamarca"],
    ["06108", "Sallique", "Jaén", "Cajamarca"],
    ["06109", "San Felipe", "Jaén", "Cajamarca"],
    ["06110", "San José del Alto", "Jaén", "Cajamarca"],
    ["06111", "Santa Rosa", "Jaén", "Cajamarca"],
    // Cajamarca - Chota
    ["06200", "Chota", "Chota", "Cajamarca"],

    // JUNÍN
    ["12001", "Huancayo", "Huancayo", "Junín"],
    ["12002", "Carhuacallanga", "Huancayo", "Junín"],
    ["12003", "Chacapampa", "Huancayo", "Junín"],
    ["12004", "Chicche", "Huancayo", "Junín"],
    ["12005", "Chilca", "Huancayo", "Junín"],
    ["12006", "Chongos Alto", "Huancayo", "Junín"],
    ["12007", "Chupuro", "Huancayo", "Junín"],
    ["12008", "Colca", "Huancayo", "Junín"],
    ["12009", "Cullhuas", "Huancayo", "Junín"],
    ["12010", "El Tambo", "Huancayo", "Junín"],
    ["12011", "Huacrapuquio", "Huancayo", "Junín"],
    ["12012", "Hualhuas", "Huancayo", "Junín"],
    ["12013", "Huancan", "Huancayo", "Junín"],
    ["12014", "Huasicancha", "Huancayo", "Junín"],
    ["12015", "Huayucachi", "Huancayo", "Junín"],
    ["12016", "Ingenio", "Huancayo", "Junín"],
    ["12017", "Pariahuanca", "Huancayo", "Junín"],
    ["12018", "Pilcomayo", "Huancayo", "Junín"],
    ["12019", "Pucará", "Huancayo", "Junín"],
    ["12020", "Quichuay", "Huancayo", "Junín"],
    ["12021", "Quilcas", "Huancayo", "Junín"],
    ["12022", "San Agustín de Cajas", "Huancayo", "Junín"],
    ["12023", "San Jerónimo de Tunán", "Huancayo", "Junín"],
    ["12024", "Saño", "Huancayo", "Junín"],
    ["12025", "Sapallanga", "Huancayo", "Junín"],
    ["12026", "Sicaya", "Huancayo", "Junín"],
    ["12027", "Santo Domingo de Acobamba", "Huancayo", "Junín"],
    ["12028", "Viques", "Huancayo", "Junín"],
    // Junín - Tarma
    ["12100", "Tarma", "Tarma", "Junín"],
    ["12101", "Acobamba", "Tarma", "Junín"],
    ["12102", "Huaricolca", "Tarma", "Junín"],
    ["12103", "Huasahuasi", "Tarma", "Junín"],
    ["12104", "La Unión", "Tarma", "Junín"],
    ["12105", "Palca", "Tarma", "Junín"],
    ["12106", "Palcamayo", "Tarma", "Junín"],
    ["12107", "San Pedro de Cajas", "Tarma", "Junín"],
    ["12108", "Tapo", "Tarma", "Junín"],
    // Junín - Satipo
    ["12200", "Satipo", "Satipo", "Junín"],
    // Junín - Chanchamayo
    ["12300", "Chanchamayo", "Chanchamayo", "Junín"],
    ["12301", "Perené", "Chanchamayo", "Junín"],
    ["12302", "Pichanaqui", "Chanchamayo", "Junín"],
    ["12303", "San Luis de Shuaro", "Chanchamayo", "Junín"],
    ["12304", "San Ramón", "Chanchamayo", "Junín"],
    ["12305", "Vitoc", "Chanchamayo", "Junín"],

    // PUNO
    ["21001", "Puno", "Puno", "Puno"],
    ["21002", "Acora", "Puno", "Puno"],
    ["21003", "Amantaní", "Puno", "Puno"],
    ["21004", "Atuncolla", "Puno", "Puno"],
    ["21005", "Capachica", "Puno", "Puno"],
    ["21006", "Chucuito", "Puno", "Puno"],
    ["21007", "Coata", "Puno", "Puno"],
    ["21008", "Huata", "Puno", "Puno"],
    ["21009", "Mañazo", "Puno", "Puno"],
    ["21010", "Paucarcolla", "Puno", "Puno"],
    ["21011", "Pichacani", "Puno", "Puno"],
    ["21012", "Platería", "Puno", "Puno"],
    ["21013", "San Antonio", "Puno", "Puno"],
    ["21014", "Tiquillaca", "Puno", "Puno"],
    ["21015", "Vilque", "Puno", "Puno"],
    // Puno - Juliaca
    ["21100", "Juliaca", "San Román", "Puno"],
    ["21101", "Cabana", "San Román", "Puno"],
    ["21102", "Cabanillas", "San Román", "Puno"],
    ["21103", "Caracoto", "San Román", "Puno"],

    // ICA
    ["11001", "Ica", "Ica", "Ica"],
    ["11002", "La Tinguiña", "Ica", "Ica"],
    ["11003", "Los Aquijes", "Ica", "Ica"],
    ["11004", "Ocucaje", "Ica", "Ica"],
    ["11005", "Pachacútec", "Ica", "Ica"],
    ["11006", "Parcona", "Ica", "Ica"],
    ["11007", "Pueblo Nuevo", "Ica", "Ica"],
    ["11008", "Salas", "Ica", "Ica"],
    ["11009", "San José de Los Molinos", "Ica", "Ica"],
    ["11010", "San Juan Bautista", "Ica", "Ica"],
    ["11011", "Santiago", "Ica", "Ica"],
    ["11012", "Subtanjalla", "Ica", "Ica"],
    ["11013", "Tate", "Ica", "Ica"],
    ["11014", "Yauca del Rosario", "Ica", "Ica"],
    // Ica - Chincha
    ["11100", "Chincha Alta", "Chincha", "Ica"],
    ["11101", "Alto Larán", "Chincha", "Ica"],
    ["11102", "Chavín", "Chincha", "Ica"],
    ["11103", "Chincha Baja", "Chincha", "Ica"],
    ["11104", "El Carmen", "Chincha", "Ica"],
    ["11105", "Grocio Prado", "Chincha", "Ica"],
    ["11106", "Pueblo Nuevo", "Chincha", "Ica"],
    ["11107", "San Juan de Yanac", "Chincha", "Ica"],
    ["11108", "San Pedro de Huacarpana", "Chincha", "Ica"],
    ["11109", "Sunampe", "Chincha", "Ica"],
    ["11110", "Tambo de Mora", "Chincha", "Ica"],
    // Ica - Nazca
    ["11200", "Nazca", "Nazca", "Ica"],
    ["11201", "Changuillo", "Nazca", "Ica"],
    ["11202", "El Ingenio", "Nazca", "Ica"],
    ["11203", "Marcona", "Nazca", "Ica"],
    ["11204", "Vista Alegre", "Nazca", "Ica"],
    // Ica - Pisco
    ["11300", "Pisco", "Pisco", "Ica"],
    ["11301", "Huancano", "Pisco", "Ica"],
    ["11302", "Humay", "Pisco", "Ica"],
    ["11303", "Independencia", "Pisco", "Ica"],
    ["11304", "Paracas", "Pisco", "Ica"],
    ["11305", "San Andrés", "Pisco", "Ica"],
    ["11306", "San Clemente", "Pisco", "Ica"],
    ["11307", "Túpac Amaru Inca", "Pisco", "Ica"],
    // Ica - Palpa
    ["11400", "Palpa", "Palpa", "Ica"],

    // TACNA
    ["23001", "Tacna", "Tacna", "Tacna"],
    ["23002", "Alto de la Alianza", "Tacna", "Tacna"],
    ["23003", "Calana", "Tacna", "Tacna"],
    ["23004", "Ciudad Nueva", "Tacna", "Tacna"],
    ["23005", "Coronel Gregorio Albarracín Lanchipa", "Tacna", "Tacna"],
    ["23006", "Inclán", "Tacna", "Tacna"],
    ["23007", "Pachía", "Tacna", "Tacna"],
    ["23008", "Palca", "Tacna", "Tacna"],
    ["23009", "Pocollay", "Tacna", "Tacna"],
    ["23010", "Sama", "Tacna", "Tacna"],

    // HUANCAVELICA
    ["09001", "Huancavelica", "Huancavelica", "Huancavelica"],
    ["09002", "Acobambilla", "Huancavelica", "Huancavelica"],
    ["09003", "Acoria", "Huancavelica", "Huancavelica"],
    ["09004", "Ascensión", "Huancavelica", "Huancavelica"],

    // AYACUCHO
    ["05001", "Ayacucho", "Huamanga", "Ayacucho"],
    ["05002", "Acocro", "Huamanga", "Ayacucho"],
    ["05003", "Acos Vinchos", "Huamanga", "Ayacucho"],
    ["05004", "Carmen Alto", "Huamanga", "Ayacucho"],
    ["05005", "Chiara", "Huamanga", "Ayacucho"],
    ["05006", "Jesús Nazareno", "Huamanga", "Ayacucho"],
    ["05007", "Ocros", "Huamanga", "Ayacucho"],
    ["05008", "Pacaycasa", "Huamanga", "Ayacucho"],
    ["05009", "Quinua", "Huamanga", "Ayacucho"],
    ["05010", "San José de Ticllas", "Huamanga", "Ayacucho"],
    ["05011", "San Juan Bautista", "Huamanga", "Ayacucho"],
    ["05012", "Santiago de Pischa", "Huamanga", "Ayacucho"],
    ["05013", "Socos", "Huamanga", "Ayacucho"],
    ["05014", "Tambillo", "Huamanga", "Ayacucho"],
    ["05015", "Vinchos", "Huamanga", "Ayacucho"],
    // Ayacucho - Huanta
    ["05100", "Huanta", "Huanta", "Ayacucho"],

    // AMAZONAS
    ["01001", "Chachapoyas", "Chachapoyas", "Amazonas"],
    ["01002", "Asunción", "Chachapoyas", "Amazonas"],
    ["01003", "Balsas", "Chachapoyas", "Amazonas"],
    ["01004", "Cheto", "Chachapoyas", "Amazonas"],
    ["01005", "Chiliquín", "Chachapoyas", "Amazonas"],
    ["01006", "Chuquibamba", "Chachapoyas", "Amazonas"],
    ["01007", "Granada", "Chachapoyas", "Amazonas"],
    ["01008", "Huancas", "Chachapoyas", "Amazonas"],
    ["01009", "La Jalca", "Chachapoyas", "Amazonas"],
    ["01010", "Leimebamba", "Chachapoyas", "Amazonas"],
    ["01011", "Levanto", "Chachapoyas", "Amazonas"],
    ["01012", "Magdalena", "Chachapoyas", "Amazonas"],
    ["01013", "Mariscal Castilla", "Chachapoyas", "Amazonas"],
    ["01014", "Molinopampa", "Chachapoyas", "Amazonas"],
    ["01015", "Montevideo", "Chachapoyas", "Amazonas"],
    ["01016", "Olleros", "Chachapoyas", "Amazonas"],
    ["01017", "Quinjalca", "Chachapoyas", "Amazonas"],
    ["01018", "San Francisco de Daguas", "Chachapoyas", "Amazonas"],
    ["01019", "San Isidro de Maino", "Chachapoyas", "Amazonas"],
    ["01020", "Soloco", "Chachapoyas", "Amazonas"],
    ["01021", "Sonche", "Chachapoyas", "Amazonas"],
    // Amazonas - Bagua
    ["01100", "Bagua", "Bagua", "Amazonas"],
    ["01101", "Aramango", "Bagua", "Amazonas"],
    ["01102", "Copallín", "Bagua", "Amazonas"],
    ["01103", "El Parco", "Bagua", "Amazonas"],
    ["01104", "Imaza", "Bagua", "Amazonas"],
    ["01105", "La Peca", "Bagua", "Amazonas"],
    // Amazonas - Utcubamba
    ["01200", "Bagua Grande", "Utcubamba", "Amazonas"],
    ["01201", "Cajaruro", "Utcubamba", "Amazonas"],
    ["01202", "Cumba", "Utcubamba", "Amazonas"],
    ["01203", "El Milagro", "Utcubamba", "Amazonas"],
    ["01204", "Jamalca", "Utcubamba", "Amazonas"],
    ["01205", "Lonya Grande", "Utcubamba", "Amazonas"],
    ["01206", "Yamón", "Utcubamba", "Amazonas"],

    // ÁNCASH
    ["02001", "Huaraz", "Huaraz", "Áncash"],
    ["02002", "Cochabamba", "Huaraz", "Áncash"],
    ["02003", "Colcabamba", "Huaraz", "Áncash"],
    ["02004", "Huanchay", "Huaraz", "Áncash"],
    ["02005", "Independencia", "Huaraz", "Áncash"],
    ["02006", "Jangas", "Huaraz", "Áncash"],
    ["02007", "La Libertad", "Huaraz", "Áncash"],
    ["02008", "Olleros", "Huaraz", "Áncash"],
    ["02009", "Pampas Grande", "Huaraz", "Áncash"],
    ["02010", "Pariacoto", "Huaraz", "Áncash"],
    ["02011", "Pira", "Huaraz", "Áncash"],
    ["02012", "Tarica", "Huaraz", "Áncash"],
    // Áncash - Huari
    ["02100", "Huari", "Huari", "Áncash"],
    // Áncash - Santa
    ["02700", "Chimbote", "Santa", "Áncash"],
    ["02701", "Cáceres del Perú", "Santa", "Áncash"],
    ["02702", "Coishco", "Santa", "Áncash"],
    ["02703", "Macate", "Santa", "Áncash"],
    ["02704", "Moro", "Santa", "Áncash"],
    ["02705", "Nepeña", "Santa", "Áncash"],
    ["02706", "Nuevo Chimbote", "Santa", "Áncash"],
    ["02707", "Samanco", "Santa", "Áncash"],
    ["02708", "Santa", "Santa", "Áncash"],
    // Áncash - Yungay
    ["02800", "Yungay", "Yungay", "Áncash"],
    // Áncash - Huaylas
    ["02200", "Caraz", "Huaylas", "Áncash"],
    // Áncash - Carhuaz
    ["02300", "Carhuaz", "Carhuaz", "Áncash"],

    // APURÍMAC
    ["03001", "Abancay", "Abancay", "Apurímac"],
    ["03002", "Chacoche", "Abancay", "Apurímac"],
    ["03003", "Circa", "Abancay", "Apurímac"],
    ["03004", "Curahuasi", "Abancay", "Apurímac"],
    ["03005", "Huanipaca", "Abancay", "Apurímac"],
    ["03006", "Lambrama", "Abancay", "Apurímac"],
    ["03007", "Pichirhua", "Abancay", "Apurímac"],
    ["03008", "San Pedro de Cachora", "Abancay", "Apurímac"],
    ["03009", "Tamburco", "Abancay", "Apurímac"],
    // Apurímac - Andahuaylas
    ["03100", "Andahuaylas", "Andahuaylas", "Apurímac"],
    ["03101", "Andarapa", "Andahuaylas", "Apurímac"],
    ["03102", "Chiara", "Andahuaylas", "Apurímac"],
    ["03103", "Huancarama", "Andahuaylas", "Apurímac"],
    ["03104", "Huancaray", "Andahuaylas", "Apurímac"],
    ["03105", "Kishuará", "Andahuaylas", "Apurímac"],
    ["03106", "Pacobamba", "Andahuaylas", "Apurímac"],
    ["03107", "Pacucha", "Andahuaylas", "Apurímac"],
    ["03108", "San Antonio de Cachi", "Andahuaylas", "Apurímac"],
    ["03109", "San Jerónimo", "Andahuaylas", "Apurímac"],
    ["03110", "Santa María de Chicmo", "Andahuaylas", "Apurímac"],
    ["03111", "Talavera", "Andahuaylas", "Apurímac"],
    ["03112", "Tumay Huaraca", "Andahuaylas", "Apurímac"],
    ["03113", "Turpo", "Andahuaylas", "Apurímac"],

    // HUÁNUCO
    ["10001", "Huánuco", "Huánuco", "Huánuco"],
    ["10002", "Amarilis", "Huánuco", "Huánuco"],
    ["10003", "Chinchao", "Huánuco", "Huánuco"],
    ["10004", "Churubamba", "Huánuco", "Huánuco"],
    ["10005", "Margos", "Huánuco", "Huánuco"],
    ["10006", "Quisqui", "Huánuco", "Huánuco"],
    ["10007", "San Francisco de Cayrán", "Huánuco", "Huánuco"],
    ["10008", "San Pedro de Chaulán", "Huánuco", "Huánuco"],
    ["10009", "Santa María del Valle", "Huánuco", "Huánuco"],
    ["10010", "Yarumayo", "Huánuco", "Huánuco"],
    ["10011", "Pillco Marca", "Huánuco", "Huánuco"],
    // Huánuco - Leoncio Prado
    ["10100", "Rupa-Rupa (Tingo María)", "Leoncio Prado", "Huánuco"],
    ["10101", "Daniel Alomía Robles", "Leoncio Prado", "Huánuco"],
    ["10102", "Hermilio Valdizán", "Leoncio Prado", "Huánuco"],
    ["10103", "José Crespo y Castillo", "Leoncio Prado", "Huánuco"],
    ["10104", "Luyando", "Leoncio Prado", "Huánuco"],
    ["10105", "Mariano Dámaso Beraún", "Leoncio Prado", "Huánuco"],

    // LORETO
    ["16001", "Iquitos", "Maynas", "Loreto"],
    ["16002", "Alto Nanay", "Maynas", "Loreto"],
    ["16003", "Fernando Lores", "Maynas", "Loreto"],
    ["16004", "Indiana", "Maynas", "Loreto"],
    ["16005", "Las Amazonas", "Maynas", "Loreto"],
    ["16006", "Mazán", "Maynas", "Loreto"],
    ["16007", "Napo", "Maynas", "Loreto"],
    ["16008", "Punchana", "Maynas", "Loreto"],
    ["16009", "Torres Causana", "Maynas", "Loreto"],
    ["16010", "Belén", "Maynas", "Loreto"],
    ["16011", "San Juan Bautista", "Maynas", "Loreto"],

    // SAN MARTÍN
    ["22001", "Moyobamba", "Moyobamba", "San Martín"],
    ["22002", "Calzada", "Moyobamba", "San Martín"],
    ["22003", "Habana", "Moyobamba", "San Martín"],
    ["22004", "Jepelacio", "Moyobamba", "San Martín"],
    ["22005", "Soritor", "Moyobamba", "San Martín"],
    ["22006", "Yantalo", "Moyobamba", "San Martín"],
    // San Martín - San Martín
    ["22100", "Tarapoto", "San Martín", "San Martín"],
    ["22101", "Alberto Leveau", "San Martín", "San Martín"],
    ["22102", "Cacatachi", "San Martín", "San Martín"],
    ["22103", "Chazuta", "San Martín", "San Martín"],
    ["22104", "Chipurana", "San Martín", "San Martín"],
    ["22105", "El Porvenir", "San Martín", "San Martín"],
    ["22106", "Huimbayoc", "San Martín", "San Martín"],
    ["22107", "Juan Guerra", "San Martín", "San Martín"],
    ["22108", "La Banda de Shilcayo", "San Martín", "San Martín"],
    ["22109", "Morales", "San Martín", "San Martín"],
    ["22110", "Papaplaya", "San Martín", "San Martín"],
    ["22111", "San Antonio", "San Martín", "San Martín"],
    ["22112", "Sauce", "San Martín", "San Martín"],
    ["22113", "Shapaja", "San Martín", "San Martín"],
    // San Martín - Rioja
    ["22200", "Rioja", "Rioja", "San Martín"],
    ["22201", "Awajún", "Rioja", "San Martín"],
    ["22202", "Elías Soplín Vargas", "Rioja", "San Martín"],
    ["22203", "Nueva Cajamarca", "Rioja", "San Martín"],
    ["22204", "Pardo Miguel", "Rioja", "San Martín"],
    ["22205", "Posic", "Rioja", "San Martín"],
    ["22206", "San Fernando", "Rioja", "San Martín"],
    ["22207", "Yorongos", "Rioja", "San Martín"],
    ["22208", "Yuracyacu", "Rioja", "San Martín"],
    // San Martín - Lamas
    ["22300", "Lamas", "Lamas", "San Martín"],
    // San Martín - Tocache
    ["22400", "Tocache", "Tocache", "San Martín"],
    // San Martín - Bellavista
    ["22500", "Bellavista", "Bellavista", "San Martín"],
    // San Martín - Mariscal Cáceres
    ["22600", "Juanjuí", "Mariscal Cáceres", "San Martín"],
    // San Martín - Huallaga
    ["22700", "Saposoa", "Huallaga", "San Martín"],
    // San Martín - Picota
    ["22800", "Picota", "Picota", "San Martín"],

    // UCAYALI
    ["25001", "Callería (Pucallpa)", "Coronel Portillo", "Ucayali"],
    ["25002", "Campoverde", "Coronel Portillo", "Ucayali"],
    ["25003", "Iparía", "Coronel Portillo", "Ucayali"],
    ["25004", "Masisea", "Coronel Portillo", "Ucayali"],
    ["25005", "Yarinacocha", "Coronel Portillo", "Ucayali"],
    ["25006", "Nueva Requena", "Coronel Portillo", "Ucayali"],
    ["25007", "Manantay", "Coronel Portillo", "Ucayali"],

    // MADRE DE DIOS
    ["17001", "Tambopata (Puerto Maldonado)", "Tambopata", "Madre de Dios"],
    ["17002", "Inambari", "Tambopata", "Madre de Dios"],
    ["17003", "Las Piedras", "Tambopata", "Madre de Dios"],
    ["17004", "Laberinto", "Tambopata", "Madre de Dios"],

    // TUMBES
    ["24001", "Tumbes", "Tumbes", "Tumbes"],
    ["24002", "Corrales", "Tumbes", "Tumbes"],
    ["24003", "La Cruz", "Tumbes", "Tumbes"],
    ["24004", "Pampas de Hospital", "Tumbes", "Tumbes"],
    ["24005", "San Jacinto", "Tumbes", "Tumbes"],
    ["24006", "San Juan de la Virgen", "Tumbes", "Tumbes"],
    // Tumbes - Zarumilla
    ["24100", "Zarumilla", "Zarumilla", "Tumbes"],
    ["24101", "Aguas Verdes", "Zarumilla", "Tumbes"],
    ["24102", "Matapalo", "Zarumilla", "Tumbes"],
    ["24103", "Papayal", "Zarumilla", "Tumbes"],
    // Tumbes - Contralmirante Villar
    ["24200", "Zorritos", "Contralmirante Villar", "Tumbes"],
    ["24201", "Casitas", "Contralmirante Villar", "Tumbes"],
    ["24202", "Canoas de Punta Sal", "Contralmirante Villar", "Tumbes"],

    // MOQUEGUA
    ["18001", "Moquegua", "Mariscal Nieto", "Moquegua"],
    ["18002", "Carumas", "Mariscal Nieto", "Moquegua"],
    ["18003", "Cuchumbaya", "Mariscal Nieto", "Moquegua"],
    ["18004", "Samegua", "Mariscal Nieto", "Moquegua"],
    ["18005", "San Cristóbal", "Mariscal Nieto", "Moquegua"],
    ["18006", "Torata", "Mariscal Nieto", "Moquegua"],
    // Moquegua - Ilo
    ["18100", "Ilo", "Ilo", "Moquegua"],
    ["18101", "El Algarrobal", "Ilo", "Moquegua"],
    ["18102", "Pacocha", "Ilo", "Moquegua"],

    // PASCO
    ["19001", "Chaupimarca", "Pasco", "Pasco"],
    ["19002", "Huachón", "Pasco", "Pasco"],
    ["19003", "Huariaca", "Pasco", "Pasco"],
    ["19004", "Huayllay", "Pasco", "Pasco"],
    ["19005", "Ninacaca", "Pasco", "Pasco"],
    ["19006", "Pallanchacra", "Pasco", "Pasco"],
    ["19007", "Paucartambo", "Pasco", "Pasco"],
    ["19008", "San Francisco de Asís de Yarusyacán", "Pasco", "Pasco"],
    ["19009", "Simón Bolívar", "Pasco", "Pasco"],
    ["19010", "Ticlacayán", "Pasco", "Pasco"],
    ["19011", "Tinyahuarco", "Pasco", "Pasco"],
    ["19012", "Vicco", "Pasco", "Pasco"],
    ["19013", "Yanacancha", "Pasco", "Pasco"],
    // Pasco - Oxapampa
    ["19100", "Oxapampa", "Oxapampa", "Pasco"],
    ["19101", "Chontabamba", "Oxapampa", "Pasco"],
    ["19102", "Huancabamba", "Oxapampa", "Pasco"],
    ["19103", "Palcazú", "Oxapampa", "Pasco"],
    ["19104", "Pozuzo", "Oxapampa", "Pasco"],
    ["19105", "Puerto Bermúdez", "Oxapampa", "Pasco"],
    ["19106", "Villa Rica", "Oxapampa", "Pasco"],

    // CUSCO (más)
    // Cusco - Espinar
    ["08600", "Espinar", "Espinar", "Cusco"],
    // Cusco - Chumbivilcas
    ["08700", "Santo Tomás", "Chumbivilcas", "Cusco"],
    // Cusco - Paucartambo
    ["08800", "Paucartambo", "Paucartambo", "Cusco"],
    // Cusco - Quispicanchi
    ["08900", "Urcos", "Quispicanchi", "Cusco"],
]

export const ubigeoData: UbigeoItem[] = rawData.map(([codigo_postal, distrito, provincia, departamento]) => ({
    codigo_postal,
    distrito,
    provincia,
    departamento,
    label: `${distrito} ${codigo_postal} - ${provincia}, ${departamento}`
}))

/**
 * Busca ubicaciones que coincidan con el texto de búsqueda
 * Busca en distrito, provincia, departamento y código postal
 */
export function searchUbigeo(query: string, limit: number = 10): UbigeoItem[] {
    if (!query || query.trim().length < 2) return []
    
    const normalizedQuery = query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos para búsqueda flexible

    return ubigeoData
        .filter(item => {
            const normalizedLabel = item.label
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            
            const normalizedDistrito = item.distrito
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            
            const normalizedProvincia = item.provincia
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            
            const normalizedDepartamento = item.departamento
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            
            return normalizedDistrito.includes(normalizedQuery) ||
                   normalizedProvincia.includes(normalizedQuery) ||
                   normalizedDepartamento.includes(normalizedQuery) ||
                   item.codigo_postal.includes(normalizedQuery) ||
                   normalizedLabel.includes(normalizedQuery)
        })
        .slice(0, limit)
}

/**
 * Formatea un UbigeoItem como "Distrito CodigoPostal" para guardar
 */
export function formatUbigeoForSave(item: UbigeoItem): string {
    return `${item.distrito} ${item.codigo_postal}`
}
