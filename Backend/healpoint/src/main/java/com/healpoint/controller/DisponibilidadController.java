package com.healpoint.controller;

import com.healpoint.entity.Disponibilidad;
import com.healpoint.repository.DisponibilidadRepository;
import com.healpoint.repository.MedicoRepository;
import com.healpoint.service.MonitoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disponibilidad")
public class DisponibilidadController {

    private final DisponibilidadRepository disponibilidadRepository;
    private final MedicoRepository medicoRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    public DisponibilidadController(DisponibilidadRepository disponibilidadRepository,
                                    MedicoRepository medicoRepository) {
        this.disponibilidadRepository = disponibilidadRepository;
        this.medicoRepository = medicoRepository;
    }

    // GET → Listar todas las disponibilidades
    @GetMapping("/mostrarDisponibilidades")
    public List<Disponibilidad> getDisponibilidades() {
        return disponibilidadRepository.findAll();
    }

    // GET → Buscar por médico usando id_medico
    @GetMapping("/mostrarDisponibilidad")
    public List<Disponibilidad> getDisponibilidadByMedico(@RequestParam Integer id_medico) {
        return disponibilidadRepository.findByMedico(id_medico);
    }

    // POST → Crear disponibilidad (solo RequestBody)
    @PostMapping("/crearDisponibilidad")
    public Disponibilidad crearDisponibilidad(@RequestBody Disponibilidad disponibilidad,
                                              @RequestParam Integer idUsuarioEditor) {

        medicoRepository.findById(disponibilidad.getMedico().getId_medico())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        Disponibilidad guardada = disponibilidadRepository.save(disponibilidad);

        monitoriaService.registrarAccion(
                "disponibilidad",
                "CREATE",
                idUsuarioEditor,
                "Se creó la disponibilidad ID " + guardada.getId_disponibilidad()
        );

        return guardada;
    }

    // PUT → Actualizar disponibilidad (solo RequestBody)
    @PutMapping("/actualizarDisponibilidad")
    public Disponibilidad actualizarDisponibilidad(@RequestBody Disponibilidad nuevaData,
                                                   @RequestParam Integer idUsuarioEditor) {

        Disponibilidad actualizada = disponibilidadRepository.findById(nuevaData.getId_disponibilidad()).map(d -> {

            d.setFecha(nuevaData.getFecha());
            d.setHora_inicio(nuevaData.getHora_inicio());
            d.setHora_fin(nuevaData.getHora_fin());
            d.setMedico(nuevaData.getMedico());

            Disponibilidad guardada = disponibilidadRepository.save(d);

            monitoriaService.registrarAccion(
                    "disponibilidad",
                    "UPDATE",
                    idUsuarioEditor,
                    "Se actualizó la disponibilidad ID " + guardada.getId_disponibilidad()
            );

            return guardada;

        }).orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        return actualizada;
    }

    // DELETE → Eliminar
    @DeleteMapping("/eliminarDisponibilidad")
    public String eliminarDisponibilidad(@RequestParam Integer id,
                                         @RequestParam Integer idUsuarioEditor) {

        disponibilidadRepository.findById(id).ifPresentOrElse(d -> {
            disponibilidadRepository.delete(d);

            monitoriaService.registrarAccion(
                    "disponibilidad",
                    "DELETE",
                    idUsuarioEditor,
                    "Se eliminó la disponibilidad ID " + id
            );

        }, () -> {
            throw new RuntimeException("Disponibilidad no encontrada");
        });

        return "Disponibilidad eliminada exitosamente.";
    }
}

