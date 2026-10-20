package com.medimind.agent;

import com.medimind.medication.FrequencyType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    @Test
    void testUserPrompt_ShankpushpiTwiceDaily_ResolvesExactlyTwiceDailyAndMorningNightTimes() {
        String prompt = "start medication of shankpushpi from today for 7 days and for 2 times a da one in the morning and one at night";

        FrequencyType freq = controller.resolveFrequency(prompt, FrequencyType.ONCE_DAILY);
        assertEquals(FrequencyType.TWICE_DAILY, freq, "Must recognize '2 times a da' as TWICE_DAILY");

        List<String> times = controller.resolveReminderTimes(freq, null, prompt);
        assertNotNull(times);
        assertEquals(2, times.size(), "Must generate exactly 2 reminder times, not 3");
        assertEquals("09:00", times.get(0));
        assertEquals("21:00", times.get(1));
    }

    @Test
    void testUserPrompt_ThriceDaily_CapsAtThreeTimes() {
        String prompt = "take antibiotic 3 times a day morning, afternoon and night";

        FrequencyType freq = controller.resolveFrequency(prompt, FrequencyType.ONCE_DAILY);
        assertEquals(FrequencyType.THREE_TIMES_DAILY, freq);

        List<String> times = controller.resolveReminderTimes(freq, List.of("08:00", "12:00", "16:00", "20:00"), prompt);
        assertNotNull(times);
        assertEquals(3, times.size(), "Must cap at 3 times daily");
    }
}
