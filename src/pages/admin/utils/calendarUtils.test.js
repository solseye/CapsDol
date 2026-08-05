import { buildAdminCalendarEvents } from "./calendarUtils";

function createSchedule({ date, time, reservation }) {
  return {
    selected_date: date,
    selected_time: time,
    field: "회계",
    reservations: [reservation],
  };
}

describe("buildAdminCalendarEvents confirmed reservation duration", () => {
  test("renders a 30-minute confirmed reservation once across candidate schedules", () => {
    const reservation = {
      reservation_id: 101,
      status: "approved",
      username: "테스트 사용자",
      confirmed_range: {
        date: "2026-08-06",
        start_time: "10:00",
        end_time: "10:30",
      },
    };

    const schedules = [
      createSchedule({ date: "2026-08-06", time: "09:00", reservation }),
      createSchedule({ date: "2026-08-06", time: "10:00", reservation }),
      createSchedule({ date: "2026-08-07", time: "14:00", reservation }),
    ];

    const events = buildAdminCalendarEvents({ schedules, blocks: [] });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      targetId: 101,
      date: "2026-08-06",
      time: "10:00",
      endTime: "10:30",
      slotSpan: 1,
      isExtension: false,
    });
  });

  test("keeps a genuinely 90-minute confirmed reservation at three slots", () => {
    const reservation = {
      reservation_id: 102,
      status: "confirmed",
      confirmed_range: {
        date: "2026-08-06",
        start_time: "13:00",
        end_time: "14:30",
      },
    };

    const events = buildAdminCalendarEvents({
      schedules: [
        createSchedule({ date: "2026-08-06", time: "12:00", reservation }),
      ],
      blocks: [],
    });

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      time: "13:00",
      endTime: "14:30",
      slotSpan: 3,
      isExtension: false,
    });
    expect(events.slice(1).every((event) => event.isExtension)).toBe(true);
  });

  test("falls back to 30 minutes when the confirmed end time is missing", () => {
    const reservation = {
      reservation_id: 103,
      status: "approved",
      approved_start_time: "15:30",
      approved_date: "2026-08-08",
    };

    const events = buildAdminCalendarEvents({
      schedules: [
        createSchedule({ date: "2026-08-08", time: "15:00", reservation }),
      ],
      blocks: [],
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      date: "2026-08-08",
      time: "15:30",
      endTime: "16:00",
      slotSpan: 1,
    });
  });
});
