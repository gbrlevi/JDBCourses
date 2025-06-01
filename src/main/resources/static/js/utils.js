// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Open modal
function openModal(title, content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // Set title and content
    modalContent.innerHTML = `
        <h2>${title}</h2>
        <div class="modal-body">${content}</div>
    `;

    modal.style.display = 'block';

    // Close modal when clicking on X
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Create form for entity
function createForm(entity, fields, submitCallback, initialData = {}) {
    const form = document.createElement('form');
    form.id = `${entity}-form`;
    form.className = 'entity-form';

    // Create form fields
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.textContent = field.label;

        let input;

        if (field.type === 'textarea') {
            input = document.createElement('textarea');
        } else if (field.type === 'select') {
            input = document.createElement('select');

            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Selecione...';
            input.appendChild(emptyOption);

            // Add options if available
            if (field.options && field.options.length) {
                field.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.text;
                    input.appendChild(optionEl);
                });
            }
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
        }

        input.id = field.name;
        input.name = field.name;
        input.className = 'form-control';

        if (field.required) {
            input.required = true;
        }

        // Set initial value if available
        if (initialData[field.name] !== undefined) {
            if (field.type === 'date' && initialData[field.name]) {
                // Format date for input
                const date = new Date(initialData[field.name]);
                input.value = date.toISOString().split('T')[0];
            } else {
                input.value = initialData[field.name];
            }
        }

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        form.appendChild(formGroup);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = initialData.id ? 'Atualizar' : 'Criar';

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.appendChild(submitBtn);
    form.appendChild(formGroup);

    // Add submit event listener
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            await submitCallback(data);
            showNotification(`${entity.charAt(0).toUpperCase() + entity.slice(1)} ${initialData.id ? 'atualizado' : 'criado'} com sucesso!`);
            document.getElementById('modal').style.display = 'none';
        } catch (error) {
            showNotification(`Erro ao ${initialData.id ? 'atualizar' : 'criar'} ${entity}: ${error.message}`, 'error');
        }
    });

    return form;
}

// Confirm deletion
function confirmDelete(entity, id, deleteCallback) {
    const content = `
        <p>Tem certeza que deseja excluir este(a) ${entity}?</p>
        <div class="actions mt-20">
            <button class="btn btn-danger" id="confirm-delete">Sim, excluir</button>
            <button class="btn" id="cancel-delete">Cancelar</button>
        </div>
    `;

    openModal(`Excluir ${entity}`, content);

    document.getElementById('confirm-delete').addEventListener('click', async function() {
        try {
            await deleteCallback(id);
            showNotification(`${entity.charAt(0).toUpperCase() + entity.slice(1)} excluído com sucesso!`);
            document.getElementById('modal').style.display = 'none';
        } catch (error) {
            showNotification(`Erro ao excluir ${entity}: ${error.message}`, 'error');
        }
    });

    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
    });
}

// Load select options
async function loadSelectOptions(selectId, fetchFunction, valueField = 'id', textField = 'nome') {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        const data = await fetchFunction();

        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add new options
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            select.appendChild(option);
        });
    } catch (error) {
        console.error(`Error loading options for ${selectId}:`, error);
    }
}
