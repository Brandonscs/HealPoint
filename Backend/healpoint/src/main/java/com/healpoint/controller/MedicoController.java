package com.healpoint.controller;

import com.healpoint.entity.Medico;
import com.healpoint.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/medico")
public class MedicoController {

    @Autowired
    private MedicoRepository medicoRepository;


    @GetMapping("/mostrarMedicos")
    public List<Medico> getMedicos() {
        return medicoRepository.findAll();
    }


    @GetMapping("/mostrarMedico")
    public Optional<Medico> getMedicoById(@RequestParam Integer id) {
        return medicoRepository.findById(id);
    }

    // POST /medico/crearMedico
    @PostMapping("/crearMedico")
    public Medico postMedico(@RequestBody Medico medico) {
        return medicoRepository.save(medico);
    }

    @PutMapping("/actualizarMedico")
    public Medico actualizarMedico(@RequestBody Medico medicoData) {

        return medicoRepository.findById(medicoData.getId_medico()).map(m -> {

            m.setEspecialidad(medicoData.getEspecialidad());
            m.setUsuario(medicoData.getUsuario());

            return medicoRepository.save(m);

        }).orElseThrow(() -> new RuntimeException("Médico no encontrado"));
    }

    // DELETE /medico/eliminarMedico?id=#
    @DeleteMapping("/eliminarMedico")
    public String deleteMedico(@RequestParam Integer id) {
        medicoRepository.deleteById(id);
        return "Médico eliminado correctamente";
    }
}
