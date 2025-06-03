-- Criação do banco e uso
CREATE DATABASE IF NOT EXISTS CursoOnline;
USE CursoOnline;

-- Drops na ordem correta
DROP TABLE IF EXISTS curso_modulo;
DROP TABLE IF EXISTS curso_instrutor;
DROP TABLE IF EXISTS Avaliacao;
DROP TABLE IF EXISTS Aula;
DROP TABLE IF EXISTS Modulo;
DROP TABLE IF EXISTS Certificado;
DROP TABLE IF EXISTS Matricula;
DROP TABLE IF EXISTS Curso;
DROP TABLE IF EXISTS Instrutor;
DROP TABLE IF EXISTS Aluno;

-- Tabelas

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

CREATE TABLE IF NOT EXISTS curso_instrutor(
    curso_id INT NOT NULL,
    instrutor_id INT NOT NULL,
    PRIMARY KEY (curso_id, instrutor_id),
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE,
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Modulo(
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo VARCHAR(50) NOT NULL,
    carga_horaria INT NOT NULL,
    qtd_aulas INT NOT NULL
);

CREATE TABLE IF NOT EXISTS curso_modulo(
    curso_id INT NOT NULL,
    modulo_id INT NOT NULL,
    PRIMARY KEY (curso_id, modulo_id),
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES Modulo(id) ON DELETE CASCADE
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


-- ============================================
-- 🔥 Dados de exemplo (simula os INSERT do DAO)
-- ============================================

-- Alunos
INSERT INTO Aluno (nome, cpf, senha, data_cadastro) 
VALUES ('Maria Silva', '12345678901', 'senha123', CURDATE());

-- Instrutores
INSERT INTO Instrutor (nome, cpf, senha, data_cadastro) 
VALUES ('Carlos Souza', '98765432100', 'senha456', CURDATE());

-- Cursos
INSERT INTO Curso (titulo, carga_horaria, status) 
VALUES ('Java Completo', 40, 'Ativo');

-- Modulos
INSERT INTO Modulo (conteudo, carga_horaria, qtd_aulas) 
VALUES ('Programação Orientada a Objetos', 10, 5);

-- Aulas
INSERT INTO Aula (url, titulo, duracao, ordem, modulo_id) 
VALUES ('https://youtube.com/aula1', 'Introdução a POO', '00:20:00', 1, 2);

-- Matricula
INSERT INTO Matricula (aluno_id, curso_id, data_matricula, ativo)
VALUES (5, 2, CURDATE(), TRUE);

-- Certificado
INSERT INTO Certificado (data_conclusao, aluno_id, curso_id)
VALUES (CURDATE(), 5, 2);

-- Avaliacao
INSERT INTO Avaliacao (nota, feedback, aluno_id, curso_id)
VALUES (9.5, 'Curso excelente!', 5, 2);

-- Relações Many-to-Many
INSERT INTO curso_instrutor (curso_id, instrutor_id) VALUES (2, 2);
INSERT INTO curso_modulo (curso_id, modulo_id) VALUES (2, 2);

-- ============================================
-- 🔥 Consultas básicas (SELECT dos DAOs)
-- ============================================

-- Buscar todos os alunos
SELECT * FROM Aluno;

-- Buscar aluno por ID
SELECT * FROM Aluno WHERE id = 1;

-- Buscar todos os instrutores
SELECT * FROM Instrutor;

-- Buscar todos os cursos
SELECT * FROM Curso;

-- Buscar curso por ID
SELECT * FROM Curso WHERE id = 1;

-- Buscar módulos de um curso
SELECT m.* 
FROM Modulo m
INNER JOIN curso_modulo cm ON m.id = cm.modulo_id
WHERE cm.curso_id = 1;

-- Buscar aulas de um módulo
SELECT * FROM Aula WHERE modulo_id = 1;

-- Buscar matrícula de um aluno
SELECT * FROM Matricula WHERE aluno_id = 1;

-- Buscar avaliações de um curso
SELECT * FROM Avaliacao WHERE curso_id = 1;


-- ============================================
-- 🔥 Atualizações (UPDATE dos DAOs)
-- ============================================

-- Atualizar nome do aluno
UPDATE Aluno SET nome = 'Maria Oliveira' WHERE id = 1;

-- Atualizar status do curso
UPDATE Curso SET status = 'Inativo' WHERE id = 1;

-- Atualizar título da aula
UPDATE Aula SET titulo = 'POO - Conceitos Básicos' WHERE id = 1;


-- ============================================
-- 🔥 Exclusões (DELETE dos DAOs)
-- ============================================

-- Deletar uma aula
DELETE FROM Aula WHERE id = 1;

-- Deletar uma matrícula
DELETE FROM Matricula WHERE id = 1;

-- Deletar um aluno
DELETE FROM Aluno WHERE id = 1;

-- Deletar relação curso-instrutor
DELETE FROM curso_instrutor WHERE curso_id = 1 AND instrutor_id = 1;

-- Deletar relação curso-modulo
DELETE FROM curso_modulo WHERE curso_id = 1 AND modulo_id = 1;
