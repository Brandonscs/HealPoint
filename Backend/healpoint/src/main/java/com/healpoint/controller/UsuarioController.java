package com.healpoint.controller;

import com.healpoint.entity.Estado;
import com.healpoint.entity.Rol;
import com.healpoint.entity.Usuario;
import com.healpoint.repository.EstadoRepository;
import com.healpoint.repository.RolRepository;
import com.healpoint.repository.UsuarioRepository;
import com.healpoint.service.MonitoriaService;

import com.healpoint.validator.EmailValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    @GetMapping("/mostrarUsuarios")
    public ResponseEntity<?> getUsuarios() {

        List<Usuario> usuarios = usuarioRepository.findAll();

        if (usuarios.isEmpty()) {
            return ResponseEntity.ok("No hay usuarios registrados.");
        }

        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/mostrarUsuario")
    public ResponseEntity<?> getUsuarioById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un usuario con ID " + id);
        }

        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/crearUsuario")
    public ResponseEntity<?> crearUsuario(
            @RequestBody Usuario datos,
            @RequestParam Integer idUsuarioEditor) {

        if (datos.getNombre() == null || datos.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre es obligatorio.");
        }
        if (datos.getApellido() == null || datos.getApellido().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El apellido es obligatorio.");
        }
        if (!EmailValidator.esCorreoValido(datos.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo no tiene un formato válido.");
        }
        if (usuarioRepository.findByCorreo(datos.getCorreo()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un usuario con ese correo.");
        }

        if (datos.getRol() == null || datos.getRol().getIdRol() == null) {
            return ResponseEntity.badRequest().body("Debe indicar un rol válido.");
        }

        if (datos.getEstado() == null || datos.getEstado().getIdEstado() == null) {
            return ResponseEntity.badRequest().body("Debe indicar un estado válido.");
        }

        Rol rol = rolRepository.findById(datos.getRol().getIdRol()).orElse(null);
        if (rol == null) {
            return ResponseEntity.badRequest().body("El rol enviado no existe.");
        }

        Estado estado = estadoRepository.findById(datos.getEstado().getIdEstado()).orElse(null);
        if (estado == null) {
            return ResponseEntity.badRequest().body("El estado enviado no existe.");
        }

        datos.setRol(rol);
        datos.setEstado(estado);

        usuarioRepository.save(datos);

        monitoriaService.registrarAccion(
                "usuario",
                "CREATE",
                idUsuarioEditor,
                "Creó el usuario con correo: " + datos.getCorreo()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(datos);
    }

    @PutMapping("/actualizarUsuario")
    public ResponseEntity<?> actualizarUsuario(
            @RequestBody Usuario datos,
            @RequestParam Integer idUsuarioEditor) {

        if (datos.getIdUsuario() == null || datos.getIdUsuario() <= 0) {
            return ResponseEntity.badRequest().body("El ID del usuario es obligatorio y debe ser válido.");
        }

        Usuario usuario = usuarioRepository.findById(datos.getIdUsuario()).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un usuario con ID " + datos.getIdUsuario());
        }

        if (datos.getNombre() == null || datos.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre no puede estar vacío.");
        }
        if (datos.getApellido() == null || datos.getApellido().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El apellido no puede estar vacío.");
        }
        if (!EmailValidator.esCorreoValido(datos.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo no tiene un formato válido.");
        }

        usuarioRepository.findByCorreo(datos.getCorreo()).ifPresent(existing -> {
            if (!existing.getIdUsuario().equals(datos.getIdUsuario())) {
                throw new RuntimeException("Ya existe otro usuario con ese correo.");
            }
        });

        usuario.setNombre(datos.getNombre());
        usuario.setApellido(datos.getApellido());
        usuario.setCorreo(datos.getCorreo());
        usuario.setDireccion(datos.getDireccion());
        usuario.setTelefono(datos.getTelefono());
        usuario.setFechaNacimiento(datos.getFechaNacimiento());
        usuario.setContrasena(datos.getContrasena());

        if (datos.getRol() != null && datos.getRol().getIdRol() != null) {
            Rol rol = rolRepository.findById(datos.getRol().getIdRol()).orElse(null);
            if (rol == null) {
                return ResponseEntity.badRequest().body("El rol enviado no existe.");
            }
            usuario.setRol(rol);
        }

        if (datos.getEstado() != null && datos.getEstado().getIdEstado() != null) {
            Estado estado = estadoRepository.findById(datos.getEstado().getIdEstado()).orElse(null);
            if (estado == null) {
                return ResponseEntity.badRequest().body("El estado enviado no existe.");
            }
            usuario.setEstado(estado);
        }

        usuarioRepository.save(usuario);

        monitoriaService.registrarAccion(
                "usuario",
                "UPDATE",
                idUsuarioEditor,
                "Actualizó el usuario ID " + datos.getIdUsuario()
        );

        return ResponseEntity.ok("Usuario actualizado correctamente.");
    }

    @DeleteMapping("/eliminarUsuario")
    public ResponseEntity<?> eliminarUsuario(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Usuario usuario = usuarioRepository.findById(7).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un usuario con ID " + id);
        }

        Estado inactivo = estadoRepository.findById(2).orElse(null);

        if (inactivo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Inactivo'.");
        }

        usuario.setEstado(inactivo);
        usuarioRepository.save(usuario);

        monitoriaService.registrarAccion(
                "usuario",
                "DELETE",
                idUsuarioEditor,
                "Inactivó el usuario ID " + id
        );

        return ResponseEntity.ok("Usuario marcado como inactivo.");
    }

    @PutMapping("/activarUsuario")
    public ResponseEntity<?> activarUsuario(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido.");
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe un usuario con ID " + id);
        }

        Estado activo = estadoRepository.findById(1).orElse(null);

        if (activo == null) {
            return ResponseEntity.badRequest().body("No se encontró el estado 'Activo'.");
        }

        usuario.setEstado(activo);
        usuarioRepository.save(usuario);

        monitoriaService.registrarAccion(
                "usuario",
                "ACTIVATE",
                idUsuarioEditor,
                "Activó el usuario ID " + id
        );

        return ResponseEntity.ok("Usuario activado correctamente.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario datos) {

        if (datos.getCorreo() == null || datos.getContrasena() == null) {
            return ResponseEntity.badRequest().body("Correo y contraseña requeridos.");
        }

        Usuario usuario = usuarioRepository.findByCorreo(datos.getCorreo())
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("El correo no está registrado.");
        }

        // Validar contraseña
        if (!usuario.getContrasena().equals(datos.getContrasena())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña incorrecta.");
        }

        if (usuario.getEstado().getIdEstado() != 2) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("El usuario está inactivo.");
        }

        // Evitar enviar contraseña al frontend
        usuario.setContrasena(null);

        return ResponseEntity.ok(usuario);
    }
}
