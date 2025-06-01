document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadAulas(); // Load all aulas initially
    } catch (error) {
        console.error('Error on initial load of Aulas page:', error);
        window.showNotification('Erro crítico ao carregar a página de aulas.', 'error');
    }

    const btnNewAula = document.getElementById('btn-new-aula');
    if (btnNewAula) {
        btnNewAula.addEventListener('click', () => showAulaForm()); // No aulaId means new aula
    }

    const searchButton = document.getElementById('search-aulas-button');
    const searchInput = document.getElementById('search-aulas-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => loadAulas(searchInput.value.trim()));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadAulas(searchInput.value.trim());
            }
        });
    }
});

let allAulasCache = []; // Cache to store all aulas for client-side filtering

async function loadAulas(searchTerm = '') {
    const tbody = document.querySelector('#aulas-table tbody');
    if (!tbody) {
        console.error('Aulas table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="6">Carregando aulas...</td></tr>';

    try {
        if (allAulasCache.length === 0 && searchTerm === '') { // Fetch only if cache is empty and not searching
            allAulasCache = await window.getAllAulas(); // From api.js
        }

        let aulasToDisplay = allAulasCache;

        if (searchTerm) {
            aulasToDisplay = allAulasCache.filter(aula =>
                aula.titulo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        tbody.innerHTML = ''; // Clear loading message or previous content

        if (!aulasToDisplay || aulasToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${searchTerm ? 'Nenhuma aula encontrada com o termo "' + searchTerm + '".' : 'Nenhuma aula encontrada.'}</td></tr>`;
            return;
        }

        for (const aula of aulasToDisplay) {
            // Aula.java: id, url, titulo, duracao, ordem, modulo
            // HTML table: ID, Título, Duração, Ordem, Módulo Associado, Ações
            let moduloNome = 'N/A';
            if (aula.modulo && aula.modulo.id) {
                // If modulo object is nested and has 'conteudo'
                if (aula.modulo.conteudo) {
                    moduloNome = aula.modulo.conteudo;
                } else {
                    // Fallback: fetch modulo details if only ID is present (less efficient)
                    try {
                        const modulo = await window.getModuloById(aula.modulo.id);
                        moduloNome = modulo.conteudo || `ID: ${aula.modulo.id}`;
                    } catch (e) {
                        console.warn(`Could not fetch modulo ${aula.modulo.id} for aula ${aula.id}`);
                        moduloNome = `ID: ${aula.modulo.id} (Erro ao buscar nome)`;
                    }
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${aula.id}</td>
                <td>${aula.titulo || 'N/A'}</td>
                <td>${aula.duracao || 'N/A'}</td>
                <td>${aula.ordem !== null ? aula.ordem : 'N/A'}</td>
                <td>${moduloNome}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary edit-aula" data-aula-id="${aula.id}" title="Editar Aula">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-aula" data-aula-id="${aula.id}" title="Excluir Aula">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        }

        attachAulaActionListeners();
    } catch (error) {
        console.error('Error loading aulas:', error);
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar aulas.</td></tr>';
        window.showNotification('Erro ao carregar lista de aulas.', 'error');
        allAulasCache = []; // Clear cache on error
    }
}

function attachAulaActionListeners() {
    document.querySelectorAll('.edit-aula').forEach(button => {
        const newButton = button.cloneNode(true); // Clone to remove old listeners
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const aulaId = this.getAttribute('data-aula-id');
            showAulaForm(aulaId);
        });
    });

    document.querySelectorAll('.delete-aula').forEach(button => {
        const newButton = button.cloneNode(true); // Clone to remove old listeners
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const aulaId = this.getAttribute('data-aula-id');
            window.confirmDelete('aula', aulaId, async () => {
                await window.deleteAula(aulaId); // from api.js
                allAulasCache = []; // Invalidate cache
                await loadAulas(); // Refresh list
            });
        });
    });
}

async function showAulaForm(aulaId = null, preselectedModuloId = null) {
    // Aula.java: id, url, titulo, duracao, ordem, modulo
    let aula = { id: '', titulo: '', url: '', duracao: '', ordem: '', moduloId: preselectedModuloId || '' };
    let formTitle = 'Nova Aula';
    let isEditMode = aulaId !== null;

    if (isEditMode) {
        formTitle = `Editar Aula ID: ${aulaId}`;
        try {
            const fetchedAula = await window.getAulaById(aulaId);
            aula = {
                ...fetchedAula,
                // Ensure moduloId is correctly populated for the form's select field
                moduloId: (fetchedAula.modulo && fetchedAula.modulo.id) ? fetchedAula.modulo.id : (preselectedModuloId || '')
            };
        } catch (error) {
            window.showNotification('Erro ao carregar dados da aula para edição.', 'error');
            return;
        }
    }

    let allModulos = [];
    try {
        allModulos = await window.getAllModulos(); // Fetch all modulos for the select dropdown
    } catch (error) {
        window.showNotification('Erro ao carregar lista de módulos para o formulário.', 'error');
        // Proceed without modulos, or handle more gracefully
    }

    const moduloOptions = allModulos.map(mod => ({
        value: mod.id,
        text: `${mod.conteudo || 'Módulo sem nome'} (ID: ${mod.id})`
    }));

    const formFields = [
        { name: 'titulo', label: 'Título da Aula', type: 'text', value: aula.titulo, required: true },
        { name: 'url', label: 'URL do Vídeo/Conteúdo', type: 'text', value: aula.url, required: true, placeholder: "https://example.com/video" },
        { name: 'duracao', label: 'Duração (HH:MM:SS)', type: 'text', value: aula.duracao, required: true, placeholder: "00:15:30" },
        { name: 'ordem', label: 'Ordem de Exibição', type: 'number', value: aula.ordem, required: true, attributes: { min: "1" } },
        { name: 'moduloId', label: 'Módulo Associado', type: 'select', options: moduloOptions, value: aula.moduloId, required: true }
    ];

    // Using manual form HTML generation for more control over select population
    let formHtml = `<form id="aula-dynamic-form" class="entity-form">`;
    if (isEditMode) {
        formHtml += `<input type="hidden" name="id" value="${aula.id}">`;
    }
    formFields.forEach(field => {
        formHtml += `<div class="form-group">`;
        formHtml += `<label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;
        if (field.type === 'select') {
            formHtml += `<select id="${field.name}" name="${field.name}" class="form-control" ${field.required ? 'required' : ''}>`;
            formHtml += `<option value="">-- Selecione um Módulo --</option>`; // Default empty option
            field.options.forEach(opt => {
                formHtml += `<option value="${opt.value}" ${opt.value == field.value ? 'selected' : ''}>${opt.text}</option>`;
            });
            formHtml += `</select>`;
        } else {
            formHtml += `<input type="${field.type || 'text'}"
                           id="${field.name}"
                           name="${field.name}"
                           value="${field.value || ''}"
                           ${field.required ? 'required' : ''}
                           ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                           ${field.attributes ? Object.entries(field.attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : ''}>`;
        }
        formHtml += `</div>`;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">${isEditMode ? 'Atualizar' : 'Criar'} Aula</button></div></form>`;

    window.openModal(formTitle, formHtml); // openModal from utils.js

    const dynamicForm = document.querySelector('#aula-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.ordem) data.ordem = parseInt(data.ordem, 10);

            // Prepare payload for backend: it expects 'modulo' as an object with 'id'
            const payload = { ...data };
            if (payload.moduloId) { // Ensure moduloId is present and valid
                payload.modulo = { id: parseInt(payload.moduloId, 10) };
                // delete payload.moduloId; // Optionally remove flat moduloId if backend only wants nested
            } else {
                window.showNotification('Por favor, selecione um módulo associado.', 'error');
                return; // Prevent submission if no modulo is selected
            }

            try {
                if (isEditMode) {
                    await window.updateAula(aulaId, payload); // from api.js
                } else {
                    await window.createAula(payload); // from api.js
                }
                window.showNotification(`Aula ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`, 'success');
                document.getElementById('modal').style.display = 'none';
                allAulasCache = []; // Invalidate cache
                await loadAulas(); // Refresh the aulas list
            } catch (error) {
                console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} aula:`, error);
                window.showNotification(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} aula.`, 'error');
            }
        });
    }
}