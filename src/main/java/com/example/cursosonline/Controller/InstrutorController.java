package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.InstrutorDAO;
import com.example.cursosonline.Domain.Instrutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instrutores")
@CrossOrigin(origins = "*")
public class InstrutorController {

    @Autowired
    private InstrutorDAO instrutorDAO;

    @PostMapping
    public ResponseEntity<Instrutor> createInstrutor(@RequestBody Instrutor instrutor) {
        try {
            instrutorDAO.save(instrutor);
            return new ResponseEntity<>(instrutor, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instrutor> getInstrutorById(@PathVariable Long id) {
        try {
            Instrutor instrutor = instrutorDAO.findById(id);
            if (instrutor != null) {
                return new ResponseEntity<>(instrutor, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Instrutor>> getAllInstrutores() {
        try {
            List<Instrutor> instrutores = instrutorDAO.findAll();
            return new ResponseEntity<>(instrutores, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instrutor> updateInstrutor(@PathVariable Long id, @RequestBody Instrutor instrutor) {
        try {
            Instrutor existingInstrutor = instrutorDAO.findById(id);
            if (existingInstrutor != null) {
                instrutor.setId(id);
                instrutorDAO.update(instrutor);
                return new ResponseEntity<>(instrutor, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteInstrutor(@PathVariable Long id) {
        try {
            Instrutor existingInstrutor = instrutorDAO.findById(id);
            if (existingInstrutor != null) {
                instrutorDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}