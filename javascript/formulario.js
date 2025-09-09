// Selección de formulario y mensaje
const formulario = document.getElementById('form-contacto');
const mensajeFormulario = document.getElementById('mensaje-formulario');

// Endpoint de Formspree
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mandvobo"; // reemplaza con tu endpoint real

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Recoger datos del formulario
  const formData = new FormData(formulario);

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (response.ok) {
      mensajeFormulario.textContent = "¡Mensaje enviado con éxito!";
      mensajeFormulario.style.color = "#28a745"; // verde
      formulario.reset(); // limpiar formulario
    } else {
      throw new Error("Error al enviar, por favor intenta nuevamente.");
    }
  } catch (error) {
    mensajeFormulario.textContent = error.message;
    mensajeFormulario.style.color = "#dc3545"; // rojo
  }
});
