package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.AvaliacaoDAO;
import com.example.cursosonline.Domain.Avaliacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
@CrossOrigin(origins = "*")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoDAO avaliacaoDAO;

    @PostMapping
    public ResponseEntity<Avaliacao> createAvaliacao(@RequestBody Avaliacao avaliacao) {
        try {
            avaliacaoDAO.save(avaliacao);
            return new ResponseEntity<>(avaliacao, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avaliacao> getAvaliacaoById(@PathVariable Long id) {
        try {
            Avaliacao avaliacao = avaliacaoDAO.findById(id);
            if (avaliacao != null) {
                return new ResponseEntity<>(avaliacao, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Avaliacao>> getAllAvaliacoes() {
        try {
            List<Avaliacao> avaliacoes = avaliacaoDAO.findAll();
            if (avaliacoes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(avaliacoes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<Avaliacao>> getAvaliacoesByAlunoId(@PathVariable Long alunoId) {
        try {
            List<Avaliacao> avaliacoes = avaliacaoDAO.findByAlunoId(alunoId);
            return new ResponseEntity<>(avaliacoes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteAvaliacao(@PathVariable Long id) {
        try {
            Avaliacao existingAvaliacao = avaliacaoDAO.findById(id);
            if (existingAvaliacao != null) {
                avaliacaoDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}