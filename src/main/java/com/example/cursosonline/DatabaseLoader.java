package com.example.cursosonline;

import com.example.cursosonline.DAO.*;
import com.example.cursosonline.Domain.*;

import java.util.Date;
import java.util.List;

public class DatabaseLoader {
    public static void main(String[] args) {
        // DAOs
        AlunoDAO alunoDAO = new AlunoDAO();
        InstrutorDAO instrutorDAO = new InstrutorDAO();
        ModuloDAO moduloDAO = new ModuloDAO();
        CursoDAO cursoDAO = new CursoDAO();
        MatriculaDAO matriculaDAO = new MatriculaDAO();
        CertificadoDAO certificadoDAO = new CertificadoDAO();
        AvaliacaoDAO avaliacaoDAO = new AvaliacaoDAO();
        AulaDAO aulaDAO = new AulaDAO();

        System.out.println("==== TESTANDO CRUD COMPLETO ====");

        // ===================== ALUNO =====================
        Aluno aluno = new Aluno();
        aluno.setNome("Maria Silva");
        aluno.setCpf("12345678901");
        aluno.setSenha("senha123");
        aluno.setDataCadastro(new Date());
        alunoDAO.save(aluno);
        System.out.println("Aluno salvo: " + aluno.getId());

        // ===================== INSTRUTOR =====================
        Instrutor instrutor = new Instrutor();
        instrutor.setNome("João Paulo");
        instrutor.setCpf("98765432100");
        instrutor.setSenha("instrutor123");
        instrutor.setDataCadastro(new Date());
        instrutorDAO.save(instrutor);
        System.out.println("Instrutor salvo: " + instrutor.getId());

        // ===================== MODULO =====================
        Modulo modulo = new Modulo();
        modulo.setConteudo("Programação Java");
        modulo.setCargaHoraria(10);
        modulo.setQtdAulas(5);
        moduloDAO.save(modulo);
        System.out.println("Modulo salvo: " + modulo.getId());

        // ===================== AULA =====================
        Aula aula = new Aula();
        aula.setTitulo("Introdução ao Java");
        aula.setDuracao("00:30:00");
        aula.setOrdem(1);
        aula.setUrl("http://link-da-aula.com/intro-java");
        aula.setModulo(modulo);
        aulaDAO.save(aula);
        System.out.println("Aula salva: " + aula.getId());

        // ===================== CURSO =====================
        Curso curso = new Curso();
        curso.setTitulo("Curso de Java Completo");
        curso.setCargaHoraria(40);
        curso.setStatus("Ativo");

        curso.getInstrutores().add(instrutor);
        curso.getModulos().add(modulo);
        cursoDAO.save(curso);
        System.out.println("Curso salvo: " + curso.getId());

        // ===================== MATRICULA =====================
        Matricula matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setCurso(curso);
        matricula.setDataMatricula(new Date());
        matricula.setAtivo(true);
        matriculaDAO.save(matricula);
        System.out.println("Matricula salva: " + matricula.getId());

        // ===================== AVALIACAO =====================
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setAluno(aluno);
        avaliacao.setCurso(curso);
        avaliacao.setNota(9.5);
        avaliacao.setFeedback("Ótimo curso!");
        avaliacaoDAO.save(avaliacao);
        System.out.println("Avaliacao salva: " + avaliacao.getId());

        // ===================== CERTIFICADO =====================
        Certificado certificado = new Certificado();
        certificado.setAluno(aluno);
        certificado.setCurso(curso);
        certificado.setDataConclusao(new Date());
        certificadoDAO.save(certificado);
        System.out.println("Certificado salvo: " + certificado.getId());

        // ===================== BUSCAS =====================
        System.out.println("\n==== Buscando dados ====");
        Aluno alunoBuscado = alunoDAO.findById(aluno.getId());
        System.out.println("Aluno encontrado: " + alunoBuscado.getNome());

        Curso cursoBuscado = cursoDAO.findById(curso.getId());
        System.out.println("Curso encontrado: " + cursoBuscado.getTitulo());

        List<Aula> aulasModulo = aulaDAO.findByModuloId(modulo.getId());
        System.out.println("Aulas do módulo: " + aulasModulo.size());

        List<Matricula> matriculasCurso = matriculaDAO.findByCursoId(curso.getId());
        System.out.println("Matriculas no curso: " + matriculasCurso.size());

        // ===================== UPDATE =====================
        System.out.println("\n==== Atualizando dados ====");
        aluno.setNome("Maria Silva Atualizada");
        alunoDAO.update(aluno);
        System.out.println("Aluno atualizado!");

        curso.setStatus("Inativo");
        cursoDAO.update(curso);
        System.out.println("Curso atualizado para inativo!");

        aula.setTitulo("Introdução ao Java - Atualizado");
        aulaDAO.update(aula);
        System.out.println("Aula atualizada!");

        // ===================== DELETE =====================
        System.out.println("\n==== Deletando dados ====");
        aulaDAO.delete(aula.getId());
        System.out.println("Aula deletada.");

        avaliacaoDAO.delete(avaliacao.getId());
        System.out.println("Avaliacao deletada.");

        certificadoDAO.delete(certificado.getId());
        System.out.println("Certificado deletado.");

        matriculaDAO.delete(matricula.getId());
        System.out.println("Matricula deletada.");

        cursoDAO.delete(curso.getId());
        System.out.println("Curso deletado.");

        moduloDAO.delete(modulo.getId());
        System.out.println("Modulo deletado.");

        instrutorDAO.delete(instrutor.getId());
        System.out.println("Instrutor deletado.");

        alunoDAO.delete(aluno.getId());
        System.out.println("Aluno deletado.");

        System.out.println("\n==== FIM DOS TESTES ====");
    }
}

