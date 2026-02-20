import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Button,
  Input,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import type { Report } from "../../type";
import { handlePrint } from "../../components/Print";
import { Pencil, Save, X } from "lucide-react";

import { updateReportRemark } from "../api/ReportApi";
import { batteryToKwh } from "../../lib/constants";
import { formatCleanDuration } from "../../lib/formatters";

interface CleanReportProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  onUpdateRemark?: (remark: string) => void;
}

export default function CleanReport({
  open,
  onClose,
  report,
  onUpdateRemark,
}: CleanReportProps) {
  const [isEditingRemark, setIsEditingRemark] = useState(false);
  const [remark, setRemark] = useState("");
  const [originalRemark, setOriginalRemark] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      const initialRemark = report.remark ?? "";
      setRemark(initialRemark);
      setOriginalRemark(initialRemark);
      setIsEditingRemark(false);
    }
  }, [report]);

  const isRemarkChanged = remark !== originalRemark;

  const cancelEditRemark = () => {
    setRemark(originalRemark);
    setIsEditingRemark(false);
  };

  const printRef = useRef<HTMLDivElement>(null);

  if (!report) return null;

  const getModeText = (mode: number) => {
    if (mode === 1) return "스크러빙 모드";
    if (mode === 2) return "스위핑 모드";
    return "알 수 없음";
  };

  const formatBatteryConsumption = (costBattery: number) => {
    return `${batteryToKwh(costBattery)} kwh`;
  };

  const formatWaterConsumption = (costWater: number) => {
    return `${costWater} ㎖`;
  };

  const handleClose = () => {
    if (isEditingRemark && isRemarkChanged) {
      const confirmClose = window.confirm(
        "수정 중인 내용이 저장되지 않았습니다.\n정말 닫으시겠습니까?"
      );

      if (!confirmClose) return;

      cancelEditRemark();
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <IconButton onClick={handleClose}>
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
                {formatCleanDuration(report.cleanTime)}
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

            {/* 특이사항 */}
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2.5,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  color: "#666",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                특이사항
                {/* 보기 모드 */}
                {!isEditingRemark && (
                  <IconButton
                    size="small"
                    onClick={() => setIsEditingRemark(true)}
                  >
                    <Pencil size={18} />
                  </IconButton>
                )}
                {/* 수정 모드 */}
                {isEditingRemark && (
                  <>
                    {/* 저장 */}
                    <IconButton
                      size="small"
                      disabled={saving || !isRemarkChanged}
                      onClick={async () => {
                        if (!isRemarkChanged) return;

                        try {
                          setSaving(true);
                          const res = await updateReportRemark(report.puduReportId, remark);
                          setOriginalRemark(remark);
                          onUpdateRemark?.(res.data.remark);
                          setIsEditingRemark(false);
                        } catch {
                          alert("특이사항 저장 실패");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      <Save size={18} />
                    </IconButton>
                    {/* 취소 */}
                    <IconButton
                      size="small"
                      disabled={saving}
                      onClick={cancelEditRemark}
                    >
                      <X size={18} />
                    </IconButton>
                  </>
                )}
              </Box>

              <Box sx={{ flex: 2 }}>
                {!isEditingRemark && (
                  <Box
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      whiteSpace: "pre-wrap",
                      textAlign: "center",
                      color: remark ? "inherit" : "#999",
                    }}
                  >
                    {remark || "특이사항이 없습니다."}
                  </Box>
                )}

                {isEditingRemark && (
                  <Input
                    fullWidth
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="특이사항을 입력하세요"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}