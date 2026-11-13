import { $, $$ } from "../../utils/dom.js";

const $body = $("body");
const $movimientos = $(".contMovimientos .movimientos");
const $btnConfirmMov = $("#confirmMov");
const $btnCargaProds = $(".cargaProds");
let inputProductosDinamico;
let resultadoSugerencias = null;

let timeSetOutId;

let contadorFilas = 0;

//FUNCIONES

//Agregar Fila

const agregarFilaProducto = () => {
    const filaProducto = document.createElement("div");
    filaProducto.classList.add("filaProducto");
    filaProducto.dataset.filaNumero = contadorFilas;

    filaProducto.innerHTML = `
            <input type="text" data-field="cod_barra" placeholder="1234567890">
            <div class="contSugerencia">
            <input type="text" data-field="nombre" placeholder="Coca-cola 500ml">
            </div>
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precio_compra" placeholder="1500">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precio_venta" placeholder="3000">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="cantidad" placeholder="2">
            <div class="acciones"></div>
`;

    $movimientos.appendChild(filaProducto);

    contadorFilas++;
};

//Completar prods al ir cargando un movimiento
const autoCompletarProductos = async (input) => {
    if (resultadoSugerencias != null) {
        resultadoSugerencias.remove();
    }

    resultadoSugerencias = document.createElement("div");
    resultadoSugerencias.classList.add("resultadoSugerencias");
    input.parentElement.appendChild(resultadoSugerencias);

    const arrProductos = await window.dbApi.pedirNombreProductos(input.value);

    console.log(arrProductos);
    if (arrProductos != undefined) {
        for (const p of arrProductos) {
            const sugerencia = document.createElement("div");
            sugerencia.dataset.id = p.id;
            sugerencia.classList.add("sugerencia");
            sugerencia.innerHTML = `${p.nombre}`;
            resultadoSugerencias.appendChild(sugerencia);
        }
    }
};

//Confirm Movimiento
const confirmarMovimiento = async () => {
    try {
        let filas = $$(".filaProducto");
        if (filas.length == 0) {
            throw {
                razon: "lista sin productos",
                msgError: "No hay ningun producto cargado",
            };
        }

        let productos = filas.map((fila) => {
            const inputs = $$("[data-field]", fila);
            return inputs.reduce((obj, input) => {
                if (input.value == "") {
                    throw {
                        razon: "campo vacio",
                        msgError: "No pueden haber campos vacios",
                        filaError: fila.dataset.filaNumero,
                        campo: input,
                        campoInfoError: input.dataset.field,
                    };
                }

                obj[input.dataset.field] = input.value;
                return obj;
            }, {});
        });

        let total = productos.reduce((acc, p) => {
            return (acc += p.cantidad * p.precio_compra);
        }, 0);

        const movimiento = [productos, total];

        console.log(movimiento);

        const respuesta = await window.dbApi.guardarMovimiento(movimiento);
        if (respuesta) {
            modalUiConfirmacion();
        }
        console.log(respuesta);
    } catch (e) {
        console.log(e);
        modalUiErrores(e);
    }
};
//Funcion que maneja la visualizacion de errores
const modalUiErrores = (objError) => {
    let $existeModal = $(".pantallaModal");
    if ($existeModal) {
        return;
    }

    const pantallaModal = document.createElement("div");
    pantallaModal.classList.add("pantallaModal");
    $body.appendChild(pantallaModal);

    const modal = document.createElement("div");
    modal.classList.add("modal");
    pantallaModal.appendChild(modal);

    if (objError.razon == "campo vacio") {
        modal.innerHTML = `
    <div class="contImgError"><img src="../../../src/img/IconoError.png"></div>
    <p><span>Error en el Producto Nº </span>${objError.filaError}</p>
    <p><span>En el Campo: </span>${objError.campoInfoError}</p>
    <p><span>Tipo: </span>${objError.msgError}</p>
    <button class="btnReintentar">Reintentar</button>
    `;
    } else if (objError.razon == "lista sin productos") {
        modal.innerHTML = `
        <div class="contImgError"><img src="../../img/iconoError.png.png"></div>
        <p><span>ERROR!!</span>
        <p><span>Razon: </span>${objError.msgError}</p>
        <button class="btnReintentar">Reintentar</button>
        `;
    }

    const $btnReintentar = $(".btnReintentar");
    $btnReintentar.addEventListener("click", (e) => {
        pantallaModal.remove();
        objError.campo.focus();
    });
};

const modalUiConfirmacion = () => {
    let $existeModal = $(".pantallaModal");
    if ($existeModal) {
        return;
    }

    const pantallaModal = document.createElement("div");
    pantallaModal.classList.add("pantallaModal");
    $body.appendChild(pantallaModal);

    const modal = document.createElement("div");
    modal.classList.add("modal");
    pantallaModal.appendChild(modal);

    modal.innerHTML = `
    <div class="contImgError"><img src="../img/iconoCheck.png"></div>
    <p><span>Exito!!!</p>
    <p><span>El movimiento fue registrado correctamente</p>
    <button class="btnCerrar">Cerrar</button>
    `;

    const $btnCerrar = $(".btnCerrar");
    $btnCerrar.addEventListener("click", (e) => {
        pantallaModal.remove();
        $movimientos.children.remove();
    });
};

//Listeners
document.addEventListener("keydown", (e) => {
    let $existeModal = $(".pantallaModal"); //Verifica si esta el modal abierto

    //Cierra el modal
    if (e.key == "Escape" && $existeModal) {
        $existeModal.remove();
    }

    if (e.key === "+") {
        agregarFilaProducto();
    }

    if (e.key == "Enter") {
        confirmarMovimiento();
    }
});

document.addEventListener("click", (e) => {
    if (
        inputProductosDinamico &&
        document.activeElement !== inputProductosDinamico // Verifica si el input existe y si perdio foco, Al perder foco el input se borran el resultado
    ) {
        resultadoSugerencias.remove();
    }
});

//Escucha los inputs de movimiento, Si es el input de nombre, lo toma y lo guarda en inputProductosDinamico
$movimientos.addEventListener("input", (e) => {
    if (e.target.dataset.field == "nombre") {
        inputProductosDinamico = e.target;
        clearTimeout(timeSetOutId);

        timeSetOutId = setTimeout(() => {
            autoCompletarProductos(e.target);
        }, 200);
    }
});

$movimientos.addEventListener("click", async (e) => {
    const sugerenciaElegida = e.target.closest(".sugerencia");
    if (!sugerenciaElegida) {
        return;
    }
    const filaProducto = sugerenciaElegida.closest(".filaProducto");

    const idProducto = sugerenciaElegida.dataset.id;
    const producto = await window.dbApi.pedirDatosProducto(idProducto);
    for (const [campo, valor] of Object.entries(producto)) {
        const input = $(`[data-field=${campo}]`, filaProducto);
        if (input) {
            input.value = valor;
        }
    }
});

//Cargar 3 prods
$btnCargaProds.addEventListener("click", (e) => {
    try {
        window.dbApi.cargar3Prods();
    } catch (e) {
        console.log(e.message);
    }
});

$btnConfirmMov.addEventListener("click", (e) => {
    confirmarMovimiento();
});
