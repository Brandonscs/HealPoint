package com.healpoint.controller;

import com.healpoint.entity.Monitoria;
import com.healpoint.repository.MonitoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/monitoria")
public class MonitoriaController {

    @Autowired
    private MonitoriaRepository monitoriaRepository;

    @GetMapping("/mostrarMonitorias")
    public ResponseEntity<?> getMonitorias() {
        var lista = monitoriaRepository.findAll();

        if (lista.isEmpty()) {
            return ResponseEntity.ok("No hay registros de monitoría.");
        }

        return ResponseEntity.ok(lista);
    }

    @GetMapping("/mostrarMonitoria")
    public ResponseEntity<?> getMonitoriaById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        var monitoria = monitoriaRepository.findById(id).orElse(null);

        if (monitoria == null) {
            return ResponseEntity.badRequest()
                    .body("No existe la monitoría con ID " + id);
        }

        return ResponseEntity.ok(monitoria);
    }

    @PostMapping("/crearMonitoria")
    public ResponseEntity<?> crearMonitoria(@RequestBody Monitoria monitoria) {

        // Validación simple
        if (monitoria.getTablaAfectada() == null || monitoria.getTablaAfectada().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La tabla afectada no puede estar vacía.");
        }

        if (monitoria.getAccion() == null || monitoria.getAccion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La acción no puede estar vacía.");
        }

        var result = monitoriaRepository.save(monitoria);
        return ResponseEntity.ok(result);
    }
}
