"use strict";

document.addEventListener("DOMContentLoaded", function() {
    var inputNombreJugador = document.getElementById("nombreJugador");
    var botonAceptarNombre = document.getElementById("aceptarNombre");
    var modal = document.getElementById("modalNombre");
    var tiempo = document.querySelector(".tiempo");
    var puntuacion = document.querySelector(".puntuacion");
    var casillas = document.querySelectorAll(".casilla-de-letra");
    var listaPalabrasEncontradas = document.querySelector(".palabras-encontradas");
    var palabraEnJuego = document.getElementById("palabraEnJuego");
    var botonIniciarJuego = document.getElementById("botonIniciar");
    var botonTerminarJuego = document.getElementById("botonTerminar");
    var seleccionTemporizador = document.getElementById("seleccionTemporizador");
    var modalFinJuego = document.getElementById("modalFinJuego");
    var botonReiniciarJuego = document.getElementById("reiniciarJuego");
    var botonCerrarModalFinJuego = document.getElementById("cerrarModalFinJuego");
    var botonVerResultados = document.getElementById("verResultados");
    var resultadosModal = document.getElementById("modalResultados");
    var botonCerrarResultados = document.getElementsByClassName("cerrar-resultados")[0];
    var listaResultadosGuardados = document.getElementById("resultadosGuardados");
    var enter = document.getElementById("botonEnter");
    var borrar = document.getElementById("botonBorrar");

    var palabraActual = "";
    var tiempoRestante;
    var puntuacionTotal = 0;
    var letrasSeleccionadas = [];
    var IntervaloTiempo;
    var letrasUsadas = [];
    var todasPalabras = [];
    var opcionTimer = 60;
    var juegoEnProgreso = false; // Flag para indicar si el juego está en curso
    var nombreJugador = "";

    enter.addEventListener("click", function() {
        finalizarPalabra();
    });
    borrar.addEventListener("click", function() {
        if (palabraActual.length > 0) {
            var ultimoIndex = letrasUsadas.pop();
            palabraActual = palabraActual.slice(0, -1);
            casillas[ultimoIndex].classList.remove("casilla-seleccionada", "ultima-casilla-seleccionada");
            if (letrasUsadas.length > 0) {
                var nuevoUltimoIndex = letrasUsadas[letrasUsadas.length - 1];
                casillas[nuevoUltimoIndex].classList.add("ultima-casilla-seleccionada");
            }
            palabraEnJuego.innerHTML = palabraActual;

            // Actualizar casillas seleccionables
            actualizarCasillasSeleccionables();
        }
    });

    botonAceptarNombre.addEventListener("click", function() {
        nombreJugador = inputNombreJugador.value;
        if (nombreJugador.length < 3) {
            document.getElementById('errorNombre').textContent = 'El nombre debe tener al menos 3 letras.';
            return;
        }
        modal.style.display = "none";
    });

    botonIniciarJuego.addEventListener("click", function() {
        empezarJuego();
    });

    botonTerminarJuego.addEventListener("click", function() {
        terminarJuego();
    });

    window.onclick = function(event) {
        if (event.target == modalFinJuego) {
            modalFinJuego.style.display = "none";
        } else if (event.target == resultadosModal) {
            resultadosModal.style.display = "none";
        }
    };

    botonReiniciarJuego.addEventListener("click", function() {
        modalFinJuego.style.display = "none";
        empezarJuego();
    });

    botonCerrarModalFinJuego.addEventListener("click", function() {
        modalFinJuego.style.display = "none";
        seleccionTemporizador.disabled = false;
        botonIniciarJuego.disabled = false;
    });

    botonVerResultados.addEventListener("click", function() {
        cargarResultados();
        resultadosModal.style.display = "flex";
    });

    botonCerrarResultados.addEventListener("click", function() {
        resultadosModal.style.display = "none";
    });

    function empezarJuego() {
        opcionTimer = parseInt(seleccionTemporizador.value);
        tiempoRestante = opcionTimer;
        puntuacionTotal = 0;
        palabraActual = "";
        letrasUsadas = [];
        todasPalabras = [];
        listaPalabrasEncontradas.innerHTML = "";
        puntuacion.textContent = puntuacionTotal;
        actualizarTiempo();
        IntervaloTiempo = setInterval(cuentaRegresiva, 1000);
        generarLetrasRandom();
        seleccionTemporizador.disabled = true; // Deshabilitar selección de tiempo
        botonIniciarJuego.disabled = true; // Deshabilitar botón de iniciar juego
        juegoEnProgreso = true; // Indicar que el juego está en curso
        reiniciarSeleccion(); // Resetear selección al iniciar el juego
    }

    function terminarJuego() {
        clearInterval(IntervaloTiempo);
        guardarResultados(); // Guardar resultadoado en LocalStorage
        modalFinJuego.style.display = "flex";
        juegoEnProgreso = false; // Indicar que el juego ha terminado
        seleccionTemporizador.disabled = false; // Habilitar selección de tiempo
        botonIniciarJuego.disabled = false; // Habilitar botón de iniciar juego
        reiniciarSeleccion(); // Resetear selección al finalizar el juego
    }

    function cuentaRegresiva() {
        tiempoRestante--;
        actualizarTiempo();
        if (tiempoRestante <= 10) {
            tiempo.style.color = "red";
        } else {
            tiempo.style.color = "white";
        }
        if (tiempoRestante <= 0) {
            terminarJuego();
        }
    }

    function actualizarTiempo() {
        var minutes = Math.floor(tiempoRestante / 60);
        var seconds = tiempoRestante % 60;
        tiempo.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    function generarLetrasRandom() {
        var letters = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIINNNNNNNNOOOOOOOOTTTTTTTTLLLLSSSSUUUUDDDRRRHHHGGGCCMMFFYYWWBBKKVVXXZZQJ";
        casillas.forEach(function(casilla) {
            var randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            casilla.textContent = randomLetter;
        });
    }

    function validarPalabra(palabra) {
        return fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + palabra)
            .then(response => response.json())
            .then(data => {
                return data.title !== "No Definitions Found";
            })
            .catch(() => false);
    }

    function actualizarPuntuacion(palabra) {
        var puntos;
        switch (palabra.length) {
            case 3:
                puntos = 1;
                break;
            case 4:
                puntos = 1;
                break;
            case 5:
                puntos = 2;
                break;
            case 6:
                puntos = 3;
                break;
            case 7:
                puntos = 5;
                break;
            default:
                puntos = 11;
        }
        puntuacionTotal += puntos;
        puntuacion.textContent = puntuacionTotal;
    }

    casillas.forEach(function(casilla, index) {
        casilla.addEventListener("click", function() {
            if (!juegoEnProgreso || letrasUsadas.includes(index) || !esAdyacente(index)) {
                return;
            }
            palabraActual += casilla.textContent;
            letrasUsadas.push(index);

            casilla.classList.add("casilla-seleccionada");
            if (letrasUsadas.length > 1) {
                var prevIndex = letrasUsadas[letrasUsadas.length - 2];
                casillas[prevIndex].classList.remove("ultima-casilla-seleccionada");
            }
            casilla.classList.add("ultima-casilla-seleccionada");

            palabraEnJuego.innerHTML = palabraActual;

            // Actualizar casillas seleccionables
            actualizarCasillasSeleccionables();
        });
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            finalizarPalabra();
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Backspace") {
            if (palabraActual.length > 0) {
                var ultimoIndex = letrasUsadas.pop();
                palabraActual = palabraActual.slice(0, -1);
                casillas[ultimoIndex].classList.remove("casilla-seleccionada", "ultima-casilla-seleccionada");
                if (letrasUsadas.length > 0) {
                    var nuevoUltimoIndex = letrasUsadas[letrasUsadas.length - 1];
                    casillas[nuevoUltimoIndex].classList.add("ultima-casilla-seleccionada");
                }
                palabraEnJuego.innerHTML = palabraActual;

                // Actualizar casillas seleccionables
                actualizarCasillasSeleccionables();
            }
        }
    });

    function esAdyacente(index) {
        if (letrasUsadas.length === 0) return true;
        var ultimoIndex = letrasUsadas[letrasUsadas.length - 1];
        var diff = Math.abs(ultimoIndex - index);
        return diff === 1 || diff === 4 || diff === 3 || diff === 5;
    }

    function finalizarPalabra() {
        if(tiempoRestante > 0) {
            if (palabraActual.length >= 3) {
                validarPalabra(palabraActual.toLowerCase()).then(isValid => {
                    if (isValid) {
                        if (!todasPalabras.includes(palabraActual)) {
                            todasPalabras.push(palabraActual);
                            var li = document.createElement("li");
                            li.textContent = palabraActual;
                            listaPalabrasEncontradas.appendChild(li);
                            actualizarPuntuacion(palabraActual);
                        } else {
                            puntuacionTotal--;
                            puntuacion.textContent = puntuacionTotal;
                        }
                    } else {
                        puntuacionTotal--;
                        puntuacion.textContent = puntuacionTotal;
                    }
                    reiniciarSeleccion();
                });
            } else {
                reiniciarSeleccion();
            }
        }
    }

    function reiniciarSeleccion() {
        palabraActual = "";
        letrasUsadas.forEach(function(index) {
            casillas[index].classList.remove("casilla-seleccionada", "ultima-casilla-seleccionada", "casilla-seleccionable");
        });
        letrasUsadas = [];
        palabraEnJuego.innerHTML = palabraActual;
        actualizarCasillasSeleccionables();
    }

    function actualizarCasillasSeleccionables() {
        casillas.forEach(function(casilla) {
            casilla.classList.remove("casilla-seleccionable");
        });

        if (letrasUsadas.length === 0) {
            casillas.forEach(function(casilla, index) {
                casilla.classList.add("casilla-seleccionable");
            });
        } else {
            var ultimoIndex = letrasUsadas[letrasUsadas.length - 1];
            var indicesAdyacentes = [
                ultimoIndex - 5, ultimoIndex - 4, ultimoIndex - 3,
                ultimoIndex - 1, /* ultimoIndex */ ultimoIndex + 1,
                ultimoIndex + 3, ultimoIndex + 4, ultimoIndex + 5
            ];

            indicesAdyacentes.forEach(function(index) {
                if (index >= 0 && index < 16 && !letrasUsadas.includes(index) && movimientoValido(ultimoIndex, index)) {
                    casillas[index].classList.add("casilla-seleccionable");
                }
            });
        }
    }

    function movimientoValido(fromIndex, toIndex) {
        var deFila = Math.floor(fromIndex / 4);
        var haciaFila = Math.floor(toIndex / 4);
        var deColumna = fromIndex % 4;
        var haciaColumna = toIndex % 4;

        var difFila = Math.abs(deFila - haciaFila);
        var difColumna = Math.abs(deColumna - haciaColumna);

        return difFila <= 1 && difColumna <= 1;
    }

    function guardarResultados() {
        var resultado = {
            nombre: nombreJugador,
            puntuacion: puntuacionTotal,
            fecha: new Date().toLocaleString(),
            tiempo: opcionTimer
        };

        var resultadosGuardados = JSON.parse(localStorage.getItem("resultadosJuego")) || [];
        resultadosGuardados.push(resultado);
        localStorage.setItem("resultadosJuego", JSON.stringify(resultadosGuardados));
    }

    function cargarResultados() {
        var resultadosGuardados = JSON.parse(localStorage.getItem("resultadosJuego")) || [];
        listaResultadosGuardados.innerHTML = "";
        
        // Ordenar los resultados por puntuación de mayor a menor
        resultadosGuardados.sort((a, b) => b.puntuacion - a.puntuacion);
        
        // Mostrar solo el top 10
        var topresultados = resultadosGuardados.slice(0, 10);
        
        topresultados.forEach(function(resultado) {
            var li = document.createElement("li");
            li.textContent = `Nombre: ${resultado.nombre}, Puntuación: ${resultado.puntuacion}, Fecha: ${resultado.fecha}, Tiempo: ${resultado.tiempo}`;
            listaResultadosGuardados.appendChild(li);
        });
    }
    
    

    // Cargar resultados al inicio
    cargarResultados();
});
