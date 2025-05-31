package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.AulaDAO;
import com.example.cursosonline.Domain.Aula;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@CrossOrigin(origins = "*")
public class AulaController {

    @Autowired
    private AulaDAO aulaDAO;

    @PostMapping
    public ResponseEntity<Aula> createAula(@RequestBody Aula aula) {
        try {
            aulaDAO.save(aula);
            return new ResponseEntity<>(aula, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aula> getAulaById(@PathVariable Long id) {
        try {
            Aula aula = aulaDAO.findById(id);
            if (aula != null) {
                return new ResponseEntity<>(aula, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Aula>> getAllAulas() {
        try {
            List<Aula> aulas = aulaDAO.findAll();
            return new ResponseEntity<>(aulas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<Aula>> getAulasByModuloId(@PathVariable Long moduloId) {
        try {
            List<Aula> aulas = aulaDAO.findByModuloId(moduloId);
            return new ResponseEntity<>(aulas, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aula> updateAula(@PathVariable Long id, @RequestBody Aula aula) {
        try {
            Aula existingAula = aulaDAO.findById(id);
            if (existingAula != null) {
                aula.setId(id);
                aulaDAO.update(aula);
                return new ResponseEntity<>(aula, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteAula(@PathVariable Long id) {
        try {
            Aula existingAula = aulaDAO.findById(id);
            if (existingAula != null) {
                aulaDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}