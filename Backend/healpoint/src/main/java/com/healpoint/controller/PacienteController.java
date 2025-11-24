package com.healpoint.controller;

import com.healpoint.entity.Estado;
import com.healpoint.entity.Paciente;
import com.healpoint.entity.Usuario;
import com.healpoint.repository.EstadoRepository;
import com.healpoint.repository.PacienteRepository;
import com.healpoint.repository.UsuarioRepository;
import com.healpoint.service.MonitoriaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/paciente")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    @GetMapping("/mostrarPacientes")
    public ResponseEntity<?> getPacientes() {
        List<Paciente> lista = pacienteRepository.findAll();

        if (lista.isEmpty()) {
            return ResponseEntity.ok("No hay pacientes registrados.");
        }

        return ResponseEntity.ok(lista);
    }

    @GetMapping("/mostrarPaciente")
    public ResponseEntity<?> getPacienteById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Paciente paciente = pacienteRepository.findById(id).orElse(null);

        if (paciente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un paciente con ID " + id);
        }

        return ResponseEntity.ok(paciente);
    }

    @PostMapping("/crearPaciente")
    public ResponseEntity<?> crearPaciente(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idUsuarioEditor,
            @RequestBody Paciente datos) {

        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            return ResponseEntity.badRequest().body("El usuario asociado no existe.");
        }

        if (datos.getEps() == null || datos.getEps().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La EPS es obligatoria.");
        }

        Estado estado = estadoRepository.findById(1).orElse(null);
        if (estado == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Activo'.");
        }

        Paciente nuevo = new Paciente(
                datos.getEps(),
                usuario,
                estado
        );

        pacienteRepository.save(nuevo);

        monitoriaService.registrarAccion(
                "paciente",
                "CREATE",
                idUsuarioEditor,
                "Se creó paciente para el usuario ID " + idUsuario
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Paciente creado exitosamente.");
    }

    @PutMapping("/actualizarPaciente")
    public ResponseEntity<?> actualizarPaciente(
            @RequestBody Paciente datos,
            @RequestParam Integer idUsuarioEditor) {

        if (datos.getIdPaciente() == null || datos.getIdPaciente() <= 0) {
            return ResponseEntity.badRequest().body("El ID del paciente es obligatorio.");
        }

        Paciente paciente = pacienteRepository.findById(datos.getIdPaciente()).orElse(null);

        if (paciente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un paciente con ID " + datos.getIdPaciente());
        }

        if (datos.getEps() == null || datos.getEps().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La EPS no puede estar vacía.");
        }

        paciente.setEps(datos.getEps());
        pacienteRepository.save(paciente);

        monitoriaService.registrarAccion(
                "paciente",
                "UPDATE",
                idUsuarioEditor,
                "Se actualizó paciente ID " + datos.getIdPaciente()
        );

        return ResponseEntity.ok("Paciente actualizado correctamente.");
    }

    @DeleteMapping("/eliminarPaciente")
    public ResponseEntity<?> eliminarPaciente(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Paciente paciente = pacienteRepository.findById(id).orElse(null);

        if (paciente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un paciente con ID " + id);
        }

        Estado inactivo = estadoRepository.findById(2).orElse(null);
        if (inactivo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Inactivo'.");
        }

        paciente.setEstado(inactivo);
        pacienteRepository.save(paciente);

        monitoriaService.registrarAccion(
                "paciente",
                "DELETE",
                idUsuarioEditor,
                "Se marcó como inactivo el paciente ID " + id
        );

        return ResponseEntity.ok("Paciente marcado como inactivo.");
    }

    @PutMapping("/activarPaciente")
    public ResponseEntity<?> activarPaciente(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Paciente paciente = pacienteRepository.findById(id).orElse(null);

        if (paciente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un paciente con ID " + id);
        }

        Estado activo = estadoRepository.findById(1).orElse(null);

        if (activo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Activo'.");
        }

        paciente.setEstado(activo);
        pacienteRepository.save(paciente);

        monitoriaService.registrarAccion(
                "paciente",
                "ACTIVATE",
                idUsuarioEditor,
                "Se activó el paciente ID " + id
        );

        return ResponseEntity.ok("Paciente activado correctamente.");
    }
}
