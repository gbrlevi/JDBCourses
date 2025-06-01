package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.AlunoDAO;
import com.example.cursosonline.Domain.Aluno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
public class AlunoController {

    @Autowired
    private AlunoDAO alunoDAO;

    @PostMapping
    public ResponseEntity<Aluno> createAluno(@RequestBody Aluno aluno) {
        try {
            aluno.setDataCadastro(new Date());
            alunoDAO.save(aluno);
            return new ResponseEntity<>(aluno, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> getAlunoById(@PathVariable Long id) {
        try {
            Aluno aluno = alunoDAO.findById(id);
            if (aluno != null) {
                return new ResponseEntity<>(aluno, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Aluno>> getAllAlunos() {
        try {
            List<Aluno> alunos = alunoDAO.findAll();
            return new ResponseEntity<>(alunos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> updateAluno(@PathVariable Long id, @RequestBody Aluno aluno) {
        try {
            Aluno existingAluno = alunoDAO.findById(id);
            if (existingAluno != null) {
                aluno.setId(id);
                try {
                    aluno.setDataCadastro(new Date());
                    alunoDAO.update(aluno);
                    return new ResponseEntity<>(aluno, HttpStatus.CREATED);
                } catch (Exception e) {
                    e.printStackTrace();
                    return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteAluno(@PathVariable Long id) {
        try {
            Aluno existingAluno = alunoDAO.findById(id);
            if (existingAluno != null) {
                alunoDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}