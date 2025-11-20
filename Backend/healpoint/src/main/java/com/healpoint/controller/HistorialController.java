package com.healpoint.controller;

import com.healpoint.entity.Cita;
import com.healpoint.entity.HistorialMedico;
import com.healpoint.repository.HistorialRepository;
import com.healpoint.repository.CitaRepository;

import com.healpoint.service.MonitoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/historial")
public class HistorialController {

    @Autowired
    private HistorialRepository historialRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private MonitoriaService monitoriaService;

    /**
     * GET /historial/mostrarHistoriales → Listar todos los historiales médicos.
     */
    @GetMapping("/mostrarHistoriales")
    public ResponseEntity<List<HistorialMedico>> getHistoriales() {
        return ResponseEntity.ok(historialRepository.findAll());
    }

    /**
     * GET /historial/mostrarHistorialPorCita?idCita=... → Consultar historial por cita.
     */
    @GetMapping("/mostrarHistorialPorCita")
    public ResponseEntity<?> getHistorialPorCita(@RequestParam Integer idCita) {

        Optional<Cita> citaOpt = citaRepository.findById(idCita);
        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("La cita con ID " + idCita + " no existe.");
        }

        Optional<HistorialMedico> historialOpt = historialRepository.findByCita(citaOpt.get());

        if (!historialOpt.isPresent()) {
            return ResponseEntity.ok("No se ha registrado historial médico para la cita ID " + idCita + ".");
        }

        return ResponseEntity.ok(historialOpt.get());
    }

    /**
     * POST /historial/crearHistorial → Registrar nuevo historial médico.
     */
    @PostMapping("/crearHistorial")
    public ResponseEntity<?> postHistorial(@RequestParam Integer idUsuarioEditor, @RequestBody HistorialMedico historialData) {

        if (historialData.getCita() == null || historialData.getCita().getId_cita() == null) {
            return ResponseEntity.badRequest().body("El ID de la cita es obligatorio para registrar el historial.");
        }

        Integer idCita = historialData.getCita().getId_cita();
        Optional<Cita> citaOpt = citaRepository.findById(idCita);

        if (!citaOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se puede registrar historial, la cita ID " + idCita + " no existe.");
        }

        if (historialRepository.findByCita(citaOpt.get()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un historial médico registrado para la cita ID " + idCita + ".");
        }

        HistorialMedico nuevoHistorial = new HistorialMedico();
        nuevoHistorial.setCita(citaOpt.get());
        nuevoHistorial.setObservaciones(historialData.getObservaciones());
        nuevoHistorial.setDiagnostico(historialData.getDiagnostico());
        nuevoHistorial.setTratamiento(historialData.getTratamiento());

        HistorialMedico historialGuardado = historialRepository.save(nuevoHistorial);

        // Monitoreo
        monitoriaService.registrarAccion(
                "historial_medico",
                "CREATE",
                idUsuarioEditor,
                "Se creó el historial médico ID " + historialGuardado.getId_historial()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(historialGuardado);
    }

    /**
     * PUT /historial/actualizarHistorial?idHistorial=... → Actualizar observaciones o diagnóstico.
     */
    @PutMapping("/actualizarHistorial")
    public ResponseEntity<?> putHistorial(@RequestParam Integer idHistorial, @RequestParam Integer idUsuarioEditor,
                                          @RequestBody HistorialMedico datosActualizados) {

        Optional<HistorialMedico> historialOpt = historialRepository.findById(idHistorial);

        if (!historialOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Historial con ID " + idHistorial + " no encontrado.");
        }

        HistorialMedico historialExistente = historialOpt.get();

        if (datosActualizados.getObservaciones() != null) {
            historialExistente.setObservaciones(datosActualizados.getObservaciones());
        }
        if (datosActualizados.getDiagnostico() != null) {
            historialExistente.setDiagnostico(datosActualizados.getDiagnostico());
        }
        if (datosActualizados.getTratamiento() != null) {
            historialExistente.setTratamiento(datosActualizados.getTratamiento());
        }

        HistorialMedico historialActualizado = historialRepository.save(historialExistente);

        // Monitoreo
        monitoriaService.registrarAccion(
                "historial_medico",
                "UPDATE",
                idUsuarioEditor,
                "Se actualizó el historial médico ID " + historialActualizado.getId_historial()
        );

        return ResponseEntity.ok(historialActualizado);
    }

    /**
     * DELETE /historial/eliminarHistorial?idHistorial=... → Eliminar historial.
     */
    @DeleteMapping("/eliminarHistorial")
    public ResponseEntity<?> deleteHistorial(@RequestParam Integer idHistorial, @RequestParam Integer idUsuarioEditor) {

        if (!historialRepository.existsById(idHistorial)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Historial con ID " + idHistorial + " no encontrado para eliminar.");
        }

        try {
            historialRepository.deleteById(idHistorial);

            // Monitoreo
            monitoriaService.registrarAccion(
                    "historial_medico",
                    "DELETE",
                    idUsuarioEditor,
                    "Se eliminó el historial médico ID " + idHistorial
            );

            return ResponseEntity.ok("Historial médico con ID " + idHistorial + " eliminado correctamente.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo eliminar el historial ID " + idHistorial + " debido a un error interno.");
        }
    }
}