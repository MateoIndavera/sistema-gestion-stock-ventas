import { $, $$ } from "../utils/dom.js";

const $body = $("body");
const $movimientos = $(".contMovimientos .movimientos");
const $btnConfirmMov = $("#confirmMov");

let count = 0;

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

    modal.innerHTML = `
      <div class="contImgError"><img src="../img/iconoError.png"></div>
      <p><span>Error en el Producto: </span> ${objError.filaError}</p>
      <p><span>En el Campo: </span>${objError.campoError}</p>
      <button>Reintentar</button>
    `;
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
                        razon: "Campo vacio",
                    };
                }
                console.log(input);

                obj[input.dataset.field] = input.value;

                return obj;
            }, {});
        });
    } catch (e) {
        modalUiErrores(e);
    }
});

// $body.addEventListener("click", (e) => {
//     console.log(count);
// });
