package com.medimind.agent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SchedulerAgentDateResolutionTest {

    private SchedulerAgentController controller;

    @BeforeEach
    void setUp() {
        controller = new SchedulerAgentController(null, null, null);
    }

    @Test
    void testScheduleMeetingOnFriday_WhenTodayIsTuesday() {
        // Given: Tuesday, October 20, 2026
        LocalDate tuesday = LocalDate.of(2026, 10, 20);
        assertEquals(DayOfWeek.TUESDAY, tuesday.getDayOfWeek());

        String prompt = "schedule meeting with dr. gupta on friday";
        LocalDateTime resolved = controller.resolveAppointmentDateTime(
                null,
                "FRIDAY",
                prompt,
                tuesday
        );

        assertNotNull(resolved);
        assertEquals(DayOfWeek.FRIDAY, resolved.getDayOfWeek(), "Appointment day must be Friday");
        assertEquals(LocalDate.of(2026, 10, 23), resolved.toLocalDate(), "Must schedule on upcoming Friday (Oct 23), not Wednesday");
        assertEquals(10, resolved.getHour(), "Default hour should be 10 AM");
    }

    @Test
    void testScheduleMeetingOnFridayWithTime_WhenTodayIsTuesday() {
        // Given: Tuesday, October 20, 2026
        LocalDate tuesday = LocalDate.of(2026, 10, 20);

        String prompt = "schedule meeting with dr. gupta on friday at 4pm";
        LocalDateTime resolved = controller.resolveAppointmentDateTime(
                null,
                "FRIDAY",
                prompt,
                tuesday
        );

        assertNotNull(resolved);
        assertEquals(DayOfWeek.FRIDAY, resolved.getDayOfWeek());
        assertEquals(LocalDate.of(2026, 10, 23), resolved.toLocalDate());
        assertEquals(16, resolved.getHour(), "Hour should be 16 (4 PM)");
        assertEquals(0, resolved.getMinute());
    }

    @Test
    void testOverridesHallucinatedWednesdayFromLLM_WhenUserAskedForFriday() {
        // Given: LLM erroneously returned Wednesday's date in apptTimeStr, but user prompt requested Friday
        LocalDate tuesday = LocalDate.of(2026, 10, 20);
        String prompt = "schedule meeting with dr. gupta on friday";
        String hallucinatedApptTime = "2026-10-21T10:00:00"; // Wednesday

        LocalDateTime resolved = controller.resolveAppointmentDateTime(
                hallucinatedApptTime,
                "FRIDAY",
                prompt,
                tuesday
        );

        assertNotNull(resolved);
        assertEquals(DayOfWeek.FRIDAY, resolved.getDayOfWeek(), "Must strictly override LLM hallucinated Wednesday to Friday");
        assertEquals(LocalDate.of(2026, 10, 23), resolved.toLocalDate());
    }

    @Test
    void testTomorrowRelativeScheduling() {
        LocalDate tuesday = LocalDate.of(2026, 10, 20);
        String prompt = "meet dr. gupta tomorrow at 11:30 am";

        LocalDateTime resolved = controller.resolveAppointmentDateTime(
                null,
                null,
                prompt,
                tuesday
        );

        assertNotNull(resolved);
        assertEquals(LocalDate.of(2026, 10, 21), resolved.toLocalDate());
        assertEquals(11, resolved.getHour());
        assertEquals(30, resolved.getMinute());
    }

    @Test
    void testMedicationStartDateOnFriday() {
        LocalDate tuesday = LocalDate.of(2026, 10, 20);
        String prompt = "start Metformin 500mg from friday";

        LocalDate startDate = controller.resolveStartDate(
                null,
                "FRIDAY",
                prompt,
                tuesday
        );

        assertNotNull(startDate);
        assertEquals(DayOfWeek.FRIDAY, startDate.getDayOfWeek());
        assertEquals(LocalDate.of(2026, 10, 23), startDate);
    }
}
