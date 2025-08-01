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
      "Acondicionador",
      "dog_show",
      "leche",
      "papel_higienico",
      "huevos",
      "azucar",
      "arroz",
      "Aceite",
    ],
  },
  servicios: {
    total: 347,
    precio_unitario: 347,
    elementos: [
      "internet",
      "celular",
      "mantenimiento",
      "gas",
      "luz_sur",
      "hbogo",
    ],
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
  perros: {
    total: 400,
    precio_unitario: 400,
    elementos: ["arroz", "pates", "pollo", "dogshow"],
  },
};
var urlget = "https://desarrolladorweb.site/api-gastos/";
var urlsaveapi = "https://desarrolladorweb.site/api-gastos/new_entry";
var urldeleteapi = "https://desarrolladorweb.site/api-gastos/delete_id";
// var urlget = "http://localhost:5000";
// var urlsaveapi = "http://localhost:5000/new_entry";
// var urldeleteapi = "http://localhost:5000/delete_id";

var ingreso = 1200;
var registroPorEliminado = "";

$(document).ready(async function () {
  // OBTENER FECHA ACTUAL DE SISTEMA
  let fechaActual = new Date();
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let anio = fechaActual.getFullYear();

  // => Formatear la fecha en formato mm/dd/yyyy
  let fechaFormateada = dia + "/" + mes + "/" + anio;
  $("#datepicker").datepicker({
    format: "dd/mm/yyyy",
    todayHighlight: true,
    autoclose: true,
  });
  $("#datepicker2").datepicker({
    format: "dd/mm/yyyy",
    todayHighlight: true,
    autoclose: true,
  });
  // => Establecer la fecha actual por defecto en el campo de entrada
  $("#fecha_compra").val(fechaFormateada);
  $("#fecha_compra_plan").val(fechaFormateada);

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

  $(".btn_menu").on("click", function () {
    $(".btn_menu").removeClass("activo");
    $(this).addClass("activo");
    $("#vistasGastos .vista").addClass("d-none");
    switch ($(this).text()) {
      case "Categorias":
        $("#totalGastosPorCategoria").removeClass("d-none");
        break;
      case "Resumen":
        $("#totalGastosResumen").removeClass("d-none");
        break;
      case "Editar":
        $("#editarGastos").removeClass("d-none");
        break;
      case "Plan mes":
        $("#planMensual").removeClass("d-none");
        break;
    }
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

  pruebas();
  // ACTUALIZAR LA TABLA DE REAL VS PLAN (En base a GASTOS_POR_CATEGORIA)
  await crear_tabla_real_vs_Plan();

  //MOSTRAR LOS GASTOS PLAN DEL gastos_plan.js
  await mostrarGastosPlan();

  // DETECTAR VALOR EN ANIO Y MES DE ANALISIS
  getAnioMesAnalisis();
});

$("#guardar_gasto_plan").on("click", async () => {
  //OBTENER DATOS DE ALMACENAMIENTO
  const spending_data = getDataStorage();
  //Guardar datos en mongoDB y actualizar datos en pantalla
  const VI_guardarDatosPlan = await guardarDatosPlan(spending_data);
});

// **************************************
// OBTENER GASTOS POR CATEGORIA
// **************************************
$(".btn_plan_gasto").on("click", function () {
  //Obtener y almacenar el ID_PRODUCTO en una variable localtorage
  const gastoID = $(this).data("gasto");
  localStorage.setItem("ID_PRODUCTO", JSON.stringify(gastoID));

  //Obtener atributos del id_producto seleccionado con Agregar
  const arrayGasto = Object.values(gastos_plan).find((g) => g.id === gastoID);

  //Asignar valores obtenidos en el MODAL de guardar gasto plan
  $("#categoria_gasto").text(arrayGasto.nombre);
  $("#subcategoria_gasto").text(arrayGasto.nombre);
  if (arrayGasto.cantidad_plan == "NA") {
    $("#cantidad_gasto_plan").addClass("d-none");
  }
  $("#monto_gasto_plan").val(arrayGasto.precio_relativo);
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

  //Guardar gastos reales realizados dentro del mes actual, en localstorage
  localStorage.removeItem("GASTOS_POR_CATEGORIA");
  localStorage.setItem(
    "GASTOS_POR_CATEGORIA",
    JSON.stringify(resultFiltroPorFecha)
  );

  console.log("GASTOS GUARDADOS: ", resultFiltroPorFecha);

  let resultTotalesPorCategoria = getTotalesPorCategoria(
    categorias,
    resultFiltroPorFecha
  );

  // Mostrar los gastos en la pantalla
  mostrarGastosPantalla(resultTotalesPorCategoria);
  mostrarResumenGastosPantalla(resultTotalesPorCategoria);
  mostrarEditarGastosPantalla(resultFiltroPorFecha);

  // Actualizar indicador principal OTROS GASTOS
  let categoriaOtrosGastos = resultTotalesPorCategoria.filter(
    (elem) => elem.categoria === "otros_gastos"
  );
  $("#otroGasto").text(categoriaOtrosGastos[0].totalReal.toFixed(2));

  // ACTUALIZAR LA TABLA DE REAL VS PLAN (En base a GASTOS_POR_CATEGORIA)
  await crear_tabla_real_vs_Plan();

  //MOSTRAR LOS GASTOS PLAN DEL gastos_plan.js
  await mostrarGastosPlan();
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
// MOSTRAR RESUMEN GASTOS EN PANTALLA
// **************************************
const mostrarResumenGastosPantalla = (datos) => {
  let html = ``;
  let diferencia = 0;

  let totalReal = 0;
  let totalPLan = 0;

  datos.map((elem) => {
    diferencia = parseFloat(elem.totalPlan) - parseFloat(elem.totalReal);
    html += `
          <tr>
            <td>${elem.categoria}</td>
            <td>${elem.totalReal}</td>
            <td>${elem.totalPlan}</td>
            <td>${diferencia.toFixed(2)}</td>
          </tr>
        `;

    totalReal += elem.totalReal;
    totalPLan += elem.totalPlan;
  });

  $("#detalleTablaCategoria").empty();
  $("#detalleTablaCategoria").html(html);

  $("#total_real").html(totalReal);
  $("#total_plan").html(totalPLan);
  $("#total_diferencia").html((totalPLan - totalReal).toFixed(2));
};
// **************************************
// MOSTRAR EDITAR GASTOS EN PANTALLA
// **************************************
const mostrarEditarGastosPantalla = (datos) => {
  let html = ``;
  let diferencia = 0;

  let totalReal = 0;
  let totalPLan = 0;

  datos.map((elem) => {
    diferencia = parseFloat(elem.totalPlan) - parseFloat(elem.totalReal);
    html += `
          <tr>
            <td>${elem.fecha_compra + " " + elem.datos_fecha.hora}</td>
            <td class="descripcio_gasto">
              <span class="table_categoria" >${elem.categoria}</span>
              <span class="table_subcategoria" >${elem.subcategoria}</span>
              <span class="table_descripcion" >${elem.descripcion}</span>
            </td>
            <td>${elem.monto}</td>
            <td>
              <button id="${
                elem._id
              }" class="icon-button editar_eliminar_registro">
                <svg class="icon_trush_svg" viewBox="0 0 24 24">
                  <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9M7 6H17V19H7V6M9 8V17H11V8H9M13 8V17H15V8H13Z" />
                </svg>
              </button>
            </td>
          </tr>
        `;

    totalReal += elem.totalReal;
    totalPLan += elem.totalPlan;
  });

  $("#detalleTablaEditar").empty();
  $("#detalleTablaEditar").html(html);
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

  const yyyy_ini = fecha_inicio.getFullYear();
  const mm_ini = String(fecha_inicio.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() es 0-indexed
  const dd_ini = String(fecha_inicio.getDate()).padStart(2, "0");

  const fechaInicioInt = parseInt(`${yyyy_ini}${mm_ini}${dd_ini}`);

  const yyyy_fin = fecha_fin.getFullYear();
  const mm_fin = String(fecha_fin.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() es 0-indexed
  const dd_fin = String(fecha_fin.getDate()).padStart(2, "0");

  const fechaFinInt = parseInt(`${yyyy_fin}${mm_fin}${dd_fin}`);

  datos.map((elem) => {
    //let fechaRegistro = elem.datos_fecha.fecha.replaceAll("-", "");
    let fechaRegistro = elem.fecha_compra.replaceAll("-", "");
    let horaRegistro = elem.datos_fecha.hora.replaceAll(":", "");
    let fechaHoraRegistro = parseInt(fechaRegistro + horaRegistro);

    let fechaGastoInt = parseInt(elem.fecha_compra.replaceAll("-", ""));

    if (fechaGastoInt >= fechaInicioInt && fechaGastoInt <= fechaFinInt) {
      elem.fecha_hora_registro = fechaHoraRegistro;
      result.push(elem);
    }
  });

  result.sort((a, b) => b.fecha_hora_registro - a.fecha_hora_registro);

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
  $("#gastoMensual").text(total.total.toFixed(2));
  // Actualización del Ahorro Mensual
  $("#ahorroMensual").text((ingreso - total.total).toFixed(2));
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
  let total = 0;
  let gasto_semanal_extra = 0;
  let gasto_semanal_planificado = 0;

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
  let ingreso = 1200;
  //OBETENER DATOS INGRESADOS
  var monto = $("#monto_gasto").val();
  var categoria = $("#listarCategorias").val();
  var subcategoria = $("#listarSubcategorias").val();
  var descripcion = $("#desc_gasto").val();
  if (descripcion.trim() === "") {
    descripcion = "SD";
  }
  let id_gasto = generateRandomID();
  let datos_fecha = obtenerDatosFecha();
  //   let tipo_gasto = $('input[name="grupoTipoGasto"]:checked').val();
  let fechaCompraNoFormat = $("#fecha_compra").val();
  let fecha_compra =
    fechaCompraNoFormat.substr(6) +
    "-" +
    fechaCompraNoFormat.substr(3, 2) +
    "-" +
    fechaCompraNoFormat.substr(0, 2);

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

  //$("#fecha_compra").val("");

  //ENVIAR AL SERVIDOR
  var jsonData = JSON.stringify(gasto, null, 2);
  var urlsave = urlsaveapi;
  var responseSave = await guardarDatos(urlsave, jsonData);

  if (responseSave == "DATA_INCOMPLETE") {
    mostrarMensaje("Datos incompletos", 0);
  } else if (responseSave == "SUCCESS") {
    await actualizarGastoMensual(ingreso);
    await getGastosPorCategorias(categorias);
    //LIMPIAR CAMPOS
    limpiarCampos();
    mostrarMensaje("Guardado", 1);
  } else if (responseSave == "ERROR") {
    mostrarMensaje("Error", 2);
  }
});
// **************************************
// MOSTRAR MENSAJE DE CONFIRMACION
// **************************************
const mostrarMensaje = (msg, msg_num) => {
  $("#response_save").text(msg);
  if (msg_num == 0) {
    $("#response_save")
      .removeClass("success error incomplete")
      .addClass("incomplete");
    $("#response_save")
      .stop(true, true) // Evita que las animaciones se acumulen
      .fadeIn(1000, function () {
        $(this).removeClass("d-none");
      }) // Aparece suavemente en 1s
      .delay(1000) // Se mantiene visible por 1s
      .fadeOut(1000, function () {
        $(this).addClass("d-none");
      }); // Desaparece suavemente en 1s
  } else if (msg_num == 1) {
    $("#response_save")
      .removeClass("success error incomplete")
      .addClass("success");
    $("#response_save")
      .removeClass("d-none")
      .fadeOut(1000)
      .fadeIn(1000, function () {
        $(this).addClass("d-none");
      });
  } else if (msg_num == 2) {
    $("#response_save")
      .removeClass("success error incomplete")
      .addClass("error");
    $("#response_save")
      .removeClass("d-none")
      .fadeOut(1000)
      .fadeIn(1000, function () {
        $(this).addClass("d-none");
      });
  }
};
// **************************************
// LIMPIAR CAMPOS DEL GUARDADO
// **************************************
const limpiarCampos = () => {
  $("#monto_gasto").val("");
  $("#listarCategorias").val("");
  $("#listarSubcategorias").val("");
  $("#desc_gasto").val("");
};
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

  // ACTUALIZAR LA TABLA DE REAL VS PLAN (En base a GASTOS_POR_CATEGORIA)
  await crear_tabla_real_vs_Plan();

  //MOSTRAR LOS GASTOS PLAN DEL gastos_plan.js
  await mostrarGastosPlan();
});

const getAnioMesAnalisis = () => {
  // OBTENER FECHA ACTUAL DE SISTEMA
  let fechaActual = new Date();
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let anio = "" + fechaActual.getFullYear();

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

// **************************************
// ACTUALIZAR FECHA COMPRA
// **************************************
$("#agregarGasto").on("click", () => {
  reiniciarFechaCompra();
});

const reiniciarFechaCompra = () => {
  // OBTENER FECHA ACTUAL DE SISTEMA
  let fechaActual = new Date();
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let anio = fechaActual.getFullYear();

  // => Formatear la fecha en formato mm/dd/yyyy
  let fechaFormateada = dia + "/" + mes + "/" + anio;
  $("#datepicker").datepicker({
    format: "dd/mm/yyyy",
    todayHighlight: true,
    autoclose: true,
  });

  // => Establecer la fecha actual por defecto en el campo de entrada
  $("#fecha_compra").val(fechaFormateada);
};

$(document).on("click", ".editar_eliminar_registro", function () {
  $("#eliminarGasto").modal("show");
  registroPorEliminado = this.id;
});
$("#eliminar_gasto").on("click", async () => {
  await eliminarRegistro(registroPorEliminado);
});

const eliminarRegistro = async (id) => {
  //ARMAR DATA
  var gasto = {
    id: id,
  };

  //ENVIAR AL SERVIDOR
  var jsonData = JSON.stringify(gasto, null, 2);
  let urldelete = urldeleteapi;
  var responseDelete = await eliminarDato(urldelete, jsonData);

  if (responseDelete == "SUCCESS") {
    // OBTENER GASTOS POR CATEGORIAS
    await getGastosPorCategorias(categorias);
    //OBTENER GASTO MENSUAL
    await actualizarGastoMensual(ingreso);
    $("#eliminarGasto").modal("hide");
    alert("Registro eliminado");
  } else if (responseDelete == "NOT_FOUND") {
    $("#eliminarGasto").modal("hide");
    alert("No se encontró el registro");
  } else if (responseDelete == "ERROR") {
    $("#eliminarGasto").modal("hide");
    alert("Error al eliminar registro");
  }
};
