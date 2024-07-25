"use strict";

document.addEventListener("DOMContentLoaded", function() {
    var playerNameInput = document.getElementById("playerName");
    var submitNameButton = document.getElementById("submitName");
    var modal = document.getElementById("nameModal");
    var tiempo = document.querySelector(".Tiempo");
    var puntuacion = document.querySelector(".Puntuacion");
    var casillas = document.querySelectorAll(".CasillaDeLetra");
    var palabrasEncontradasList = document.querySelector(".PalabrasEncontradas");
    var palabraEnJuego = document.getElementById("PalabraEnJuego");
    var iniciarJuego = document.getElementById("botonIniciar");
    var terminarJuego = document.getElementById("botonTerminar");
    var timerSelect = document.getElementById("timerSelect");
    var endGameModal = document.getElementById("endGameModal");
    var restartGameButton = document.getElementById("restartGame");
    var closeEndGameModalButton = document.getElementById("closeEndGameModal");
    var verResultadosButton = document.getElementById("verResultados");
    var resultadosModal = document.getElementById("resultadosModal");
    var closeResultadosModalButton = document.getElementsByClassName("closeResultados")[0];
    var resultadosGuardadosList = document.getElementById("resultadosGuardados");

    var palabraActual = "";
    var tiempoRestante;
    var puntuacionTotal = 0;
    var letrasSeleccionadas = [];
    var timerInterval;
    var usedLetters = [];
    var allWords = [];
    var timerOption = 60;
    var gameInProgress = false; // Flag para indicar si el juego está en curso
    var playerName = "";

    submitNameButton.addEventListener("click", function() {
        playerName = playerNameInput.value;
        if (playerName.length < 3) {
            document.getElementById('errorNombre').textContent = 'El nombre debe tener al menos 3 letras.';
            return;
        }
        modal.style.display = "none";
    });

    iniciarJuego.addEventListener("click", function() {
        startGame();
    });

    terminarJuego.addEventListener("click", function() {
        endGame();
    });

    window.onclick = function(event) {
        if (event.target == endGameModalmodal) {
            endGameModal.style.display = "none";
        } else if (event.target == resultadosModal) {
            resultadosModal.style.display = "none";
        }
    };

    restartGameButton.addEventListener("click", function() {
        endGameModal.style.display = "none";
        startGame();
    });

    closeEndGameModalButton.addEventListener("click", function() {
        endGameModal.style.display = "none";
        timerSelect.disabled = false;
        iniciarJuego.disabled = false;
    });

    verResultadosButton.addEventListener("click", function() {
        loadResults();
        resultadosModal.style.display = "flex";
    });

    closeResultadosModalButton.addEventListener("click", function() {
        resultadosModal.style.display = "none";
    });

    function startGame() {
        timerOption = parseInt(timerSelect.value);
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
        timerSelect.disabled = true; // Deshabilitar selección de tiempo
        iniciarJuego.disabled = true; // Deshabilitar botón de iniciar juego
        gameInProgress = true; // Indicar que el juego está en curso
        resetSelection(); // Resetear selección al iniciar el juego
    }

    function endGame() {
        clearInterval(timerInterval);
        saveResult(); // Guardar resultado en LocalStorage
        endGameModal.style.display = "flex";
        gameInProgress = false; // Indicar que el juego ha terminado
        timerSelect.disabled = false; // Habilitar selección de tiempo
        iniciarJuego.disabled = false; // Habilitar botón de iniciar juego
        resetSelection(); // Resetear selección al finalizar el juego
    }

    function countdown() {
        tiempoRestante--;
        updateTiempo();
        if (tiempoRestante <= 10) {
            tiempo.style.color = "red";
        } else {
            tiempo.style.color = "white";
        }
        if (tiempoRestante <= 0) {
            endGame();
        }
    }

    function updateTiempo() {
        var minutes = Math.floor(tiempoRestante / 60);
        var seconds = tiempoRestante % 60;
        tiempo.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
            if (!gameInProgress || usedLetters.includes(index) || !isAdjacent(index)) {
                return;
            }
            palabraActual += casilla.textContent;
            usedLetters.push(index);

            casilla.classList.add("CasillaSeleccionada");
            if (usedLetters.length > 1) {
                var prevIndex = usedLetters[usedLetters.length - 2];
                casillas[prevIndex].classList.remove("UltimaCasillaSeleccionada");
            }
            casilla.classList.add("UltimaCasillaSeleccionada");

            palabraEnJuego.innerHTML = palabraActual;

            // Actualizar casillas seleccionables
            updateSelectableCells();
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
                casillas[lastIndex].classList.remove("CasillaSeleccionada", "UltimaCasillaSeleccionada");
                if (usedLetters.length > 0) {
                    var newLastIndex = usedLetters[usedLetters.length - 1];
                    casillas[newLastIndex].classList.add("UltimaCasillaSeleccionada");
                }
                palabraEnJuego.innerHTML = palabraActual;

                // Actualizar casillas seleccionables
                updateSelectableCells();
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
        if(tiempoRestante > 0) {
            if (palabraActual.length >= 3) {
                validarPalabra(palabraActual.toLowerCase()).then(isValid => {
                    if (isValid) {
                        if (!allWords.includes(palabraActual)) {
                            allWords.push(palabraActual);
                            var li = document.createElement("li");
                            li.textContent = palabraActual;
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
                    resetSelection();
                });
            } else {
                resetSelection();
            }
        }
    }

    function resetSelection() {
        palabraActual = "";
        usedLetters.forEach(function(index) {
            casillas[index].classList.remove("CasillaSeleccionada", "UltimaCasillaSeleccionada", "CasillaSeleccionable");
        });
        usedLetters = [];
        palabraEnJuego.innerHTML = palabraActual;
        updateSelectableCells();
    }

    function updateSelectableCells() {
        casillas.forEach(function(casilla) {
            casilla.classList.remove("CasillaSeleccionable");
        });

        if (usedLetters.length === 0) {
            casillas.forEach(function(casilla, index) {
                casilla.classList.add("CasillaSeleccionable");
            });
        } else {
            var lastIndex = usedLetters[usedLetters.length - 1];
            var adjacentIndices = [
                lastIndex - 5, lastIndex - 4, lastIndex - 3,
                lastIndex - 1, /* lastIndex */ lastIndex + 1,
                lastIndex + 3, lastIndex + 4, lastIndex + 5
            ];

            adjacentIndices.forEach(function(index) {
                if (index >= 0 && index < 16 && !usedLetters.includes(index) && isValidMove(lastIndex, index)) {
                    casillas[index].classList.add("CasillaSeleccionable");
                }
            });
        }
    }

    function isValidMove(fromIndex, toIndex) {
        var fromRow = Math.floor(fromIndex / 4);
        var toRow = Math.floor(toIndex / 4);
        var fromCol = fromIndex % 4;
        var toCol = toIndex % 4;

        var rowDiff = Math.abs(fromRow - toRow);
        var colDiff = Math.abs(fromCol - toCol);

        return rowDiff <= 1 && colDiff <= 1;
    }

    function saveResult() {
        var result = {
            name: playerName,
            score: puntuacionTotal,
            date: new Date().toLocaleString(),
            time: timerOption
        };

        var savedResults = JSON.parse(localStorage.getItem("gameResults")) || [];
        savedResults.push(result);
        localStorage.setItem("gameResults", JSON.stringify(savedResults));
    }

    function loadResults() {
        var savedResults = JSON.parse(localStorage.getItem("gameResults")) || [];
        resultadosGuardadosList.innerHTML = "";
        
        // Ordenar los resultados por puntuación de mayor a menor
        savedResults.sort((a, b) => b.score - a.score);
        
        // Mostrar solo el top 10
        var topResults = savedResults.slice(0, 10);
        
        topResults.forEach(function(result) {
            var li = document.createElement("li");
            li.textContent = `Nombre: ${result.name}, Puntuación: ${result.score}, Fecha: ${result.date}, Tiempo: ${result.time}`;
            resultadosGuardadosList.appendChild(li);
        });
    }
    
    

    // Cargar resultados al inicio
    loadResults();
});
