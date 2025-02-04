var categorias = {
  almuerzo: {
    total: 372,
    precio_unitario: 12,
    elementos: [],
  },
  cafe: {
    total: 34,
    precio_unitario: 8.5,
    elementos: [],
  },
  fruta: {
    total: 186,
    precio_unitario: 20,
    elementos: ["papaya", "mango", "platano", "otros"],
  },
  dog_show: {
    total: 91,
    precio_unitario: 91,
    elementos: [],
  },
  higado: {
    total: 28,
    precio_unitario: 7,
    elementos: [],
  },
  abarrotes: {
    total: 330,
    precio_unitario: 330,
    elementos: [
      "fideos",
      "ayudin",
      "esponjas_lavavajillas",
      "lejia",
      "limpiatodo",
      "detergente",
      "Enjuague_bucal",
      "Colinos",
      "cepillos",
      "jabon",
      "glicerina",
      "pañitos_humedos",
      "shampoo",
      "acondicionador",
      "dog_show",
      "leche",
      "papel_higienico",
    ],
  },
  servicios: {
    total: 347,
    precio_unitario: 347,
    elementos: ["internet", "celular", "mantenimiento", "gas", "luz_sur"],
  },
  departamento: {
    total: 1750,
    precio_unitario: 1750,
    elementos: [],
  },
  otros_gastos: {
    total: 400,
    precio_unitario: 400,
    elementos: ["pasajes", "dulces", "ropa", "comida_calle", "otros_gastos"],
  },
};
var urlget = "https://desarrolladorweb.site/api-gastos/";
var urlsaveapi = "https://desarrolladorweb.site/api-gastos/new_entry";
var ingreso = 4500;
$(document).ready(async function () {
  // OBTENER FECHA ACTUAL DE SISTEMA
  let fechaActual = new Date();
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let anio = fechaActual.getFullYear();

  // => Formatear la fecha en formato mm/dd/yyyy
  let fechaFormateada = mes + "/" + dia + "/" + anio;
  $("#datepicker").datepicker({
    format: "mm/dd/yyyy",
    todayHighlight: true,
    autoclose: true,
  });

  // => Establecer la fecha actual por defecto en el campo de entrada
  $("#fecha_compra").val(fechaFormateada);

  // LISTAR CATEGORIAS
  let resultCategorias = await mostrarCategorias(categorias);

  // LISTAR SUBCATEGORIAS EN EL SELECT
  $("#listarCategorias").change(function () {
    let categoria = $(this).val();
    var html = ``;
    if (categorias[categoria] != undefined) {
      if (categorias[categoria].elementos.length == 0) {
        html = `
              <option value="${categoria}" selected>${categoria}</option>
              `;
      } else {
        categorias[categoria].elementos.map((valor) => {
          html += `
              <option value="${valor}" selected>${valor}</option>
              `;
        });
      }
    }

    $("#listarSubcategorias").empty();
    $("#listarSubcategorias").html(html);
  });

  // DETECTAR SI SE MODIFICÓ EL MES O EL ANIO DE ANALISIS
  $("#mes_analisis").change(function () {
    let mes = $(this).val();
    let anio = $("#anio_analisis").val();

    localStorage.setItem("mes_analisis", mes);
    localStorage.setItem("anio_analisis", anio);
  });

  $("#anio_analisis").change(function () {
    let anio = $(this).val();
    let mes = $("#mes_analisis").val();

    localStorage.setItem("mes_analisis", mes);
    localStorage.setItem("anio_analisis", anio);
  });

  // OBTENER GASTOS POR CATEGORIAS
  await getGastosPorCategorias(categorias);

  //OBTENER GASTO MENSUAL
  await actualizarGastoMensual(ingreso);

  // DETECTAR VALOR EN ANIO Y MES DE ANALISIS
  getAnioMesAnalisis();
});

// **************************************
// OBTENER GASTOS POR CATEGORIA
// **************************************
const getGastosPorCategorias = async (categorias) => {
  let urlsave = urlget;
  let response = await obtenerDatos(urlsave);
  let rango = obtenerRangoFechas("mensual");

  // filtrar por fechas (filtradoPorFecha([datos en json], [fecha inicio date()], [fecha fin date()] ))
  let resultFiltroPorFecha = filtradoPorFecha(
    JSON.parse(response),
    rango.inicio,
    rango.fin
  );

  let resultTotalesPorCategoria = getTotalesPorCategoria(
    categorias,
    resultFiltroPorFecha
  );

  // Mostrar los gastos en la pantalla
  mostrarGastosPantalla(resultTotalesPorCategoria);

  // Actualizar indicador principal OTROS GASTOS
  let categoriaOtrosGastos = resultTotalesPorCategoria.filter(
    (elem) => elem.categoria === "otros_gastos"
  );
  $("#otroGasto").text(categoriaOtrosGastos[0].totalReal);
};

// **************************************
// MOSTRAR GASTOS EN PANTALLA
// **************************************
const mostrarGastosPantalla = (datos) => {
  let html = ``;

  datos.map((elem) => {
    html += `
          <div class="contGraficoRanking">
            <div class="contFilaGrafico">
              <div class="descripcionGasto">
                <span class="categoriaGasto">${elem.categoria}</span>
                <span class="totalPlanificado">S/ ${elem.totalReal}</span>
              </div>

              <div class="barraGastos">
                <progress value="${elem.totalReal}" max="${elem.totalPlan}"></progress>
              </div>
              <div class="valorPlanificado">S/ ${elem.totalPlan}</div>
            </div>
          </div>
        `;
  });
  $("#totalGastosPorCategoria").empty();
  $("#totalGastosPorCategoria").html(html);
};

// **************************************
// OBTENER GASTOS TOTALES POR CATEGORIA
// **************************************
const getTotalesPorCategoria = (categorias, datos) => {
  let categoriaRealVsPlan = {
    categoria: "",
    totalPlan: 0,
    totalReal: 0,
  };

  let categoriasRealVsPlan = [];

  for (let cat in categorias) {
    let totalReal = 0;
    let gatosPorCategoria = datos.filter((item) => item.categoria === cat);

    if (gatosPorCategoria != undefined) {
      totalReal = gatosPorCategoria.reduce((acum, elem) => {
        return acum + parseFloat(elem.monto);
      }, 0);

      categoriaRealVsPlan = {
        categoria: cat,
        totalPlan: parseFloat(categorias[cat].total),
        totalReal: totalReal,
      };
      categoriasRealVsPlan.push(categoriaRealVsPlan);
      continue;
    }

    categoriaRealVsPlan = {
      categoria: cat,
      totalPlan: parseFloat(categorias[cat].total),
      totalReal: totalReal,
    };
    categoriasRealVsPlan.push(categoriaRealVsPlan);
  }

  return categoriasRealVsPlan;
};

// **************************************
// FILTRAR GASTOS POR RANGO DE FECHAS
// **************************************
const filtradoPorFecha = (datos, fecha_inicio, fecha_fin) => {
  let result = [];
  // parsear entero las fecha para rangos

  let fechaInicioInt = parseInt(
    fecha_inicio.toISOString().split("T")[0].replace("-", "")
  );
  let fechaFinInt = parseInt(
    fecha_fin.toISOString().split("T")[0].replace("-", "")
  );

  datos.map((elem) => {
    let fechaGastoInt = parseInt(elem.fecha_compra.replace("-", ""));

    if (fechaGastoInt >= fechaInicioInt && fechaGastoInt <= fechaFinInt) {
      result.push(elem);
    }
  });
  return result;
};

// **************************************
// ACTUALIZAR EL GASTO MENSUAL
// **************************************
const actualizarGastoMensual = async (ingreso) => {
  let urlsave = urlget;
  let response = await obtenerDatos(urlsave);
  //OBTENER EL RANGO DE FECHAS
  let rango = obtenerRangoFechas("mensual");
  //OBTENER EL MONTO TOTAL EN BASE A LOS RANGO DE FECHAS
  let total = obetenerGastoSemanal(
    JSON.parse(response),
    rango.inicio,
    rango.fin
  );
  // Actualización del gasto mensual
  $("#gastoMensual").text(total.total);
  // Actualización del Ahorro Mensual
  $("#ahorroMensual").text(ingreso - total.total);
};

// **************************************
// MOSTRAR LAS CATEGORIAS EN EL SELECT
// **************************************
const mostrarCategorias = async (caterogias) => {
  let result = [];
  var html = `
          <option selected>Categoría</option>
          `;
  for (let cat in caterogias) {
    html += `
          <option value="${cat}">${cat}</option>
        `;
    result.push(cat);
  }
  $("#listarCategorias").empty();
  $("#listarCategorias").html(html);

  return result;
};

// **************************************
// OBTENER GASTOS SEMANAL
// **************************************
const obetenerGastoSemanal = (data, fecha_inicio, fecha_fin) => {
  var total = 0;
  var gasto_semanal_extra = 0;
  var gasto_semanal_planificado = 0;

  total = data.reduce((acumulador, elem) => {
    var formatofecha = new Date(
      parseInt(elem.fecha_compra.substring(0, 4)),
      parseInt(elem.fecha_compra.substring(5, 7)) - 1,
      parseInt(elem.fecha_compra.substring(8, 10))
    );

    if (formatofecha >= fecha_inicio && formatofecha <= fecha_fin) {
      return acumulador + parseFloat(elem.monto);
    } else {
      return acumulador + 0;
    }
  }, 0);

  return (gastos_semanales = {
    total,
    gasto_semanal_extra,
    gasto_semanal_planificado,
  });
};

// **************************************
// GUARDAR DATOS MONGO ATLAS
// **************************************
$("#guardar_gasto").on("click", async () => {
  let ingreso = 4500;
  //OBETENER DATOS INGRESADOS
  var monto = $("#monto_gasto").val();
  var categoria = $("#listarCategorias").val();
  var subcategoria = $("#listarSubcategorias").val();
  var descripcion = $("#desc_gasto").val();
  let id_gasto = generateRandomID();
  let datos_fecha = obtenerDatosFecha();
  //   let tipo_gasto = $('input[name="grupoTipoGasto"]:checked').val();
  let fechaCompraNoFormat = $("#fecha_compra").val();
  let fecha_compra =
    fechaCompraNoFormat.substr(6) +
    "-" +
    fechaCompraNoFormat.substr(0, 2) +
    "-" +
    fechaCompraNoFormat.substr(3, 2);

  //ARMAR DATA
  var gasto = {
    monto,
    categoria,
    subcategoria,
    descripcion,
    id_gasto,
    datos_fecha,
    fecha_compra,
  };

  //LIMPIAR CAMPOS
  $("#monto_gasto").val("");
  $("#listarCategorias").val("");
  $("#listarSubcategorias").val("");
  $("#desc_gasto").val("");
  //$("#fecha_compra").val("");

  //ENVIAR AL SERVIDOR
  var jsonData = JSON.stringify(gasto, null, 2);
  var urlsave = urlsaveapi;
  var responseSave = await guardarDatos(urlsave, jsonData);
  if (responseSave == "Gasto guardado correctamente.") {
    await actualizarGastoMensual(ingreso);
  }
});

// **************************************
// GENERAR ID
// **************************************
function generateRandomID() {
  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// **************************************
// OBTENER DATOS DE FECHA PARA GUARDAR DATOS
// **************************************
const obtenerDatosFecha = () => {
  const now = new Date();
  const year = now.getFullYear(); // Año
  const month = now.getMonth() + 1; // Mes (0-11, así que se suma 1)
  const day = now.getDate(); // Día del mes
  const hours = now.getHours(); // Hora
  const minutes = now.getMinutes(); // Minutos
  const seconds = now.getSeconds(); // Segundos
  const milliseconds = now.getMilliseconds(); // Milisegundos

  //OBTENER FECHA
  const formattedDate =
    year +
    "-" +
    String(month).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0");
  //OBTENER HORA
  const formattedTime =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
  //OBTENER NOMBRE DEL DÍA
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const indiceDia = now.getDay();
  const nombreDia = diasSemana[indiceDia];

  //OBJETO DE SALIDA
  const date_data = {
    fecha: formattedDate,
    hora: formattedTime,
    diaDesc: nombreDia,
    dia: String(day).padStart(2, "0"),
    mes: String(month).padStart(2, "0"),
    anio: year,
  };

  return date_data;
};

// **************************************
// OBTENER RANGOS DE FECHAS
// **************************************
const obtenerRangoFechas = (categoria) => {
  const indiceDias = [1, 2, 3, 4, 5, 6, 0];

  let mes_analisis = localStorage.getItem("mes_analisis");
  let anio_analisis = localStorage.getItem("anio_analisis");

  let now = new Date();

  if (mes_analisis != null && anio_analisis != null) {
    now = new Date(parseInt(anio_analisis), parseInt(mes_analisis) - 1, 1);
  }

  const diaActual = now.getDay();
  const indiceActual = indiceDias.indexOf(diaActual);

  if (categoria == "semanal") {
    var inicio = new Date();
    var fin = new Date();
    inicio.setDate(inicio.getDate() - indiceActual);
    fin.setDate(fin.getDate());

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 0);

    return (rangoFechas = {
      inicio,
      fin,
    });
  } else if (categoria == "mensual") {
    var inicio = now;
    var fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    inicio.setDate(1);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 0);

    return (rangoFechas = {
      inicio,
      fin,
    });
  } else if (categoria == "hoy") {
    var inicio = new Date();
    var fin = new Date();
    inicio.setDate(now.getDate());
    fin.setDate(now.getDate());

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 0);

    return (rangoFechas = {
      inicio,
      fin,
    });
  }
};

$("#buscar_gastos").on("click", async () => {
  // OBTENER GASTOS POR CATEGORIAS
  await getGastosPorCategorias(categorias);

  //OBTENER GASTO MENSUAL
  await actualizarGastoMensual(ingreso);

  // DETECTAR VALOR EN ANIO Y MES DE ANALISIS
  getAnioMesAnalisis();
});

const getAnioMesAnalisis = () => {
  // OBTENER FECHA ACTUAL DE SISTEMA
  let fechaActual = new Date();
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let anio = "" + fechaActual.getFullYear();

  console.log(mes);
  console.log(anio);

  let mes_analisis = localStorage.getItem("mes_analisis");
  let anio_analisis = localStorage.getItem("anio_analisis");

  if (mes_analisis == null) {
    $("#mes_analisis").val(mes);
  } else {
    $("#mes_analisis").val(mes_analisis);
  }

  if (anio_analisis == null) {
    $("#anio_analisis").val(anio);
  } else {
    $("#anio_analisis").val(anio_analisis);
  }
};
