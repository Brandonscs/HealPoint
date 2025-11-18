package com.healpoint.controller;

import com.healpoint.entity.Estado;
import com.healpoint.repository.EstadoRepository;
import com.healpoint.service.MonitoriaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estado")
public class EstadoController {

    private final EstadoRepository estadoRepository;
    private final MonitoriaService monitoriaService;

    public EstadoController(EstadoRepository estadoRepository,
                            MonitoriaService monitoriaService) {
        this.estadoRepository = estadoRepository;
        this.monitoriaService = monitoriaService;
    }

    @GetMapping("/mostrarEstados")
    public ResponseEntity<List<Estado>> getEstados() {
        return ResponseEntity.ok(estadoRepository.findAll());
    }

    @GetMapping("/mostrarEstado")
    public ResponseEntity<?> getEstadoById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("El ID enviado no es válido.");
        }

        Estado estado = estadoRepository.findById(id).orElse(null);

        if (estado == null) {
            return ResponseEntity.badRequest().body("No existe el estado con ID " + id);
        }

        return ResponseEntity.ok(estado);
    }

    @GetMapping("/mostrarEstadoPorNombre")
    public ResponseEntity<?> getEstadoByNombre(@RequestParam String nombre) {

        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Debe ingresar un nombre de estado.");
        }

        Estado estado = estadoRepository.findByNombreEstado(nombre).orElse(null);

        if (estado == null) {
            return ResponseEntity.badRequest()
                    .body("No existe un estado con nombre '" + nombre + "'");
        }

        return ResponseEntity.ok(estado);
    }

    @PostMapping("/crearEstado")
    public ResponseEntity<?> crearEstado(@RequestBody Estado estado,
                                         @RequestParam(required = false) Integer idUsuario) {

        if (estado.getNombreEstado() == null || estado.getNombreEstado().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del estado no puede ser vacío.");
        }

        if (estadoRepository.findByNombreEstado(estado.getNombreEstado()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un estado con ese nombre.");
        }

        Estado nuevo = estadoRepository.save(estado);

        monitoriaService.registrarAccion(
                "estado",
                "CREATE",
                idUsuario,
                "Se creó un nuevo estado: " + nuevo.getNombreEstado()
        );

        return ResponseEntity.ok(nuevo);
    }

    @PutMapping("/actualizarEstado")
    public ResponseEntity<?> actualizarEstado(
            @RequestBody Estado datos,
            @RequestParam(required = false) Integer idUsuario) {

        if (datos.getIdEstado() == null || datos.getIdEstado() <= 0) {
            return ResponseEntity.badRequest().body("El ID del estado es obligatorio y debe ser válido.");
        }

        Estado estado = estadoRepository.findById(datos.getIdEstado()).orElse(null);

        if (estado == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un estado con ID " + datos.getIdEstado());
        }

        if (datos.getNombreEstado() == null || datos.getNombreEstado().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del estado no puede estar vacío.");
        }

        estado.setNombreEstado(datos.getNombreEstado());
        estado.setDescripcion(datos.getDescripcion());

        estadoRepository.save(estado);

        monitoriaService.registrarAccion(
                "estado",
                "UPDATE",
                idUsuario,
                "Se actualizó el estado con ID " + datos.getIdEstado()
        );

        return ResponseEntity.ok("Estado actualizado correctamente.");
    }

    @DeleteMapping("/eliminarEstado")
    public ResponseEntity<?> eliminarEstado(
            @RequestParam Integer id,
            @RequestParam(required = false) Integer idUsuario) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Estado estado = estadoRepository.findById(id).orElse(null);

        if (estado == null) {
            return ResponseEntity.badRequest()
                    .body("No existe el estado con ID " + id);
        }

        estadoRepository.delete(estado);

        monitoriaService.registrarAccion(
                "estado",
                "DELETE",
                idUsuario,
                "Se eliminó el estado con ID " + id
        );

        return ResponseEntity.ok("Estado eliminado exitosamente.");
    }
}
