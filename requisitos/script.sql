-- =================================================================================
-- PARTE 1: DEFINIÇÃO DA ESTRUTURA DO BANCO DE DADOS 
-- =================================================================================

-- Criação do banco e uso
CREATE DATABASE IF NOT EXISTS CursoOnline;
USE CursoOnline;

-- Drops na ordem correta para evitar erros de chave estrangeira
DROP TABLE IF EXISTS curso_modulo;
DROP TABLE IF EXISTS curso_instrutor;
DROP TABLE IF EXISTS Avaliacao;
DROP TABLE IF EXISTS Aula;
DROP TABLE IF EXISTS Certificado;
DROP TABLE IF EXISTS Matricula;
DROP TABLE IF EXISTS Modulo;
DROP TABLE IF EXISTS Curso;
DROP TABLE IF EXISTS Instrutor;
DROP TABLE IF EXISTS Aluno;

-- Criação das Tabelas
CREATE TABLE IF NOT EXISTS Aluno(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50),
    cpf VARCHAR(11) UNIQUE NOT NULL, 
    senha VARCHAR(99),
    data_cadastro DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Instrutor(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    senha VARCHAR(99),
    data_cadastro DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Curso(
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL,
    status VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS Modulo(
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL,
    qtd_aulas INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Aula(
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    duracao VARCHAR(8) NOT NULL,
    ordem INT NOT NULL,
    modulo_id INT NOT NULL,
    FOREIGN KEY (modulo_id) REFERENCES Modulo(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Matricula(
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    data_matricula DATE NOT NULL,
    ativo BOOLEAN NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Certificado(
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_conclusao DATE,
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Avaliacao(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nota DOUBLE(4,2),
    feedback VARCHAR(300),
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE
);

-- Tabelas de Junção para Relações Muitos-para-Muitos
CREATE TABLE IF NOT EXISTS curso_instrutor(
    curso_id INT NOT NULL,
    instrutor_id INT NOT NULL,
    PRIMARY KEY (curso_id, instrutor_id),
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE,
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS curso_modulo(
    curso_id INT NOT NULL,
    modulo_id INT NOT NULL,
    PRIMARY KEY (curso_id, modulo_id),
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES Modulo(id) ON DELETE CASCADE
);


-- =================================================================================
-- PARTE 2: INSERÇÃO DE DADOS DE EXEMPLO
-- =================================================================================
-- Este bloco simula o que o DatabaseLoader.java ou os formulários do frontend fariam.
-- Os IDs são 1, 2, 3... porque as tabelas acabaram de ser criadas.

-- Inserindo Alunos
INSERT INTO Aluno (nome, cpf, senha, data_cadastro) VALUES ('Ana Carolina Lima', '11122233301', 'senhaAna', CURDATE());
INSERT INTO Aluno (nome, cpf, senha, data_cadastro) VALUES ('Bruno Costa Alves', '11122233302', 'senhaBruno', CURDATE());
INSERT INTO Aluno (nome, cpf, senha, data_cadastro) VALUES ('Camila Fernandes Dias', '11122233303', 'senhaCamila', CURDATE());

-- Inserindo Instrutores
INSERT INTO Instrutor (nome, cpf, senha, data_cadastro) VALUES ('Prof. Dr. Ricardo Oliveira', '44455566601', 'instrutorRicardo', CURDATE());
INSERT INTO Instrutor (nome, cpf, senha, data_cadastro) VALUES ('Ms. Sofia Albuquerque', '44455566602', 'instrutorSofia', CURDATE());

-- Inserindo Módulos
INSERT INTO Modulo (conteudo, carga_horaria, qtd_aulas) VALUES ('Introdução ao Java e POO', 10, 5);
INSERT INTO Modulo (conteudo, carga_horaria, qtd_aulas) VALUES ('Desenvolvimento Web com React', 20, 10);
INSERT INTO Modulo (conteudo, carga_horaria, qtd_aulas) VALUES ('Banco de Dados com SQL', 15, 8);

-- Inserindo Cursos
INSERT INTO Curso (titulo, carga_horaria, status) VALUES ('Java Spring Boot Essencial', 40, 'Ativo');
INSERT INTO Curso (titulo, carga_horaria, status) VALUES ('React: Do Básico ao Avançado', 50, 'Ativo');

-- Inserindo Aulas (associadas aos módulos)
-- Aulas para o Módulo de Java (ID 1)
INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) VALUES ('https://curso.online/aula/101', 'O que é Java e JVM?', '00:15:30', 1, 1);
INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) VALUES ('https://curso.online/aula/102', 'Classes e Objetos', '00:25:10', 2, 1);
-- Aulas para o Módulo de React (ID 2)
INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) VALUES ('https://curso.online/aula/201', 'Configurando Ambiente React', '00:18:00', 1, 2);
INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) VALUES ('https://curso.online/aula/202', 'Componentes Funcionais e Props', '00:35:45', 2, 2);

-- Vinculando Cursos a Instrutores
INSERT INTO curso_instrutor (curso_id, instrutor_id) VALUES (1, 1); -- Curso Java com Instrutor Ricardo
INSERT INTO curso_instrutor (curso_id, instrutor_id) VALUES (2, 2); -- Curso React com Instrutora Sofia

-- Vinculando Cursos a Módulos
INSERT INTO curso_modulo (curso_id, modulo_id) VALUES (1, 1); -- Curso Java com Módulo de Java
INSERT INTO curso_modulo (curso_id, modulo_id) VALUES (1, 3); -- Curso Java também tem Módulo de SQL
INSERT INTO curso_modulo (curso_id, modulo_id) VALUES (2, 2); -- Curso React com Módulo de React

-- Inserindo Matrículas
INSERT INTO Matricula (aluno_id, curso_id, data_matricula, ativo) VALUES (1, 1, '2025-05-10', true);  -- Ana no curso de Java
INSERT INTO Matricula (aluno_id, curso_id, data_matricula, ativo) VALUES (2, 2, '2025-05-15', true);  -- Bruno no curso de React
INSERT INTO Matricula (aluno_id, curso_id, data_matricula, ativo) VALUES (1, 2, '2025-05-20', false); -- Ana também no curso de React (inativa)

-- Inserindo Avaliações
INSERT INTO Avaliacao (nota, feedback, aluno_id, curso_id) VALUES (9.5, 'Excelente curso, muito didático!', 1, 1); -- Ana avalia Java
INSERT INTO Avaliacao (nota, feedback, aluno_id, curso_id) VALUES (8.0, 'Bom conteúdo, mas poderia ter mais exemplos práticos.', 2, 2); -- Bruno avalia React

-- Inserindo Certificados
INSERT INTO Certificado (data_conclusao, aluno_id, curso_id) VALUES ('2025-06-08', 1, 1); -- Ana concluiu o curso de Java


-- =================================================================================
-- PARTE 3: EXEMPLOS DAS QUERIES USADAS NOS DAOS 
-- =================================================================================

-- Exemplos AlunoDAO
SELECT * FROM Aluno; -- findAll()
SELECT * FROM Aluno WHERE id = 1; -- findById(1)
UPDATE Aluno SET nome = 'Ana Carolina Lima Silva' WHERE id = 1; -- update()
-- DELETE FROM Aluno WHERE id = 3; -- delete(3) - Comentado para manter os dados de exemplo


-- Exemplos AulaDAO
SELECT * FROM Aula; -- findAll()
SELECT * FROM Aula WHERE id = 2; -- findById(2)
SELECT * FROM Aula WHERE modulo_id = 1; -- findByModuloId(1)
UPDATE Aula SET titulo = 'Classes, Objetos e Herança' WHERE id = 2; -- update()
-- DELETE FROM Aula WHERE id = 4; -- delete(4)


-- Exemplos AvaliacaoDAO
SELECT * FROM Avaliacao; -- findAll()
SELECT * FROM Avaliacao WHERE id = 1; -- findById(1)
SELECT * FROM Avaliacao WHERE aluno_id = 1; -- findByAlunoId(1)
-- DELETE FROM Avaliacao WHERE id = 2; -- delete(2)


-- Exemplos CertificadoDAO
SELECT * FROM Certificado; -- findAll()
SELECT * FROM Certificado WHERE id = 1; -- findById(1)
SELECT * FROM Certificado WHERE aluno_id = 1; -- findByAlunoId(1)
-- DELETE FROM Certificado WHERE id = 1; -- delete(1)


-- Exemplos CursoDAO
SELECT * FROM Curso; -- findAll()
SELECT * FROM Curso WHERE id = 2; -- findById(2)
UPDATE Curso SET status = 'Concluído' WHERE id = 1; -- update()
-- DELETE FROM Curso WHERE id = 2; -- delete(2) - isso deletaria matrículas, certificados, etc. em cascata.


-- Exemplos InstrutorDAO
SELECT * FROM Instrutor; -- findAll()
SELECT * FROM Instrutor WHERE id = 1; -- findById(1)
UPDATE Instrutor SET nome = 'Ricardo Oliveira PhD' WHERE id = 1; -- update()
-- DELETE FROM Instrutor WHERE id = 2; -- delete(2) - isso desvincularia o curso em cascata.


-- Exemplos MatriculaDAO
SELECT * FROM Matricula; -- findAll()
SELECT * FROM Matricula WHERE id = 3; -- findById(3)
SELECT * FROM Matricula WHERE aluno_id = 1; -- findByAlunoId(1)
SELECT * FROM Matricula WHERE curso_id = 2; -- findByCursoId(2)
UPDATE Matricula SET ativo = true WHERE id = 3; -- update()
-- DELETE FROM Matricula WHERE id = 2; -- delete(2)


-- Exemplos ModuloDAO
SELECT * FROM Modulo; -- findAll()
SELECT * FROM Modulo WHERE id = 3; -- findById(3)
UPDATE Modulo SET conteudo = 'Bancos de Dados SQL e NoSQL' WHERE id = 3; -- update()
-- DELETE FROM Modulo WHERE id = 3; -- delete(3) - isso deletaria aulas e desvincularia cursos em cascata.


-- Exemplos CursoInstrutorDAO
SELECT instrutor_id FROM curso_instrutor WHERE curso_id = 1; -- findInstrutoresByCursoId(1)
SELECT curso_id FROM curso_instrutor WHERE instrutor_id = 2; -- findCursosByInstrutorId(2)
-- DELETE FROM curso_instrutor WHERE curso_id = 1 AND instrutor_id = 1; -- delete()


-- Exemplos CursoModuloDAO
SELECT modulo_id FROM curso_modulo WHERE curso_id = 1; -- findModulosByCursoId(1)
SELECT curso_id FROM curso_modulo WHERE modulo_id = 2; -- findCursosByModuloId(2)
-- DELETE FROM curso_modulo WHERE curso_id = 1 AND modulo_id = 3; -- delete()

