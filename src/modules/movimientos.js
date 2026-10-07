import { $, $$ } from "../utils/dom.js";

const $body = $("body");
const $movimientos = $(".contMovimientos .movimientos");
const $btnConfirmMov = $("#confirmMov");

let count = 0;

//FUNCIONES

const confirmarMovimiento = () => {
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

        console.log(productos);
    } catch (e) {
        console.log(e);
        modalUiErrores(e);
    }
};

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

document.addEventListener("keydown", (e) => {
    if (e.key != "+") {
        return;
    }

    const filaProducto = document.createElement("div");
    filaProducto.classList.add("filaProducto");
    filaProducto.dataset.filaNumero = count;

    filaProducto.innerHTML = `
            <input type="text" data-field="cod barra" placeholder="1234567890">
            <input type="text" data-field="nombre" placeholder="Coca-cola 500ml">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioCompra" placeholder="1500">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioVenta" placeholder="3000">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="cantidad" placeholder="2">
            <div class="acciones"></div>
`;

    $movimientos.appendChild(filaProducto);

    count++;
});

document.addEventListener("keydown", (e) => {
    let $existeModal = $(".pantallaModal");
    if (e.key == "Escape" && $existeModal) {
        $existeModal.remove();
    }
    if (e.key != "Enter") {
        return;
    }

    confirmarMovimiento();
});

$btnConfirmMov.addEventListener("click", (e) => {
    confirmarMovimiento();
});

// $body.addEventListener("click", (e) => {
//     console.log(count);
// });
