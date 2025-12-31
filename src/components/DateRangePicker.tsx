import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";

import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";

import Popover from "@mui/material/Popover";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";

import type { DateRange } from "@mui/x-date-pickers-pro";

interface Props {
  value: DateRange<Dayjs>;
  onChange: (range: DateRange<Dayjs>) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempStart, setTempStart] = useState<Dayjs | null>(value[0]);
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(value[1]);

  const today = dayjs();

  /* ------------------ 날짜 선택 ------------------ */
  const handleDateSelect = (date: Dayjs | null) => {
    if (!date) return;

    if (!tempStart || tempEnd) {
      setTempStart(date.startOf("day"));
      setTempEnd(null);
      return;
    }

    if (date.isBefore(tempStart, "day")) {
      setTempEnd(tempStart.endOf("day"));
      setTempStart(date.startOf("day"));
    } else {
      setTempEnd(date.endOf("day"));
    }
  };

  const confirm = () => {
    if (tempStart && tempEnd) {
      onChange([tempStart, tempEnd]);
      setAnchorEl(null);
    }
  };

  /* ------------------ 상태 판단 ------------------ */
  const isStart = (d: Dayjs) => tempStart && d.isSame(tempStart, "day");
  const isEnd = (d: Dayjs) => tempEnd && d.isSame(tempEnd, "day");
  const isInRange = (d: Dayjs) =>
    tempStart &&
    tempEnd &&
    d.isAfter(tempStart, "day") &&
    d.isBefore(tempEnd, "day");

  const isToday = (d: Dayjs) => d.isSame(today, "day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      {/* 입력 */}
      <div
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-2 px-3 py-2 border rounded w-[260px] cursor-pointer bg-white"
      >
        <span className="flex-1 text-sm">
          {value[0] && value[1]
            ? `${value[0].format("YYYY-MM-DD")} ~ ${value[1].format(
                "YYYY-MM-DD"
              )}`
            : "날짜 선택"}
        </span>
        <CalendarTodayIcon fontSize="small" />
      </div>

      {/* 팝오버 */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className="p-4 w-[360px]">
          {/* 상단 선택된 날짜 */}
          <div className="flex gap-2 mb-4">
            <DateBox
              label="Start"
              date={tempStart}
              active={!tempEnd}
              onClear={() => setTempStart(null)}
            />
            <DateBox
              label="End"
              date={tempEnd}
              active={!!tempEnd}
              onClear={() => setTempEnd(null)}
            />
          </div>

          <DateCalendar
            value={tempEnd || tempStart}
            onChange={handleDateSelect}
            showDaysOutsideCurrentMonth
            slots={{
              day: (props: PickersDayProps) => {
                const d = props.day;
                const start = isStart(d);
                const end = isEnd(d);
                const inRange = isInRange(d);

                return (
                  <div className="relative">
                    {/* range background */}
                    {inRange && (
                      <div className="absolute inset-0 bg-blue-100 z-0" />
                    )}

                    <PickersDay
                      {...props}
                      disableRipple
                      className={`
                        relative z-10
                        ${start || end ? "!bg-blue-600 !text-white" : ""}
                        ${start || end ? "!rounded-full" : ""}
                        ${
                          isToday(d) && !start && !end
                            ? "!border !border-blue-500"
                            : ""
                        }
                        hover:!bg-blue-200
                      `}
                    />
                  </div>
                );
              },
            }}
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={confirm}
              disabled={!tempStart || !tempEnd}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded disabled:opacity-40"
            >
              선택
            </button>
          </div>
        </div>
      </Popover>
    </LocalizationProvider>
  );
}

/* ------------------ 상단 날짜 박스 ------------------ */
function DateBox({
  label,
  date,
  active,
  onClear,
}: {
  label: string;
  date: Dayjs | null;
  active?: boolean;
  onClear?: () => void;
}) {
  return (
    <div
      className={`flex-1 px-3 py-2 rounded-lg ${
        active ? "bg-white border" : "bg-gray-100"
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            active ? "text-blue-600 font-medium" : ""
          }`}
        >
          {date ? date.format("MM/DD/YYYY") : "--"}
        </span>
        {date && onClear && (
          <button onClick={onClear}>
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>
    </div>
  );
}
