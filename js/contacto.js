document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("formContacto").addEventListener("submit", function(event) {
        // Limpiar errores anteriores
        document.getElementById('errorNombre').textContent = '';
        document.getElementById('errorEmail').textContent = '';
        document.getElementById('errorMensaje').textContent = '';
        
        // Obtener los valores de los campos
        var nombre = document.getElementById('nombre').value;
        var email = document.getElementById('email').value;
        var mensaje = document.getElementById('mensaje').value;
        
        // Bandera para evitar el envío del formulario si hay errores
        var valid = true;
        
        // Validar el nombre
        if (nombre.trim() === '') {
            document.getElementById('errorNombre').textContent = 'El nombre es obligatorio.';
            valid = false;
        }
        
        // Validar el email
        if (email.trim() === '') {
            document.getElementById('errorEmail').textContent = 'El email es obligatorio.';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('errorEmail').textContent = 'El email no es válido.';
            valid = false;
        }
        
        // Validar el mensaje
        if (mensaje.trim() === '') {
            document.getElementById('errorMensaje').textContent = 'El mensaje es obligatorio.';
            valid = false;
        }
        
        // Si hay errores, prevenir el envío del formulario
        if (!valid) {
            event.preventDefault();
        } else {
            // Construye el mailto URL
            var mailtoLink = `mailto:${email}?subject=Contacto Boggle El Galgo&body=Nombre Completo: ${nombre}%0D%0AMensaje: ${mensaje}`;
            // Abre el cliente de correo predeterminado
            window.location.href = mailtoLink;
            event.preventDefault(); // Prevenir el envío del formulario después de redirigir a mailto
        }
    });
});
