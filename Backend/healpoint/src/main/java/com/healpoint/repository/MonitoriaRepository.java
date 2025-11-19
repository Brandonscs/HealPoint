package com.healpoint.repository;

import com.healpoint.entity.Monitoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoriaRepository extends JpaRepository<Monitoria, Integer> {

}
