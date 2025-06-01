document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Attempt to load all matriculas. This requires a GET /api/matriculas endpoint.
        // If not available, this initial load might fail or show nothing.
        await loadMatriculas();
    } catch (error) {
        console.error('Error on initial load of Matrículas page:', error);
        window.showNotification('Erro crítico ao carregar a página de matrículas.', 'error');
    }

    const btnNewMatricula = document.getElementById('btn-new-matricula');
    if (btnNewMatricula) {
        btnNewMatricula.addEventListener('click', () => showMatriculaForm());
    }

    const searchButton = document.getElementById('search-matriculas-button');
    const searchInput = document.getElementById('search-matriculas-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => loadMatriculas(searchInput.value.trim()));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadMatriculas(searchInput.value.trim());
            }
        });
    }
});

let allMatriculasCache = []; // Cache for client-side filtering

async function loadMatriculas(searchTerm = '') {
    const tbody = document.querySelector('#matriculas-table tbody');
    if (!tbody) {
        console.error('Matrículas table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="6">Carregando matrículas...</td></tr>';

    try {
        // IMPORTANT: Assumes window.getAllMatriculas() exists and calls GET /api/matriculas
        // If your backend doesn't have this endpoint, this will fail.
        if (allMatriculasCache.length === 0 && searchTerm === '') {
            if (typeof window.getAllMatriculas !== 'function') {
                tbody.innerHTML = '<tr><td colspan="6">Funcionalidade de listar todas as matrículas não implementada no backend (GET /api/matriculas).</td></tr>';
                console.warn('window.getAllMatriculas is not defined in api.js or backend endpoint GET /api/matriculas is missing.');
                return;
            }
            allMatriculasCache = await window.getAllMatriculas();
        }

        let matriculasToDisplay = allMatriculasCache;
        let alunoDetailsCache = {}; // Cache for aluno details
        let cursoDetailsCache = {}; // Cache for curso details

        // Populate caches if needed for display (can be slow if many unique alunos/cursos)
        for (const matricula of matriculasToDisplay) {
            if (matricula.aluno && matricula.aluno.id && !alunoDetailsCache[matricula.aluno.id]) {
                try {
                    alunoDetailsCache[matricula.aluno.id] = await window.getAlunoById(matricula.aluno.id);
                } catch (e) { console.warn(`Failed to fetch aluno ${matricula.aluno.id}`); }
            }
            if (matricula.curso && matricula.curso.id && !cursoDetailsCache[matricula.curso.id]) {
                try {
                    cursoDetailsCache[matricula.curso.id] = await window.getCursoById(matricula.curso.id);
                } catch (e) { console.warn(`Failed to fetch curso ${matricula.curso.id}`); }
            }
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            matriculasToDisplay = allMatriculasCache.filter(matricula => {
                const aluno = matricula.aluno && matricula.aluno.id ? alunoDetailsCache[matricula.aluno.id] : null;
                const curso = matricula.curso && matricula.curso.id ? cursoDetailsCache[matricula.curso.id] : null;
                const alunoNome = aluno ? aluno.nome.toLowerCase() : '';
                const cursoTitulo = curso ? curso.titulo.toLowerCase() : '';
                return alunoNome.includes(lowerSearchTerm) || cursoTitulo.includes(lowerSearchTerm);
            });
        }

        tbody.innerHTML = ''; // Clear loading message

        if (!matriculasToDisplay || matriculasToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${searchTerm ? 'Nenhuma matrícula encontrada com o termo "' + searchTerm + '".' : 'Nenhuma matrícula encontrada.'}</td></tr>`;
            return;
        }

        matriculasToDisplay.forEach(matricula => {
            // Matricula.java: id, aluno, curso, dataMatricula, ativo
            const aluno = matricula.aluno && matricula.aluno.id ? alunoDetailsCache[matricula.aluno.id] : null;
            const curso = matricula.curso && matricula.curso.id ? cursoDetailsCache[matricula.curso.id] : null;

            const alunoNome = aluno ? aluno.nome : (matricula.aluno ? `ID: ${matricula.aluno.id}` : 'N/A');
            const cursoTitulo = curso ? curso.titulo : (matricula.curso ? `ID: ${matricula.curso.id}` : 'N/A');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${matricula.id}</td>
                <td>${alunoNome}</td>
                <td>${cursoTitulo}</td>
                <td>${matricula.dataMatricula ? window.formatDate(matricula.dataMatricula) : 'N/A'}</td>
                <td>${matricula.ativo ? 'Ativa' : 'Inativa'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary edit-matricula" data-id="${matricula.id}" title="Editar Matrícula">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-matricula" data-id="${matricula.id}" title="Excluir Matrícula">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachMatriculaActionListeners();
    } catch (error) {
        console.error('Error loading matrículas:', error);
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar matrículas. Verifique o console.</td></tr>';
        window.showNotification('Erro ao carregar lista de matrículas.', 'error');
        allMatriculasCache = [];
    }
}

function attachMatriculaActionListeners() {
    document.querySelectorAll('.edit-matricula').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showMatriculaForm(id);
        });
    });

    document.querySelectorAll('.delete-matricula').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('matrícula', id, async () => {
                await window.deleteMatricula(id); // from api.js
                allMatriculasCache = []; // Invalidate cache
                await loadMatriculas(); // Refresh list
            });
        });
    });
}

async function showMatriculaForm(id = null) {
    // Matricula.java: id, aluno, curso, dataMatricula, ativo
    let matricula = { id: '', alunoId: '', cursoId: '', dataMatricula: new Date().toISOString().split('T')[0], ativo: true };
    let formTitle = 'Nova Matrícula';
    let isEditMode = id !== null;

    let allAlunos = [];
    let allCursos = [];

    try {
        allAlunos = await window.getAllAlunos();
        allCursos = await window.getAllCursos();
    } catch (error) {
        window.showNotification('Erro ao carregar alunos ou cursos para o formulário.', 'error');
        return; // Can't proceed without alunos and cursos
    }

    if (isEditMode) {
        formTitle = 'Editar Matrícula';
        try {
            const fetchedMatricula = await window.getMatriculaById(id);
            matricula = {
                ...fetchedMatricula,
                alunoId: fetchedMatricula.aluno ? fetchedMatricula.aluno.id : '',
                cursoId: fetchedMatricula.curso ? fetchedMatricula.curso.id : '',
                dataMatricula: fetchedMatricula.dataMatricula ? new Date(fetchedMatricula.dataMatricula).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };
        } catch (error) {
            window.showNotification('Erro ao carregar dados da matrícula para edição.', 'error');
            return;
        }
    }

    const alunoOptions = allAlunos.map(al => ({ value: al.id, text: `${al.nome} (CPF: ${al.cpf || 'N/A'})` }));
    const cursoOptions = allCursos.map(cur => ({ value: cur.id, text: `${cur.titulo} (ID: ${cur.id})` }));

    const formFields = [
        { name: 'alunoId', label: 'Aluno', type: 'select', options: alunoOptions, value: matricula.alunoId, required: true },
        { name: 'cursoId', label: 'Curso', type: 'select', options: cursoOptions, value: matricula.cursoId, required: true },
        { name: 'dataMatricula', label: 'Data da Matrícula', type: 'date', value: matricula.dataMatricula, required: true },
        { name: 'ativo', label: 'Matrícula Ativa', type: 'checkbox', checked: matricula.ativo } // Using checkbox for boolean
    ];

    // Manual form HTML generation for better control of select and checkbox
    let formHtml = `<form id="matricula-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${matricula.id}">`;
    }

    formFields.forEach(field => {
        formHtml += `<div class="form-group">`;
        formHtml += `<label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;
        if (field.type === 'select') {
            formHtml += `<select id="${field.name}" name="${field.name}" class="form-control" ${field.required ? 'required' : ''}>`;
            formHtml += `<option value="">-- Selecione --</option>`;
            field.options.forEach(opt => {
                formHtml += `<option value="${opt.value}" ${opt.value == field.value ? 'selected' : ''}>${opt.text}</option>`;
            });
            formHtml += `</select>`;
        } else if (field.type === 'checkbox') {
            formHtml += `<input type="checkbox" id="${field.name}" name="${field.name}" class="form-check-input" ${field.checked ? 'checked' : ''}>`;
        } else {
            formHtml += `<input type="${field.type || 'text'}"
                           id="${field.name}"
                           name="${field.name}"
                           value="${field.value || ''}"
                           ${field.required ? 'required' : ''}>`;
        }
        formHtml += `</div>`;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Matrícula</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#matricula-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            // const data = Object.fromEntries(formData.entries()); // FormData doesn't include unchecked checkboxes by default

            const data = {};
            formData.forEach((value, key) => data[key] = value);
            // Handle checkbox: if 'ativo' is not in formData, it means it was unchecked (false)
            data.ativo = dynamicForm.querySelector('[name="ativo"]').checked;


            // Prepare payload for backend: it expects 'aluno' and 'curso' as objects with 'id'
            const payload = {
                dataMatricula: data.dataMatricula,
                ativo: data.ativo,
                aluno: { id: parseInt(data.alunoId, 10) },
                curso: { id: parseInt(data.cursoId, 10) }
            };
            if (isEditMode) {
                payload.id = matricula.id;
            }


            try {
                if (isEditMode) {
                    await window.updateMatricula(id, payload); // from api.js
                } else {
                    await window.createMatricula(payload); // from api.js
                }
                window.showNotification(`Matrícula ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';
                allMatriculasCache = []; // Invalidate cache
                await loadMatriculas();
            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} matrícula:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} matrícula.`, 'error');
            }
        });
    }
}
