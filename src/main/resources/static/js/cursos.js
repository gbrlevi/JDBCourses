// Adicione no topo do arquivo, fora de qualquer função:
let allCursosCache = [];
// Caches para sub-detalhes, se necessário para a pesquisa ou para evitar re-fetch
let cursoDetailsInstrutoresCache = {};
let cursoDetailsModulosCache = {};
let cursoDetailsMatriculasCache = {};


document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadCursos();
    } catch (error) {
        console.error('Error on initial load of Cursos page:', error);
        window.showNotification('Erro crítico ao carregar a página de cursos.', 'error');
    }

    const btnNewCurso = document.getElementById('btn-new-curso');
    if (btnNewCurso) {
        btnNewCurso.addEventListener('click', () => showCursoForm());
    }

    const btnCloseDetails = document.getElementById('btn-close-details');
    if (btnCloseDetails) {
        btnCloseDetails.addEventListener('click', () => {
            const detailsPanel = document.getElementById('curso-details');
            if (detailsPanel) detailsPanel.style.display = 'none';
        });
    }

    // Adicionar listeners para a barra de pesquisa de cursos
    const searchCursosInput = document.getElementById('search-cursos-input');
    const searchCursosButton = document.getElementById('search-cursos-button');

    if (searchCursosButton && searchCursosInput) {
        searchCursosButton.addEventListener('click', () => {
            loadCursos(searchCursosInput.value.trim());
        });
        searchCursosInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadCursos(searchCursosInput.value.trim());
            }
        });
    }
});

async function loadCursos(searchTerm = '') { // Modificado para aceitar searchTerm
    const tbody = document.querySelector('#cursos-table tbody');
    if (!tbody) {
        console.error('Cursos table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="4">Carregando cursos...</td></tr>';

    try {
        if (allCursosCache.length === 0 && searchTerm === '') {
            allCursosCache = await window.getAllCursos();
        }

        let cursosToDisplay = allCursosCache;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            cursosToDisplay = allCursosCache.filter(curso =>
                    (curso.titulo && curso.titulo.toLowerCase().includes(lowerSearchTerm))
                // Você pode adicionar mais campos para pesquisa se desejar, ex: curso.status
            );
        }

        tbody.innerHTML = ''; // Limpar

        if (!cursosToDisplay || cursosToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">${searchTerm ? 'Nenhum curso encontrado com o termo "' + searchTerm + '".' : 'Nenhum curso encontrado.'}</td></tr>`;
            return;
        }

        cursosToDisplay.forEach(curso => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${curso.id}</td>
                <td>${curso.titulo || 'N/A'}</td>
                <td>CH: ${curso.cargaHoraria || 'N/A'}h - Status: ${curso.status || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary view-curso" data-id="${curso.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary edit-curso" data-id="${curso.id}" title="Editar Curso">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-curso" data-id="${curso.id}" title="Excluir Curso">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachCursoActionListeners(); // Re-anexa listeners
    } catch (error) {
        console.error('Error loading cursos:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar cursos.</td></tr>';
        window.showNotification('Erro ao carregar lista de cursos.', 'error');
        if (searchTerm === '') allCursosCache = [];
    }
}

function attachCursoActionListeners() {
    document.querySelectorAll('.view-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showCursoDetails(id);
        });
    });

    document.querySelectorAll('.edit-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showCursoForm(id);
        });
    });

    document.querySelectorAll('.delete-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('curso', id, async () => { // confirmDelete from utils.js
                await window.deleteCurso(id); // deleteCurso from api.js
                allCursosCache = []; // CORREÇÃO: Invalida o cache
                await loadCursos(); // Recarrega a lista do zero
            });
        });
    });
}

async function showCursoDetails(cursoId) {
    const detailsPanel = document.getElementById('curso-details');
    const cursoInfoDiv = document.getElementById('curso-info');

    if (!detailsPanel || !cursoInfoDiv) {
        console.error('Curso details elements not found!');
        return;
    }

    try {
        const curso = await window.getCursoById(cursoId); // from api.js
        if (!curso) {
            window.showNotification('Curso não encontrado.', 'error');
            return;
        }

        // Curso.java fields: id, titulo, cargaHoraria, status
        cursoInfoDiv.innerHTML = `
            <div class="form-group"><label>ID:</label><p>${curso.id}</p></div>
            <div class="form-group"><label>Título:</label><p>${curso.titulo || 'N/A'}</p></div>
            <div class="form-group"><label>Carga Horária:</label><p>${curso.cargaHoraria !== null ? curso.cargaHoraria + ' horas' : 'N/A'}</p></div>
            <div class="form-group"><label>Status:</label><p>${curso.status || 'N/A'}</p></div>
        `;

        detailsPanel.style.display = 'block';

        // Setup "Add Instrutor" button
        const btnAddInstrutor = document.getElementById('btn-add-instrutor');
        if (btnAddInstrutor) {
            btnAddInstrutor.setAttribute('data-curso-id', cursoId);
            const newBtnAddInstrutor = btnAddInstrutor.cloneNode(true);
            btnAddInstrutor.parentNode.replaceChild(newBtnAddInstrutor, btnAddInstrutor);
            newBtnAddInstrutor.addEventListener('click', () => showAddInstrutorToCursoForm(cursoId));
        }

        // Setup "Add Modulo" button
        const btnAddModulo = document.getElementById('btn-add-modulo');
        if (btnAddModulo) {
            btnAddModulo.setAttribute('data-curso-id', cursoId);
            const newBtnAddModulo = btnAddModulo.cloneNode(true);
            btnAddModulo.parentNode.replaceChild(newBtnAddModulo, btnAddModulo);
            newBtnAddModulo.addEventListener('click', () => showAddModuloToCursoForm(cursoId));
        }

        // Load related data
        await loadInstrutoresByCurso(cursoId);
        await loadModulosByCurso(cursoId);
        await loadMatriculasByCurso(cursoId);

    } catch (error) {
        console.error(`Error showing curso details for ID ${cursoId}:`, error);
        window.showNotification('Erro ao carregar detalhes do curso.', 'error');
        detailsPanel.style.display = 'none';
    }
}

async function loadInstrutoresByCurso(cursoId) {
    const tbody = document.querySelector('#instrutores-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Carregando instrutores...</td></tr>';

    try {
        const instrutorIds = await window.getInstrutoresByCursoId(cursoId); // from api.js

        tbody.innerHTML = '';
        if (!instrutorIds || instrutorIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum instrutor vinculado a este curso.</td></tr>';
            return;
        }

        for (const instrutorId of instrutorIds) {
            try {
                const instrutor = await window.getInstrutorById(instrutorId); // from api.js
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${instrutor.id}</td>
                    <td>${instrutor.nome || 'N/A'}</td>
                    <td>${instrutor.cpf || 'N/A'}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-danger remove-instrutor-from-curso" data-curso-id="${cursoId}" data-instrutor-id="${instrutor.id}" title="Remover Instrutor do Curso">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            } catch (fetchError) {
                console.warn(`Could not fetch details for instrutor ID ${instrutorId}:`, fetchError);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="4">Erro ao carregar instrutor ID ${instrutorId}.</td>`;
                tbody.appendChild(tr);
            }
        }
        attachInstrutorCursoActionListeners(cursoId);
    } catch (error) {
        console.error('Error loading instrutores for curso:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar instrutores.</td></tr>';
    }
}

function attachInstrutorCursoActionListeners(currentCursoId) {
    document.querySelectorAll('.remove-instrutor-from-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', async function() {
            const cursoId = this.getAttribute('data-curso-id');
            const instrutorId = this.getAttribute('data-instrutor-id');
            window.confirmDelete(`vínculo do instrutor ID ${instrutorId} com este curso`, null, async () => {
                await window.removerVinculoInstrutorCurso(cursoId, instrutorId); // from api.js
                window.showNotification('Vínculo com instrutor removido.', 'success');
                await loadInstrutoresByCurso(cursoId); // Refresh instrutores list
            }, "Remover Vínculo");
        });
    });
}


async function loadModulosByCurso(cursoId) {
    const tbody = document.querySelector('#modulos-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Carregando módulos...</td></tr>';

    try {
        const moduloIds = await window.getModulosByCursoId(cursoId); // from api.js

        tbody.innerHTML = '';
        if (!moduloIds || moduloIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhum módulo vinculado a este curso.</td></tr>';
            return;
        }

        for (const moduloId of moduloIds) {
            try {
                const modulo = await window.getModuloById(moduloId); // from api.js
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${modulo.id}</td>
                    <td>${modulo.conteudo || 'N/A'}</td>
                    <td>CH: ${modulo.cargaHoraria || 0}h, Aulas: ${modulo.qtdAulas || 0}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-danger remove-modulo-from-curso" data-curso-id="${cursoId}" data-modulo-id="${modulo.id}" title="Remover Módulo do Curso">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            } catch (fetchError) {
                console.warn(`Could not fetch details for modulo ID ${moduloId}:`, fetchError);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="4">Erro ao carregar módulo ID ${moduloId}.</td>`;
                tbody.appendChild(tr);
            }
        }
        attachModuloCursoActionListeners(cursoId);
    } catch (error) {
        console.error('Error loading modulos for curso:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar módulos.</td></tr>';
    }
}

function attachModuloCursoActionListeners(currentCursoId) {
    document.querySelectorAll('.remove-modulo-from-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', async function() {
            const cursoId = this.getAttribute('data-curso-id');
            const moduloId = this.getAttribute('data-modulo-id');
            window.confirmDelete(`vínculo do módulo ID ${moduloId} com este curso`, null, async () => {
                await window.removerVinculoModuloCurso(cursoId, moduloId); // from api.js
                window.showNotification('Vínculo com módulo removido.', 'success');
                await loadModulosByCurso(cursoId); // Refresh
            }, "Remover Vínculo");
        });
    });
}

async function loadMatriculasByCurso(cursoId) {
    const tbody = document.querySelector('#matriculas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Carregando matrículas...</td></tr>';

    try {
        const matriculas = await window.getMatriculasByCursoId(cursoId); // from api.js
        tbody.innerHTML = '';

        if (!matriculas || matriculas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Nenhuma matrícula encontrada para este curso.</td></tr>';
            return;
        }

        for (const matricula of matriculas) {
            let alunoNome = 'Carregando...';
            if (matricula.aluno && matricula.aluno.id) {
                try {
                    const aluno = await window.getAlunoById(matricula.aluno.id); // from api.js
                    alunoNome = aluno.nome || 'Nome Indisponível';
                } catch (e) {
                    alunoNome = `Erro (ID: ${matricula.aluno.id})`;
                }
            } else {
                alunoNome = 'Aluno Desconhecido';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${matricula.id}</td>
                <td>${alunoNome}</td>
                <td>${matricula.dataMatricula ? window.formatDate(matricula.dataMatricula) : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-matricula-from-curso" data-matricula-id="${matricula.id}" data-curso-id="${cursoId}" title="Excluir Matrícula">
                        <i class="fas fa-user-times"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        attachMatriculaCursoActionListeners(cursoId);
    } catch (error) {
        console.error('Error loading matriculas for curso:', error);
        tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar matrículas.</td></tr>';
    }
}

function attachMatriculaCursoActionListeners(currentCursoId) {
    document.querySelectorAll('.delete-matricula-from-curso').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function() {
            const matriculaId = this.getAttribute('data-matricula-id');
            const cursoId = this.getAttribute('data-curso-id'); // To refresh the correct list
            window.confirmDelete('matrícula', matriculaId, async () => {
                await window.deleteMatricula(matriculaId); // from api.js
                await loadMatriculasByCurso(cursoId); // Refresh
            });
        });
    });
}


async function showCursoForm(id = null) {
    let curso = { titulo: '', cargaHoraria: '', status: '' }; // Matches Curso.java
    let formTitle = 'Novo Curso';
    let isEditMode = id !== null;

    if (isEditMode) {
        formTitle = 'Editar Curso';
        try {
            curso = await window.getCursoById(id);
        } catch (error) {
            window.showNotification('Erro ao carregar dados do curso para edição.', 'error');
            return;
        }
    }

    const formFields = [
        { name: 'titulo', label: 'Título do Curso', type: 'text', value: curso.titulo, required: true },
        { name: 'cargaHoraria', label: 'Carga Horária (horas)', type: 'number', value: curso.cargaHoraria, required: true, attributes: { min: "1" } },
        { name: 'status', label: 'Status', type: 'text', value: curso.status, required: true, placeholder: "Ex: Ativo, Em Breve, Inativo" }
    ];

    let formHtml = `<form id="curso-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${curso.id}">`;
    }
    formFields.forEach(field => {
        formHtml += `
            <div class="form-group">
                <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type || 'text'}"
                       id="${field.name}"
                       name="${field.name}"
                       value="${field.value || ''}"
                       ${field.required ? 'required' : ''}
                       ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                       ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>
            </div>
        `;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Curso</button></div></form>`;

    window.openModal(formTitle, formHtml); // openModal from utils.js

    const dynamicForm = document.querySelector('#curso-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.cargaHoraria) {
                data.cargaHoraria = parseInt(data.cargaHoraria, 10);
            }

            try {
                if (isEditMode) {
                    await window.updateCurso(id, data);
                } else {
                    await window.createCurso(data);
                }
                window.showNotification(`Curso ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';

                allCursosCache = []; // CORREÇÃO: Invalida o cache
                await loadCursos(); // Recarrega a lista do zero

            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} curso:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} curso.`, 'error');
            }
        });
    }
}

async function showAddInstrutorToCursoForm(cursoId) {
    try {
        const allInstrutores = await window.getAllInstrutores(); // from api.js
        const cursoInstrutorIds = await window.getInstrutoresByCursoId(cursoId); // Get IDs already linked

        const availableInstrutores = allInstrutores.filter(instrutor => !cursoInstrutorIds.includes(instrutor.id));

        if (availableInstrutores.length === 0) {
            window.showNotification('Não há novos instrutores disponíveis para adicionar ou todos já estão vinculados.', 'warning');
            return;
        }

        const options = availableInstrutores.map(instrutor => ({
            value: instrutor.id,
            text: `${instrutor.nome} (CPF: ${instrutor.cpf || 'N/A'})`
        }));

        const fields = [
            { name: 'instrutorId', label: 'Selecione o Instrutor', type: 'select', options, required: true }
        ];

        let formHtml = `<form id="add-instrutor-to-curso-form" class="entity-form">`;
        fields.forEach(field => {
            formHtml += `<div class="form-group"><label for="${field.name}">${field.label}</label><select id="${field.name}" name="${field.name}" class="form-control" required>`;
            field.options.forEach(opt => {
                formHtml += `<option value="${opt.value}">${opt.text}</option>`;
            });
            formHtml += `</select></div>`;
        });
        formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">Vincular Instrutor</button></div></form>`;

        window.openModal('Adicionar Instrutor ao Curso', formHtml);

        const dynamicForm = document.querySelector('#add-instrutor-to-curso-form');
        if (dynamicForm) {
            dynamicForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const instrutorId = formData.get('instrutorId');
                try {
                    await window.vincularInstrutorCurso(cursoId, instrutorId);
                    window.showNotification('Instrutor vinculado ao curso com sucesso!', 'success');
                    document.getElementById('modal').style.display = 'none';
                    await loadInstrutoresByCurso(cursoId);
                } catch (error) {
                    window.showNotification(error.message || 'Erro ao vincular instrutor.', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error preparing add instrutor form:', error);
        window.showNotification('Erro ao carregar instrutores disponíveis.', 'error');
    }
}


async function showAddModuloToCursoForm(cursoId) {
    try {
        const allModulos = await window.getAllModulos(); // from api.js
        const cursoModuloIds = await window.getModulosByCursoId(cursoId);

        const availableModulos = allModulos.filter(modulo => !cursoModuloIds.includes(modulo.id));

        if (availableModulos.length === 0) {
            window.showNotification('Não há novos módulos disponíveis ou todos já estão vinculados.', 'warning');
            return;
        }

        const options = availableModulos.map(modulo => ({
            value: modulo.id,
            text: `${modulo.conteudo} (CH: ${modulo.cargaHoraria || 0}h)`
        }));

        const fields = [
            { name: 'moduloId', label: 'Selecione o Módulo', type: 'select', options, required: true }
        ];

        let formHtml = `<form id="add-modulo-to-curso-form" class="entity-form">`;
        fields.forEach(field => {
            formHtml += `<div class="form-group"><label for="${field.name}">${field.label}</label><select id="${field.name}" name="${field.name}" class="form-control" required>`;
            field.options.forEach(opt => {
                formHtml += `<option value="${opt.value}">${opt.text}</option>`;
            });
            formHtml += `</select></div>`;
        });
        formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">Vincular Módulo</button></div></form>`;


        window.openModal('Adicionar Módulo ao Curso', formHtml);

        const dynamicForm = document.querySelector('#add-modulo-to-curso-form');
        if (dynamicForm) {
            dynamicForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const moduloId = formData.get('moduloId');
                try {
                    await window.vincularModuloCurso(cursoId, moduloId);
                    window.showNotification('Módulo vinculado ao curso com sucesso!', 'success');
                    document.getElementById('modal').style.display = 'none';
                    await loadModulosByCurso(cursoId);
                } catch (error) {
                    window.showNotification(error.message || 'Erro ao vincular módulo.', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error preparing add modulo form:', error);
        window.showNotification('Erro ao carregar módulos disponíveis.', 'error');
    }
}
