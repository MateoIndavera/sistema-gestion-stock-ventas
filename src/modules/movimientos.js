import { $, $$ } from "../utils/dom.js";

const $body = $("body");
const $movimientos = $(".contMovimientos .movimientos");
const $btnConfirmMov = $("#confirmMov");

let count = 0;

document.addEventListener("keydown", (e) => {
    if (e.key != "+") {
        return;
    }

    const filaProducto = document.createElement("div");
    filaProducto.classList.add("filaProducto");
    filaProducto.dataset.filaNumero = count;

    filaProducto.innerHTML = `
            <input type="text" data-field="codigo barra" placeholder="1234567890">
            <input type="text" data-field="nombre" placeholder="Coca-cola 500ml">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioCompra" placeholder="1500">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="precioVenta" placeholder="3000">
            <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" data-field="cantidad" placeholder="2">
            <div class="acciones"></div>
`;

    $movimientos.appendChild(filaProducto);

    count++;
});

$btnConfirmMov.addEventListener("click", (e) => {
    try {
        let productos = [];
        let filas = $$(".filaProducto");
        filas.map((fila) => {
            const inputs = $$("[data-field]", fila);

            productos = inputs.reduce((obj, input) => {
                if (input.value == "") {
                    throw {
                        filaError: fila.dataset.filaNumero,
                        campoError: input.dataset.field,
                    };
                }

                obj[input.dataset.field] = input.value;

                return obj;
            }, {});
        });
    } catch (e) {
        console.log(e);
    }
});

// $body.addEventListener("click", (e) => {
//     console.log(count);
// });
