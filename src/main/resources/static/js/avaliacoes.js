document.addEventListener('DOMContentLoaded', async function() {
    try {
        // This assumes GET /api/avaliacoes endpoint exists for listing all evaluations
        await loadAvaliacoes();
    } catch (error) {
        console.error('Error on initial load of Avaliações page:', error);
        window.showNotification('Erro crítico ao carregar a página de avaliações.', 'error');
    }

    const btnNewAvaliacao = document.getElementById('btn-new-avaliacao');
    if (btnNewAvaliacao) {
        btnNewAvaliacao.addEventListener('click', () => showAvaliacaoForm()); // No ID means new
    }

    const searchButton = document.getElementById('search-avaliacoes-button');
    const searchInput = document.getElementById('search-avaliacoes-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => loadAvaliacoes(searchInput.value.trim()));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadAvaliacoes(searchInput.value.trim());
            }
        });
    }
});

let allAvaliacoesCache = []; // Cache for client-side filtering
let alunoDetailsCache = {}; // Cache for aluno details
let cursoDetailsCache = {}; // Cache for curso details


async function loadAvaliacoes(searchTerm = '') {
    const tbody = document.querySelector('#avaliacoes-table tbody');
    if (!tbody) {
        console.error('Avaliações table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="6">Carregando avaliações...</td></tr>';

    try {
        // IMPORTANT: Assumes window.getAllAvaliacoes() exists and calls GET /api/avaliacoes
        if (typeof window.getAllAvaliacoes !== 'function') {
            tbody.innerHTML = '<tr><td colspan="6">Funcionalidade de listar todas as avaliações não implementada (GET /api/avaliacoes).</td></tr>';
            console.warn('window.getAllAvaliacoes is not defined in api.js or backend endpoint GET /api/avaliacoes is missing.');
            return;
        }

        if (allAvaliacoesCache.length === 0 && searchTerm === '') {
            allAvaliacoesCache = await window.getAllAvaliacoes();
        }

        // Pre-fetch Aluno and Curso details if not already cached
        // This is done before filtering to ensure search terms can match names/titles
        for (const avaliacao of allAvaliacoesCache) {
            if (avaliacao.aluno && avaliacao.aluno.id && !alunoDetailsCache[avaliacao.aluno.id]) {
                try {
                    alunoDetailsCache[avaliacao.aluno.id] = await window.getAlunoById(avaliacao.aluno.id);
                } catch (e) { console.warn(`Failed to fetch aluno ${avaliacao.aluno.id}`); }
            }
            if (avaliacao.curso && avaliacao.curso.id && !cursoDetailsCache[avaliacao.curso.id]) {
                try {
                    cursoDetailsCache[avaliacao.curso.id] = await window.getCursoById(avaliacao.curso.id);
                } catch (e) { console.warn(`Failed to fetch curso ${avaliacao.curso.id}`); }
            }
        }

        let avaliacoesToDisplay = allAvaliacoesCache;
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            avaliacoesToDisplay = allAvaliacoesCache.filter(avaliacao => {
                const aluno = avaliacao.aluno && avaliacao.aluno.id ? alunoDetailsCache[avaliacao.aluno.id] : null;
                const curso = avaliacao.curso && avaliacao.curso.id ? cursoDetailsCache[avaliacao.curso.id] : null;
                const alunoNome = aluno ? aluno.nome.toLowerCase() : '';
                const cursoTitulo = curso ? curso.titulo.toLowerCase() : '';
                const feedback = avaliacao.feedback ? avaliacao.feedback.toLowerCase() : '';
                return alunoNome.includes(lowerSearchTerm) ||
                    cursoTitulo.includes(lowerSearchTerm) ||
                    feedback.includes(lowerSearchTerm);
            });
        }

        tbody.innerHTML = ''; // Clear loading message

        if (!avaliacoesToDisplay || avaliacoesToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${searchTerm ? 'Nenhuma avaliação encontrada com o termo "' + searchTerm + '".' : 'Nenhuma avaliação encontrada.'}</td></tr>`;
            return;
        }

        avaliacoesToDisplay.forEach(avaliacao => {
            // Avaliacao.java: id, nota, feedback, aluno, curso
            const aluno = avaliacao.aluno && avaliacao.aluno.id ? alunoDetailsCache[avaliacao.aluno.id] : null;
            const curso = avaliacao.curso && avaliacao.curso.id ? cursoDetailsCache[avaliacao.curso.id] : null;

            const alunoNome = aluno ? aluno.nome : (avaliacao.aluno ? `ID: ${avaliacao.aluno.id}` : 'N/A');
            const cursoTitulo = curso ? curso.titulo : (avaliacao.curso ? `ID: ${avaliacao.curso.id}` : 'N/A');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${avaliacao.id}</td>
                <td>${alunoNome}</td>
                <td>${cursoTitulo}</td>
                <td>${avaliacao.nota !== null ? avaliacao.nota : 'N/A'}</td>
                <td>${avaliacao.feedback || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-avaliacao" data-id="${avaliacao.id}" title="Excluir Avaliação">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachAvaliacaoActionListeners();
    } catch (error) {
        console.error('Error loading avaliações:', error);
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar avaliações. Verifique o console.</td></tr>';
        window.showNotification('Erro ao carregar lista de avaliações.', 'error');
        allAvaliacoesCache = []; // Clear cache on error
    }
}

function attachAvaliacaoActionListeners() {
    // No .edit-avaliacao listener because backend doesn't support update

    document.querySelectorAll('.delete-avaliacao').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('avaliação', id, async () => {
                await window.deleteAvaliacao(id); // from api.js
                allAvaliacoesCache = []; // Invalidate cache
                alunoDetailsCache = {}; // Invalidate related caches
                cursoDetailsCache = {};
                await loadAvaliacoes(); // Refresh list
            });
        });
    });
}

async function showAvaliacaoForm() { // Form is only for creating new evaluations
    // Avaliacao.java fields: id, nota, feedback, aluno, curso
    let avaliacao = { alunoId: '', cursoId: '', nota: '', feedback: '' };
    let formTitle = 'Nova Avaliação';

    let allAlunos = [];
    let allCursos = [];

    try {
        allAlunos = await window.getAllAlunos();
        allCursos = await window.getAllCursos();
    } catch (error) {
        window.showNotification('Erro ao carregar alunos ou cursos para o formulário.', 'error');
        return;
    }

    const alunoOptions = allAlunos.map(al => ({ value: al.id, text: `${al.nome} (CPF: ${al.cpf || 'N/A'})` }));
    const cursoOptions = allCursos.map(cur => ({ value: cur.id, text: `${cur.titulo} (ID: ${cur.id})` }));

    const formFields = [
        { name: 'alunoId', label: 'Aluno Avaliador', type: 'select', options: alunoOptions, value: avaliacao.alunoId, required: true },
        { name: 'cursoId', label: 'Curso Avaliado', type: 'select', options: cursoOptions, value: avaliacao.cursoId, required: true },
        { name: 'nota', label: 'Nota (Ex: 0.0 a 10.0)', type: 'number', value: avaliacao.nota, required: true, attributes: { step: "0.1", min: "0", max: "10" } },
        { name: 'feedback', label: 'Feedback (Comentário)', type: 'textarea', value: avaliacao.feedback, required: false, attributes: { rows: "4", maxlength: "300" } }
    ];

    // Manual form HTML generation for better control
    let formHtml = `<form id="avaliacao-dynamic-form" class="entity-form">`;
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
        } else if (field.type === 'textarea') {
            formHtml += `<textarea id="${field.name}" name="${field.name}" class="form-control" 
                ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>${field.value || ''}</textarea>`;
        } else {
            formHtml += `<input type="${field.type || 'text'}"
                           id="${field.name}"
                           name="${field.name}"
                           value="${field.value || ''}"
                           ${field.required ? 'required' : ''}
                           ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>`;
        }
        formHtml += `</div>`;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">Criar Avaliação</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#avaliacao-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.nota) data.nota = parseFloat(data.nota);

            // Prepare payload for backend
            const payload = {
                nota: data.nota,
                feedback: data.feedback,
                aluno: { id: parseInt(data.alunoId, 10) },
                curso: { id: parseInt(data.cursoId, 10) }
            };

            try {
                await window.createAvaliacao(payload); // from api.js
                window.showNotification('Avaliação criada com sucesso!', 'success');
                document.getElementById('modal').style.display = 'none';
                allAvaliacoesCache = []; // Invalidate cache
                alunoDetailsCache = {};
                cursoDetailsCache = {};
                await loadAvaliacoes();
            } catch (error) {
                console.error('Erro ao criar avaliação:', error);
                window.showNotification(error.message || 'Erro ao criar avaliação.', 'error');
            }
        });
    }
}