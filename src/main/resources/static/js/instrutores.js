document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadInstrutores(); // Load all instrutores initially
    } catch (error) {
        console.error('Error on initial load of Instrutores page:', error);
        window.showNotification('Erro crítico ao carregar a página de instrutores.', 'error');
    }

    const btnNewInstrutor = document.getElementById('btn-new-instrutor');
    if (btnNewInstrutor) {
        btnNewInstrutor.addEventListener('click', () => showInstrutorForm());
    }

    const btnCloseDetails = document.getElementById('btn-close-details');
    if (btnCloseDetails) {
        btnCloseDetails.addEventListener('click', () => {
            const detailsPanel = document.getElementById('instrutor-details');
            if (detailsPanel) detailsPanel.style.display = 'none';
        });
    }

    const searchButton = document.getElementById('search-instrutores-button');
    const searchInput = document.getElementById('search-instrutores-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => loadInstrutores(searchInput.value.trim()));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadInstrutores(searchInput.value.trim());
            }
        });
    }
});

let allInstrutoresCache = []; // Cache for client-side filtering

async function loadInstrutores(searchTerm = '') {
    const tbody = document.querySelector('#instrutores-table tbody');
    if (!tbody) {
        console.error('Instrutores table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="5">Carregando instrutores...</td></tr>';

    try {
        if (allInstrutoresCache.length === 0 && searchTerm === '') {
            allInstrutoresCache = await window.getAllInstrutores(); // From api.js
        }

        let instrutoresToDisplay = allInstrutoresCache;

        if (searchTerm) {
            instrutoresToDisplay = allInstrutoresCache.filter(instrutor =>
                instrutor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (instrutor.cpf && instrutor.cpf.includes(searchTerm))
            );
        }

        tbody.innerHTML = ''; // Clear loading message or previous content

        if (!instrutoresToDisplay || instrutoresToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">${searchTerm ? 'Nenhum instrutor encontrado com o termo "' + searchTerm + '".' : 'Nenhum instrutor encontrado.'}</td></tr>`;
            return;
        }

        instrutoresToDisplay.forEach(instrutor => {
            // Instrutor.java fields: id, nome, cpf, senha, dataCadastro
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${instrutor.id}</td>
                <td>${instrutor.nome || 'N/A'}</td>
                <td>${instrutor.cpf || 'N/A'}</td>
                <td>${instrutor.dataCadastro ? window.formatDate(instrutor.dataCadastro) : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary view-instrutor" data-id="${instrutor.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary edit-instrutor" data-id="${instrutor.id}" title="Editar Instrutor">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-instrutor" data-id="${instrutor.id}" title="Excluir Instrutor">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachInstrutorActionListeners();
    } catch (error) {
        console.error('Error loading instrutores:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar instrutores.</td></tr>';
        window.showNotification('Erro ao carregar lista de instrutores.', 'error');
        allInstrutoresCache = []; // Clear cache on error
    }
}

function attachInstrutorActionListeners() {
    document.querySelectorAll('.view-instrutor').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showInstrutorDetails(id);
        });
    });

    document.querySelectorAll('.edit-instrutor').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showInstrutorForm(id);
        });
    });

    document.querySelectorAll('.delete-instrutor').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('instrutor', id, async () => {
                await window.deleteInstrutor(id); // from api.js
                allInstrutoresCache = []; // Invalidate cache
                await loadInstrutores(); // Refresh list
            });
        });
    });
}

async function showInstrutorDetails(instrutorId) {
    const detailsPanel = document.getElementById('instrutor-details');
    const instrutorInfoDiv = document.getElementById('instrutor-info');

    if (!detailsPanel || !instrutorInfoDiv) {
        console.error('Instrutor details elements not found!');
        return;
    }

    try {
        const instrutor = await window.getInstrutorById(instrutorId); // from api.js
        if (!instrutor) {
            window.showNotification('Instrutor não encontrado.', 'error');
            return;
        }

        instrutorInfoDiv.innerHTML = `
            <div class="form-group"><label>ID:</label><p>${instrutor.id}</p></div>
            <div class="form-group"><label>Nome:</label><p>${instrutor.nome || 'N/A'}</p></div>
            <div class="form-group"><label>CPF:</label><p>${instrutor.cpf || 'N/A'}</p></div>
            <div class="form-group"><label>Data de Cadastro:</label><p>${instrutor.dataCadastro ? window.formatDate(instrutor.dataCadastro) : 'N/A'}</p></div>
        `;
        // Senha is not displayed for security reasons.

        detailsPanel.style.display = 'block';
        await loadCursosByInstrutor(instrutorId);

    } catch (error) {
        console.error(`Error showing instrutor details for ID ${instrutorId}:`, error);
        window.showNotification('Erro ao carregar detalhes do instrutor.', 'error');
        detailsPanel.style.display = 'none';
    }
}

async function loadCursosByInstrutor(instrutorId) {
    const tbody = document.querySelector('#cursos-ministrados-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3">Carregando cursos ministrados...</td></tr>';

    try {
        // RelationshipController returns List<Long> for curso IDs.
        const cursoIds = await window.getCursosByInstrutorId(instrutorId); // from api.js

        tbody.innerHTML = '';
        if (!cursoIds || cursoIds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Este instrutor não está vinculado a nenhum curso.</td></tr>';
            return;
        }

        for (const cursoId of cursoIds) {
            try {
                const curso = await window.getCursoById(cursoId); // from api.js
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${curso.id}</td>
                    <td>${curso.titulo || 'N/A'}</td>
                    <td>${curso.status || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            } catch (fetchError) {
                console.warn(`Could not fetch details for curso ID ${cursoId}:`, fetchError);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="3">Erro ao carregar curso ID ${cursoId}.</td>`;
                tbody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error('Error loading cursos for instrutor:', error);
        tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar cursos ministrados.</td></tr>';
    }
}


async function showInstrutorForm(id = null) {
    // Instrutor.java fields: id, nome, cpf, senha, dataCadastro
    let instrutor = { id: '', nome: '', cpf: '', senha: '' }; // dataCadastro is backend-handled
    let formTitle = 'Novo Instrutor';
    let isEditMode = id !== null;

    if (isEditMode) {
        formTitle = 'Editar Instrutor';
        try {
            instrutor = await window.getInstrutorById(id);
        } catch (error) {
            window.showNotification('Erro ao carregar dados do instrutor para edição.', 'error');
            return;
        }
    }

    const formFields = [
        { name: 'nome', label: 'Nome Completo', type: 'text', value: instrutor.nome, required: true },
        { name: 'cpf', label: 'CPF (somente números)', type: 'text', value: instrutor.cpf, required: true, attributes: { pattern: "\\d{11}", title: "CPF deve conter 11 dígitos numéricos." } },
        { name: 'senha', label: 'Senha', type: 'password', value: '', required: !isEditMode, placeholder: isEditMode ? 'Deixe em branco para não alterar' : '' }
    ];

    let formHtml = `<form id="instrutor-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${instrutor.id}">`;
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
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Instrutor</button></div></form>`;

    window.openModal(formTitle, formHtml); // openModal from utils.js

    const dynamicForm = document.querySelector('#instrutor-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.cpf) {
                data.cpf = data.cpf.replace(/\D/g, ''); // Ensure only numbers for CPF
            }
            // For edit mode, if senha is empty, don't send it so backend doesn't update to empty
            if (isEditMode && (!data.senha || data.senha.trim() === '')) {
                delete data.senha;
            }
            // dataCadastro is set by the backend.

            try {
                if (isEditMode) {
                    await window.updateInstrutor(id, data); // from api.js
                } else {
                    await window.createInstrutor(data); // from api.js
                }
                window.showNotification(`Instrutor ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';
                allInstrutoresCache = []; // Invalidate cache
                await loadInstrutores();
            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} instrutor:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} instrutor.`, 'error');
            }
        });
    }
}