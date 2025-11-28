import React, { useState } from "react";
import { Dayjs } from "dayjs";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Popover from "@mui/material/Popover";
import type { DateRangePickerProps } from "../type";

// 날짜 범위 선택 컴포넌트
export default function DateRangePicker({
  value,
  onChange,
  label = "YYYY-MM-DD~YYYY-MM-DD", // 기본 라벨
}: DateRangePickerProps) {
  // Popover를 열기 위한 anchor 요소 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // 임시 시작 날짜 (첫 번째 클릭 시 저장)
  const [tempStart, setTempStart] = useState<Dayjs | null>(null);

  // 달력 열기 (Box 클릭 시 실행)
  const openPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 달력 닫기 (선택 완료 또는 닫기 시 실행)
  const closePicker = () => {
    setAnchorEl(null);
    setTempStart(null); // 임시 시작 날짜 초기화
  };

  // 날짜 선택 처리
  const handleSelect = (date: Dayjs) => {
    if (!tempStart) {
      // 첫 번째 클릭 → 시작 날짜 저장
      setTempStart(date);
    } else {
      // 두 번째 클릭 → 종료 날짜 저장 후 범위 확정
      const start = tempStart;
      const end = date;
      // 시작과 종료 순서 보정 (end가 start보다 앞서면 swap)
      onChange(end.isBefore(start) ? [end, start] : [start, end]);
      closePicker(); // 선택 완료 후 닫기
    }
  };

  // Popover 열림 여부
  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* 날짜 범위 표시 박스 (항상 보임) */}
      <Box
        onClick={openPicker} // 클릭 시 달력 열기
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "white",
          border: "1px solid rgba(0,0,0,0.23)",
          borderRadius: 1,
          fontSize: value[0] && value[1] ? 16 : 14, // 날짜 선택 전은 작게, 선택 후는 크게
          px: 1.5,
          py: 1.2,
          width: 220,
          cursor: "pointer",
        }}
      >
        <span>
          {/* 날짜 선택 완료 시 → YYYY-MM-DD ~ YYYY-MM-DD 표시 */}
          {
            value[0] && value[1]
              ? `${value[0].format("YYYY-MM-DD")} ~ ${value[1].format(
                  "YYYY-MM-DD"
                )}`
              : label /* 선택 전에는 기본 라벨 표시 */
          }
        </span>
        <CalendarTodayIcon fontSize="small" /> {/* 달력 아이콘 */}
      </Box>

      {/* Popover: 클릭 시 표시되는 달력 */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box display="flex" p={1}>
          {/* 시작 날짜 달력 */}
          <DateCalendar
            value={value[0]}
            onChange={(v) => v && handleSelect(v)}
          />
          {/* 종료 날짜 달력 */}
          <DateCalendar
            value={value[1]}
            onChange={(v) => v && handleSelect(v)}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
}
