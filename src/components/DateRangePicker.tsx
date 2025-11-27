import React, { useState } from "react";
import { Dayjs } from "dayjs";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Popover from "@mui/material/Popover";

interface RangePickerProps {
  value: [Dayjs | null, Dayjs | null];
  onChange: (range: [Dayjs | null, Dayjs | null]) => void;
  label?: string;
  fullWidth?: boolean; // 추가
  size?: "small" | "medium"; // 추가
}

export default function DateRangePicker({
  value,
  onChange,
  label = "YYYY-MM-DD~YYYY-MM-DD",
}: RangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempStart, setTempStart] = useState<Dayjs | null>(null);

  const openPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closePicker = () => {
    setAnchorEl(null);
    setTempStart(null);
  };

  const handleSelect = (date: Dayjs) => {
    if (!tempStart) {
      setTempStart(date);
    } else {
      const start = tempStart;
      const end = date;
      onChange(end.isBefore(start) ? [end, start] : [start, end]);
      closePicker();
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* 항상 텍스트 + 달력 아이콘 표시 */}
      <Box
        onClick={openPicker}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "white",
          border: "1px solid rgba(0,0,0,0.23)",
          borderRadius: 1,
          fontSize: value[0] && value[1] ? 16 : 14, // 날짜 선택 전은 작게, 선택 후는 원래 크기
          px: 1.5,
          py: 1.2,
          width: 220,
          cursor: "pointer",
        }}
      >
        <span>
          {value[0] && value[1]
            ? `${value[0].format("YYYY-MM-DD")} ~ ${value[1].format(
                "YYYY-MM-DD"
              )}`
            : label}
        </span>
        <CalendarTodayIcon fontSize="small" />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box display="flex" p={1}>
          <DateCalendar
            value={value[0]}
            onChange={(v) => v && handleSelect(v)}
          />
          <DateCalendar
            value={value[1]}
            onChange={(v) => v && handleSelect(v)}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
}
