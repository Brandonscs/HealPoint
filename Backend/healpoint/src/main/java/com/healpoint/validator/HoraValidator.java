package com.healpoint.validator;

import java.time.LocalDate;
import java.time.LocalTime;

public class HoraValidator {

    private static final LocalTime HORA_MIN = LocalTime.of(6, 0);
    private static final LocalTime HORA_MAX = LocalTime.of(20, 0);

    public static boolean esHoraEnRango(LocalTime hora) {
        if (hora == null) return false;

        return !hora.isBefore(HORA_MIN) && !hora.isAfter(HORA_MAX);
    }

    public static boolean esHoraDelPasado(LocalDate fecha, LocalTime hora) {
        if (fecha.equals(LocalDate.now())) {
            return hora.isBefore(LocalTime.now());
        }
        return false;
    }
}
