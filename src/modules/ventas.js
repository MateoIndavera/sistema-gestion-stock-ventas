import { $, $$ } from "../utils/dom.js";

const body = $("body");

body.addEventListener("keydown", (e) => {
    if (e.key != "+") {
        return;
    }

    let existeModal = $(".pantallaModal");
    if (existeModal) {
        existeModal.remove();
    }

    console.log("si lees esto, Seguime!!!");

    const pantallaModal = document.createElement("div");
    pantallaModal.classList.add("pantallaModal");
    body.appendChild(pantallaModal);

    const modal = document.createElement("div");
    modal.classList.add("modal");
    pantallaModal.appendChild(modal);
});
