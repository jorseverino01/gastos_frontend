const getDataStorage = () => {
  let ingreso = 1200;
  //OBETENER DATOS INGRESADOS
  let cantidad_gasto_plan = $("#cantidad_gasto_plan").val();
  let monto_gasto_plan = $("#monto_gasto_plan").val();
  let categoria_gasto = $("#categoria_gasto").text();
  let subcategoria_gasto = $("#subcategoria_gasto").text();
  let desc_gasto = $("#desc_gasto_plan").val();
  let fecha_compra_plan = $("#fecha_compra_plan").val();
  let id_gasto = generateRandomID();
  let datos_fecha = obtenerDatosFecha();
  let fecha_compra =
    fecha_compra_plan.substr(6) +
    "-" +
    fecha_compra_plan.substr(3, 2) +
    "-" +
    fecha_compra_plan.substr(0, 2);

  let id_producto = localStorage.getItem("ID_PRODUCTO");

  const spending_data = {
    monto: monto_gasto_plan,
    categoria: categoria_gasto,
    subcategoria: subcategoria_gasto,
    descripcion: desc_gasto,
    id_gasto,
    datos_fecha,
    fecha_compra,
    id_producto,
    cantidad: cantidad_gasto_plan,
  };

  return spending_data;
};

const guardarDatosPlan = async (data) => {
  //Almacenamiento del gasto plan
  let jsonData = JSON.stringify(data, null, 2);
  const urlsave = urlsaveapi;
  const responseSave = await guardarDatos(urlsave, jsonData);

  //Mostrar mensaje obtenidos
  mostrarMensajesGuardar(responseSave);
};

const mostrarMensajesGuardar = async (responseSave) => {
  if (responseSave == "DATA_INCOMPLETE") {
    mostrarMensaje("Datos incompletos", 0);
  } else if (responseSave == "SUCCESS") {
    await actualizarGastoMensual(ingreso);
    await getGastosPorCategorias(categorias);
    //Limpia los campos necesarios del modal guardar gasto plan
    limpiarCamposModalPlan();
    mostrarMensaje("Guardado", 1);
  } else if (responseSave == "ERROR") {
    mostrarMensaje("Error", 2);
  }
};

const limpiarCamposModalPlan = () => {
  //Limpia campo Descripcion del modal gasto plan
  $("#desc_gasto_plan").val("");
};

const mostrarGastosPlan = async () => {
  let gastos_planificados = gastos_plan;

  let GASTOS_REAL_VS_PLAN = JSON.parse(
    localStorage.getItem("GASTOS_REAL_VS_PLAN")
  );
  console.log(GASTOS_REAL_VS_PLAN);

  let html = ``;

  //Obtener el gastos real realizado por ID de producto.
  let gastos_reales = JSON.parse(localStorage.getItem("GASTOS_POR_CATEGORIA"));

  for (let i = 0; i < GASTOS_REAL_VS_PLAN.length; i++) {
    const gasto = GASTOS_REAL_VS_PLAN[i];

    let claseColor = "";

    let cantidad;

    if (gasto.cantidad_plan == "NA") {
      cantidad = 1;
    } else {
      cantidad = gasto.cantidad_plan;
    }

    if (gasto.monto_total == undefined) {
      {
        gasto.monto_total = 0;
      }
    }

    if (parseFloat(gasto.monto_total) > parseFloat(gasto.precio_plan_mensual)) {
      {
        claseColor = "valor_rojo";
      }
    }

    html += `
            <div class="row_plan_gasto">
              <div class="img_plan_gasto">
                <img src="./img/${gasto.img}" alt="${gasto.nombre}" />
              </div>
              <div class="datos_plan_gasto">
                <span id="des_plan_gasto" class="des_plan_gasto">${gasto.nombre}</span>
                <div class="unid_plan_gasto">
                  <span class="desc_cant_cons_gastos_plan">Cantidad</span>
                  <span class="real_unid">0</span>
                  <span class="plan_unid">${cantidad}</span>
                </div>
                <div class="consum_plan_gasto">
                  <span class="desc_cant_cons_gastos_plan">Consumo</span>
                  <span class="real_consum ${claseColor}">S/${gasto.monto_total}</span>
                  <span class="plan_consum">S/${gasto.precio_plan_mensual}</span>
                </div>
              </div>
              <!-- <div class="dec_btn_plan_gasto">
                <div
                  class="btn_plan_gasto"
                  data-bs-toggle="modal"
                  data-bs-target="#gastoPlanMes"
                  data-gasto="${gasto.id}"
                >
                  Agregar
                </div> -->
              </div>
            </div>
  `;
  }

  $("#detallePlanMemsual").empty();
  $("#detallePlanMemsual").html(html);
};

const pruebas = () => {
  let total = 0;
  let otros_gastos = 0;
  let servicios = 0;
  let abarrotes = 0;
  let perros = 0;
  let almuerzo = 0;

  Object.values(gastos_plan).forEach((gasto) => {
    //console.log(gasto.nombre, "   ", gasto.precio_plan_mensual);
    if (gasto.planificado === "X") {
      total += gasto.precio_plan_mensual;
    }
    if (gasto.categoria === "otros_gastos" && gasto.planificado === "X") {
      otros_gastos += gasto.precio_plan_mensual;
      console.log(
        "OTROS GASTOS:  ",
        gasto.subcategoria,
        ":  ",
        gasto.precio_plan_mensual
      );
      //console.log("OTROS GASTOS:  ", gasto.nombre);
    }
    if (gasto.categoria === "servicios" && gasto.planificado === "X") {
      servicios += gasto.precio_plan_mensual;
    }
    if (gasto.categoria === "abarrotes" && gasto.planificado === "X") {
      abarrotes += gasto.precio_plan_mensual;
    }
    if (gasto.categoria === "perros" && gasto.planificado === "X") {
      perros += gasto.precio_plan_mensual;
    }
    if (gasto.categoria === "almuerzo" && gasto.planificado === "X") {
      almuerzo += gasto.precio_plan_mensual;
    }
  });
  console.log("TOTAL:  ", total);
  console.log("OTROS GASTOS:  ", otros_gastos);
  console.log("SERVICIOS:  ", servicios);
  console.log("ABARROTES:  ", abarrotes);
  console.log("PERROS:  ", perros);
  console.log("ALMUERZO:  ", almuerzo);
};

const crear_tabla_real_vs_Plan = () => {
  //Obtenemos los valore en arrays de objetos (JSON) de los gastos totales del mes y los gastos planificados
  let GASTOS_X_CATEGORIA = JSON.parse(
    localStorage.getItem("GASTOS_POR_CATEGORIA")
  );
  let GASTOS_PLANIFICADOS = Object.values(gastos_plan);

  // SUMARIZACION POR CATEGORIA:
  //------------------------------
  // se almacenamos en "totalTemp"
  // ini
  let totalTemp = {};
  let GASTOS_REALES_SUM_SUBCAT = [];
  let valor_aux_fixed = 0.0;

  result_totalTemp = GASTOS_X_CATEGORIA.reduce((acumulador, gasto) => {
    const clave = `${gasto.categoria}|${gasto.subcategoria}`;

    if (!(clave in totalTemp)) {
      totalTemp[clave] = {
        categoria: gasto.categoria,
        subcategoria: gasto.subcategoria,
        monto_total: 0,
      };
    }

    valor_aux_fixed = parseFloat(totalTemp[clave].monto_total);
    valor_aux_fixed += parseFloat(gasto.monto);
    totalTemp[clave].monto_total = parseFloat(valor_aux_fixed).toFixed(2);

    return totalTemp;
  }, totalTemp);

  for (clave in totalTemp) {
    GASTOS_REALES_SUM_SUBCAT.push(totalTemp[clave]);
  }
  // Fin

  // Agregar el gasto real a una nueva tabla "GASTOS_PLANIFICADOS_TEMP"

  let GASTOS_PLANIFICADOS_TEMP = [];
  let GASTOS_REALES_SUM_SUBCAT_TEMP = GASTOS_REALES_SUM_SUBCAT;
  let gasto_real_plan_temp = {};
  let total_otros = 0;
  let i_otr_gst = 0;

  for (let i = 0; i < GASTOS_PLANIFICADOS.length; i++) {
    // Obtenemos cada gasto_plan
    const gasto_plan = GASTOS_PLANIFICADOS[i];

    // Guardamos el index de la subcategoria "otros_gastos"
    if (gasto_plan.subcategoria == "otros_gastos") {
      i_otr_gst = i;
    }

    // Buscamos el gasto real de la subcategoria del plan
    if (gasto_plan.subcategoria != "otros_gastos") {
      let index_borrado_aux = 0;
      let index_borrado = -1;

      GASTOS_REALES_SUM_SUBCAT_TEMP.find((gasto) => {
        if (
          gasto_plan.subcategoria.toUpperCase() ==
          gasto.subcategoria.toUpperCase()
        ) {
          gasto_plan["monto_total"] = parseFloat(gasto.monto_total);
          index_borrado = index_borrado_aux;
        }
        index_borrado_aux += 1;
      });

      // Eliminamos el gasto, si se encontró en el array
      if (index_borrado > -1) {
        GASTOS_REALES_SUM_SUBCAT_TEMP.splice(index_borrado, 1);
      }

      GASTOS_PLANIFICADOS_TEMP.push(gasto_plan);
    }

    // Si estamos en la ultima iteracion, agregamos el elemento de otros_gastos y la suma de todos los extras
    // otros_gastos = otros_gastos + extras:
    if (i == GASTOS_PLANIFICADOS.length - 1) {
      const gasto_plan_otros = GASTOS_PLANIFICADOS[i_otr_gst];
      const total_otros = GASTOS_REALES_SUM_SUBCAT_TEMP.reduce(
        (acumulador, elem) => {
          acumulador += parseFloat(elem.monto_total);
          return acumulador;
        },
        0
      );
      gasto_plan_otros["monto_total"] = parseFloat(total_otros);
      GASTOS_PLANIFICADOS_TEMP.push(gasto_plan_otros);
    }
  }
  // Almacenamos la tabla de reales vs plan en localstorage
  localStorage.setItem(
    "GASTOS_REAL_VS_PLAN",
    JSON.stringify(GASTOS_PLANIFICADOS_TEMP)
  );
};
