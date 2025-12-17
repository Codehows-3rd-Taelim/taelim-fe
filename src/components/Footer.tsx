import { Box } from "@mui/material";
import { FaInstagram, FaStore, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        bgcolor: "#f5f5f5",
        py: 3,
        px: 3,
        zIndex: 20,
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {/* 왼쪽: 고객센터 */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Box sx={{ fontWeight: 600, mb: 0.5 }}>고객센터</Box>
              <Box>TEL : 010-2089-8170</Box>
              <Box>E-mail : inustree@naver.com</Box>
              <Box sx={{ mt: 1 }}>
                <a
                  href="https://inustree-robotics.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#991b1b",
                    textDecoration: "none",
                    marginRight: "8px",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  로봇정보
                </a>

                <a
                  href="http://inustree.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#991b1b",
                    textDecoration: "none",
                    marginLeft: "8px",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  회사정보
                </a>
              </Box>
            </Box>

            {/* 오른쪽: SNS 아이콘 */}
            <Box sx={{ display: "flex", gap: 3, fontSize: "1.5rem" }}>
              <a
                href="https://www.instagram.com/inustree/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram style={{ color: "#E1306C" }} />
              </a>

              <a
                href="https://www.youtube.com/@inustree5216"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube style={{ color: "#dc2626" }} />
              </a>

              <a
                href="https://smartstore.naver.com/inustree_"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaStore style={{ color: "#ef4444" }} />
              </a>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
