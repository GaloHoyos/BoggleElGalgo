"use strict";

document.addEventListener("DOMContentLoaded", function() {
    var playerNameInput = document.getElementById("playerName");
    var submitNameButton = document.getElementById("submitName");
    var modal = document.getElementById("nameModal");
    var closeModal = document.getElementsByClassName("close")[0];
    var tiempo = document.querySelector(".Tiempo");
    var puntuacion = document.querySelector(".Puntuacion");
    var casillas = document.querySelectorAll(".CasillaDeLetra");
    var palabrasEncontradasList = document.querySelector(".PalabrasEncontradas");
    var palabraEnJuego = document.getElementById("PalabraEnJuego");
    var iniciarJuego = document.getElementById("botonIniciar");

    var palabraActual = "";
    var tiempoRestante;
    var puntuacionTotal = 0;
    var letrasSeleccionadas = [];
    var timerInterval;
    var usedLetters = [];
    var allWords = [];
    var timerOption = 60;

    submitNameButton.addEventListener("click", function() {
        var playerName = playerNameInput.value;
        if (playerName.length < 3) {
            alert("El nombre debe tener al menos 3 letras.");
            return;
        }
        modal.style.display = "none";
    });

    botonIniciar.addEventListener("click", function() {
        startGame();
    });

    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    function startGame() {
        tiempoRestante = timerOption;
        puntuacionTotal = 0;
        palabraActual = "";
        usedLetters = [];
        allWords = [];
        palabrasEncontradasList.innerHTML = "";
        puntuacion.textContent = puntuacionTotal;
        updateTiempo();
        timerInterval = setInterval(countdown, 1000);
        generateRandomLetters();
    }

    function countdown() {
        tiempoRestante--;
        updateTiempo();
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            alert("¡Tiempo terminado!");
        }
    }

    function updateTiempo() {
        var minutes = Math.floor(tiempoRestante / 60);
        var seconds = tiempoRestante % 60;
        tiempo.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function generateRandomLetters() {
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
            if (usedLetters.includes(index) || !isAdjacent(index)) {
                return;
            }
            console.log("clicked", casilla.textContent); // debug
            palabraActual += casilla.textContent;
            usedLetters.push(index);
            casilla.classList.add("CasillaSeleccionada");
            console.log("palabraActual", palabraActual); // debug
            palabraEnJuego.innerHTML = palabraActual;
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
                var lastIndex = usedLetters.pop();
                palabraActual = palabraActual.slice(0, -1);
                casillas[lastIndex].classList.remove("CasillaSeleccionada");
                palabraEnJuego.innerHTML = palabraActual;
            }
        }
    });

    function isAdjacent(index) {
        if (usedLetters.length === 0) return true;
        var lastIndex = usedLetters[usedLetters.length - 1];
        var diff = Math.abs(lastIndex - index);
        return diff === 1 || diff === 4 || diff === 3 || diff === 5;
    }

    function finalizarPalabra() {
        console.log("finalizarPalabra", palabraActual.toLowerCase()); // debug
        console.log("tiempoRestante", tiempoRestante); // debug
        if(tiempoRestante > 0) {
            if (palabraActual.length >= 3) {
                validarPalabra(palabraActual.toLowerCase()).then(isValid => {
                    if (isValid) {
                        if (!allWords.includes(palabraActual)) {
                            allWords.push(palabraActual);
                            var li = document.createElement("li");
                            li.textContent = palabraActual;
                            console.log("palabraActual", palabraActual); // debug
                            palabrasEncontradasList.appendChild(li);
                            actualizarPuntuacion(palabraActual);
                        } else {
                            puntuacionTotal--;
                            puntuacion.textContent = puntuacionTotal;
                        }
                    } else {
                        puntuacionTotal--;
                        puntuacion.textContent = puntuacionTotal;
                    }
                    palabraEnJuego.innerHTML = "";
                    palabraActual = ""; // Mover aquí
                    usedLetters = [];
                    casillas.forEach(casilla => casilla.classList.remove("CasillaSeleccionada"));
                });
            } else {
                puntuacionTotal--;
                puntuacion.textContent = puntuacionTotal;
                palabraActual = ""; // Mantener aquí para el caso else
                usedLetters = [];
                casillas.forEach(casilla => casilla.classList.remove("CasillaSeleccionada"));
            }
        }
    }
    
});
