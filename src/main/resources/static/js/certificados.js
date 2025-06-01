document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadCertificados();
    } catch (error) {
        console.error('Error on initial load of Certificados page:', error);
        window.showNotification('Erro crítico ao carregar a página de certificados.', 'error');
    }

    const btnNewCertificado = document.getElementById('btn-new-certificado');
    if (btnNewCertificado) {
        btnNewCertificado.addEventListener('click', () => showCertificadoForm());
    }

    const searchButton = document.getElementById('search-certificados-button');
    const searchInput = document.getElementById('search-certificados-input');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => loadCertificados(searchInput.value.trim()));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadCertificados(searchInput.value.trim());
            }
        });
    }
});

let allCertificadosCache = [];
let alunoDetailsCacheCert = {}; // Using different cache names to avoid conflicts if on same page
let cursoDetailsCacheCert = {};

async function loadCertificados(searchTerm = '') {
    const tbody = document.querySelector('#certificados-table tbody');
    if (!tbody) {
        console.error('Certificados table body not found!');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="5">Carregando certificados...</td></tr>';

    try {
        if (typeof window.getAllCertificados !== 'function') {
            tbody.innerHTML = '<tr><td colspan="5">Funcionalidade de listar todos os certificados não implementada (GET /api/certificados).</td></tr>';
            console.warn('window.getAllCertificados is not defined in api.js or backend endpoint GET /api/certificados is missing.');
            return;
        }

        if (allCertificadosCache.length === 0 && searchTerm === '') {
            allCertificadosCache = await window.getAllCertificados();
        }

        // Pre-fetch Aluno and Curso details if not already cached
        for (const certificado of allCertificadosCache) {
            if (certificado.aluno && certificado.aluno.id && !alunoDetailsCacheCert[certificado.aluno.id]) {
                try {
                    alunoDetailsCacheCert[certificado.aluno.id] = await window.getAlunoById(certificado.aluno.id);
                } catch (e) { console.warn(`Failed to fetch aluno ${certificado.aluno.id} for certificado`); }
            }
            if (certificado.curso && certificado.curso.id && !cursoDetailsCacheCert[certificado.curso.id]) {
                try {
                    cursoDetailsCacheCert[certificado.curso.id] = await window.getCursoById(certificado.curso.id);
                } catch (e) { console.warn(`Failed to fetch curso ${certificado.curso.id} for certificado`); }
            }
        }

        let certificadosToDisplay = allCertificadosCache;
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            certificadosToDisplay = allCertificadosCache.filter(cert => {
                const aluno = cert.aluno && cert.aluno.id ? alunoDetailsCacheCert[cert.aluno.id] : null;
                const curso = cert.curso && cert.curso.id ? cursoDetailsCacheCert[cert.curso.id] : null;
                const alunoNome = aluno ? aluno.nome.toLowerCase() : '';
                const cursoTitulo = curso ? curso.titulo.toLowerCase() : '';
                return alunoNome.includes(lowerSearchTerm) || cursoTitulo.includes(lowerSearchTerm);
            });
        }

        tbody.innerHTML = ''; // Clear loading message

        if (!certificadosToDisplay || certificadosToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">${searchTerm ? 'Nenhum certificado encontrado com o termo "' + searchTerm + '".' : 'Nenhum certificado encontrado.'}</td></tr>`;
            return;
        }

        certificadosToDisplay.forEach(certificado => {
            // Certificado.java: id, dataConclusao, aluno, curso
            const aluno = certificado.aluno && certificado.aluno.id ? alunoDetailsCacheCert[certificado.aluno.id] : null;
            const curso = certificado.curso && certificado.curso.id ? cursoDetailsCacheCert[certificado.curso.id] : null;

            const alunoNome = aluno ? aluno.nome : (certificado.aluno ? `ID: ${certificado.aluno.id}` : 'N/A');
            const cursoTitulo = curso ? curso.titulo : (certificado.curso ? `ID: ${certificado.curso.id}` : 'N/A');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${certificado.id}</td>
                <td>${alunoNome}</td>
                <td>${cursoTitulo}</td>
                <td>${certificado.dataConclusao ? window.formatDate(certificado.dataConclusao) : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-danger delete-certificado" data-id="${certificado.id}" title="Excluir Certificado">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachCertificadoActionListeners();
    } catch (error) {
        console.error('Error loading certificados:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar certificados. Verifique o console.</td></tr>';
        window.showNotification('Erro ao carregar lista de certificados.', 'error');
        allCertificadosCache = []; // Clear cache on error
    }
}

function attachCertificadoActionListeners() {
    // No .edit-certificado listener

    document.querySelectorAll('.delete-certificado').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.confirmDelete('certificado', id, async () => {
                await window.deleteCertificado(id); // from api.js
                allCertificadosCache = []; // Invalidate cache
                alunoDetailsCacheCert = {};
                cursoDetailsCacheCert = {};
                await loadCertificados(); // Refresh list
            });
        });
    });
}

async function showCertificadoForm() { // Form is only for creating new certificados
    // Certificado.java fields: id, dataConclusao, aluno, curso
    let certificado = { alunoId: '', cursoId: '', dataConclusao: new Date().toISOString().split('T')[0] };
    let formTitle = 'Emitir Novo Certificado';

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
        { name: 'alunoId', label: 'Aluno Contemplado', type: 'select', options: alunoOptions, value: certificado.alunoId, required: true },
        { name: 'cursoId', label: 'Curso Concluído', type: 'select', options: cursoOptions, value: certificado.cursoId, required: true },
        { name: 'dataConclusao', label: 'Data de Conclusão', type: 'date', value: certificado.dataConclusao, required: true }
    ];

    // Manual form HTML generation
    let formHtml = `<form id="certificado-dynamic-form" class="entity-form">`;
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
        } else {
            formHtml += `<input type="${field.type || 'text'}"
                           id="${field.name}"
                           name="${field.name}"
                           value="${field.value || ''}"
                           ${field.required ? 'required' : ''}>`;
        }
        formHtml += `</div>`;
    });
    formHtml += `<div class="form-group"><button type="submit" class="btn btn-primary">Emitir Certificado</button></div></form>`;

    window.openModal(formTitle, formHtml);

    const dynamicForm = document.querySelector('#certificado-dynamic-form');
    if (dynamicForm) {
        dynamicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Prepare payload for backend
            const payload = {
                dataConclusao: data.dataConclusao,
                aluno: { id: parseInt(data.alunoId, 10) },
                curso: { id: parseInt(data.cursoId, 10) }
            };

            try {
                await window.createCertificado(payload); // from api.js
                window.showNotification('Certificado emitido com sucesso!', 'success');
                document.getElementById('modal').style.display = 'none';
                allCertificadosCache = []; // Invalidate cache
                alunoDetailsCacheCert = {};
                cursoDetailsCacheCert = {};
                await loadCertificados();
            } catch (error) {
                console.error('Erro ao emitir certificado:', error);
                window.showNotification(error.message || 'Erro ao emitir certificado.', 'error');
            }
        });
    }
}