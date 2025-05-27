package com.example.cursosonline.Domain;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "Matricula")
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "data_matricula", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date dataMatricula;

    @Column(name = "ativo", nullable = false)
    private boolean ativo;

    // Constructors
    public Matricula() {}

    public Matricula(Aluno aluno, Curso curso, Date dataMatricula, boolean ativo) {
        this.aluno = aluno;
        this.curso = curso;
        this.dataMatricula = dataMatricula;
        this.ativo = ativo;
    }

    ////////////////////////
    /// gettters and setters
    ////////////////////////

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public Date getDataMatricula() {
        return dataMatricula;
    }

    public void setDataMatricula(Date dataMatricula) {
        this.dataMatricula = dataMatricula;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
