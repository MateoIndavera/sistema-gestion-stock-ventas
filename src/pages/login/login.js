import { $, $$ } from "../../utils/dom.js";

const $form = $(".form-login");

$form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datosLogin = new FormData($form);

    const respuesta = await window.dbApi.loginUser(
        Object.fromEntries(datosLogin),
    );

    console.log(respuesta);
});
