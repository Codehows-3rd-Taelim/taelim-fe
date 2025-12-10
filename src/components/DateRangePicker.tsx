import React, { useState } from "react";
import { Dayjs } from "dayjs";
import { Box, Button } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Popover from "@mui/material/Popover";
import type { DateRangePickerProps } from "../type";
import "dayjs/locale/ko";

export default function DateRangePicker({
  value, // [startDate, endDate] 형태의 Dayjs 배열
  onChange, // 부모에서 전달된 변경 이벤트 콜백
  label = "YYYY-MM-DD~YYYY-MM-DD", // 기본 표시 라벨
}: DateRangePickerProps) {
  // 📌 달력을 열기 위한 Popover 기준 요소
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 📌 임시로 선택하는 시작일 / 종료일 (확정되기 전 상태)
  const [tempStart, setTempStart] = useState<Dayjs | null>(value[0] || null);
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(value[1] || null);

  // 📌 날짜 선택 UI 열기
  const openPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // 클릭한 Box 기준으로 Popover 열기
    setTempStart(value[0] || null); // 기존 선택값 임시 저장
    setTempEnd(value[1] || null);
  };

  // 📌 날짜 선택 UI 닫기
  const closePicker = () => {
    setAnchorEl(null);
  };

  // 📌 날짜 선택 확정 (확인 버튼)
  const handleConfirm = () => {
    if (tempStart && tempEnd) {
      // 시작일이 종료일보다 늦으면 자동 swap
      const start = tempStart;
      const end = tempEnd;

      // 부모로 선택된 값을 전달
      onChange(
        end.isBefore(start)
          ? [start, end.endOf("day")] // swap 후 endOf('day') 적용
          : [start, end.endOf("day")]
      );
      closePicker(); // 팝오버 닫기
    }
  };

  const open = Boolean(anchorEl); // Popover 열림 여부

  return (
    //  MUI Date Pickers에서 Dayjs를 한국어(locale=ko)로 사용하도록 설정
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      {/* ---------------------- 선택 박스 영역 ---------------------- */}
      <Box
        onClick={openPicker} // 클릭 시 달력 팝업 열림
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "white",
          border: "1px solid rgba(0,0,0,0.23)",
          borderRadius: 1,
          fontSize: value[0] && value[1] ? 14 : 12,
          px: 1.5,
          py: 1.2,
          width: 220,
          cursor: "pointer",
        }}
      >
        {/* 선택된 날짜 범위 표시 */}
        <span>
          {value[0] && value[1]
            ? `${value[0].format("YYYY-MM-DD")} ~ ${value[1].format(
                "YYYY-MM-DD"
              )}`
            : label}
        </span>

        {/* 달력 아이콘 */}
        <CalendarTodayIcon fontSize="small" />
      </Box>

      {/* ---------------------- 달력 Popover ---------------------- */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box display="flex" p={1} gap={1}>
          {/* 📌 왼쪽 달력: 시작일 선택 */}
          <DateCalendar
            value={tempStart}
            onChange={(v) => v && setTempStart(v)} // 시작일 임시 저장
          />

          {/* 📌 오른쪽 달력: 종료일 선택 */}
          <DateCalendar
            value={tempEnd}
            onChange={(v) => v && setTempEnd(v)} // 종료일 임시 저장
            minDate={tempStart || undefined} // 시작일 이후만 선택 가능하도록 제한
          />
        </Box>

        {/* 확인 버튼 */}
        <Box display="flex" justifyContent="flex-end" p={1}>
          <Button
            size="small"
            variant="contained"
            onClick={handleConfirm}
            disabled={!tempStart || !tempEnd} // 둘 다 선택해야 활성화
          >
            선택
          </Button>
        </Box>
      </Popover>
    </LocalizationProvider>
  );
}
