package com.healpoint.repository;

import com.healpoint.entity.Estado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoRepository extends JpaRepository<Estado,Integer> {

    Optional<Estado> findByNombreEstado(String nombreEstado);
}
