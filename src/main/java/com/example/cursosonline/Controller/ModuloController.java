package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.ModuloDAO;
import com.example.cursosonline.Domain.Modulo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
@CrossOrigin(origins = "*")
public class ModuloController {

    @Autowired
    private ModuloDAO moduloDAO;

    @PostMapping
    public ResponseEntity<Modulo> createModulo(@RequestBody Modulo modulo) {
        try {
            moduloDAO.save(modulo);
            return new ResponseEntity<>(modulo, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modulo> getModuloById(@PathVariable Long id) {
        try {
            Modulo modulo = moduloDAO.findById(id);
            if (modulo != null) {
                return new ResponseEntity<>(modulo, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Modulo>> getAllModulos() {
        try {
            List<Modulo> modulos = moduloDAO.findAll();
            return new ResponseEntity<>(modulos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Modulo> updateModulo(@PathVariable Long id, @RequestBody Modulo modulo) {
        try {
            Modulo existingModulo = moduloDAO.findById(id);
            if (existingModulo != null) {
                modulo.setId(id);
                moduloDAO.update(modulo);
                return new ResponseEntity<>(modulo, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteModulo(@PathVariable Long id) {
        try {
            Modulo existingModulo = moduloDAO.findById(id);
            if (existingModulo != null) {
                moduloDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}