package com.healpoint.controller;

import com.healpoint.entity.Estado;
import com.healpoint.entity.Medico;
import com.healpoint.entity.Usuario;
import com.healpoint.repository.EstadoRepository;
import com.healpoint.repository.MedicoRepository;
import com.healpoint.repository.UsuarioRepository;
import com.healpoint.service.MonitoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medico")
public class MedicoController {

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    @GetMapping("/mostrarMedicos")
    public List<Medico> getMedicos() {
        return medicoRepository.findAll();
    }

    @GetMapping("/mostrarMedico")
    public Object getMedicoById(@RequestParam Integer id) {

        if (id == null || id <= 0) {
            return "ID inválido";
        }

        var medico = medicoRepository.findById(id).orElse(null);

        if (medico == null) {
            return "No existe el médico con ID " + id;
        }

        return medico;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<Medico> obtenerMedicoPorIdUsuario(@PathVariable Integer idUsuario) {
        return medicoRepository.findByUsuario_IdUsuario(idUsuario)
                .map(medico -> ResponseEntity.ok(medico))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /medico/crearMedico
    @PostMapping("/crearMedico")
    public Object postMedico(
            @RequestBody Medico medico,
            @RequestParam Integer idUsuarioEditor
    ) {

        if (medico.getEspecialidad() == null || medico.getEspecialidad().trim().isEmpty()) {
            return "La especialidad es obligatoria.";
        }

        if (medico.getUsuario() == null || medico.getUsuario().getIdUsuario() == null) {
            return "Debe enviar un usuario válido.";
        }

        Usuario user = usuarioRepository.findById(medico.getUsuario().getIdUsuario()).orElse(null);
        if (user == null) {
            return "El usuario enviado no existe.";
        }

        if (medico.getEstado() == null || medico.getEstado().getIdEstado() == null) {
            return "Debe enviar un estado válido.";
        }

        Estado estado = estadoRepository.findById(medico.getEstado().getIdEstado()).orElse(null);
        if (estado == null) {
            return "El estado enviado no existe.";
        }

        medico.setUsuario(user);
        medico.setEstado(estado);

        Medico nuevo = medicoRepository.save(medico);

        monitoriaService.registrarAccion(
                "medico",
                "CREATE",
                idUsuarioEditor,
                "Se creó un médico con ID " + nuevo.getId_medico()
        );

        return nuevo;
    }

    @PutMapping("/actualizarMedico")
    public Object actualizarMedico(
            @RequestBody Medico medicoData,
            @RequestParam Integer idUsuarioEditor
    ) {

        if (medicoData.getId_medico() == null || medicoData.getId_medico() <= 0) {
            return "Debe enviar un ID válido.";
        }

        return medicoRepository.findById(medicoData.getId_medico()).map(m -> {

            if (medicoData.getEspecialidad() != null) {
                m.setEspecialidad(medicoData.getEspecialidad());
            }

            if (medicoData.getUsuario() != null &&
                    medicoData.getUsuario().getIdUsuario() != null) {

                Usuario user = usuarioRepository.findById(
                        medicoData.getUsuario().getIdUsuario()
                ).orElse(null);

                if (user == null) {
                    return "El usuario enviado no existe.";
                }

                m.setUsuario(user);
            }

            if (medicoData.getEstado() != null &&
                    medicoData.getEstado().getIdEstado() != null) {

                Estado estado = estadoRepository.findById(
                        medicoData.getEstado().getIdEstado()
                ).orElse(null);

                if (estado == null) {
                    return "El estado enviado no existe.";
                }

                m.setEstado(estado);
            }

            medicoRepository.save(m);

            monitoriaService.registrarAccion(
                    "medico",
                    "UPDATE",
                    idUsuarioEditor,
                    "Se actualizó el médico ID " + m.getId_medico()
            );

            return m;

        }).orElse("Médico no encontrado");
    }

    @DeleteMapping("/desactivarMedico")
    public Object desactivarMedico(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor
    ) {

        if (id == null || id <= 0) {
            return "ID inválido.";
        }

        return medicoRepository.findById(id).map(m -> {

            Estado inactivo = estadoRepository.findById(2).orElse(null); // 2 = Inactivo
            if (inactivo == null) {
                return "No se encontró el estado 'Inactivo'.";
            }

            m.setEstado(inactivo);
            medicoRepository.save(m);

            monitoriaService.registrarAccion(
                    "medico",
                    "DELETE",
                    idUsuarioEditor,
                    "Se marcó como inactivo el médico ID " + id
            );

            return "Médico marcado como inactivo";

        }).orElse("No existe un médico con ID " + id);
    }

    @PutMapping("/activarMedico")
    public Object activarMedico(
            @RequestParam Integer id,
            @RequestParam Integer idUsuarioEditor
    ) {

        if (id == null || id <= 0) {
            return "ID inválido.";
        }

        return medicoRepository.findById(id).map(m -> {

            Estado activo = estadoRepository.findById(1).orElse(null); // 1 = Activo
            if (activo == null) {
                return "No se encontró el estado 'Activo'.";
            }

            m.setEstado(activo);
            medicoRepository.save(m);

            monitoriaService.registrarAccion(
                    "medico",
                    "ACTIVATE",
                    idUsuarioEditor,
                    "Se activó el médico ID " + id
            );

            return "Médico activado correctamente";

        }).orElse("No existe un médico con ID " + id);
    }
}
