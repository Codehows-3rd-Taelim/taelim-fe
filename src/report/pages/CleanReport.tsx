import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import type { Report } from "../../type";
import { handlePrint } from "../../components/Print";

interface CleanReportProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

export default function CleanReport({
  open,
  onClose,
  report,
}: CleanReportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!report) return null;

  const formatCleanTime = (cleanTimeSeconds: number) => {
    const totalSeconds = Math.floor(cleanTimeSeconds);
    if (totalSeconds === 0) return "-";

    const totalMinutes = Math.floor(totalSeconds / 60);

    return `${totalMinutes} min`;
  };

  const getModeText = (mode: number) => {
    if (mode === 1) return "스크러빙 모드";
    if (mode === 2) return "스위핑 모드";
    return "알 수 없음";
  };

  const formatBatteryConsumption = (costBattery: number) => {
    return `${Math.round(costBattery * 1.3 * 100) / 10000} %`;
  };

  const formatWaterConsumption = (costWater: number) => {
    return `${costWater} ℓ`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: "600px",
        },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            청소 보고서
          </span> */}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => handlePrint(printRef)}
            sx={{
              bgcolor: "#757575",
              color: "white",
              "&:hover": {
                bgcolor: "#616161",
              },
            }}
          >
            프린트
          </Button>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 컨텐츠 */}
      <DialogContent sx={{ p: 3 }}>
        <Box ref={printRef}>
          {/* 프린트용 제목 */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>
              청소 보고서
            </span>
          </Box>
          
          {/* 맵 이미지 */}
          <Box
            sx={{
              width: "100%",
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              overflow: "hidden",
              mb: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <img
              src={report.mapUrl}
              alt="청소 구역 맵"
              style={{
                maxWidth: "100%",
                maxHeight: "350px",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* 정보 섹션 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* 청소 구역명 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>청소 구역명</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>{report.mapName}</Box>
            </Box>

            {/* 청소 시작 시간 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>청소 시작 시간</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>{report.startTime}</Box>
            </Box>

            {/* 청소 모드 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>청소 모드</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>
                {getModeText(report.mode)}
              </Box>
            </Box>

            {/* 청소 시간 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>청소 시간</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>
                {formatCleanTime(report.cleanTime)}
              </Box>
            </Box>

            {/* 청소 면적 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>청소 면적</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>
                {report.cleanArea} / {report.taskArea} m²
              </Box>
            </Box>

            {/* 전력 소비량 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>전력 소비량</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>
                {formatBatteryConsumption(report.costBattery)}
              </Box>
            </Box>

            {/* 물 소비량 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Box sx={{ flex: 1, color: "#666", fontSize: "16px" }}>물 소비량</Box>
              <Box sx={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>
                {formatWaterConsumption(report.costWater)}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}