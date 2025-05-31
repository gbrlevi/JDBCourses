package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.CursoInstrutorDAO;
import com.example.cursosonline.DAO.CursoModuloDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relationships")
@CrossOrigin(origins = "*")
public class RelationshipController {

    @Autowired
    private CursoInstrutorDAO cursoInstrutorDAO;

    @Autowired
    private CursoModuloDAO cursoModuloDAO;

    // Curso-Instrutor relationships
    @PostMapping("/curso/{cursoId}/instrutor/{instrutorId}")
    public ResponseEntity<HttpStatus> addInstrutorToCurso(
            @PathVariable Long cursoId,
            @PathVariable Long instrutorId) {
        try {
            cursoInstrutorDAO.save(cursoId, instrutorId);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/curso/{cursoId}/instrutor/{instrutorId}")
    public ResponseEntity<HttpStatus> removeInstrutorFromCurso(
            @PathVariable Long cursoId,
            @PathVariable Long instrutorId) {
        try {
            cursoInstrutorDAO.delete(cursoId, instrutorId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/curso/{cursoId}/instrutores")
    public ResponseEntity<List<Long>> getInstrutoresByCurso(@PathVariable Long cursoId) {
        try {
            List<Long> instrutores = cursoInstrutorDAO.findInstrutoresByCursoId(cursoId);
            return new ResponseEntity<>(instrutores, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/instrutor/{instrutorId}/cursos")
    public ResponseEntity<List<Long>> getCursosByInstrutor(@PathVariable Long instrutorId) {
        try {
            List<Long> cursos = cursoInstrutorDAO.findCursosByInstrutorId(instrutorId);
            return new ResponseEntity<>(cursos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Curso-Modulo relationships
    @PostMapping("/curso/{cursoId}/modulo/{moduloId}")
    public ResponseEntity<HttpStatus> addModuloToCurso(
            @PathVariable Long cursoId,
            @PathVariable Long moduloId) {
        try {
            cursoModuloDAO.save(cursoId, moduloId);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/curso/{cursoId}/modulo/{moduloId}")
    public ResponseEntity<HttpStatus> removeModuloFromCurso(
            @PathVariable Long cursoId,
            @PathVariable Long moduloId) {
        try {
            cursoModuloDAO.delete(cursoId, moduloId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/curso/{cursoId}/modulos")
    public ResponseEntity<List<Long>> getModulosByCurso(@PathVariable Long cursoId) {
        try {
            List<Long> modulos = cursoModuloDAO.findModulosByCursoId(cursoId);
            return new ResponseEntity<>(modulos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/modulo/{moduloId}/cursos")
    public ResponseEntity<List<Long>> getCursosByModulo(@PathVariable Long moduloId) {
        try {
            List<Long> cursos = cursoModuloDAO.findCursosByModuloId(moduloId);
            return new ResponseEntity<>(cursos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}