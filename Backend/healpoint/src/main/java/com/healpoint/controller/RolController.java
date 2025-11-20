package com.healpoint.controller;

import com.healpoint.entity.Estado;
import com.healpoint.entity.Rol;
import com.healpoint.service.MonitoriaService;
import com.healpoint.repository.EstadoRepository;
import com.healpoint.repository.RolRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rol")
public class RolController {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    @GetMapping("/mostrarRoles")
    public ResponseEntity<?> getRoles() {

        List<Rol> roles = rolRepository.findAll();

        if (roles.isEmpty()) {
            return ResponseEntity.ok("No hay roles registrados.");
        }

        return ResponseEntity.ok(roles);
    }

    @GetMapping("/mostrarRol")
    public ResponseEntity<?> getRolById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Rol rol = rolRepository.findById(id).orElse(null);

        if (rol == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un rol con ID " + id);
        }

        return ResponseEntity.ok(rol);
    }

    @GetMapping("/mostrarRolPorNombre")
    public ResponseEntity<?> getRolByNombre(@RequestParam String nombre) {

        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Debe ingresar un nombre.");
        }

        Rol rol = rolRepository.findByNombreRol(nombre).orElse(null);

        if (rol == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un rol con nombre: " + nombre);
        }

        return ResponseEntity.ok(rol);
    }

    @PostMapping("/crearRol")
    public ResponseEntity<?> crearRol(@RequestBody Rol datos,
                                      @RequestParam Integer idUsuario) {

        if (datos.getNombreRol() == null || datos.getNombreRol().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del rol es obligatorio.");
        }

        if (datos.getEstado() == null || datos.getEstado().getIdEstado() == null) {
            return ResponseEntity.badRequest().body("Debe enviar un estado válido.");
        }

        Estado estado = estadoRepository.findById(datos.getEstado().getIdEstado()).orElse(null);

        if (estado == null) {
            return ResponseEntity.badRequest().body("El estado enviado no existe.");
        }

        if (rolRepository.findByNombreRol(datos.getNombreRol()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un rol con ese nombre.");
        }

        Rol nuevo = new Rol();
        nuevo.setNombreRol(datos.getNombreRol());
        nuevo.setDescripcion(datos.getDescripcion());
        nuevo.setEstado(estado);

        rolRepository.save(nuevo);

        monitoriaService.registrarAccion(
                "rol",
                "CREATE",
                idUsuario,
                "Se creó un nuevo rol: " + nuevo.getNombreRol()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body("Rol creado exitosamente.");
    }


    @PutMapping("/actualizarRol")
    public ResponseEntity<?> actualizarRol(@RequestBody Rol datos,
                                           @RequestParam Integer idUsuario) {

        if (datos.getIdRol() == null || datos.getIdRol() <= 0) {
            return ResponseEntity.badRequest().body("Debe enviar un ID válido.");
        }

        Rol rol = rolRepository.findById(datos.getIdRol()).orElse(null);
        if (rol == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un rol con ID " + datos.getIdRol());
        }

        if (datos.getNombreRol() == null || datos.getNombreRol().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del rol no puede estar vacío.");
        }

        rol.setNombreRol(datos.getNombreRol());
        rol.setDescripcion(datos.getDescripcion());

        rolRepository.save(rol);

        monitoriaService.registrarAccion(
                "rol",
                "UPDATE",
                idUsuario,
                "Se actualizó el rol ID " + datos.getIdRol()
        );

        return ResponseEntity.ok("Rol actualizado correctamente.");
    }

    @DeleteMapping("/eliminarRol")
    public ResponseEntity<?> eliminarRol(@RequestParam Integer id,
                                         @RequestParam Integer idUsuario) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Rol rol = rolRepository.findById(id).orElse(null);

        if (rol == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un rol con ID " + id);
        }

        Estado inactivo = estadoRepository.findById(2).orElse(null);

        if (inactivo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Inactivo'.");
        }

        rol.setEstado(inactivo);
        rolRepository.save(rol);

        monitoriaService.registrarAccion(
                "rol",
                "DELETE",
                idUsuario,
                "Se marcó como inactivo el rol ID " + id
        );

        return ResponseEntity.ok("Rol marcado como inactivo.");
    }

    @PutMapping("/activarRol")
    public ResponseEntity<?> activarRol(@RequestParam Integer id,
                                        @RequestParam Integer idUsuario) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Rol rol = rolRepository.findById(id).orElse(null);

        if (rol == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un rol con ID " + id);
        }

        Estado activo = estadoRepository.findById(1).orElse(null);

        if (activo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Activo'.");
        }

        rol.setEstado(activo);
        rolRepository.save(rol);

        monitoriaService.registrarAccion(
                "rol",
                "ACTIVATE",
                idUsuario,
                "Se activó el rol ID " + id
        );

        return ResponseEntity.ok("Rol activado correctamente.");
    }
}
