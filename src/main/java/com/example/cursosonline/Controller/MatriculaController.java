package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.MatriculaDAO;
import com.example.cursosonline.Domain.Matricula;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
public class MatriculaController {

    @Autowired
    private MatriculaDAO matriculaDAO;

    @PostMapping
    public ResponseEntity<Matricula> createMatricula(@RequestBody Matricula matricula) {
        try {
            matriculaDAO.save(matricula);
            return new ResponseEntity<>(matricula, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matricula> getMatriculaById(@PathVariable Long id) {
        try {
            Matricula matricula = matriculaDAO.findById(id);
            if (matricula != null) {
                return new ResponseEntity<>(matricula, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<Matricula>> getMatriculasByAlunoId(@PathVariable Long alunoId) {
        try {
            List<Matricula> matriculas = matriculaDAO.findByAlunoId(alunoId);
            return new ResponseEntity<>(matriculas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Matricula>> getMatriculasByCursoId(@PathVariable Long cursoId) {
        try {
            List<Matricula> matriculas = matriculaDAO.findByCursoId(cursoId);
            return new ResponseEntity<>(matriculas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Matricula> updateMatricula(@PathVariable Long id, @RequestBody Matricula matricula) {
        try {
            Matricula existingMatricula = matriculaDAO.findById(id);
            if (existingMatricula != null) {
                matricula.setId(id);
                matriculaDAO.update(matricula);
                return new ResponseEntity<>(matricula, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMatricula(@PathVariable Long id) {
        try {
            Matricula existingMatricula = matriculaDAO.findById(id);
            if (existingMatricula != null) {
                matriculaDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}