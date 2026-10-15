import { $, $$ } from "../utils/dom.js";

const $body = $("body");
const $movimientos = $(".contMovimientos .movimientos");
const $btnConfirmMov = $("#confirmMov");
const $btnCargaProds = $(".cargaProds");

let count = 0;

//FUNCIONES

//Agregar Fila

const agregarFilaProducto = () => {
    const filaProducto = document.createElement("div");
    filaProducto.classList.add("filaProducto");
    filaProducto.dataset.filaNumero = count;

    filaProducto.innerHTML = `
            <input type="text" data-field="codBarra" placeholder="1234567890">
            <div class="contSugerencia">
            <input type="text" data-field="nombre" placeholder="Coca-cola 500ml">
            <div class="resultadoSugerencia">
                <div class="sugerencia">Coca Cola 2.25L</div>
                <div class="sugerencia">Arroz Gallo 1kg</div>
                <div class="sugerencia">Aceite Natura 900ml</div>
            </div>
            </div>
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioCompra" placeholder="1500">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioVenta" placeholder="3000">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="cantidad" placeholder="2">
            <div class="acciones"></div>
`;

    $movimientos.appendChild(filaProducto);

    count++;
};

//Completar prods al ir cargando un movimiento
const autoCompletarProductos = async (input) => {
    setTimeout(() => {
        console.log("event\n", input.value, "\n"); // Dejaste aca
    }, 300);
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
            return (acc += p.cantidad * p.precioCompra);
        }, 0);

        const movimiento = [productos, total];

        console.log(movimiento);

        const respuesta = await window.dbApi.guardarMovimiento(movimiento);
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
    modal.classList.add("modalError");
    pantallaModal.appendChild(modal);

    if (objError.razon == "campo vacio") {
        modal.innerHTML = `
    <div class="contImgError"><img src="../img/iconoError.png"></div>
    <p><span>Error en el Producto Nº </span>${objError.filaError}</p>
    <p><span>En el Campo: </span>${objError.campoInfoError}</p>
    <p><span>Tipo: </span>${objError.msgError}</p>
    <button class="btnReintentar">Reintentar</button>
    `;
    } else if (objError.razon == "lista sin productos") {
        modal.innerHTML = `
        <div class="contImgError"><img src="../img/iconoError.png"></div>
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

$movimientos.addEventListener("input", (e) => {
    if (e.target.dataset.field == "nombre") {
        autoCompletarProductos(e.target);
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
