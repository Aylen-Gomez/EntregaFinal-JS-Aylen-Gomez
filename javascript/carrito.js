// ==============================
// CARRITO
// ==============================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function vaciarCarrito() {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminarán todos los productos del carrito",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      actualizarCarrito();

      Swal.fire({
        title: "Carrito eliminado",
        text: "Se vació tu carrito correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}

function actualizarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total");
  if (!listaCarrito || !totalCarrito) return;

  listaCarrito.innerHTML = "";
  let total = 0;
  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} - $${item.precio}`;
    listaCarrito.appendChild(li);
    total += item.precio;
  });
  totalCarrito.textContent = total;
}

function agregarAlCarrito(producto) {
  carrito.push(producto);
  guardarCarrito();
  actualizarCarrito();

  Swal.fire({
    title: "Producto agregado",
    text: `${producto.nombre} fue añadido al carrito`,
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    timerProgressBar: true,
  });
}

// ==============================
// DESCUENTO
// ==============================
function aplicarDescuento() {
  const codigoInput = document.getElementById("codigo-descuento");
  const mensaje = document.getElementById("mensaje-descuento");
  const totalSpan = document.getElementById("total");

  const codigo = codigoInput.value.trim().toUpperCase();

  if (codigo === "DESC10") {
    const totalActual = parseInt(totalSpan.textContent);
    const totalDescontado = Math.round(totalActual * 0.9);
    totalSpan.textContent = totalDescontado;
    mensaje.style.display = "block";
    mensaje.style.color = "green";
    mensaje.textContent = "¡Descuento aplicado!";
  } else {
    mensaje.style.display = "block";
    mensaje.style.color = "red";
    mensaje.textContent = "Código inválido";
  }
}

// ==============================
// FINALIZAR COMPRA
// ==============================
function finalizarCompra() {
  if (carrito.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "No hay productos en el carrito para comprar",
      icon: "warning",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  const totalActual = parseInt(document.getElementById("total").textContent);
  let resumen = carrito.map(item => `${item.nombre} - $${item.precio}`).join('<br>');

  Swal.fire({
    title: "Confirmar Compra",
    html: `<strong>Productos:</strong><br>${resumen}<br><strong>Total: $${totalActual}</strong>`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Pagar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Pago Seguro",
        html: `
          <input type="text" id="nombre-tarjeta" class="swal2-input" placeholder="Nombre en la tarjeta">
          <input type="text" id="numero-tarjeta" class="swal2-input" placeholder="Número de tarjeta">
          <input type="text" id="vencimiento" class="swal2-input" placeholder="MM/AA">
          <input type="text" id="cvv" class="swal2-input" placeholder="CVV">
        `,
        confirmButtonText: "Pagar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const nombre = Swal.getPopup().querySelector('#nombre-tarjeta').value;
          const numero = Swal.getPopup().querySelector('#numero-tarjeta').value;
          const venc = Swal.getPopup().querySelector('#vencimiento').value;
          const cvv = Swal.getPopup().querySelector('#cvv').value;

          if (!nombre || !numero || !venc || !cvv) {
            Swal.showValidationMessage(`Por favor completa todos los campos`);
          }
          return { nombre, numero, venc, cvv };
        }
      }).then((pago) => {
        if (pago.isConfirmed) {
          carrito = [];
          guardarCarrito();
          actualizarCarrito();
          document.getElementById("codigo-descuento").value = "";
          document.getElementById("mensaje-descuento").style.display = "none";

          Swal.fire({
            title: "¡Compra exitosa!",
            html: `Gracias por tu compra, ${pago.value.nombre}<br>Total pagado: $${totalActual}`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
    }
  });
}

// ==============================
// CARGAR PRODUCTOS DINÁMICAMENTE
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();

  // Botones carrito
  const btnVaciar = document.getElementById("vaciar-carrito");
  if (btnVaciar) btnVaciar.addEventListener("click", vaciarCarrito);

  const btnAplicar = document.getElementById("aplicar-descuento");
  if (btnAplicar) btnAplicar.addEventListener("click", aplicarDescuento);

  const btnFinalizar = document.getElementById("finalizar-compra");
  if (btnFinalizar) btnFinalizar.addEventListener("click", finalizarCompra);

  // Contenedor principal
  const main = document.querySelector("#productos-container");
  if (!main) return;

  fetch("../productos.json")
    .then((res) => res.json())
    .then((productos) => {
      // Agrupar productos por categoría
      const categorias = {};
      productos.forEach((producto) => {
        if (!categorias[producto.categoria]) {
          categorias[producto.categoria] = [];
        }
        categorias[producto.categoria].push(producto);
      });

      // Crear secciones por categoría
      for (const categoria in categorias) {
        // Contenedor del título (para CSS)
        const contenedorTitulo = document.createElement("div");
        contenedorTitulo.className = "producto-titulo";

        const titulo = document.createElement("h2");
        titulo.textContent = categoria;
        titulo.classList.add("categoria"); // clase para estilos
        contenedorTitulo.appendChild(titulo);

        main.appendChild(contenedorTitulo);

        // Sección de tarjetas
        const section = document.createElement("section");
        section.className = "tarjetas-container";
        main.appendChild(section);

        categorias[categoria].forEach((producto) => {
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta producto";
          tarjeta.dataset.id = producto.id;
          tarjeta.dataset.nombre = producto.nombre;
          tarjeta.dataset.precio = producto.precio;

          tarjeta.innerHTML = `
            <div class="tarjeta-imagen">
              <img src="${producto.img}" alt="${producto.nombre}" />
            </div>
            <div class="tarjeta-contenido">
              <h3 class="tarjeta-titulo">${producto.nombre}</h3>
              <span class="tarjeta-precio">$${producto.precio}</span>
              <button class="tarjeta-boton agregar-carrito">Agregar al carrito</button>
            </div>
          `;
          section.appendChild(tarjeta);
        });

        // Evento agregar al carrito
        section.addEventListener("click", (e) => {
          if (e.target.classList.contains("agregar-carrito")) {
            const tarjeta = e.target.closest(".producto");
            const producto = {
              id: tarjeta.dataset.id,
              nombre: tarjeta.dataset.nombre,
              precio: parseInt(tarjeta.dataset.precio),
            };
            agregarAlCarrito(producto);
          }
        });
      }
    })
    .catch((error) => console.error("Error al cargar productos:", error));
});
