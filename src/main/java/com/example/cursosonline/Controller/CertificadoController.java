package com.example.cursosonline.Controller;

import com.example.cursosonline.DAO.CertificadoDAO;
import com.example.cursosonline.Domain.Certificado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificados")
@CrossOrigin(origins = "*")
public class CertificadoController {

    @Autowired
    private CertificadoDAO certificadoDAO;

    @PostMapping
    public ResponseEntity<Certificado> createCertificado(@RequestBody Certificado certificado) {
        try {
            certificadoDAO.save(certificado);
            return new ResponseEntity<>(certificado, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificado> getCertificadoById(@PathVariable Long id) {
        try {
            Certificado certificado = certificadoDAO.findById(id);
            if (certificado != null) {
                return new ResponseEntity<>(certificado, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<Certificado>> getCertificadosByAlunoId(@PathVariable Long alunoId) {
        try {
            List<Certificado> certificados = certificadoDAO.findByAlunoId(alunoId);
            return new ResponseEntity<>(certificados, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCertificado(@PathVariable Long id) {
        try {
            Certificado existingCertificado = certificadoDAO.findById(id);
            if (existingCertificado != null) {
                certificadoDAO.delete(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}