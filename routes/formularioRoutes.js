<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modificar Formulario</title>
    <link rel="stylesheet" href="/navbar.css">
    <link rel="stylesheet" href="/newForm.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.13/jspdf.plugin.autotable.min.js"></script>
    <link rel="icon" type="image/png" href="https://ugc.production.linktr.ee/mj5IciCyRk2puUukygYa_kmwAn8AE84X4N3S5?io=true&size=avatar-v3_0">
    <style>
        .percentage-input {
            width: auto;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
            text-align: center;
        }
        .notification-icon,
        .user-photo {
            position: absolute;
            right: 55px;
            top: 60px;
        }
    </style>
</head>
<body>
    <nav id="NavNF"> <%- include('../partials/navbar') %> </nav>

    <div class="container">
        <div class="maincontent">
            <header class="notification-icon user-photo">
                <%- include('../partials/headerU') %>
            </header> 

            <div class="modify-form-section">
                <h2>Crear Formulario</h2>
                <div class="right-panel">
                    <div class="modify-buttons">
                        <button type="button" class="btn-download" id="download-pdf-btn">
                            <i class="fas fa-file-download"></i> PDF
                        </button>
                        <a href="/formularios" class="btn-cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </a>          
                    </div>
                </div>
            </div>

            <div class="form-editor">
                <h3>Editor de Preguntas</h3>
                <form id="form-modification" method="POST" action="/formularios/save-form">
                    <div class="alineado3">
                        <label for="titulo">Título del Formulario:</label>
                        <input type="text" id="form-title" name="form-title" value="Autoevaluación" required>
                        
                        <label for="pruebas-options">Tipo de formulario...</label>
                        <select class="opcion1" id="form-type" name="form-type" required>
                            <option value="evaluacion">Evaluacion</option>
                            <option value="autoevaluacion">Autoevaluacion</option>
                        </select>
                    </div>
            
                    <div class="lol">
                        <!-- Contenedor de preguntas adicionales -->
                        <div id="additional-questions"></div>
                    </div>
                    <div class="boton-guardar">
                        <button type="submit" class="btn-save" id="save-form-btn">
                            <i class="fas fa-save"></i> Guardar 
                        </button>
                        <button type="button" class="btn-add" id="add-question-btn">
                            <i class="fas fa-plus"></i> Añadir Pregunta
                        </button>
                    </div>
                </form>
            </div>

            <div class="preview-section">
                <h3>Vista Previa del Formulario</h3>
                <iframe id="preview-frame" src="" width="100%" height="400" frameborder="0" style="display: none;"></iframe>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let questionCount = 1;

            const addQuestionBtn = document.getElementById('add-question-btn');
            const additionalQuestions = document.getElementById('additional-questions');

            // Evento de botón para añadir preguntas
            addQuestionBtn.addEventListener('click', () => {
                const questionNumber = questionCount++;
                const newQuestion = `
                <div class="form-group question-container" id="question-group-${questionNumber}">
                    <div class="alineados2">
                        <label for="question${questionNumber}">Pregunta ${questionNumber}:</label>
                        <input type="text" id="question${questionNumber}" name="question${questionNumber}" placeholder="Escribe tu pregunta aquí" required>
                        <label for="type${questionNumber}">Tipo de Pregunta:</label>
                        <select name="type${questionNumber}" id="type${questionNumber}" onchange="toggleOptions(${questionNumber})">
                            <option value="texto">Texto</option>
                            <option value="multiple">Opción Múltiple</option>
                            <option value="checkbox">Checkbox</option>
                        </select>
                        <button type="button" class="btn-delete" onclick="deleteQuestion(${questionNumber})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>

                    <label for="description${questionNumber}">Descripción:</label>
                    <textarea id="description${questionNumber}" name="description${questionNumber}" placeholder="Descripción ..."></textarea>

                    <div class="alineados">
                        <label for="percentage${questionNumber}">Porcentaje:</label>
                        <input type="number" class="percentage-input" id="percentage${questionNumber}" name="percentage${questionNumber}" min="0" max="100" required oninput="updateColor(${questionNumber}), maxPorcentage(${questionNumber})">
                    </div>

                    <div class="options-group" id="options${questionNumber}" style="display: none;">
                        <div id="options-container-${questionNumber}">
                            <div class="option-item">
                                <label>Opción 1:</label>
                                <input type="text" name="option${questionNumber}_1" placeholder="Escribe una opción" required>
                                <label>Puntuación:</label>
                                <input type="number" name="option${questionNumber}_1_score" placeholder="Puntuación" min="0" step="1" required>
                            </div>
                        </div>
                        <button type="button" class="btn-add-option" onclick="addOption(${questionNumber})">
                            <i class="fas fa-plus"></i> Añadir Opción
                        </button>
                    </div>
                </div>
                `;
                additionalQuestions.insertAdjacentHTML('beforeend', newQuestion);
            });

            function addOption(questionNumber) {
                const optionsContainer = document.getElementById(`options-container-${questionNumber}`);
                const optionCount = optionsContainer.querySelectorAll('.option-item').length + 1;
                const newOption = `
                    <div class="option-item">
                        <label>Opción ${optionCount}:</label>
                        <input type="text" name="option${questionNumber}_${optionCount}" placeholder="Escribe una opción" required>
                        <label>Puntuación:</label>
                        <input type="number" name="option${questionNumber}_${optionCount}_score" placeholder="Puntuación" min="0" step="1" required>
                        <button type="button" class="btn-delete-option" onclick="deleteOption(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                optionsContainer.insertAdjacentHTML('beforeend', newOption);
            }

            function deleteQuestion(questionNumber) {
                document.getElementById(`question-group-${questionNumber}`).remove();
            }

            function deleteOption(optionElement) {
                optionElement.parentElement.remove();
            }

            function toggleOptions(questionNumber) {
                const typeSelect = document.getElementById(`type${questionNumber}`);
                const optionsGroup = document.getElementById(`options${questionNumber}`);
                optionsGroup.style.display = (typeSelect.value === 'multiple' || typeSelect.value === 'checkbox') ? 'block' : 'none';

                // Adjust the required attribute
                const optionInputs = optionsGroup.querySelectorAll('input[type="text"], input[type="number"]');
                optionInputs.forEach(input => {
                    if (optionsGroup.style.display === 'block') {
                        input.setAttribute('required', 'required');
                    } else {
                        input.removeAttribute('required');
                    }
                });
            }

            // Form submission: Remove required attribute from hidden options
            document.getElementById('form-modification').addEventListener('submit', function(event) {
                const optionGroups = document.querySelectorAll('.options-group');
                optionGroups.forEach(group => {
                    if (group.style.display === 'none') {
                        const inputs = group.querySelectorAll('input');
                        inputs.forEach(input => input.removeAttribute('required'));
                    }
                });
            });
        });
    </script>
</body>
</html>
